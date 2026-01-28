import React from 'react';
import { BrainCircuit, Camera, ShieldCheck, Zap, Layers, Globe2 } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay, gradient }: any) => (
  <div className={`reveal ${delay} group relative p-1 rounded-2xl bg-gradient-to-b ${gradient} hover:scale-[1.02] transition-transform duration-300`}>
    <div className="absolute inset-0 bg-white/5 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
    <div className="relative h-full bg-[#130b24] rounded-xl p-8 border border-white/5 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-all"></div>
      
      <div className="w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  </div>
);

export const Features: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent -z-10"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 reveal">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Por que escolher o <span className="text-purple-400">DropAI</span>?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Nossa IA foi desenhada especificamente para substituir times inteiros de marketing por uma fração do custo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={BrainCircuit}
            title="Copywriting Humano"
            description="Esqueça textos robóticos. Nossa IA usa frameworks de persuasão (AIDA, PAS) para criar textos que convertem frios em compradores."
            delay="delay-100"
            gradient="from-purple-500/20 to-transparent"
          />
          <FeatureCard 
            icon={Camera}
            title="Studio AI"
            description="Gere fotos de produtos em qualquer cenário. Coloque seu produto em uma mesa de luxo ou sendo usado por um modelo em segundos."
            delay="delay-200"
            gradient="from-pink-500/20 to-transparent"
          />
          <FeatureCard 
            icon={ShieldCheck}
            title="Anti-Bloqueio"
            description="Nossos criativos são validados contra as políticas do Facebook Ads. Reduza seus banimentos em até 80%."
            delay="delay-300"
            gradient="from-blue-500/20 to-transparent"
          />
          <FeatureCard 
            icon={Zap}
            title="Velocidade Absurda"
            description="De produto cru para campanha rodando em menos de 5 minutos. Teste 10 produtos por dia sem cansar."
            delay="delay-400"
            gradient="from-yellow-500/20 to-transparent"
          />
          <FeatureCard 
            icon={Layers}
            title="Landing Pages"
            description="Em breve: Gerador de páginas de vendas completas, com copy, design e código pronto para Shopify."
            delay="delay-500"
            gradient="from-green-500/20 to-transparent"
          />
          <FeatureCard 
            icon={Globe2}
            title="Multilíngue"
            description="Venda para o mundo todo. Tradução e adaptação cultural automática para mais de 30 idiomas."
            delay="delay-600"
            gradient="from-cyan-500/20 to-transparent"
          />
        </div>
      </div>
    </section>
  );
};