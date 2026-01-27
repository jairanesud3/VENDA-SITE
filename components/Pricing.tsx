import React from 'react';
import { Check, Star } from 'lucide-react';

const PricingItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3 text-slate-300">
    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
    <span>{text}</span>
  </li>
);

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="reveal text-4xl font-bold text-center mb-16">Escolha Seu Plano</h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* PLANO 1 */}
          <div className="reveal delay-100 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col hover:border-slate-600 transition-colors">
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

            <button className="w-full py-3 rounded-xl border border-slate-700 hover:border-white hover:bg-slate-800 text-white font-semibold transition-all">
              Começar Básico
            </button>
          </div>

          {/* PLANO 2 (DESTAQUE) */}
          <div className="reveal delay-200 relative p-8 rounded-3xl bg-slate-900 border-2 border-purple-500 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] flex flex-col transform md:-translate-y-4 hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 fill-current" /> MAIS VENDIDO
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-purple-400">ESCALA PRO</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-sm text-slate-500">R$</span>
                <span className="text-5xl font-extrabold text-white">97,00</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <p className="mt-4 text-slate-300 text-sm">O melhor custo-benefício para quem joga sério.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <span>300 Gerações de Imagens (10x mais poder!)</span>
              </li>
              <li className="flex items-start gap-3 text-white font-medium">
                <Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <span>10.000 Gerações de Texto (Copy Ilimitada na prática)</span>
              </li>
              <PricingItem text="Acesso Prioritário (Geração mais rápida)" />
              <PricingItem text="Modelos de IA Premium (Flux & GPT-4)" />
              <PricingItem text="Suporte VIP" />
            </ul>

            <button className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-bold text-lg transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/40">
              Quero Escalar Minhas Vendas
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};