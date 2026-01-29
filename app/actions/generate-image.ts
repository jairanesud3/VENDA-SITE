'use server'

import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/utils/rate-limit";

const LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1";
const MODEL_ID = "aa77f04e-3eec-4034-9c07-d0f619684628"; // Leonardo Kino XL

export async function generateProductImage(prompt: string) {
  // 1. SEGURANÇA E AUTENTICAÇÃO
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  // Verificar Plano (Apenas PRO pode usar Studio de alta qualidade)
  // Nota: Mantendo a lógica de segurança solicitada, sem alterar DB.
  const userPlan = user.user_metadata?.plan || 'free';
  if (userPlan !== 'pro') {
    throw new Error("🔒 Recurso exclusivo PRO. Faça upgrade para gerar imagens de estúdio.");
  }

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
    // 2. INICIAR GERAÇÃO (POST)
    const initResponse = await fetch(`${LEONARDO_API_URL}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        height: 1024,
        width: 1024,
        modelId: MODEL_ID,
        prompt: `${prompt}, professional studio lighting, 8k resolution, commercial photography, highly detailed, centered product`,
        num_images: 1,
        public: false
      })
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

    // 3. POLLING LOOP (ESPERAR IMAGEM FICAR PRONTA)
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 30; // 60 segundos máx (30 * 2s)

    while (attempts < maxAttempts) {
      // Espera 2 segundos
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
          break; // Sai do loop
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