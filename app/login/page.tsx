'use client'

import React, { useState } from 'react';
import { Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { login, signup } from './actions';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manipulador do formulário
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const action = mode === 'login' ? login : signup;
      const result = await action(formData);
      
      // Se houver erro retornado pela Server Action
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // Se sucesso, o redirect acontece no server action
    } catch (e) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0B0518]">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0B0518] to-[#0B0518] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
           <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic">DROPHACKER</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
          
          {/* Tabs */}
          <div className="flex p-1 bg-black/20 rounded-xl mb-8 border border-white/5">
            <button 
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                mode === 'login' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              ENTRAR
            </button>
            <button 
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                mode === 'signup' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              CADASTRAR
            </button>
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              {mode === 'login' ? 'Bem-vindo de volta!' : 'Comece a hackear vendas.'}
            </h1>
            <p className="text-slate-400 text-sm">
              {mode === 'login' 
                ? 'Acesse seu painel e crie novos anúncios.' 
                : 'Crie sua conta gratuita em segundos.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail Profissional</label>
              <Input 
                name="email" 
                type="email" 
                placeholder="seu@email.com" 
                required 
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
              <Input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                minLength={6}
                autoComplete={mode === 'login' ? "current-password" : "new-password"}
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
              className="w-full mt-4" 
              isLoading={isLoading}
            >
              {mode === 'login' ? 'ACESSAR PAINEL' : 'CRIAR CONTA AGORA'} 
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>

          {mode === 'login' && (
            <div className="mt-6 text-center">
              <a href="#" className="text-xs text-slate-500 hover:text-purple-400 transition-colors">
                Esqueceu sua senha?
              </a>
            </div>
          )}

        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          Protegido por reCAPTCHA e sujeito à Política de Privacidade e Termos de Uso do DropAI.
        </p>

      </div>
    </div>
  );
}