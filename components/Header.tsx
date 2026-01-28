'use client';

import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface HeaderProps {
  onLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogin }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex justify-center ${scrolled ? 'pt-4' : 'pt-6'}`}>
      <div className={`
        flex items-center justify-between px-6 transition-all duration-300
        ${scrolled 
          ? 'w-[90%] md:w-[70%] h-16 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg shadow-purple-900/20' 
          : 'w-full max-w-7xl h-20 bg-transparent border-transparent'}
      `}>
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-lg shadow-lg shadow-purple-500/30">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">DROP<span className="text-purple-400">HACKER</span></span>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onLogin}
            className="hidden md:block text-sm text-slate-300 hover:text-white font-medium transition-colors"
          >
            Login
          </button>
          <button 
            onClick={onLogin}
            className={`
              bg-white text-purple-950 hover:bg-purple-50 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg 
              ${scrolled ? 'scale-95' : ''}
            `}
          >
            Começar Agora
          </button>
        </div>
      </div>
    </header>
  );
};