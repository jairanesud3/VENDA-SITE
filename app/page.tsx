'use client'

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { Features } from '@/components/Features';
import { Testimonials } from '@/components/Testimonials';
import { Pricing } from '@/components/Pricing';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';
import { SupportWidget } from '@/components/SupportWidget';
import { AlertCircle, X, ArrowRight } from 'lucide-react';

// Componente isolado para lidar com Parâmetros de URL
const PaymentStatusNotification = () => {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  
  // Extrai o valor para garantir que o efeito reaja à mudança
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    // Verifica explicitamente se é 'true'
    if (canceled === 'true') {
      setIsVisible(true);
      // Timer removido para garantir que o usuário veja a mensagem
    }
  }, [canceled]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
      <div className="bg-[#1a0b2e] border-2 border-red-500/50 text-white p-5 rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.4)] flex items-start gap-4 relative overflow-hidden backdrop-blur-xl">
        
        {/* Barra lateral decorativa */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-red-500 to-pink-600"></div>
        
        <div className="p-2.5 bg-red-500/20 rounded-full shrink-0 border border-red-500/30">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-red-100 text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            Pagamento Não Concluído
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed mb-4 font-medium">
            Parece que você não finalizou sua assinatura. Seus concorrentes já estão usando IA. Não fique para trás.
          </p>
          <button 
            onClick={() => {
              document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'});
              setIsVisible(false);
            }} 
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white text-sm font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
          >
            Voltar para Planos <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={() => setIsVisible(false)} 
          className="text-slate-400 hover:text-white transition-colors absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();

  // Scroll Animations Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleLoginNavigation = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white overflow-hidden">
      {/* Suspense é necessário para componentes que usam useSearchParams */}
      <Suspense fallback={null}>
        <PaymentStatusNotification />
      </Suspense>

      <Header onLogin={handleLoginNavigation} />
      <main>
        <Hero onLogin={handleLoginNavigation} />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}