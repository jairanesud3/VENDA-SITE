'use client';

import React, { useState } from 'react';
import { Check, Star, Zap, Loader2, Ban, Lock } from 'lucide-react';

const PricingItem = ({ text, included = true }: { text: string, included?: boolean }) => (
  <li className={`flex items-start gap-3 ${included ? 'text-slate-300' : 'text-slate-600'}`}>
    <div className={`mt-1 p-0.5 rounded-full border ${included ? 'bg-slate-800 border-slate-700' : 'bg-transparent border-slate-800'}`}>
      {included ? <Check className="w-3 h-3 text-green-500 shrink-0" /> : <Ban className="w-3 h-3 text-slate-600 shrink-0" />}
    </div>
    <span className={included ? '' : 'line-through decoration-slate-700'}>{text}</span>
  </li>
);

export const Pricing: React.FC = () => {
  const [loadingPlan, setLoadingPlan] = useState<'free' | 'basic' | 'pro' | null>(null);

  const handleCheckout = async (plan: 'free' | 'basic' | 'pro') => {
    setLoadingPlan(plan);
    // Simulação de redirecionamento ou lógica de checkout
    if (plan === 'free') {
        setTimeout(() => {
            window.location.href = '/login?plan=free'; // Redireciona para cadastro
        }, 1000);
    } else {
        // Lógica do Stripe existente
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });
            const data = await response.json();
            if (data.url) window.location.href = data.url;
            else setLoadingPlan(null);
        } catch (e) {
            setLoadingPlan(null);
        }
    }
  };

  return (
    <section id="pricing" className="py-20 md:py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <h2 className="reveal text-3xl md:text-5xl font-bold text-center mb-6 text-white">Planos para todos os níveis</h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">Comece grátis e escale conforme suas vendas aumentam.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          
          {/* PLANO 0 - GRATUITO (NOVO) */}
          <div className="reveal delay-100 p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col hover:border-slate-600 transition-colors backdrop-blur-sm order-2 md:order-1">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-400 uppercase tracking-widest">Teste Grátis</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-sm text-slate-500">R$</span>
                <span className="text-4xl font-bold text-white">0,00</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <p className="mt-4 text-slate-400 text-sm">Para conhecer a ferramenta.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 text-sm">
              <PricingItem text="5 Gerações de Texto / mês" />
              <PricingItem text="2 Gerações de Imagem / mês" />
              <PricingItem text="Acesso à IA Padrão" />
              <PricingItem text="Ferramentas Avançadas" included={false} />
              <PricingItem text="Suporte Humano" included={false} />
            </ul>

            <button 
              onClick={() => handleCheckout('free')}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-semibold transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loadingPlan === 'free' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Conta Grátis'}
            </button>
          </div>

          {/* PLANO 2 - ESCALA PRO (DESTAQUE - CENTRO) */}
          <div className="reveal delay-200 relative p-[2px] rounded-3xl overflow-hidden transform md:-translate-y-6 hover:scale-[1.02] transition-transform duration-300 shadow-2xl shadow-purple-900/30 order-1 md:order-2 z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-border-spin opacity-75"></div>
            
            <div className="relative h-full bg-[#0F0520] p-6 md:p-8 rounded-[22px] flex flex-col">
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-b-lg text-[10px] md:text-xs font-bold tracking-wider flex items-center gap-1 shadow-lg shadow-purple-900/50 z-20 whitespace-nowrap">
                  <Star className="w-3 h-3 fill-current" /> RECOMENDADO
                </div>

                <div className="mb-6 pt-4">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                    ESCALA PRO <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse"/>
                  </h3>
                  
                  <div className="mt-4 mb-1 flex items-center gap-2">
                      <span className="text-sm text-slate-400 font-medium line-through decoration-red-500/50">R$ 299</span>
                      <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30">OFERTA</span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-slate-500">R$</span>
                    <span className="text-5xl font-extrabold text-white tracking-tight">97,00</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <p className="mt-4 text-slate-300 text-sm">Sem limites. Potência máxima.</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 text-sm">
                  <li className="flex items-start gap-3 text-white font-bold bg-purple-900/20 p-2 rounded-lg border border-purple-500/20">
                    <Check className="w-4 h-4 text-purple-400 mt-0.5" />
                    <span>Ilimitado: Textos e Roteiros</span>
                  </li>
                  <PricingItem text="300 Gerações de Imagens" />
                  <PricingItem text="Modelos Premium (Gemini 2.5 + GPT-4)" />
                  <PricingItem text="Studio Product AI (Fotos 4K)" />
                  <PricingItem text="Suporte Prioritário WhatsApp" />
                </ul>

                <button 
                  onClick={() => handleCheckout('pro')}
                  disabled={loadingPlan !== null}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg transition-all shadow-lg shadow-green-900/40 hover:shadow-green-500/30 transform active:scale-95 flex items-center justify-center disabled:opacity-50"
                >
                  {loadingPlan === 'pro' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Quero Escalar Vendas'}
                </button>
            </div>
          </div>

          {/* PLANO 1 - INICIANTE */}
          <div className="reveal delay-300 p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col hover:border-slate-600 transition-colors backdrop-blur-sm order-3">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-400 uppercase tracking-widest">Iniciante</h3>
              <div className="mt-4 mb-1 text-sm text-slate-500 font-medium">50% OFF</div>
              
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-slate-500">R$</span>
                <span className="text-4xl font-bold text-white">49,90</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <p className="mt-4 text-slate-400 text-sm">Para quem está começando.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1 text-sm">
              <PricingItem text="900 Gerações de Texto" />
              <PricingItem text="60 Gerações de Imagens" />
              <PricingItem text="Suporte por Email" />
              <PricingItem text="Studio Product AI (Básico)" />
              <PricingItem text="Acesso à Comunidade" included={false} />
            </ul>

            <button 
              onClick={() => handleCheckout('basic')}
              disabled={loadingPlan !== null}
              className="w-full py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-semibold transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loadingPlan === 'basic' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assinar Básico'}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};