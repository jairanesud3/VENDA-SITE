'use client';

import React, { useState, useRef } from 'react';
import { Camera, Download, Loader2, Sparkles, AlertTriangle, Lock, Upload, ImagePlus, X, RefreshCw, Palette, Grid3X3, Sun, Moon, Monitor, Leaf, Gem, Box, Aperture } from 'lucide-react';
import { generateProductImage } from '@/app/actions/generate-image';
import { Button } from '@/components/ui/button';

interface ImageToolProps {
  userPlan: 'free' | 'pro';
  onUpgrade: () => void;
}

// --- ESTILOS DE FUNDO (BACKGROUNDS) ---
const BACKGROUNDS = [
  { 
    id: 'studio', 
    name: 'Estúdio Dark', 
    icon: Moon,
    class: 'bg-[#050505] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-[#050505] to-[#000000]' 
  },
  { 
    id: 'concrete', 
    name: 'Concreto Minimal', 
    icon: Box,
    class: 'bg-[#1c1c1c] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#333] via-[#1c1c1c] to-[#111]' 
  },
  { 
    id: 'softbox', 
    name: 'Soft Studio', 
    icon: Aperture,
    class: 'bg-[#2a2a2a] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#404040] via-[#2a2a2a] to-[#1a1a1a]' 
  },
  { 
    id: 'emerald', 
    name: 'Emerald Jungle', 
    icon: Leaf,
    class: 'bg-[#0a1f0a] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-green-900/40 via-[#0a1f0a] to-black' 
  },
  { 
    id: 'velvet', 
    name: 'Red Velvet', 
    icon: Gem,
    class: 'bg-[#1a0505] bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-red-900/30 via-[#1a0505] to-black' 
  },
  { 
    id: 'golden', 
    name: 'Golden Hour', 
    icon: Sun,
    class: 'bg-[#1a0b00] bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-orange-900/20 via-[#1a0b00] to-black' 
  },
  { 
    id: 'cyber', 
    name: 'Cyber Grid', 
    icon: Grid3X3,
    class: 'bg-[#09090b] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]' 
  },
  { 
    id: 'aurora', 
    name: 'Neon Aurora', 
    icon: Sparkles,
    class: 'bg-[#0F0520] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0F0520] to-black' 
  },
  { 
    id: 'blueprint', 
    name: 'Tech Blue', 
    icon: Monitor,
    class: 'bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950' 
  },
  { 
    id: 'pure', 
    name: 'OLED Black', 
    icon: Palette,
    class: 'bg-black' 
  }
];

