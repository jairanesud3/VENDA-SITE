import React from 'react';
import { Star, TrendingUp, CheckCircle2 } from 'lucide-react';

const ReviewCard = ({ name, role, image, text, metric, delay }: { name: string, role: string, image: string, text: string, metric: string, delay: string }) => (
  <div className={`reveal ${delay} p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10`}>
    <div className="flex items-center gap-4 mb-4">
      <img src={image} alt={name} className="w-12 h-12 rounded-full border-2 border-purple-500/30 object-cover" />
      <div>
        <h4 className="font-bold text-white leading-tight">{name}</h4>
        <p className="text-xs text-slate-400">{role}</p>
      </div>
      <div className="ml-auto flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        ))}
      </div>
    </div>
    
    <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">"{text}"</p>
    
    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded-full">
        <TrendingUp className="w-3 h-3" />
        {metric}
      </div>
      <div className="flex items-center gap-1 text-slate-500 text-xs">
        <CheckCircle2 className="w-3 h-3 text-blue-500" />
        Compra Verificada
      </div>
    </div>
  </div>
);

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-slate-950 relative">
      {/* Background Gradient Spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-900/10 blur-[100px] rounded-full -z-10"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            Quem Usa, <span className="text-green-500 glow-green">Escala</span>.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Não acredite na nossa palavra. Veja os resultados de quem parou de perder tempo criando anúncios ruins.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ReviewCard 
            name="Ricardo Mattos"
            role="E-commerce (Nicho Pet)"
            image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
            text="Eu gastava R$ 500 por semana com designers. Agora crio criativos melhores em segundos. Meu ROAS saiu de 1.8 para 4.2 em 3 dias."
            metric="+133% de ROAS"
            delay="delay-100"
          />
          <ReviewCard 
            name="Juliana Costa"
            role="Loja de Moda"
            image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces"
            text="A IA entendeu exatamente a 'vibe' da minha marca. As imagens parecem ensaios fotográficos de estúdio. É bizarro de tão bom."
            metric="Economia de R$ 2.5k/mês"
            delay="delay-200"
          />
          <ReviewCard 
            name="Carlos Ferraz"
            role="Gestor de Tráfego"
            image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces"
            text="O CTR dos meus anúncios no TikTok explodiu. O filtro anti-bloqueio é real, parei de tomar shadowban nas contas novas."
            metric="CTR de 3.5% (Média)"
            delay="delay-300"
          />
        </div>
      </div>
    </section>
  );
};