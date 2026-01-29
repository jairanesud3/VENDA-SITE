'use server'

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/utils/rate-limit";

// Módulos que EXIGEM pagamento (Server-Side Enforced)
// Adicionados novos módulos premium: email_marketing, blog_post, persona
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
  
  // Usamos getUser() e não getSession() para garantir que o token não foi forjado
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

  // Se o módulo for premium e o plano não for PRO, bloqueia.
  if (moduleId && PREMIUM_MODULES.includes(moduleId)) {
    if (userPlan !== 'pro') {
      console.warn(`[SECURITY] User ${user.id} (Plan: ${userPlan}) attempted to breach premium module: ${moduleId}`);
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
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (!response.text) throw new Error("A IA não retornou texto.");
    
    // --- CAMADA 5: SALVAR NO HISTÓRICO ---
    try {
        let resultToSave = response.text;
        // Tenta parsear para salvar como JSON puro se possível, senão salva como string no JSON
        try {
            const parsed = JSON.parse(response.text);
            resultToSave = parsed;
        } catch(e) {}

        await supabase.from('user_history').insert({
            user_id: user.id,
            type: 'text',
            module: moduleId || 'generator',
            prompt: prompt.substring(0, 200) + '...', // Salva um resumo do prompt
            result: typeof resultToSave === 'object' ? resultToSave : { text: resultToSave }
        });
    } catch (dbError) {
        console.error("Erro ao salvar histórico (não bloqueante):", dbError);
    }

    return response.text;

  } catch (error: any) {
    console.error("Erro na Geração IA:", error);
    throw new Error(`Erro no processamento da IA: ${error.message}`);
  }
}