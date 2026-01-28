'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, AlertTriangle, Video, Mail, 
  Search, Users, Calculator, Target, Megaphone, TrendingUp, 
  ShieldAlert, Menu, X, MousePointerClick, 
  Camera, DollarSign, BarChart2, CheckCircle2, Moon, Sun, Type, Download,
  Home, ChevronRight, Wand2, LucideIcon
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  onLogout: () => void;
}

// --- CONFIGURAÇÃO ---
type ModuleId = 
  | 'home'
  | 'generator' | 'video_script' | 'product_desc' | 'email_seq' 
  | 'persona' | 'studio'
  | 'roas_analyzer' 
  | 'settings';

interface ModuleConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  desc: string;
}

const MODULES: Record<string, ModuleConfig> = {
  home: { label: 'Visão Geral', icon: Home, color: 'text-purple-400', desc: 'Resumo da sua conta' },
  generator: { label: 'Copy Ad Facebook', icon: Megaphone, color: 'text-blue-400', desc: 'Textos de alta conversão para Ads' },
  video_script: { label: 'Roteiro TikTok', icon: Video, color: 'text-pink-400', desc: 'Scripts virais para vídeos curtos' },
  studio: { label: 'Studio Product AI', icon: Camera, color: 'text-orange-400', desc: 'Fotos profissionais de produtos' },
  roas_analyzer: { label: 'Calculadora ROAS', icon: Calculator, color: 'text-emerald-400', desc: 'Previsão de lucro e viabilidade' },
  persona: { label: 'Hacker de Avatar', icon: Users, color: 'text-indigo-400', desc: 'Análise profunda do público-alvo' },
  product_desc: { label: 'SEO E-commerce', icon: Search, color: 'text-cyan-400', desc: 'Descrições otimizadas para lojas' },
  settings: { label: 'Configurações', icon: Settings, color: 'text-slate-400', desc: 'Ajustes da conta' },
};

// --- COMPONENTE SELECT ---
const CustomSelect = ({ label, value, onChange, options }: any) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
              value === opt 
              ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' 
              : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

interface SidebarItemProps {
  id: string;
  conf: ModuleConfig;
  active: boolean;
  open: boolean;
  onClick: () => void;
}

