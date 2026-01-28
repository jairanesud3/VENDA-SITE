'use server'

import { GoogleGenAI } from "@google/genai";

export async function generateCopy(prompt: string) {
  // Tenta pegar a chave de API de ambas as variáveis para garantir compatibilidade
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave de API não configurada. Verifique seu arquivo .env");
  }

  const ai = new GoogleGenAI({ apiKey });

  // TENTATIVA 1: Modelo Principal (gemini-2.0-flash-lite)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite', 
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (!response.text) throw new Error("Resposta vazia do modelo 2.0");
    return response.text;

  } catch (primaryError: any) {
    console.warn("⚠️ Aviso: Falha no Gemini 2.0 Flash Lite. Tentando fallback...", primaryError.message);

    // TENTATIVA 2: Fallback (gemini-1.5-flash)
    try {
      const responseFallback = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return responseFallback.text;
    } catch (fallbackError: any) {
      console.error("❌ Erro Fatal: Ambos os modelos falharam.", fallbackError);
      // Retorna o erro original ou o do fallback para o frontend
      throw new Error(`Falha na IA (Tentativas esgotadas): ${fallbackError.message}`);
    }
  }
}