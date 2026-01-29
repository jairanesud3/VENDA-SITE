'use server'

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/utils/rate-limit";

const PREMIUM_MODULES = [
    'video_script', 
    'studio', 
    'persona', 
    'email_marketing', 
    'blog_post', 
    'headline_optimizer'
];

// Mapeamento de instruções específicas por plataforma
const PLATFORM_PROMPTS: Record<string, string> = {
    facebook: '"facebook": { "headline": "Título chamativo (max 40 chars)", "body": "Texto persuasivo com emojis (AIDA)", "cta": "Botão (ex: Saiba Mais)" }',
    instagram: '"instagram": { "headline": "Primeira linha (Gancho)", "body": "Legenda engajadora com hashtags", "cta": "Chamada para Bio/Direct" }',
    tiktok: '"tiktok": { "description": "Legenda curta viral (max 150 chars)", "cta": "CTA rápido" }',
    shopee: '"shopee": { "title": "Título SEO (Palavras-chave)", "description": "Descrição técnica e benefícios", "price": "Preço sugerido atraente" }',
    mercadolivre: '"mercadolivre": { "title": "Título Técnico (Max 60 chars)", "headline": "Frase de destaque", "price": "Preço competitivo" }',
    olx: '"olx": { "title": "Título direto (O que é)", "body": "Descrição detalhada do estado/uso", "price": "Preço para negociação" }',
    amazon: '"amazon": { "headline": "Título Longo SEO", "title": "Bullets de benefícios", "price": "Preço psicológico" }',
    pinterest: '"pinterest": { "title": "Título Inspiracional", "description": "Descrição com keywords" }',
    linkedin: '"linkedin": { "headline": "Título Profissional", "body": "Texto B2B formal" }',
    twitter: '"twitter": { "text": "Tweet curto e polêmico/viral (max 280 chars)" }',
    youtube: '"youtube": { "title": "Título Clickbait (Alta conversão)", "description": "Descrição para SEO e Links" }'
};

export async function generateCopy(prompt: string, moduleId?: string, selectedPlatforms: string[] = []) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("⛔ Acesso Negado: Sessão inválida.");
  if (!checkRateLimit(user.id)) throw new Error("⏳ Calma aí! Aguarde 1 minuto.");

  const userPlan = user.user_metadata?.plan || 'free'; 
  if (moduleId && PREMIUM_MODULES.includes(moduleId) && userPlan !== 'pro') {
    throw new Error("🔒 BLOQUEADO: Recurso PRO.");
  }

  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Erro de API Key.");

  const ai = new GoogleGenAI({ apiKey });

  try {
    let finalPrompt = prompt;

    // Lógica Dinâmica para Gerador de Anúncios
    if (moduleId === 'generator') {
        // Se nenhuma plataforma for enviada (fallback), usa as 3 principais
        const targets = selectedPlatforms.length > 0 ? selectedPlatforms : ['instagram', 'facebook', 'tiktok'];
        
        // Constrói o schema JSON baseado APENAS nas selecionadas
        const jsonSchemaParts = targets.map(p => PLATFORM_PROMPTS[p] || "").filter(Boolean);
        const jsonSchema = `{ ${jsonSchemaParts.join(',\n')} }`;

        finalPrompt = `
          ATUE COMO O MAIOR COPYWRITER DO MUNDO (Estilo Ogilvy/Schwartz).
          Produto/Serviço: ${prompt}
          
          TAREFA: Crie anúncios ALTAMENTE PERSUASIVOS apenas para as plataformas abaixo.
          Use gatilhos mentais (Escassez, Urgência, Autoridade).
          Adapte a linguagem para cada rede (ex: TikTok = informal/gírias, LinkedIn = formal).

          IMPORTANTE: Retorne APENAS um JSON válido. Sem markdown, sem explicações.
          ESTRUTURA OBRIGATÓRIA DO JSON:
          ${jsonSchema}
        `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: finalPrompt,
      config: { responseMimeType: 'application/json' }
    });

    if (!response.text) throw new Error("A IA falhou ao gerar texto.");

    // Salvar no histórico
    try {
        let resultToSave = JSON.parse(response.text);
        await supabase.from('user_history').insert({
            user_id: user.id,
            type: 'text',
            module: moduleId || 'generator',
            prompt: prompt.substring(0, 100),
            result: resultToSave
        });
    } catch(e) {}

    return response.text;

  } catch (error: any) {
    console.error("Erro IA:", error);
    throw new Error(`Erro na IA: ${error.message}`);
  }
}