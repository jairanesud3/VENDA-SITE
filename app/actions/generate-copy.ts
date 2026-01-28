'use server'

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";

// Lista de módulos que exigem plano Premium
const PREMIUM_MODULES = ['video_script', 'studio', 'persona'];

export async function generateCopy(prompt: string, moduleId?: string) {
  // 1. CAMADA DE SEGURANÇA 1: Verificar Autenticação
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("⛔ Acesso não autorizado. Faça login novamente.");
  }

  // 2. CAMADA DE SEGURANÇA 2: Verificar Plano do Usuário (Database Source of Truth)
  // Assumimos que o plano está salvo no user_metadata ou em uma tabela 'profiles'
  // Para este exemplo, usamos user_metadata que é injetado via Webhook do Stripe
  const userPlan = user.user_metadata?.plan || 'free';

  // 3. CAMADA DE SEGURANÇA 3: Validar Permissão do Módulo
  if (moduleId && PREMIUM_MODULES.includes(moduleId)) {
    if (userPlan !== 'pro') {
      console.warn(`[SECURITY ALERT] User ${user.id} tried to access premium module ${moduleId} without permission.`);
      throw new Error("🔒 Upgrade required: Este recurso é exclusivo para usuários PRO.");
    }
  }

  // 4. CAMADA DE SEGURANÇA 4: Rate Limiting (Opcional - Simplificado aqui)
  // Poderíamos checar um contador no banco de dados aqui.

  // --- FIM DA VERIFICAÇÃO DE SEGURANÇA ---

  // Tenta pegar a chave de API de ambas as variáveis para garantir compatibilidade
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave de API não configurada no servidor.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Uso do modelo Gemini 2.5 Flash Lite
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', 
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (!response.text) throw new Error("Resposta vazia do modelo 2.5");
    return response.text;

  } catch (error: any) {
    console.error("❌ Erro no Gemini 2.5 Flash Lite:", error);
    throw new Error(`Falha na IA (Gemini 2.5): ${error.message}`);
  }
}