'use client';

import React, { useState } from 'react';
import { Camera, Download, Loader2, Sparkles, AlertTriangle, Lock } from 'lucide-react';
import { generateProductImage } from '@/app/actions/generate-image';
import { Button } from '@/components/ui/button';

interface ImageToolProps {
  userPlan: 'free' | 'pro';
  onUpgrade: () => void;
}

export const ImageTool: React.FC<ImageToolProps> = ({ userPlan, onUpgrade }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Verificação Client-Side rápida
    if (userPlan !== 'pro') {
      setError("Recurso exclusivo PRO.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateProductImage(prompt);
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
      <div className="w-full lg:w-[400px] bg-slate-950 border-r border-slate-800 p-6 flex flex-col h-auto lg:h-full z-20 shadow-2xl overflow-y-auto">
        
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
               <Camera className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Studio Product AI</h2>
          </div>
          <p className="text-sm text-slate-400">
            Crie fotos de estúdio ultra-realistas (4K) para seus produtos em segundos.
          </p>
        </div>

        {userPlan === 'free' && (
           <div className="mb-6 p-4 bg-slate-900/80 border border-yellow-500/30 rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>
              <div className="relative z-10 flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                    <Lock className="w-4 h-4" /> Bloqueado
                 </div>
                 <p className="text-xs text-slate-300">Este modelo de IA (Kino XL) custa caro e é exclusivo para membros PRO.</p>
                 <button onClick={onUpgrade} className="mt-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs font-bold py-2 rounded-lg hover:brightness-110 transition-all">
                    Desbloquear Studio
                 </button>
              </div>
           </div>
        )}

        <div className="space-y-4 flex-1">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Descreva o Produto e Cenário
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading || userPlan === 'free'}
              placeholder="Ex: Uma garrafa térmica preta moderna em cima de uma mesa de madeira rústica, iluminação suave de manhã, alta resolução..."
              className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2 text-red-300 text-xs">
               <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
               <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt || userPlan === 'free'}
            className="w-full py-6 text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-900/20"
          >
            {isLoading ? (
               <div className="flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 <span>RENDERIZANDO 4K...</span>
               </div>
            ) : (
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4" />
                 <span>GERAR FOTO DE ESTÚDIO</span>
               </div>
            )}
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW */}
      <div className="flex-1 bg-[#05020a] relative flex items-center justify-center p-8 overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
         
         {!imageUrl && !isLoading && (
            <div className="text-center opacity-30">
               <Camera className="w-24 h-24 mx-auto mb-4 text-slate-600" />
               <p className="text-lg text-slate-500 font-medium">O estúdio está vazio.</p>
            </div>
         )}

         {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4">
               <div className="relative w-32 h-32">
                  <div className="absolute inset-0 border-t-4 border-orange-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-4 border-t-4 border-purple-500 rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-xs font-bold text-orange-500 animate-pulse">AI</span>
                  </div>
               </div>
               <p className="text-orange-400 text-sm font-bold tracking-widest animate-pulse">PROCESSANDO PIXELS...</p>
            </div>
         )}

         {imageUrl && !isLoading && (
            <div className="relative group max-w-2xl w-full animate-in zoom-in-95 duration-700">
               <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
               <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
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