// SidebarItem extracted to avoid re-declaration and type issues
const SidebarItem: React.FC<SidebarItemProps> = ({ 
  id, 
  conf, 
  active, 
  open, 
  onClick 
}) => (
  <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
          active 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
  >
      <conf.icon className={`w-5 h-5 ${active ? 'text-white' : conf.color} transition-colors`} />
      {open && <span>{conf.label}</span>}
      {active && open && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // State for Generation
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Options State
  const [tone, setTone] = useState('Agressivo');
  const [platform, setPlatform] = useState('FB Ads');
  const [videoDuration, setVideoDuration] = useState('30s');
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- LÓGICA DA API ---
  const handleGenerate = async () => {
    if (!input && !capturedImage) return;
    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key não encontrada. Adicione ao .env");
        
        const ai = new GoogleGenAI({ apiKey });
        let prompt = "";
        
        // Construtor de Prompt Simples
        if (activeModule === 'generator') prompt = `Crie 3 opções de Copy (Texto de Anúncio) para o produto: "${input}". Tom: ${tone}. Plataforma: ${platform}. Use formato JSON: { "headline": "...", "body": "...", "cta": "..." }`;
        if (activeModule === 'video_script') prompt = `Crie um roteiro de TikTok de ${videoDuration} sobre: "${input}". Formato JSON: { "title": "...", "scenes": [{"time": "0-5s", "visual": "...", "audio": "..."}] }`;
        if (activeModule === 'studio') prompt = `Product photography of ${input}, cinematic lighting, 8k resolution, photorealistic.`;
        if (activeModule === 'persona') prompt = `Analise o público alvo para: "${input}". Formato JSON: { "demographics": "...", "pain_points": [], "desires": [] }`;

        // Execução
        if (activeModule === 'studio') {
             const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash-image',
                 contents: { parts: [{ text: prompt }] },
                 config: { imageConfig: { aspectRatio: "1:1" } }
             });
             // Extração de imagem (simplificada para o exemplo)
             const imgData = response.candidates?.[0]?.content?.parts?.find((p:any) => p.inlineData)?.inlineData?.data;
             if (imgData) setResult({ type: 'image', url: `data:image/png;base64,${imgData}`, prompt });
             else throw new Error("Falha ao gerar imagem.");
        } else {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            setResult(JSON.parse(response.text || "{}"));
        }

    } catch (err: any) {
        setError(err.message || "Erro na geração.");
    } finally {
        setIsGenerating(false);
    }
  };

  const HomeView = () => (
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">Bom dia, Hacker.</h1>
              <p className="text-slate-400">O que vamos escalar hoje?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(MODULES).filter(([k]) => k !== 'home' && k !== 'settings').map(([key, mod]) => (
                  <button 
                    key={key}
                    onClick={() => setActiveModule(key as ModuleId)}
                    className="group bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/30 p-6 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                      <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <mod.icon className={`w-6 h-6 ${mod.color}`} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{mod.label}</h3>
                      <p className="text-sm text-slate-500">{mod.desc}</p>
                  </button>
              ))}
          </div>
      </div>
  );

  const ToolView = () => {
      const ActiveIcon = MODULES[activeModule].icon;
      return (
      <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* LEFT: CONTROLS */}
          <div className="w-full lg:w-[450px] p-6 lg:border-r border-slate-800 overflow-y-auto custom-scrollbar bg-slate-950/50">
             <div className="mb-6 flex items-center gap-3 text-purple-400">
                 <ActiveIcon className="w-6 h-6" />
                 <span className="text-sm font-bold uppercase tracking-wider">{MODULES[activeModule].label}</span>
             </div>

             <div className="space-y-8">
                 <div className="space-y-3">
                     <label className="text-sm font-bold text-white">Sobre o que é seu produto?</label>
                     <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ex: Tênis ortopédico que corrige postura..."
                        className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm leading-relaxed"
                     />
                 </div>

                 {activeModule === 'generator' && (
                     <>
                        <CustomSelect label="Tom de Voz" value={tone} onChange={setTone} options={['Agressivo', 'Amigável', 'Urgente']} />
                        <CustomSelect label="Plataforma" value={platform} onChange={setPlatform} options={['FB Ads', 'Instagram', 'Google']} />
                     </>
                 )}
                 
                 {activeModule === 'video_script' && (
                     <CustomSelect label="Duração" value={videoDuration} onChange={setVideoDuration} options={['15s', '30s', '60s']} />
                 )}

                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !input}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                    {isGenerating ? <Loader2 className="animate-spin w-5 h-5"/> : <Wand2 className="w-5 h-5"/>}
                    {isGenerating ? 'HACKEANDO...' : 'GERAR AGORA'}
                 </button>
             </div>
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="flex-1 bg-[#0B0518] relative overflow-hidden flex flex-col">
              {/* Toolbar */}
              <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50">
                  <span className="text-xs font-bold text-slate-500 uppercase">Preview do Resultado</span>
                  {result && (
                      <button 
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                        className="text-xs flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                      >
                          <Copy className="w-3 h-3"/> Copiar
                      </button>
                  )}
              </div>

              {/* Content */}
              <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex items-center justify-center relative">
                  {!result && !isGenerating && (
                      <div className="text-center opacity-30">
                          <MousePointerClick className="w-16 h-16 mx-auto mb-4 text-slate-500"/>
                          <p className="text-slate-400 font-medium">Configure ao lado e clique em Gerar</p>
                      </div>
                  )}

                  {isGenerating && (
                      <div className="text-center">
                           <div className="relative w-24 h-24 mx-auto mb-6">
                               <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                               <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                               <Sparkles className="absolute inset-0 m-auto text-purple-400 w-8 h-8 animate-pulse"/>
                           </div>
                           <p className="text-purple-300 font-mono text-sm animate-pulse">Consultando Inteligência...</p>
                      </div>
                  )}

                  {result && !isGenerating && (
                      <div className="w-full max-w-3xl animate-in zoom-in-95 duration-300">
                          {result.type === 'image' ? (
                              <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-2xl">
                                  <img src={result.url} className="w-full rounded-xl" />
                                  <div className="p-4 flex justify-between items-center">
                                      <span className="text-xs text-slate-500">Gerado com Gemini 2.5 Image</span>
                                      <a href={result.url} download="dropai-img.png" className="text-pink-400 text-xs font-bold hover:underline flex gap-1"><Download size={14}/> Download</a>
                                  </div>
                              </div>
                          ) : (
                              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur">
                                  <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                                      {JSON.stringify(result, null, 2)}
                                  </pre>
                              </div>
                          )}
                      </div>
                  )}
                  
                  {/* Background Grid Decoration */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
              </div>
          </div>
      </div>
      );
  };

  return (
    <div className="flex h-screen bg-[#0B0518] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 z-50`}>
          <div className="h-16 flex items-center px-4 border-b border-slate-800">
              <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg mr-3 shadow-lg shadow-purple-500/20">
                  <Zap className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && <span className="font-bold tracking-tight italic">DROPHACKER</span>}
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
              <SidebarItem 
                  id="home" 
                  conf={MODULES.home} 
                  active={activeModule === 'home'} 
                  open={sidebarOpen}
                  onClick={() => { setActiveModule('home'); setResult(null); setError(null); }}
              />
              <div className="my-2 border-t border-slate-800 mx-2"></div>
              <p className={`px-4 text-[10px] font-bold text-slate-600 uppercase mb-2 mt-4 ${!sidebarOpen && 'hidden'}`}>Ferramentas</p>
              {Object.keys(MODULES).filter(k => k !== 'home' && k !== 'settings').map(key => (
                  <SidebarItem 
                      key={key} 
                      id={key} 
                      conf={MODULES[key]} 
                      active={activeModule === key} 
                      open={sidebarOpen}
                      onClick={() => { setActiveModule(key as ModuleId); setResult(null); setError(null); }}
                  />
              ))}
          </div>

          <div className="p-4 border-t border-slate-800">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center p-2 hover:bg-slate-900 rounded-lg text-slate-500 mb-2">
                  <Menu size={16} />
              </button>
              <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/30 transition-colors ${!sidebarOpen && 'justify-center'}`}>
                  <LogOut size={16} />
                  {sidebarOpen && "Sair"}
              </button>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* TOP BAR */}
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur z-40">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Home size={14}/> <span>/</span> <span className="text-white font-medium">{MODULES[activeModule].label}</span>
              </div>
              <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      Sistema Operacional
                  </div>
                  
                  {/* Perfil do Usuário Adicionado */}
                  <div className="pl-4 border-l border-slate-800 flex items-center gap-3">
                    <div className="hidden md:block text-right">
                      <p className="text-xs font-bold text-white">Hacker</p>
                      <p className="text-[10px] text-slate-500">Plano Pro</p>
                    </div>
                    <div className="relative group cursor-pointer">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 p-0.5 overflow-hidden shadow-lg shadow-purple-500/10 group-hover:border-purple-500 transition-colors">
                        <img 
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces" 
                          alt="Avatar" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full"></div>
                    </div>
                  </div>

              </div>
          </header>

          {/* DYNAMIC CONTENT AREA */}
          <div className="flex-1 overflow-hidden relative">
              {activeModule === 'home' ? <HomeView /> : <ToolView />}
          </div>
      </main>
    </div>
  );
};