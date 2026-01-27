import React from 'react';
import { Search, Cpu, DollarSign } from 'lucide-react';

const StepCard = ({ icon: Icon, step, title, description, delay }: { icon: any, step: string, title: string, description: string, delay: string }) => (
  <div className={`reveal ${delay} relative p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 group hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10`}>
    <div className="absolute -top-6 left-8 w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 group-hover:border-purple-500 group-hover:bg-purple-900/20 transition-all shadow-lg">
      <span className="text-xl font-bold text-slate-300 group-hover:text-purple-400">{step}</span>
    </div>
    <div className="mt-6">
      <Icon className="w-10 h-10 text-purple-500 mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-slate-950 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
          <p className="text-slate-400">Do produto ao lucro em 3 passos simples</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 pt-6">
          <StepCard 
            icon={Search}
            step="01"
            title="Cole o Nome do Produto"
            description="Apenas diga o que você vai vender. A IA identifica o nicho automaticamente."
            delay="delay-0"
          />
          <StepCard 
            icon={Cpu}
            step="02"
            title="Nossa IA Trabalha"
            description="Geramos 10 variações de copy persuasiva e fotos de uso real em segundos."
            delay="delay-200"
          />
          <StepCard 
            icon={DollarSign}
            step="03"
            title="Você Lucra"
            description="Copie, cole no gerenciador de anúncios e veja as vendas caírem na sua conta."
            delay="delay-300"
          />
        </div>
      </div>
    </section>
  );
};