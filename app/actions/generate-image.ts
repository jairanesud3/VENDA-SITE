'use server'

import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/utils/rate-limit";
import { Buffer } from "buffer";

const LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1";
const MODEL_ID = "aa77f04e-3eec-4034-9c07-d0f619684628"; // Leonardo Kino XL

// Função auxiliar para fazer upload da imagem de referência para a Leonardo AI
async function uploadInitImage(apiKey: string, base64Image: string, extension: string) {
  try {
    // 1. Solicitar URL pré-assinada (Presigned URL)
    const initResponse = await fetch(`${LEONARDO_API_URL}/init-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ extension })
    });

    if (!initResponse.ok) throw new Error("Falha ao iniciar upload de imagem.");
    const initData = await initResponse.json();
    const { uploadUrl, id } = initData.uploadInitImage;

    // 2. Fazer Upload dos dados binários (PUT)
    // Remove o header do base64 (ex: "data:image/jpeg;base64,") para enviar apenas o buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: buffer
    });

    if (!uploadResponse.ok) throw new Error("Falha ao enviar imagem para o servidor da IA.");

    return id; // Retorna o ID da imagem para usar na geração
  } catch (error) {
    console.error("Erro no upload de imagem:", error);
    throw error;
  }
}

export async function generateProductImage(prompt: string, imageBase64?: string) {
  // 1. SEGURANÇA E AUTENTICAÇÃO
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  // Verificar Plano
  const userPlan = user.user_metadata?.plan || 'free';
  
  // --- MODO TESTE (DEV): TRAVA DE PLANO DESATIVADA TEMPORARIAMENTE ---
  /*
  if (userPlan !== 'pro') {
    throw new Error("🔒 Recurso exclusivo PRO. Faça upgrade para gerar imagens de estúdio.");
  }
  */

  // Rate Limit
  const isAllowed = checkRateLimit(user.id);
  if (!isAllowed) {
    throw new Error("⏳ Muitas requisições. Aguarde um momento.");
  }

  const apiKey = process.env.LEONARDO_API_KEY;
  if (!apiKey) {
    throw new Error("Erro de configuração: LEONARDO_API_KEY ausente.");
  }

  try {
    let initImageId = null;

    // 2. SE HOUVER IMAGEM DE REFERÊNCIA, FAZER UPLOAD PRIMEIRO
    if (imageBase64) {
      // Detectar extensão simples (assumindo jpg ou png baseada no header, ou default jpg)
      const extension = imageBase64.substring("data:image/".length, imageBase64.indexOf(";base64")) || "jpg";
      initImageId = await uploadInitImage(apiKey, imageBase64, extension);
    }

    // 3. CONFIGURAR PAYLOAD DA GERAÇÃO
    const payload: any = {
      height: 1024,
      width: 1024,
      modelId: MODEL_ID,
      prompt: `${prompt}, professional product photography, high detail, 8k, realistic lighting`,
      num_images: 1,
      public: false,
    };

    // Se tiver imagem, adiciona os parâmetros de Image-to-Image
    if (initImageId) {
      payload.init_image_id = initImageId;
      payload.init_strength = 0.4; // 0.1 a 0.9 (Quanto maior, mais fiel à imagem original. 0.4 permite mudar o fundo mantendo a forma)
      payload.prompt = `(product shot) ${prompt}, maintaining the product shape perfectly, cinematic lighting`;
    }

    // 4. INICIAR GERAÇÃO (POST)
    const initResponse = await fetch(`${LEONARDO_API_URL}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!initResponse.ok) {
      const err = await initResponse.json();
      throw new Error(`Erro Leonardo AI: ${JSON.stringify(err)}`);
    }

    const initData = await initResponse.json();
    const generationId = initData.sdGenerationJob?.generationId;

    if (!generationId) {
      throw new Error("Falha ao obter ID da geração.");
    }

    // 5. POLLING LOOP (ESPERAR IMAGEM FICAR PRONTA)
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 30; // 60 segundos máx

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const checkResponse = await fetch(`${LEONARDO_API_URL}/generations/${generationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        const status = checkData.generations_by_pk?.status;

        if (status === 'COMPLETE') {
          imageUrl = checkData.generations_by_pk?.generated_images?.[0]?.url;
          break;
        } else if (status === 'FAILED') {
          throw new Error("A geração da imagem falhou no servidor da IA.");
        }
      }
      attempts++;
    }

    if (!imageUrl) {
      throw new Error("Tempo limite excedido. Tente novamente.");
    }

    return imageUrl;

  } catch (error: any) {
    console.error("Erro na Server Action de Imagem:", error);
    throw new Error(error.message || "Erro interno ao gerar imagem.");
  }
}