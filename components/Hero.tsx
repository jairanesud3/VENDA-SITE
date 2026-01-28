import React from 'react';
import { ArrowRight, Sparkles, Layout, MousePointer2, MessageSquare, Image as ImageIcon, BarChart3, Globe } from 'lucide-react';

interface HeroProps {
  onLogin: () => void;
}

// Componente visual que simula o Dashboard na imagem
const DashboardPreview = () => (
  <div className="relative w-full max-w-4xl mx-auto mt-8 md:mt-12 aspect-[16/10] bg-[#1a1033] border border-white/10 rounded-xl shadow-2xl shadow-purple-900/50 overflow-hidden flex flex-col animate-float group hover:shadow-[0_0_50px_rgba(147,51,234,0.3)] transition-all duration-500">
    {/* Header Fake */}
    <div className="h-8 md:h-10 border-b border-white/5 bg-white/5 flex items-center px-3 md:px-4 gap-2">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/50"></div>
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/50"></div>
        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/50"></div>
      </div>
      <div className="mx-auto w-1/3 h-4 md:h-5 bg-white/5 rounded-md"></div>
    </div>
    
    {/* Body Fake */}
    <div className="flex-1 flex">
      {/* Sidebar Fake - Hidden on Mobile */}
      <div className="w-48 border-r border-white/5 bg-white/[0.02] p-4 hidden md:flex flex-col gap-3">
        <div className="h-8 w-full bg-purple-500/20 rounded-lg mb-4 animate-pulse"></div>
        {[1,2,3,4].map(i => <div key={i} className="h-4 w-3/4 bg-white/5 rounded"></div>)}
      </div>
      
      {/* Content Fake */}
      <div className="flex-1 p-4 md:p-6 relative overflow-hidden">
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="h-24 md:h-32 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-white/5 p-3 md:p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-purple-500/20 mb-2"></div>
            <div className="h-3 md:h-4 w-1/2 bg-white/10 rounded mb-2"></div>
            <div className="h-1.5 md:h-2 w-3/4 bg-white/5 rounded"></div>
          </div>
          <div className="h-24 md:h-32 rounded-xl bg-gradient-to-br from-pink-500/10 to-transparent border border-white/5 p-3 md:p-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] delay-100"></div>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded bg-pink-500/20 mb-2"></div>
            <div className="h-3 md:h-4 w-1/2 bg-white/10 rounded mb-2"></div>
            <div className="h-1.5 md:h-2 w-3/4 bg-white/5 rounded"></div>
          </div>
        </div>
        
        <div className="h-28 md:h-40 rounded-xl bg-white/5 border border-white/5 p-3 md:p-4 flex gap-4 items-center relative overflow-hidden">
             <div className="flex-1 space-y-2">
                 <div className="h-3 md:h-4 w-full bg-white/10 rounded"></div>
                 <div className="h-3 md:h-4 w-2/3 bg-white/10 rounded"></div>
             </div>
             <div className="w-20 h-20 md:w-32 md:h-32 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 opacity-50 blur-xl animate-pulse-slow"></div>
        </div>
      </div>
    </div>
  </div>
);

const Node = ({ icon: Icon, position, delay, color }: { icon: any, position: string, delay: string, color: string }) => (
  <div className={`absolute ${position} hidden lg:flex flex-col items-center justify-center animate-pulse-slow ${delay} z-20`}>
    <div className={`w-12 h-12 rounded-xl bg-[#0B0518] border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center relative group hover:scale-110 transition-transform duration-300`}>
       <Icon className={`w-6 h-6 ${color} drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]`} />
       <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[1px] bg-gradient-to-r from-transparent via-${color.split('-')[1]}-500/50 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
    </div>
  </div>
);

export const Hero: React.FC<HeroProps> = ({ onLogin }) => {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden bg-hero-glow">
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 text-center relative z-10">
        
        <div className="reveal inline-flex items-center gap-2 px-3 py-1.5 md:px-4 rounded-full bg-white/5 border border-white/10 text-purple-200 text-[10px] md:text-xs font-medium mb-6 hover:bg-white/10 transition-colors cursor-default backdrop-blur-md animate-[bounce_2s_infinite]">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Nova IA V.2.5: Crie campanhas vencedoras sozinho</span>
        </div>

        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[400px] bg-purple-600/30 blur-[80px] md:blur-[120px] rounded-full animate-blob pointer-events-none mix-blend-screen"></div>

        <h1 className="reveal delay-100 relative text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white drop-shadow-2xl px-2">
          Transforme Produtos<br/> em <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.5)]">Dinheiro.</span> <br/>
          
          <span className="text-2xl sm:text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 block mt-2 pb-2 drop-shadow-[0_0_35px_rgba(168,85,247,0.5)]">
            Anúncios Virais em 30s.
          </span>
        </h1>

        <p className="reveal delay-200 text-base md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed px-4">
          A IA treinada para Vendas Online. 
          Gere <strong className="text-white">textos que convencem</strong> e <strong className="text-white">imagens de estúdio</strong> instantaneamente.
        </p>

        <div className="reveal delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 relative z-20 px-4">
          <button 
            onClick={onLogin}
            className="group relative px-6 py-3 md:px-8 md:py-4 rounded-full bg-purple-600 text-white font-bold text-base md:text-lg transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] hover:-translate-y-1 w-full sm:w-auto overflow-hidden active:scale-95"
          >
            <span className="relative z-10">Quero Vender Mais</span>
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ripple"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <button 
            onClick={onLogin}
            className="group px-6 py-3 md:px-8 md:py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold backdrop-blur-sm transition-all w-full sm:w-auto flex items-center justify-center active:scale-95 text-base"
          >
            Ver Demonstração
            <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="reveal delay-300 relative mx-auto max-w-5xl px-2">
           <div className="hidden lg:block absolute top-1/2 left-0 w-32 h-px bg-gradient-to-r from-transparent to-purple-500/30 -translate-x-full"></div>
           <Node icon={Layout} position="top-[20%] -left-[5%]" delay="delay-0" color="text-blue-400" />
           <Node icon={MousePointer2} position="top-[50%] -left-[12%]" delay="delay-200" color="text-green-400" />
           <Node icon={MessageSquare} position="bottom-[20%] -left-[5%]" delay="delay-300" color="text-purple-400" />

           <DashboardPreview />

           <Node icon={ImageIcon} position="top-[20%] -right-[5%]" delay="delay-100" color="text-pink-400" />
           <Node icon={BarChart3} position="top-[50%] -right-[12%]" delay="delay-500" color="text-yellow-400" />
           <Node icon={Globe} position="bottom-[20%] -right-[5%]" delay="delay-200" color="text-cyan-400" />
        </div>

      </div>
    </section>
  );
};