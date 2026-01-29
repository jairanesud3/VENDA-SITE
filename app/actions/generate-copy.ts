'use server'

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/utils/rate-limit";

// Módulos que EXIGEM pagamento (Server-Side Enforced)
const PREMIUM_MODULES = ['video_script', 'studio', 'persona'];

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
  // O plano vem do metadata do usuário (protegido pelo Supabase/Stripe)
  // O usuário NÃO consegue alterar isso via inspecionar elemento.
  const userPlan = user.user_metadata?.plan || 'free'; // Default seguro é 'free'

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

  // Se passou por todas as barreiras, executa a IA
  const ai = new GoogleGenAI({ apiKey });

  try {
    // ATUALIZAÇÃO CRÍTICA: Uso do modelo oficial 'gemini-flash-lite-latest'.
    // Este modelo é mais rápido, econômico e substitui as versões 1.5.
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (!response.text) throw new Error("A IA não retornou texto.");
    
    return response.text;

  } catch (error: any) {
    console.error("Erro na Geração IA:", error);
    // Retry simples: Em caso de falha momentânea, o frontend pode solicitar novamente.
    // Não tentamos fallback para modelos antigos para evitar erros de depreciação.
    throw new Error(`Erro no processamento da IA: ${error.message}`);
  }
}