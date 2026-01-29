'use server'

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/utils/rate-limit";

// Módulos que EXIGEM pagamento (Server-Side Enforced)
const PREMIUM_MODULES = [
    'video_script', 
    'studio', 
    'persona', 
    'email_marketing', 
    'blog_post', 
    'headline_optimizer'
];

export async function generateCopy(prompt: string, moduleId?: string) {
  // --- CAMADA 1: CONEXÃO SEGURA ---
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Tentativa de acesso não autorizado detectada.");
    throw new Error("⛔ Acesso Negado: Sessão inválida ou expirada.");
  }

  // --- CAMADA 2: RATE LIMITING (Anti-Abuso) ---
  const isAllowed = checkRateLimit(user.id);
  if (!isAllowed) {
    throw new Error("⏳ Calma aí! Você fez muitas requisições. Aguarde 1 minuto.");
  }

  // --- CAMADA 3: VERIFICAÇÃO DE PLANO (Database Truth) ---
  const userPlan = user.user_metadata?.plan || 'free'; 

  if (moduleId && PREMIUM_MODULES.includes(moduleId)) {
    if (userPlan !== 'pro') {
      throw new Error("🔒 BLOQUEADO: Este recurso exige o Plano PRO. O servidor recusou sua solicitação.");
    }
  }

  // --- CAMADA 4: SEGURANÇA DA API KEY ---
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Erro de Configuração do Servidor (API Key ausente).");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    let finalPrompt = prompt;

    // Se for o gerador de anúncios, injetamos o prompt MESTRE para todas as plataformas
    if (moduleId === 'generator') {
        const antiMarkdown = "IMPORTANTE: Retorne APENAS texto puro dentro dos valores JSON. NÃO use formatação markdown.";
        
        // Extrai dados básicos do prompt original (que vem formatado como string)
        // Isso é uma simplificação, idealmente o prompt já viria estruturado, mas aqui garantimos a injeção.
        finalPrompt = `
          ${prompt}
          
          ${antiMarkdown}
          TAREFA: Gere variações de anúncio ALTAMENTE PERSUASIVAS para AS 12 PLATAFORMAS ABAIXO.
          Adapte a linguagem (gírias, formalidade, emojis, tamanho) para cada rede.

          Retorne um JSON ÚNICO com esta estrutura exata:
          {
            "facebook": { "headline": "...", "body": "...", "cta": "..." },
            "instagram": { "headline": "...", "body": "...", "cta": "..." },
            "tiktok": { "description": "...", "cta": "..." },
            "google": { "headline": "...", "description": "..." },
            "shopee": { "title": "...", "description": "..." },
            "mercadolivre": { "title": "...", "headline": "..." },
            "olx": { "title": "...", "body": "..." },
            "amazon": { "headline": "...", "title": "..." },
            "pinterest": { "title": "...", "description": "..." },
            "linkedin": { "headline": "...", "body": "..." },
            "twitter": { "text": "..." },
            "youtube": { "title": "...", "description": "..." }
          }
        `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: finalPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (!response.text) throw new Error("A IA não retornou texto.");
    
    // --- CAMADA 5: SALVAR NO HISTÓRICO ---
    try {
        let resultToSave = response.text;
        try {
            const parsed = JSON.parse(response.text);
            resultToSave = parsed;
        } catch(e) {}

        await supabase.from('user_history').insert({
            user_id: user.id,
            type: 'text',
            module: moduleId || 'generator',
            prompt: prompt.substring(0, 200) + '...',
            result: typeof resultToSave === 'object' ? resultToSave : { text: resultToSave }
        });
    } catch (dbError) {
        console.error("Erro db:", dbError);
    }

    return response.text;

  } catch (error: any) {
    console.error("Erro na Geração IA:", error);
    throw new Error(`Erro no processamento da IA: ${error.message}`);
  }
}