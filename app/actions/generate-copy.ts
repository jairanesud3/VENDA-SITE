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
    // Utilizando o modelo solicitado. Se houver erro de modelo não encontrado, 
    // o SDK geralmente lança uma exceção que tratamos abaixo.
    // Nota: 'gemini-2.0-flash-lite' é um modelo experimental/preview.
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite-preview-02-05', 
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return response.text;
  } catch (error: any) {
    console.error("Erro na Server Action (Generate Copy):", error);
    // Retorna null ou lança erro para ser tratado no frontend
    throw new Error(`Falha na IA: ${error.message}`);
  }
}