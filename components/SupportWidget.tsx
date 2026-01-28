'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// CONSTANTES (Fácil configuração)
const WHATSAPP_NUMBER = "5511999999999"; // Apenas números
const WHATSAPP_MESSAGE = "Olá! Gostaria de saber mais sobre o DropAI.";

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou a IA do DropAI. Como posso te ajudar a vender mais hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      // SEGURANÇA: Chave obtida via variável de ambiente
      const apiKey = process.env.API_KEY;

      if (!apiKey) {
         setMessages(prev => [...prev, { role: 'model', text: "⚠️ Ops! A chave da API não está configurada. Por favor, adicione sua API_KEY no arquivo .env para que eu possa funcionar." }]);
         setIsTyping(false);
         return;
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey || '' });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `
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
          
          PERGUNTA DO USUÁRIO: "${userMsg}"
        `,
        config: {
          temperature: 0.6,
          maxOutputTokens: 150,
        }
      });

      const text = response.text || "Desculpe, tive um lapso de conexão. Pode repetir?";
      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      console.error("Erro no chat:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Estou com dificuldade de conexão agora. Verifique sua internet ou tente recarregar." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans pointer-events-none">
      
      {/* JANELA DE CHAT IA (Pointer events auto para interação) */}
      <div className={`pointer-events-auto transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute bottom-10 right-0'}`}>
        {isOpen && (
          <div className="w-[340px] h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in">
            {/* Header unificado */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Suporte DropAI</h3>
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> IA Online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Botão WhatsApp Integrado no Header */}
                <a 
                   href={whatsappLink} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="p-2 text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors flex items-center gap-1.5 mr-1"
                   title="Falar com humano no WhatsApp"
                >
                   <MessageCircle size={18} />
                </a>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-900/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed animate-in fade-in zoom-in-95 duration-200 ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-none shadow-lg shadow-purple-900/20' 
                      : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder-slate-600"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-purple-900/20"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTÃO FLUTUANTE ÚNICO (Pointer events auto) */}
      <div className="flex flex-col gap-3 items-end pointer-events-auto">
        <div className="group flex items-center gap-3">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap pointer-events-none translate-x-2 group-hover:translate-x-0 duration-200">
            {isOpen ? 'Fechar Suporte' : 'Dúvidas? Fale com a IA'}
          </span>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-black/30 transition-all transform hover:scale-105 active:scale-95 border-2 backdrop-blur-sm ${isOpen ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-purple-600 border-purple-400 text-white hover:bg-purple-500'}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
          </button>
        </div>
      </div>
    </div>
  );
};