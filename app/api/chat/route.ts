import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Receber o corpo da requisição
    const { message } = await req.json();

    // 2. Autenticação Segura (Server-Side)
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave de API não configurada no servidor." },
        { status: 500 }
      );
    }

    // 3. Inicializar Gemini
    const ai = new GoogleGenAI({ apiKey });

    // 4. Contexto do Sistema (Prompt Engineering movido para o Backend)
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

    // 5. Gerar conteúdo usando o modelo solicitado (gemini-1.5-flash)
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    const text = response.text || "Desculpe, não consegui processar sua resposta agora.";

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Erro na API de Chat:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar IA.", details: error.message },
      { status: 500 }
    );
  }
}