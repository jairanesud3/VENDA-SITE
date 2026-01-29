'use server'

import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/utils/rate-limit";
import { Buffer } from "buffer";

const LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1";
const MODEL_ID = "aa77f04e-3eec-4034-9c07-d0f619684628"; // Leonardo Kino XL

// Função auxiliar para fazer upload da imagem para a Leonardo AI
async function uploadToLeonardo(apiKey: string, imageFile: File) {
  try {
    const extension = imageFile.name.split('.').pop() || 'jpg';

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

    if (!initResponse.ok) {
        const errorText = await initResponse.text();
        throw new Error(`Falha ao iniciar upload: ${errorText}`);
    }
    
    const initData = await initResponse.json();
    const { uploadUrl, id } = initData.uploadInitImage;

    // 2. Fazer Upload dos dados binários (PUT)
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: buffer,
      headers: {
        'Content-Type': imageFile.type || 'image/jpeg',
        // 'Content-Length' é gerenciado automaticamente pelo fetch/node
      }
    });

    if (!uploadResponse.ok) {
        throw new Error("Falha ao enviar binário da imagem para o servidor.");
    }

    return id; // Retorna o ID da imagem para usar na geração
  } catch (error) {
    console.error("Erro no upload de imagem:", error);
    throw error;
  }
}

export async function generateProductImage(formData: FormData) {
  // 1. EXTRAÇÃO DE DADOS
  const prompt = formData.get('prompt') as string;
  const imageFile = formData.get('image') as File | null;

  if (!prompt) throw new Error("Prompt é obrigatório.");

  // 2. SEGURANÇA E AUTENTICAÇÃO
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  // Verificar Plano
  const userPlan = user.user_metadata?.plan || 'free';
  // Lógica de restrição de plano pode ser reativada aqui se necessário

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

    // 3. SE HOUVER ARQUIVO, FAZER UPLOAD
    if (imageFile && imageFile.size > 0) {
      console.log("Iniciando upload de imagem de referência...");
      initImageId = await uploadToLeonardo(apiKey, imageFile);
    }

    // 4. CONFIGURAR PAYLOAD DA GERAÇÃO
    const payload: any = {
      height: 1024,
      width: 1024,
      modelId: MODEL_ID,
      prompt: `${prompt}, professional product photography, high detail, 8k, realistic lighting`,
      num_images: 1,
      public: false,
    };

    // Configuração Image-to-Image
    if (initImageId) {
      payload.init_image_id = initImageId;
      // init_strength controla quanto a IA deve respeitar a imagem original vs o prompt.
      // 0.35 dá liberdade criativa para mudar o fundo mantendo a essência do produto.
      payload.init_strength = 0.35; 
      
      // Reforça o prompt para garantir que o cenário mude
      payload.prompt = `(product shot) ${prompt}, maintaining the product shape perfectly, cinematic lighting, 8k resolution`;
    }

    // 5. INICIAR GERAÇÃO (POST)
    const generationResponse = await fetch(`${LEONARDO_API_URL}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!generationResponse.ok) {
      const err = await generationResponse.json();
      throw new Error(`Erro Leonardo AI: ${JSON.stringify(err)}`);
    }

    const generationData = await generationResponse.json();
    const generationId = generationData.sdGenerationJob?.generationId;

    if (!generationId) {
      throw new Error("Falha ao obter ID da geração.");
    }

    // 6. POLLING LOOP (ESPERAR IMAGEM FICAR PRONTA)
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