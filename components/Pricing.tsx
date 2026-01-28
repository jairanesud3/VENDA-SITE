'use client';

import React, { useState } from 'react';
import { Check, Star, Zap, Loader2 } from 'lucide-react';

const PricingItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3 text-slate-300">
    <div className="mt-1 p-0.5 rounded-full bg-slate-800 border border-slate-700">
      <Check className="w-3 h-3 text-green-500 shrink-0" />
    </div>
    <span>{text}</span>
  </li>
);

export const Pricing: React.FC = () => {
  const [loadingPlan, setLoadingPlan] = useState<'basic' | 'pro' | null>(null);

  const handleCheckout = async (plan: 'basic' | 'pro') => {
    try {
      setLoadingPlan(plan);
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Erro ao criar checkout:', data.error);
        alert('Erro ao iniciar pagamento. Verifique o console.');
        setLoadingPlan(null);
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      alert('Ocorreu um erro inesperado. Tente novamente.');
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="reveal text-4xl font-bold text-center mb-16 text-white">Escolha Seu Plano</h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
          
          {/* PLANO 1 - INICIANTE */}
          <div className="reveal delay-100 p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col hover:border-slate-600 transition-colors backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-400">INICIANTE</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-sm text-slate-500">R$</span>
                <span className="text-4xl font-bold text-white">49,90</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <p className="mt-4 text-slate-400 text-sm">Para quem está começando.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <PricingItem text="60 Gerações de Imagens Realistas" />
              <PricingItem text="900 Gerações de Texto" />
              <PricingItem text="Suporte por Email" />
              <PricingItem text="Acesso à IA Padrão" />
            </ul>

            <button 
              onClick={() => handleCheckout('basic')}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-xl border border-slate-700 hover:border-white hover:bg-slate-800 text-white font-semibold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPlan === 'basic' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Começar Básico'}
            </button>
          </div>

          {/* PLANO 2 - ESCALA PRO (DESTAQUE) */}
          <div className="reveal delay-200 relative p-[2px] rounded-3xl overflow-hidden transform md:-translate-y-4 hover:scale-[1.02] transition-transform duration-300 shadow-2xl shadow-purple-900/30">
            {/* ANIMAÇÃO DE BORDA GIRATÓRIA (FLASHY) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-border-spin opacity-75"></div>
            
            <div className="relative h-full bg-[#0F0520] p-8 rounded-[22px] flex flex-col">
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1.5 rounded-b-xl text-xs font-bold tracking-wider flex items-center gap-1 shadow-lg shadow-purple-900/50 z-20">
                  <Star className="w-3 h-3 fill-current" /> MAIS VENDIDO
                </div>

                <div className="mb-6 pt-4">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                    ESCALA PRO <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse"/>
                  </h3>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-sm text-slate-500">R$</span>
                    <span className="text-5xl font-extrabold text-white tracking-tight">97,00</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <p className="mt-4 text-slate-300 text-sm">O melhor custo-benefício para quem joga sério.</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-white font-bold bg-purple-900/20 p-2 rounded-lg border border-purple-500/20">
                    <div className="mt-0.5 p-0.5 rounded-full bg-purple-600"><Check className="w-3 h-3 text-white" /></div>
                    <span>300 Gerações de Imagens (10x mais!)</span>
                  </li>
                  <li className="flex items-start gap-3 text-white font-bold bg-purple-900/20 p-2 rounded-lg border border-purple-500/20">
                    <div className="mt-0.5 p-0.5 rounded-full bg-purple-600"><Check className="w-3 h-3 text-white" /></div>
                    <span>10.000 Gerações de Texto</span>
                  </li>
                  <PricingItem text="Acesso Prioritário (Geração mais rápida)" />
                  <PricingItem text="Modelos de IA Premium (Flux & GPT-4)" />
                  <PricingItem text="Suporte VIP no WhatsApp" />
                </ul>

                <button 
                  onClick={() => handleCheckout('pro')}
                  disabled={loadingPlan !== null}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg transition-all shadow-lg shadow-green-900/40 hover:shadow-green-500/30 transform active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loadingPlan === 'pro' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Processando...
                    </>
                  ) : (
                    'Quero Escalar Minhas Vendas'
                  )}
                </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};