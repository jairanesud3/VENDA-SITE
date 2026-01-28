import React from 'react';
import { Search, Cpu, DollarSign, ArrowRight } from 'lucide-react';

const StepCard = ({ number, title, description, icon: Icon }: any) => (
  <div className="relative group h-full">
    {/* Glow effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div className="relative h-full flex flex-col items-start gap-4 p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1">
      <div className="w-full flex justify-between items-start">
        <div className="w-12 h-12 rounded-lg bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-sm">
           <Icon className="w-6 h-6" />
        </div>
        <span className="text-4xl font-bold text-white/5 select-none">{number}</span>
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          {title} 
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 bg-[#0d061c] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12 reveal">
          <span className="text-purple-400 font-bold tracking-wider text-xs uppercase mb-2 block">Processo Validado</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Do Link ao Lucro em 3 Passos
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 reveal delay-100">
          <StepCard 
            number="01"
            title="Cole o Link"
            icon={Search}
            description="Não perca tempo digitando. Apenas cole o link do produto (AliExpress, Shopee, Amazon) e nossa IA analisa o mercado e seus concorrentes em tempo real."
          />
          <StepCard 
            number="02"
            title="A Mágica Acontece"
            icon={Cpu}
            description="Nossa inteligência cria textos persuasivos (Copywriting) e gera imagens de estúdio do seu produto que convertem cliques em vendas."
          />
          <StepCard 
            number="03"
            title="Venda de Verdade"
            icon={DollarSign}
            description="Baixe seus criativos prontos, suba no Facebook ou TikTok Ads e veja o resultado. Sem depender de designers caros ou agências lentas."
          />
        </div>
      </div>
    </section>
  );
};