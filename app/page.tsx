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

// Fundo Animado HIPER VELOCIDADE
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
    <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-purple-600/20 rounded-full blur-[100px] animate-side-to-side-hyper mix-blend-screen"></div>
    <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/15 rounded-full blur-[90px] animate-blob-hyper mix-blend-screen"></div>
    <div className="absolute bottom-[-10%] left-[20%] w-[70vw] h-[70vw] bg-pink-600/10 rounded-full blur-[120px] animate-side-to-side-hyper mix-blend-screen" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
  </div>
);

// Notificação de Falta de Pagamento
const PaymentStatusNotification = () => {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (canceled === 'true') {
      setIsVisible(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [canceled]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md animate-in slide-in-from-top-10 fade-in duration-300">
      <div className="bg-[#1a0b2e] border-2 border-red-500 text-white p-6 rounded-2xl shadow-[0_0_100px_rgba(239,68,68,0.6)] flex flex-col gap-4 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
        <div className="relative flex items-start gap-4">
            <div className="p-3 bg-red-600 rounded-full shrink-0 shadow-lg shadow-red-900/50">
            <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
            <h3 className="font-extrabold text-white text-lg uppercase tracking-tight mb-1">Pagamento Pendente</h3>
            <p className="text-slate-200 text-sm leading-relaxed font-medium">Você voltou antes de finalizar! Sua vaga no preço antigo ainda está reservada por <span className="text-red-400 font-bold">5 minutos</span>.</p>
            </div>
            <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
        <button 
          onClick={() => {
            document.getElementById('pricing')?.scrollIntoView({behavior: 'smooth'});
            setIsVisible(false);
          }} 
          className="relative w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-red-900/40 flex items-center justify-center gap-2 group overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">Finalizar Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12"></div>
        </button>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach((el) => observer.observe(el));
    return () => { hiddenElements.forEach((el) => observer.unobserve(el)); };
  }, []);

  const handleLoginNavigation = () => { router.push('/login'); };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white overflow-hidden relative">
      <AnimatedBackground />
      <Suspense fallback={null}><PaymentStatusNotification /></Suspense>
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