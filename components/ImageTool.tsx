'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, Loader2, Sparkles, AlertTriangle, Lock, Upload, ImagePlus, X, RefreshCw, Palette } from 'lucide-react';
import { generateProductImage } from '@/app/actions/generate-image';
import { Button } from '@/components/ui/button';
import { BACKGROUNDS } from './Dashboard'; // Importa a lista global

interface ImageToolProps {
  userPlan: 'free' | 'pro';
  onUpgrade: () => void;
  activeTheme: any;
  setActiveTheme: (theme: any) => void;
}

// Replicando o Seletor Grid aqui para manter funcionalidade isolada visualmente mas com estado global
const ThemeSelector = ({ activeTheme, setActiveTheme }: { activeTheme: any, setActiveTheme: (t: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg border ${
          isOpen 
            ? 'bg-purple-600 border-purple-400 text-white' 
            : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
        }`}
        title="Alterar Cenário/Tema"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-[280px] bg-[#0f0f11] border border-slate-700 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
            Selecionar Ambiente
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => { setActiveTheme(bg); setIsOpen(false); }}
                className={`
                  relative group aspect-square rounded-lg flex flex-col items-center justify-center transition-all
                  ${activeTheme.id === bg.id 
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400 ring-offset-2 ring-offset-black' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}
                `}
                title={bg.name}
              >
                <bg.icon className="w-5 h-5 mb-1" />
              </button>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-center">
            <span className="text-[10px] text-slate-400">
              Tema Atual: <span className="text-white font-bold">{activeTheme.name}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const ImageTool: React.FC<ImageToolProps> = ({ userPlan, onUpgrade, activeTheme, setActiveTheme }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para Visualização (Preview)
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  // Estado para Arquivo Real (File)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 9 * 1024 * 1024) { 
        setError("A imagem deve ter no máximo 9MB.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImagePreview(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReferenceImagePreview(null);
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
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
      const formData = new FormData();
      formData.append('prompt', prompt);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const url = await generateProductImage(formData);
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

        <div className="space-y-6 flex-1">
          {/* AREA DE UPLOAD DE IMAGEM */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block flex justify-between">
              <span>1. Foto do Produto (Opcional)</span>
              {referenceImagePreview && <span className="text-green-400">Imagem carregada</span>}
            </label>
            
            {!referenceImagePreview ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-700 hover:border-orange-500/50 hover:bg-slate-900/50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
                >
                    <div className="p-3 bg-slate-900 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-orange-400" />
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-white font-medium">Clique para enviar foto</span>
                    <span className="text-[10px] text-slate-600 mt-1">PNG ou JPG (Max 9MB)</span>
                </div>
            ) : (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-700 group">
                    <img src={referenceImagePreview} alt="Referência" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    <button 
                        onClick={handleRemoveImage}
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
              placeholder={referenceImagePreview 
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
                 {referenceImagePreview ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                 <span>{referenceImagePreview ? 'TRANSFORMAR PRODUTO' : 'GERAR DO ZERO'}</span>
               </div>
            )}
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW */}
      <div className={`flex-1 relative flex items-center justify-center p-8 overflow-hidden transition-all duration-700 ease-in-out ${activeTheme.class}`}>
         
         {/* THEME SELECTOR GRID (Novo, fixo e sem bugs) */}
         <div className="absolute top-4 right-4 z-50">
            <ThemeSelector activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
         </div>

         {!imageUrl && !isLoading && (
            <div className="text-center opacity-40 flex flex-col items-center">
               <div className="relative">
                  <div className={`absolute inset-0 blur-xl rounded-full ${activeTheme.id === 'golden' ? 'bg-orange-500/20' : 'bg-purple-500/20'}`}></div>
                  <ImagePlus className="w-20 h-20 mb-4 text-white/50 relative z-10" />
               </div>
               <p className="text-lg text-white/50 font-medium max-w-xs">
                 {referenceImagePreview ? "Descreva o cenário e clique em Transformar." : "Faça upload de um produto ou descreva um do zero."}
               </p>
            </div>
         )}

         {isLoading && (
            <div className="flex flex-col items-center justify-center gap-6">
               <div className="relative w-40 h-40">
                  <div className="absolute inset-0 border-t-2 border-orange-500/50 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-r-2 border-purple-500/50 rounded-full animate-spin-slow"></div>
                  
                  {referenceImagePreview && (
                    <div className="absolute inset-6 rounded-full overflow-hidden border border-white/10 opacity-50 animate-pulse">
                         <img src={referenceImagePreview} className="w-full h-full object-cover grayscale" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                     <span className="text-xs font-bold bg-black/50 backdrop-blur px-2 py-1 rounded text-orange-500 animate-pulse">AI WORK</span>
                  </div>
               </div>
               <p className="text-orange-400 text-sm font-bold tracking-widest animate-pulse">
                   {referenceImagePreview ? 'FUNDINDO IMAGEM...' : 'RENDERIZANDO 4K...'}
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