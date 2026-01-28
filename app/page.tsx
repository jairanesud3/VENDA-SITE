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

// Componente isolado para lidar com Parâmetros de URL (Necessário para evitar erros de Build no Next.js)
const PaymentStatusNotification = () => {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      setIsVisible(true);
      // Opcional: Auto-fechar após 10 segundos
      const timer = setTimeout(() => setIsVisible(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-top-10 fade-in duration-500">
      <div className="bg-[#1a0b2e] border border-red-500/50 text-white p-5 rounded-xl shadow-2xl flex items-start gap-4 relative overflow-hidden backdrop-blur-md">
        {/* Barra lateral decorativa */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-red-500 to-pink-600"></div>
        
        <div className="p-2.5 bg-red-500/10 rounded-full shrink-0 border border-red-500/20">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-red-100 text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
            Pagamento Pendente
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            Houve um problema ou você desistiu? Não deixe para depois o faturamento que você pode ter hoje. Sua vaga ainda está reservada.
          </p>
          <button 
            onClick={() => {
              document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'});
              setIsVisible(false);
            }} 
            className="text-white text-xs font-bold bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 w-fit"
          >
            Tentar Novamente <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <button 
          onClick={() => setIsVisible(false)} 
          className="text-slate-500 hover:text-white transition-colors absolute top-3 right-3"
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