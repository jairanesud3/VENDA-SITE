import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/* 
  !!! IMPORTANTE - SQL NECESSÁRIO NO SUPABASE !!!
  Execute este SQL no SQL Editor do seu Supabase para criar a tabela de histórico:

  create table if not exists support_chat_history (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    role text not null check (role in ('user', 'model')),
    content text not null,
    created_at timestamptz default now()
  );

  alter table support_chat_history enable row level security;

  create policy "Users can view own chat" on support_chat_history 
    for select using (auth.uid() = user_id);

  create policy "Users can insert own chat" on support_chat_history 
    for insert with check (auth.uid() = user_id);
*/

export async function POST(req: Request) {
  try {
    // 1. Receber o corpo da requisição
    const { message } = await req.json();

    // 2. Configuração do Supabase e Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 3. Autenticação da API Key do Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave de API não configurada no servidor." },
        { status: 500 }
      );
    }

    // 4. Salvar mensagem do USUÁRIO no banco (se logado)
    if (user) {
      await supabase.from('support_chat_history').insert({
        user_id: user.id,
        role: 'user',
        content: message
      });
    }

    // 5. Inicializar Gemini
    const ai = new GoogleGenAI({ apiKey });

    // 6. Contexto do Sistema
    const prompt = `
      CONTEXTO DO SISTEMA:
      Você é o assistente virtual de suporte do "DropAI" (DROPHACKER.AI).
      O DropAI é uma ferramenta SaaS que cria anúncios, copy e imagens para dropshipping e e-commerce usando IA.
      
      INFORMAÇÕES CHAVE:
      - Preços: Iniciante (R$49,90/mês), Escala Pro (R$97,00/mês).
      - Funcionalidades: Gera textos AIDA, imagens realistas de produtos, roteiros TikTok.
      - Diferencial: Filtro anti-bloqueio para Facebook Ads.
      
      SUA MISSÃO:
      Responda dúvidas sobre a ferramenta de forma curta, persuasiva e amigável.
      Se perguntarem sobre suporte humano, direcione para o botão do WhatsApp.
      
      PERGUNTA DO USUÁRIO: "${message}"
    `;

    // 7. Gerar resposta
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    const text = response.text || "Desculpe, não consegui processar sua resposta agora.";

    // 8. Salvar resposta da IA no banco (se logado)
    if (user) {
      await supabase.from('support_chat_history').insert({
        user_id: user.id,
        role: 'model',
        content: text
      });
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Erro na API de Chat:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar IA.", details: error.message },
      { status: 500 }
    );
  }
}