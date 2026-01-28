'use client'

import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, AlertTriangle, UserCheck, Chrome, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { login, signup } from './actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securityCheck, setSecurityCheck] = useState(false);
  const router = useRouter();

  useEffect(() => {
     // Simula uma verificação de segurança no mount para feedback visual
     setSecurityCheck(true);
  }, []);

  const handleDemoAccess = () => {
    if(isLoading) return;
    setIsLoading(true);
    // Pequeno delay para UX
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  const handleGoogleLogin = () => {
    if(isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        setError("Integração Google: Configuração de segurança pendente no servidor.");
    }, 1000);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validação Client-Side Básica (Prática de Segurança e UX)
    if (!email || !email.includes('@') || email.length < 5) {
        setError("Formato de e-mail inválido.");
        setIsLoading(false);
        return;
    }

    if (!password || password.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres.");
        setIsLoading(false);
        return;
    }

    try {
      const action = mode === 'login' ? login : signup;
      const result = await action(formData);
      
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // Se sucesso, o server action faz o redirect
    } catch (e) {
      console.error(e);
      setError("Erro de conexão. Verifique sua internet.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0B0518] selection:bg-purple-500 selection:text-white">
      
      {/* Botão Voltar (Enhanced) */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-slate-500 hover:text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest group bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 hover:border-purple-500/50 backdrop-blur-sm"
      >
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        Voltar
      </button>

      {/* Security Badge */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2 text-emerald-500/50 text-[10px] font-mono tracking-tighter select-none">
        <ShieldCheck className="w-3 h-3" />
        SECURE_CONNECTION: {securityCheck ? 'ENCRYPTED' : 'CHECKING...'}
      </div>

      {/* Background Effects (Hyper Speed) */}
      <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-purple-900/20 rounded-full blur-[120px] animate-side-to-side-hyper mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-indigo-900/20 rounded-full blur-[120px] animate-blob-hyper mix-blend-screen"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      <div className="w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Logo */}
        <div className="flex justify-center mb-8 transform hover:scale-105 transition-transform duration-500">
           <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-2xl shadow-purple-500/30 ring-1 ring-white/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tighter italic">DROPHACKER</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black ring-1 ring-white/5 relative overflow-hidden">
          
          {/* Top Line Decor */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {mode === 'login' ? 'Acesse o painel de controle da sua operação.' : 'Comece a escalar suas vendas hoje.'}
            </p>
          </div>

          {/* Google Button */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full mb-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
             <Chrome className="w-5 h-5 text-red-500" />
             {mode === 'login' ? 'Entrar com Google' : 'Cadastrar com Google'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-[#0e061e] px-3 text-slate-600">ou via credenciais</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">E-mail Profissional</label>
              <div className="relative group">
                <Input 
                    name="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    required 
                    disabled={isLoading}
                    autoComplete="email"
                    className="bg-slate-900/50 border-slate-800 focus:bg-slate-900 focus:border-purple-500/50 pl-10 transition-all"
                />
                <UserCheck className="absolute left-3 top-3.5 w-4 h-4 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
              </div>
            </div>
            
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Senha Segura</label>
               <div className="relative group">
                <Input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    disabled={isLoading}
                    minLength={6}
                    autoComplete={mode === 'login' ? "current-password" : "new-password"}
                    className="bg-slate-900/50 border-slate-800 focus:bg-slate-900 focus:border-purple-500/50 pl-10 transition-all"
                />
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs font-medium animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full mt-2 py-6 text-sm tracking-wide shadow-purple-900/20" 
              isLoading={isLoading}
              disabled={isLoading}
            >
              {mode === 'login' ? 'ACESSAR CONTA' : 'CRIAR CONTA GRÁTIS'} 
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>

          <div className="mt-6 flex justify-center">
            <button 
                type="button"
                disabled={isLoading}
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                className="text-xs text-slate-400 hover:text-white transition-colors border-b border-transparent hover:border-slate-500 pb-0.5"
            >
                {mode === 'login' ? 'Novo por aqui? Crie uma conta' : 'Já é membro? Faça login'}
            </button>
          </div>

        </div>
        
        {/* Demo Link */}
        <div className="mt-8 text-center">
            <button 
                onClick={handleDemoAccess}
                disabled={isLoading}
                className="text-[10px] font-extrabold text-slate-600 hover:text-purple-400 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:scale-105 active:scale-95 duration-300"
            >
                <Zap className="w-3 h-3" />
                Acessar Demonstração (Modo Visitante)
            </button>
        </div>

      </div>
    </div>
  );
}