export const ImageTool: React.FC<ImageToolProps> = ({ userPlan, onUpgrade }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeBg, setActiveBg] = useState(BACKGROUNDS[0]);
  
  // Estado para Imagem de Referência
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("A imagem deve ter no máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
        setError("Por favor, descreva o cenário desejado.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      // Passa a imagem de referência (se houver) para a Server Action
      const url = await generateProductImage(prompt, referenceImage || undefined);
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao gerar imagem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#0B0518] overflow-hidden">
      
      {/* LEFT PANEL: CONTROLS */}
      <div className="w-full lg:w-[400px] bg-slate-950 border-r border-slate-800 p-6 flex flex-col h-auto lg:h-full z-20 shadow-2xl overflow-y-auto custom-scrollbar">
        
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
               <Camera className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Studio Product AI</h2>
          </div>
          <p className="text-sm text-slate-400">
            Crie fotos de estúdio ultra-realistas (4K). Use uma foto do seu produto como base ou crie do zero.
          </p>
        </div>

        {/* 
            BANNER DE BLOQUEIO PARA VISITANTES (FREE)
            (Descomentar quando quiser bloquear o uso gratuito)
        */}
        {/* {userPlan === 'free' && (
           <div className="mb-6 p-4 bg-slate-900/80 border border-yellow-500/30 rounded-xl relative overflow-hidden group animate-in fade-in slide-in-from-top-2">
              <div className="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>
              <div className="relative z-10 flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                    <Lock className="w-4 h-4" /> Recurso Exclusivo
                 </div>
                 <p className="text-xs text-slate-300 leading-relaxed">
                    Este modelo de IA (Kino XL) é exclusivo para assinantes. 
                    Disponível no plano <span className="text-white font-bold">Iniciante</span> (pacote básico) e <span className="text-purple-400 font-bold">PRO</span> (potência máxima).
                 </p>
                 <button onClick={onUpgrade} className="mt-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold py-2.5 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-orange-900/20">
                    Liberar Acesso Agora
                 </button>
              </div>
           </div>
        )} */}

        <div className="space-y-6 flex-1">
          
          {/* AREA DE UPLOAD DE IMAGEM */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block flex justify-between">
              <span>1. Foto do Produto (Opcional)</span>
              {referenceImage && <span className="text-green-400">Imagem carregada</span>}
            </label>
            
            {!referenceImage ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-700 hover:border-orange-500/50 hover:bg-slate-900/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                    <div className="p-3 bg-slate-900 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-white font-medium">Clique para enviar foto</span>
                    <span className="text-[10px] text-slate-600 mt-1">PNG ou JPG (Max 5MB)</span>
                </div>
            ) : (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-700 group">
                    <img src={referenceImage} alt="Referência" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    <button 
                        onClick={() => { setReferenceImage(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur-sm"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] text-white font-bold text-center">
                        Usando como referência
                    </div>
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png, image/jpeg, image/jpg" 
                className="hidden" 
            />
          </div>

          {/* AREA DE PROMPT */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              2. Descreva o Cenário / Fundo
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              placeholder={referenceImage 
                ? "Ex: Coloque este produto em cima de uma pedra de mármore, fundo desfocado de luxo, iluminação de cinema..."
                : "Ex: Uma garrafa térmica preta moderna em cima de uma mesa de madeira rústica..."
              }
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors resize-none custom-scrollbar"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2 text-red-300 text-xs animate-in slide-in-from-top-2">
               <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
               <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="w-full py-6 text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-lg shadow-orange-900/20"
          >
            {isLoading ? (
               <div className="flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 <span>PROCESSANDO...</span>
               </div>
            ) : (
               <div className="flex items-center gap-2">
                 {referenceImage ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                 <span>{referenceImage ? 'TRANSFORMAR PRODUTO' : 'GERAR DO ZERO'}</span>
               </div>
            )}
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW */}
      <div className={`flex-1 relative flex items-center justify-center p-8 overflow-hidden transition-all duration-700 ease-in-out ${activeBg.class}`}>
         
         {/* BACKGROUND SELECTOR (STABLE & MODERN) */}
         <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-[95%] md:max-w-2xl">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-2xl overflow-x-auto custom-scrollbar no-scrollbar mx-auto">
                {BACKGROUNDS.map((bg) => (
                    <button
                        key={bg.id}
                        onClick={() => setActiveBg(bg)}
                        className={`
                            relative group flex-shrink-0 p-2.5 rounded-full transition-all duration-300
                            ${activeBg.id === bg.id 
                                ? 'bg-white/15 text-white ring-1 ring-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}
                        `}
                        title={bg.name}
                    >
                        <bg.icon className="w-5 h-5" />
                        
                        {/* Tooltip Stable - Fade Only */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-2 py-1 bg-black/90 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-50">
                            {bg.name}
                        </div>
                    </button>
                ))}
            </div>
            {/* Active Label (Stable) */}
            <div className="text-center mt-2">
                <span className="text-[10px] font-medium text-white/50 tracking-widest uppercase bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
                    Ambiente: <span className="text-white">{activeBg.name}</span>
                </span>
            </div>
         </div>

         {!imageUrl && !isLoading && (
            <div className="text-center opacity-40 flex flex-col items-center">
               <div className="relative">
                  <div className={`absolute inset-0 blur-xl rounded-full ${activeBg.id === 'golden' ? 'bg-orange-500/20' : 'bg-purple-500/20'}`}></div>
                  <ImagePlus className="w-20 h-20 mb-4 text-white/50 relative z-10" />
               </div>
               <p className="text-lg text-white/50 font-medium max-w-xs">
                 {referenceImage ? "Descreva o cenário e clique em Transformar." : "Faça upload de um produto ou descreva um do zero."}
               </p>
            </div>
         )}

         {isLoading && (
            <div className="flex flex-col items-center justify-center gap-6">
               <div className="relative w-40 h-40">
                  <div className="absolute inset-0 border-t-2 border-orange-500/50 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-r-2 border-purple-500/50 rounded-full animate-spin-slow"></div>
                  
                  {referenceImage && (
                    <div className="absolute inset-6 rounded-full overflow-hidden border border-white/10 opacity-50 animate-pulse">
                         <img src={referenceImage} className="w-full h-full object-cover grayscale" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                     <span className="text-xs font-bold bg-black/50 backdrop-blur px-2 py-1 rounded text-orange-500 animate-pulse">AI WORK</span>
                  </div>
               </div>
               <p className="text-orange-400 text-sm font-bold tracking-widest animate-pulse">
                   {referenceImage ? 'FUNDINDO IMAGEM...' : 'RENDERIZANDO 4K...'}
               </p>
            </div>
         )}

         {imageUrl && !isLoading && (
            <div className="relative group max-w-2xl w-full animate-in zoom-in-95 duration-700 z-10">
               <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
               <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                  <img src={imageUrl} alt="Generated" className="w-full h-auto object-cover" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <span className="text-[10px] text-slate-400">Leonardo AI • Kino XL Model</span>
                     <a 
                        href={imageUrl} 
                        download="studio-photo.jpg" 
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                     >
                        <Download className="w-3 h-3" /> Baixar Alta Resolução
                     </a>
                  </div>
               </div>
            </div>
         )}
      </div>

    </div>
  );
};