'use client'

import React, { useState } from 'react';
import { Zap, ArrowRight, AlertTriangle, UserCheck, Chrome } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { login, signup } from './actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDemoAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  const handleGoogleLogin = () => {
    // Simulação visual por enquanto
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        setError("A integração com Google está sendo configurada. Por favor, use e-mail e senha.");
    }, 1000);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const action = mode === 'login' ? login : signup;
      const result = await action(formData);
      
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0B0518]">
      
      {/* Background Effects (Hyper Speed) */}
      <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-purple-900/30 rounded-full blur-[100px] animate-side-to-side-hyper"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-indigo-900/30 rounded-full blur-[100px] animate-blob-hyper"></div>

      <div className="w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
           <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic">DROPHACKER</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
          
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta grátis'}
            </h1>
            <p className="text-slate-400 text-sm">
              Automatize suas vendas com Inteligência Artificial.
            </p>
          </div>

          {/* Google Button */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mb-4 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
          >
             <Chrome className="w-5 h-5 text-red-500" />
             Entrar com Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0f0721] px-2 text-slate-500">Ou use e-mail</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input 
                name="email" 
                type="email" 
                placeholder="E-mail Profissional" 
                required 
                autoComplete="email"
                className="bg-slate-950/50 border-slate-800 focus:bg-slate-900"
              />
            </div>
            
            <div className="space-y-2">
              <Input 
                name="password" 
                type="password" 
                placeholder="Senha" 
                required 
                minLength={6}
                autoComplete={mode === 'login' ? "current-password" : "new-password"}
                className="bg-slate-900/50 border-slate-800 focus:bg-slate-900"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-2 py-6 text-base" 
              isLoading={isLoading}
            >
              {mode === 'login' ? 'ENTRAR' : 'COMEÇAR AGORA'} 
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>

          <div className="mt-6 flex justify-center">
            <button 
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
            >
                {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>

        </div>
        
        {/* Demo Link */}
        <div className="mt-8 text-center">
            <button 
                onClick={handleDemoAccess}
                className="text-xs font-bold text-slate-600 hover:text-white transition-colors uppercase tracking-widest"
            >
                Acessar Demonstração (Visitante)
            </button>
        </div>

      </div>
    </div>
  );
}