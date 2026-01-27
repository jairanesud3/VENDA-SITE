import React from 'react';
import { ArrowRight, Sparkles, Zap, MousePointerClick } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-36 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-purple-600/15 blur-[120px] -z-10 rounded-full animate-pulse-slow"></div>
      <div className="absolute top-20 right-0 w-72 h-72 bg-green-500/10 blur-[100px] -z-10 rounded-full animate-pulse-slow"></div>
      
      {/* Floating Elements decoration */}
      <div className="absolute top-40 left-10 md:left-20 animate-float opacity-30 md:opacity-50 pointer-events-none">
         <MousePointerClick className="w-12 h-12 text-purple-500 rotate-12" />
      </div>
      <div className="absolute bottom-20 right-10 md:right-20 animate-float delay-700 opacity-30 md:opacity-50 pointer-events-none">
         <Zap className="w-12 h-12 text-green-500 -rotate-12" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center">
        
        <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur border border-purple-500/30 text-purple-300 text-sm font-medium mb-8 hover:border-purple-400 transition-colors shadow-lg shadow-purple-900/20 cursor-default">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>A Revolução das Vendas Online Chegou</span>
        </div>

        <h1 className="reveal delay-100 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 text-white">
          Transforme Produtos em <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 glow-green animate-pulse">Dinheiro</span>.
          <br className="hidden md:block" />
          <span className="text-3xl md:text-5xl lg:text-6xl text-slate-300 font-bold block mt-2">Anúncios Virais em 30 Segundos.</span>
        </h1>

        <p className="reveal delay-200 text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          A primeira IA treinada exclusivamente para Vendas Online e E-commerce. Gere textos que convencem e imagens ultrarrealistas do seu produto instantaneamente.
        </p>

        <div className="reveal delay-300 flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={scrollToPricing}
            className="group relative w-full md:w-auto inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-slate-950 text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] transform hover:-translate-y-1 active:translate-y-0 active:scale-95"
          >
            Quero Vender Mais Agora
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>Setup em 2 minutos • Sem cartão</span>
          </div>
        </div>

      </div>
    </section>
  );
};