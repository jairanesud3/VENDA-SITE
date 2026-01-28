'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Zap, Star, Loader2, ArrowLeft, ShieldCheck, CreditCard, Banknote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function PlansPage() {
  const [loadingPlan, setLoadingPlan] = useState<'basic' | 'pro' | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();

  useEffect(() => {
    const fetchPlan = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.plan) {
            setCurrentPlan(user.user_metadata.plan);
        }
    };
    fetchPlan();
  }, []);

  const handleCheckout = async (plan: 'basic' | 'pro') => {
    setLoadingPlan(plan);
    try {
        // Envia o ciclo de cobrança junto (caso o backend suporte no futuro)
        const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan, cycle: billingCycle }),
        });
        
        const data = await response.json();
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Erro ao iniciar checkout: " + (data.error || "Tente novamente."));
            setLoadingPlan(null);
        }
    } catch (e) {
        console.error(e);
        alert("Erro de conexão.");
        setLoadingPlan(null);
    }
  };

  const PlanFeature = ({ text, included = true }: { text: string, included?: boolean }) => (
    <li className={`flex items-start gap-3 ${included ? 'text-slate-300' : 'text-slate-600'}`}>
      <div className={`mt-0.5 p-0.5 rounded-full border ${included ? 'bg-purple-500/10 border-purple-500/50' : 'bg-transparent border-slate-800'}`}>
        {included ? <Check className="w-3 h-3 text-purple-400" /> : <X className="w-3 h-3 text-slate-600" />}
      </div>
      <span className={included ? '' : 'line-through decoration-slate-700'}>{text}</span>
    </li>
  );

  return (
    <div className="min-h-screen bg-[#0B0518] text-white font-sans relative overflow-hidden flex flex-col">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-purple-900/20 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
          >
              <ArrowLeft className="w-4 h-4" /> Voltar para Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-white hidden sm:block">DROP<span className="text-purple-400">HACKER</span></span>
          </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="text-center mb-10 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Escolha seu Poder de Fogo</h1>
            <p className="text-slate-400 text-lg">
                Desbloqueie ferramentas de IA que substituem uma equipe inteira.
            </p>
        </div>

        {/* Toggle Mensal/Anual */}
        <div className="flex items-center justify-center gap-4 mb-12 bg-slate-900/50 p-1.5 rounded-full border border-slate-800 inline-flex mx-auto backdrop-blur-sm">
            <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                Mensal
            </button>
            <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                Anual
                <span className="bg-white text-purple-600 text-[10px] px-1.5 rounded font-extrabold">-20%</span>
            </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full items-center">
            
            {/* PLANO BÁSICO */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-md hover:border-slate-600 transition-all duration-300 flex flex-col h-full">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest mb-2">Iniciante</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm text-slate-500">R$</span>
                        <span className="text-4xl font-bold text-white">
                            {billingCycle === 'monthly' ? '49,90' : '39,90'}
                        </span>
                        <span className="text-slate-500">/mês</span>
                    </div>
                    {billingCycle === 'yearly' && <p className="text-green-400 text-xs font-bold mt-1">Faturado R$ 478,80 anualmente</p>}
                    <p className="text-slate-500 text-sm mt-4">Ideal para quem está validando os primeiros produtos.</p>
                </div>
                <div className="w-full h-px bg-slate-800 my-6"></div>
                <ul className="space-y-4 mb-8 text-sm flex-1">
                    <PlanFeature text="IA de Texto Ilimitada" />
                    <PlanFeature text="60 Imagens de Estúdio / mês" />
                    <PlanFeature text="Análise de Concorrentes" />
                    <PlanFeature text="Roteiros TikTok Virais" included={false} />
                    <PlanFeature text="Filtro Anti-Bloqueio Avançado" included={false} />
                    <PlanFeature text="Suporte Prioritário" included={false} />
                </ul>
                <button 
                    onClick={() => handleCheckout('basic')}
                    disabled={loadingPlan !== null || currentPlan === 'basic'}
                    className={`w-full py-4 rounded-xl font-bold border transition-all flex items-center justify-center gap-2
                    ${currentPlan === 'basic' 
                        ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-default' 
                        : 'border-slate-600 hover:bg-slate-800 text-white hover:border-white/20'}`}
                >
                    {loadingPlan === 'basic' ? <Loader2 className="animate-spin" /> : currentPlan === 'basic' ? 'Seu Plano Atual' : 'Assinar Básico'}
                </button>
                <div className="mt-4 flex justify-center gap-3 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <CreditCard className="w-5 h-5"/>
                    <Banknote className="w-5 h-5"/>
                </div>
            </div>

            {/* PLANO PRO (DESTACADO) */}
            <div className="relative bg-[#130725] border border-purple-500/30 rounded-3xl p-8 md:p-10 shadow-2xl shadow-purple-900/40 transform md:-translate-y-4 hover:scale-[1.02] transition-transform duration-300 flex flex-col h-full">
                {/* Badge */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest flex items-center gap-2 shadow-lg shadow-purple-900/50">
                    <Star className="w-3 h-3 fill-white" /> MAIS ESCOLHIDO
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        Escala Pro <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse"/>
                    </h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm text-slate-500">R$</span>
                        <span className="text-5xl font-bold text-white">
                             {billingCycle === 'monthly' ? '97,00' : '77,60'}
                        </span>
                        <span className="text-slate-500">/mês</span>
                    </div>
                    {billingCycle === 'yearly' && <p className="text-green-400 text-xs font-bold mt-1">Faturado R$ 931,20 anualmente (Economize R$ 232)</p>}
                    <p className="text-slate-400 text-sm mt-4">Poder total para escalar suas vendas sem limites.</p>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-6"></div>
                <ul className="space-y-4 mb-8 text-sm flex-1">
                    <PlanFeature text="IA de Texto & Roteiros Ilimitados" />
                    <PlanFeature text="300 Imagens de Estúdio / mês" />
                    <PlanFeature text="Gerador de Personas (Hacker de Avatar)" />
                    <PlanFeature text="Calculadora de ROAS & Lucro" />
                    <PlanFeature text="Filtro Anti-Bloqueio (Blacklist Check)" />
                    {/* AQUI ESTÁ A MUDANÇA SOLICITADA */}
                    <PlanFeature text="IA de Última Geração (Mais Inteligente)" />
                    <PlanFeature text="Suporte VIP WhatsApp" />
                </ul>
                <button 
                    onClick={() => handleCheckout('pro')}
                    disabled={loadingPlan !== null || currentPlan === 'pro'}
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                    ${currentPlan === 'pro'
                        ? 'bg-green-900/20 border border-green-500/50 text-green-400 cursor-default'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/30 hover:shadow-purple-500/40 active:scale-95'}`}
                >
                    {loadingPlan === 'pro' ? <Loader2 className="animate-spin" /> : currentPlan === 'pro' ? 'Plano Ativo' : 'Quero Escalar Vendas'}
                </button>
                <div className="mt-4 flex justify-center items-center gap-2 text-[10px] text-slate-500">
                    <div className="flex gap-2 opacity-60">
                         <CreditCard className="w-4 h-4"/>
                         <Banknote className="w-4 h-4"/>
                    </div>
                    <span>Pagamento Seguro SSL</span>
                </div>
            </div>

        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Pagamento 100% Seguro via Stripe. Garantia de 7 dias.</span>
        </div>
      </div>
    </div>
  );
}