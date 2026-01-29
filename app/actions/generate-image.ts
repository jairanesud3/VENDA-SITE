'use server'

import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/utils/rate-limit";
import { GoogleGenAI } from "@google/genai";
import { Buffer } from "node:buffer";

const LEONARDO_API_URL = "https://cloud.leonardo.ai/api/rest/v1";
// Modelo Leonardo Kino XL (Fotorealismo de alto nível)
const LEONARDO_MODEL_ID = "aa77f04e-3eec-4034-9c07-d0f619684628"; 

export async function generateProductImage(formData: FormData) {
  try {
    // 1. EXTRAÇÃO E SEGURANÇA
    const promptUsuario = formData.get('prompt') as string;
    const imageFile = formData.get('image') as File | null;

    if (!promptUsuario) throw new Error("Por favor, descreva o cenário.");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Sessão expirada. Faça login novamente.");

    const isAllowed = checkRateLimit(user.id);
    if (!isAllowed) throw new Error("⏳ Limite de requisições atingido. Aguarde 1 minuto.");

    const leoApiKey = process.env.LEONARDO_API_KEY;
    const geminiApiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    if (!leoApiKey || !geminiApiKey) {
      throw new Error("Erro de configuração de API no servidor.");
    }

    let finalPrompt = promptUsuario;

    // 2. ESTRATÉGIA VISION: SE TIVER IMAGEM, O GEMINI ANALISA
    if (imageFile && imageFile.size > 0) {
        console.log("📸 Iniciando análise visual com Gemini...");
        
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        // Converter File para Base64
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imageFile.type || 'image/jpeg';

        // Prompt de Engenharia para o Gemini descrever o produto
        const visionPrompt = `
            Analise esta imagem. Descreva o produto visualmente com extrema precisão (materiais, cores, formato, texturas).
            Combine essa descrição técnica do produto com o seguinte pedido de cenário do usuário: "${promptUsuario}".
            
            Com base nisso, crie um PROMPT FINAL EM INGLÊS otimizado para a Leonardo AI gerar uma imagem fotorealista.
            
            Estrutura obrigatória do output:
            [Descrição Detalhada do Produto] in [Cenário Solicitado], cinematic lighting, 8k resolution, photorealistic, commercial photography, depth of field.
            
            Retorne APENAS o prompt em inglês.
        `;

        const visionResponse = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: {
              parts: [
                  { 
                      inlineData: { 
                          mimeType: mimeType, 
                          data: base64Data 
                      } 
                  },
                  { text: visionPrompt }
              ]
            }
        });

        finalPrompt = visionResponse.text || `${promptUsuario}, high quality product photography`;
        console.log("✨ Prompt Gerado pelo Gemini:", finalPrompt);
    } else {
        // Se não tem imagem, apenas traduz/melhora o prompt do usuário
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const textResponse = await ai.models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: `Melhore este prompt para um gerador de imagens (Leonardo AI). Traduza para Inglês e adicione termos de qualidade fotográfica: "${promptUsuario}". Retorne APENAS o prompt em inglês.`
        });
        finalPrompt = textResponse.text || promptUsuario;
    }

    // 3. ENVIAR PARA LEONARDO AI (TEXT-TO-IMAGE)
    // Agora enviamos apenas texto, o que é 100% estável e não depende de upload de init_image
    const payload = {
      height: 1024,
      width: 1024,
      modelId: LEONARDO_MODEL_ID,
      prompt: finalPrompt,
      num_images: 1,
      public: false,
      alchemy: true, // Qualidade máxima
      photoReal: true, // Modo fotorealista
      presetStyle: "CINEMATIC"
    };

    const generationResponse = await fetch(`${LEONARDO_API_URL}/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${leoApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!generationResponse.ok) {
        const errText = await generationResponse.text();
        console.error("Erro Leonardo:", errText);
        throw new Error("A IA de imagem está sobrecarregada. Tente novamente em 30s.");
    }

    const generationData = await generationResponse.json();
    const generationId = generationData.sdGenerationJob?.generationId;

    if (!generationId) throw new Error("Falha ao iniciar geração de imagem.");

    // 4. POLLING (ESPERA ATIVA)
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 30; // 60 segundos máx

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const checkResponse = await fetch(`${LEONARDO_API_URL}/generations/${generationId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${leoApiKey}` }
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        const status = checkData.generations_by_pk?.status;

        if (status === 'COMPLETE') {
          imageUrl = checkData.generations_by_pk?.generated_images?.[0]?.url;
          break;
        } else if (status === 'FAILED') {
          throw new Error("A geração falhou no servidor da Leonardo AI.");
        }
      }
      attempts++;
    }

    if (!imageUrl) throw new Error("Tempo limite excedido. Tente novamente.");

    // 5. SALVAR NO HISTÓRICO
    try {
        await supabase.from('user_history').insert({
            user_id: user.id,
            type: 'image',
            module: 'studio',
            prompt: promptUsuario, // Salva o prompt original em PT
            result: { url: imageUrl }
        });
    } catch (dbErr) {
        console.error("Erro ao salvar histórico:", dbErr);
    }

    return imageUrl;

  } catch (error: any) {
    console.error("Erro Final:", error);
    throw new Error(error.message || "Erro desconhecido ao gerar imagem.");
  }
}