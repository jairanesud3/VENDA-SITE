import React from 'react';
import { Zap } from 'lucide-react';

interface HeaderProps {
  onLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogin }) => {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.scrollTo(0,0)}>
          <div className="p-2 bg-purple-600/20 rounded-lg border border-purple-500/30 group-hover:border-purple-500 transition-colors">
            <Zap className="w-6 h-6 text-purple-400 group-hover:animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">DROP<span className="text-purple-500">HACKER</span>.AI</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="hidden md:block text-slate-300 hover:text-white font-medium transition-colors hover:scale-105 transform duration-200"
          >
            Login
          </button>
          <button 
            onClick={onLogin}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            Começar Agora
          </button>
        </div>
      </div>
    </header>
  );
};