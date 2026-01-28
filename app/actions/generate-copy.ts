'use server'

import { GoogleGenAI } from "@google/genai";

export async function generateCopy(prompt: string) {
  // Tenta pegar a chave de API de ambas as variáveis para garantir compatibilidade
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave de API não configurada. Verifique seu arquivo .env");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    // Uso exclusivo do modelo Gemini 2.0 Flash Lite conforme solicitado
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite', 
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (!response.text) throw new Error("Resposta vazia do modelo 2.0");
    return response.text;

  } catch (error: any) {
    console.error("❌ Erro no Gemini 2.0 Flash Lite:", error);
    throw new Error(`Falha na IA (Gemini 2.0): ${error.message}`);
  }
}