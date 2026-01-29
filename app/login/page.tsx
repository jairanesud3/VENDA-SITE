'use client'

import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, AlertTriangle, UserCheck, Chrome, ArrowLeft, Lock, ShieldCheck, Sparkles } from 'lucide-react';
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
     // Animação de verificação de segurança
     const timer = setTimeout(() => setSecurityCheck(true), 1500);
     return () => clearTimeout(timer);
  }, []);

  const handleDemoAccess = () => {
    if(isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  const handleGoogleLogin = () => {
    if(isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        setError("Integração Enterprise: Aguardando aprovação do admin para SSO.");
    }, 1200);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validação Rigorosa
    if (!email || !email.includes('@') || email.length < 5) {
        setError("E-mail inválido. Utilize um endereço corporativo válido.");
        setIsLoading(false);
        return;
    }

    if (!password || password.length < 6) {
        setError("Credencial inválida: Senha muito curta.");
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
    } catch (e) {
      console.error(e);
      setError("Falha de comunicação segura com o servidor.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#030014] font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* --- BACKGROUND COMPLEXO & PROFISSIONAL --- */}
      
      {/* 1. Grid Cyberpunk em Movimento Suave */}
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none"></div>
      
      {/* 2. Luz de Fundo (Aurora) - Superior Central */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 blur-[120px] rounded-[100%] pointer-events-none animate-pulse-slow mix-blend-screen"></div>
      
      {/* 3. Orbes flutuantes nas pontas (Ambientação) */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full animate-blob pointer-events-none"></div>
      <div className="absolute top-1/2 right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* 4. Textura de Noise (Granulação para tirar o aspecto "chapado") */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>


      {/* --- INTERFACE UI --- */}

      {/* Botão Voltar (Estilo Glass) */}
      <button 
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 group"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white/10 group-hover:border-purple-500/50 transition-all">
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100">Retornar</span>
      </button>

      {/* Badge de Segurança (Canto Superior Direito) */}
      <div className="absolute top-8 right-8 z-50 flex flex-col items-end gap-1">
        <div className={`flex items-center gap-2 text-[10px] font-mono border px-2 py-1 rounded-md backdrop-blur-md transition-colors duration-1000 ${securityCheck ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 bg-slate-900/50 text-slate-500'}`}>
            <ShieldCheck className="w-3 h-3" />
            <span>{securityCheck ? 'SSL ENCRYPTED' : 'HANDSHAKE...'}</span>
        </div>
      </div>


      {/* CONTAINER PRINCIPAL (Login Card) */}
      <div className="w-full max-w-[420px] relative z-10 mx-4">
        
        {/* Efeito de Brilho atrás do Card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[30px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

        <div className="relative bg-[#0f0720]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 md:p-10 shadow-2xl shadow-black ring-1 ring-white/5 overflow-hidden">
          
          {/* Header do Card */}
          <div className="flex flex-col items-center text-center mb-8">
             <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4 ring-1 ring-white/20">
                <Zap className="w-6 h-6 text-white fill-white" />
             </div>
             <h2 className="text-2xl font-bold text-white tracking-tight">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Comece Gratuitamente'}
             </h2>
             <p className="text-slate-400 text-sm mt-2 max-w-[280px]">
                {mode === 'login' 
                    ? 'Entre para gerenciar sua operação de vendas.' 
                    : 'Junte-se a 12.000+ vendedores escalando com IA.'}
             </p>
          </div>

          {/* Social Login */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-white hover:bg-slate-200 text-[#0f0720] rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 mb-6 relative overflow-hidden group disabled:opacity-70"
          >
             <Chrome className="w-5 h-5 text-red-600 relative z-10" />
             <span className="relative z-10">{mode === 'login' ? 'Continuar com Google' : 'Cadastrar com Google'}</span>
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Credenciais</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                    <UserCheck className="w-5 h-5" />
                </div>
                <Input 
                    name="email" 
                    type="email" 
                    placeholder="E-mail Profissional" 
                    required 
                    disabled={isLoading}
                    autoComplete="email"
                    className="pl-12 bg-[#1a102e]/50 border-slate-800 focus:border-purple-500/50 focus:bg-[#1f1235] transition-all h-12 text-sm placeholder:text-slate-600"
                />
              </div>
            </div>
            
            <div className="space-y-2">
               <div className="relative group">
                <div className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                    <Lock className="w-5 h-5" />
                </div>
                <Input 
                    name="password" 
                    type="password" 
                    placeholder="Sua senha secreta" 
                    required 
                    disabled={isLoading}
                    minLength={6}
                    autoComplete={mode === 'login' ? "current-password" : "new-password"}
                    className="pl-12 bg-[#1a102e]/50 border-slate-800 focus:border-purple-500/50 focus:bg-[#1f1235] transition-all h-12 text-sm placeholder:text-slate-600"
                />
              </div>
              {mode === 'login' && (
                  <div className="flex justify-end">
                      <a href="#" className="text-[10px] text-slate-500 hover:text-purple-400 transition-colors">Esqueceu a senha?</a>
                  </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300 text-xs font-medium animate-in slide-in-from-top-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-6 text-sm font-bold tracking-wide shadow-xl shadow-purple-900/20 hover:shadow-purple-500/20" 
              isLoading={isLoading}
              disabled={isLoading}
            >
              {mode === 'login' ? 'ACESSAR DASHBOARD' : 'CRIAR CONTA GRÁTIS'} 
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>

          {/* Footer do Card */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4 text-center">
            <button 
                type="button"
                disabled={isLoading}
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                className="text-xs text-slate-400 hover:text-white transition-colors"
            >
                {mode === 'login' ? (
                    <>Ainda não tem conta? <span className="text-purple-400 font-bold ml-1">Cadastre-se grátis</span></>
                ) : (
                    <>Já possui cadastro? <span className="text-purple-400 font-bold ml-1">Faça Login</span></>
                )}
            </button>
            
            <button 
                onClick={handleDemoAccess}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors"
            >
                <Sparkles className="w-3 h-3" />
                Modo Visitante (Demo)
            </button>
          </div>

        </div>
        
        {/* Footer Text */}
        <div className="mt-6 text-center text-[10px] text-slate-600">
            &copy; 2026 DropHacker AI Inc. • Protegido por ReCaptcha Enterprise.
        </div>

      </div>
    </div>
  );
}