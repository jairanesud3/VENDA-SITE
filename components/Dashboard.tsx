'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, Video, 
  Search, Users, Calculator, Megaphone, 
  Menu, MousePointerClick, 
  Camera, Home, ChevronRight, Wand2, LucideIcon, Download,
  Lock, AlertTriangle, X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { generateCopy } from '@/app/actions/generate-copy';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface DashboardProps {
  onLogout: () => void;
  userEmail?: string | null;
}

// --- CONFIGURAÇÃO ---
type ModuleId = 
  | 'home'
  | 'generator' | 'video_script' | 'product_desc' 
  | 'persona' | 'studio'
  | 'roas_analyzer' 
  | 'settings';

interface ModuleConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  desc: string;
  placeholder?: string;
  isPremium?: boolean;
}

const MODULES: Record<string, ModuleConfig> = {
  home: { label: 'Visão Geral', icon: Home, color: 'text-purple-400', desc: 'Resumo da sua conta' },
  generator: { label: 'Copy Ad Facebook', icon: Megaphone, color: 'text-blue-400', desc: 'Textos de alta conversão', placeholder: 'Ex: Corretor Postural, Tênis de Corrida...' },
  product_desc: { label: 'SEO E-commerce', icon: Search, color: 'text-cyan-400', desc: 'Descrições otimizadas', placeholder: 'Ex: Fone Bluetooth à prova d\'água...' },
  roas_analyzer: { label: 'Calculadora ROAS', icon: Calculator, color: 'text-emerald-400', desc: 'Previsão de lucro e viabilidade', placeholder: 'Ex: Custo do Produto R$50, Preço de Venda R$129...' },
  
  // Módulos Premium
  video_script: { label: 'Roteiro TikTok', icon: Video, color: 'text-pink-400', desc: 'Scripts virais para vídeos curtos', placeholder: 'Ex: Escova Alisadora 3 em 1...', isPremium: true },
  studio: { label: 'Studio Product AI', icon: Camera, color: 'text-orange-400', desc: 'Fotos profissionais de produtos', placeholder: 'Ex: Garrafa Térmica Preta em cima de uma mesa de madeira...', isPremium: true },
  persona: { label: 'Hacker de Avatar', icon: Users, color: 'text-indigo-400', desc: 'Análise profunda do público', placeholder: 'Ex: Kit de Ferramentas para Jardim...', isPremium: true },
  settings: { label: 'Configurações', icon: Settings, color: 'text-slate-400', desc: 'Ajustes da conta' },
};

// --- COMPONENTE SELECT ---
const CustomSelect = ({ label, value, onChange, options }: any) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
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
  isLocked?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  id, 
  conf, 
  active, 
  open, 
  isLocked,
  onClick 
}) => (
  <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all relative group
          ${active 
          ? 'text-white bg-white/5 border-r-4 border-purple-500' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white border-r-4 border-transparent'
      }`}
  >
      {active && <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent pointer-events-none"></div>}
      <div className="relative">
        <conf.icon className={`w-5 h-5 ${active ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-slate-500 group-hover:text-white'} transition-colors relative z-10`} />
        {isLocked && <div className="absolute -top-1 -right-1 bg-slate-900 rounded-full p-0.5"><Lock className="w-2.5 h-2.5 text-yellow-500" /></div>}
      </div>
      {(open || active) && <span className={`relative z-10 truncate ${active ? 'font-bold tracking-wide' : ''}`}>{conf.label}</span>}
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, userEmail }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // SEGURANÇA: State inicial sempre 'free'. Só muda se o backend confirmar.
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free'); 
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // State for Generation
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Options State
  const [tone, setTone] = useState('Agressivo');
  const [platform, setPlatform] = useState('FB Ads');
  const [videoDuration, setVideoDuration] = useState('30s');
  
  const userName = userEmail ? userEmail.split('@')[0] : null;
  const formattedName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "Visitante";

  // Sincronização Segura de Plano
  useEffect(() => {
    const fetchUserPlan = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            // Verifica metadata do Supabase (source of truth)
            if (user?.user_metadata?.plan === 'pro') {
                setUserPlan('pro');
            } else {
                setUserPlan('free');
            }
        } catch (e) {
            console.error("Erro ao verificar plano", e);
            setUserPlan('free');
        } finally {
            setIsLoadingPlan(false);
        }
    };
    fetchUserPlan();
  }, []);

  const handleUpgradeClick = () => {
    router.push('/plans');
  };

  const isModuleLocked = MODULES[activeModule].isPremium && userPlan === 'free';

  // --- LÓGICA DA API ---
  const handleGenerate = async () => {
    if (!input || isModuleLocked) return;
    setIsGenerating(true);
    setResult(null);
    setError(null);

    // Mobile: Scroll to result area automatically
    if (window.innerWidth < 1024) {
        setTimeout(() => {
            document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    try {
        let prompt = "";
        const moduleId = activeModule; // Passar ID para o backend validar permissão

        // Prompt construction logic remains the same...
        switch (activeModule) {
            case 'generator':
                prompt = `Atue como um Copywriter Sênior. Crie 3 opções de Copy para Anúncio do produto: "${input}". 
                Tom: ${tone}. Plataforma: ${platform}. 
                Use gatilhos mentais (Urgência, Escassez). 
                Retorne APENAS JSON: { "ad_1": {"headline": "...", "body": "...", "cta": "..."}, "ad_2": {...}, "ad_3": {...} }`;
                break;
            case 'video_script':
                prompt = `Crie um roteiro viral de TikTok de ${videoDuration} para: "${input}". 
                Estrutura: Gancho Visual -> Retenção -> Oferta.
                Retorne APENAS JSON: { "hook_visual": "...", "hook_audio": "...", "scenes": [{"seconds": "0-3", "visual": "...", "audio": "..."}] }`;
                break;
            case 'product_desc':
                prompt = `Especialista em SEO de E-commerce. Descreva: "${input}". 
                Use palavras-chave de alto volume. 
                Retorne APENAS JSON: { "product_title": "...", "meta_description": "...", "description_body": "...", "features_list": ["...", "..."] }`;
                break;
            case 'persona':
                prompt = `Analise o público-alvo para: "${input}". 
                Retorne APENAS JSON: { "avatar_name": "...", "age_range": "...", "interests": ["...", "..."], "pain_points": ["...", "..."], "objections": ["...", "..."], "buying_triggers": ["...", "..."] }`;
                break;
            case 'roas_analyzer':
                prompt = `Analise financeiramente: "${input}". 
                Estime margens e CPA ideal. 
                Retorne APENAS JSON: { "analysis_summary": "...", "metrics": { "breakeven_cpa": "...", "target_roas": "...", "potential_profit": "..." }, "recommendation": "..." }`;
                break;
            case 'studio':
                prompt = `Professional high-end product photography of ${input}, studio lighting, 4k, ultra-realistic, advertising standard.`;
                break;
            default:
                prompt = `Ajude com: ${input}`;
        }
        
        if (activeModule === 'studio') {
             const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
             if (!apiKey) throw new Error("API Key não encontrada.");
             const ai = new GoogleGenAI({ apiKey });
             
             // Client-side image gen calls should also be secured via a Next.js API route proxy in production
             // For now, we rely on the component conditional rendering, but real security is in `generateCopy` action
             const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash-image',
                 contents: { parts: [{ text: prompt }] },
                 config: { imageConfig: { aspectRatio: "1:1" } }
             });
             const imgData = response.candidates?.[0]?.content?.parts?.find((p:any) => p.inlineData)?.inlineData?.data;
             if (imgData) setResult({ type: 'image', url: `data:image/png;base64,${imgData}`, prompt });
             else throw new Error("Falha ao gerar imagem.");
        
        } else {
            // CHAMADA SEGURA AO SERVIDOR
            // Agora passamos o moduleId para validar permissões no backend
            const text = await generateCopy(prompt, activeModule);
            
            if (text) {
              try {
                setResult(JSON.parse(text));
              } catch (e) {
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
                setResult(JSON.parse(cleanText));
              }
            } else {
              throw new Error("Nenhuma resposta da IA.");
            }
        }

    } catch (err: any) {
        console.error(err);
        if (err.message.includes("Upgrade required")) {
            setError("🔒 ACESSO NEGADO: Este recurso é exclusivo para membros PRO. Faça o upgrade.");
        } else {
            setError("Erro ao processar. Tente novamente.");
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const renderResultValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <ul className="space-y-3 mt-2">
          {value.map((item: any, i: number) => (
            <li key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-slate-300 break-words">
               {typeof item === 'object' ? (
                  <div className="space-y-1">
                     {Object.entries(item).map(([k, v]: any) => (
                        <div key={k} className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider min-w-[80px] pt-0.5">{k.replace(/_/g, ' ')}:</span>
                          <span className="text-slate-200 break-words">{String(v)}</span>
                        </div>
                     ))}
                  </div>
               ) : item}
            </li>
          ))}
        </ul>
      )
    }
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {Object.entries(value).map(([k, v]: any) => (
            <div key={k} className="bg-slate-950/40 border border-white/5 rounded-lg p-3 flex flex-col hover:border-purple-500/20 transition-colors">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">{k.replace(/_/g, ' ')}</span>
              <span className="text-sm font-medium text-white break-words">{String(v)}</span>
            </div>
          ))}
        </div>
      )
    }
    return <p className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words">{String(value)}</p>;
  };

  return (
    <div className="flex h-screen bg-[#0B0518] text-white font-sans overflow-hidden relative">
      
      {/* MOBILE HEADER BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
            <div className="p-1 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight text-white">DROP<span className="text-purple-400">HACKER</span></span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-400 hover:text-white">
            <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR (Desktop: Persistent / Mobile: Drawer) */}
      <>
        {/* Backdrop Mobile */}
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        )}
        
        <aside className={`
            fixed lg:static top-0 left-0 bottom-0 z-50 
            bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 shadow-2xl
            ${mobileMenuOpen ? 'translate-x-0 w-[80%]' : '-translate-x-full lg:translate-x-0'}
            ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}>
            {/* Header Sidebar Desktop */}
            <div className="hidden lg:flex h-20 items-center px-6 border-b border-slate-800 shrink-0">
                <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg mr-3 shadow-lg shadow-purple-500/20 shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                {sidebarOpen && <span className="font-bold tracking-tight italic text-lg">DROPHACKER</span>}
            </div>

            {/* Header Sidebar Mobile (Close Button) */}
            <div className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-slate-800">
                <span className="font-bold text-slate-300">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}><X className="text-slate-400" /></button>
            </div>

            {/* User Plan Badge */}
            {sidebarOpen && (
                <div className="px-6 pt-6 pb-2">
                    {isLoadingPlan ? (
                        <div className="h-16 w-full bg-slate-900 rounded-xl animate-pulse"></div>
                    ) : (
                        <div className={`rounded-xl p-3 border ${userPlan === 'free' ? 'bg-slate-900 border-slate-700' : 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30'}`}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plano Atual</span>
                                {userPlan === 'free' ? 
                                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Grátis</span> :
                                    <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><Zap size={8} fill="white"/> PRO</span>
                                }
                            </div>
                            <div className="text-xs font-bold text-white mb-2">{userPlan === 'free' ? 'Visitante' : 'Membro VIP'}</div>
                            {userPlan === 'free' && (
                                <button 
                                    onClick={handleUpgradeClick} 
                                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    Fazer Upgrade
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2 space-y-0 custom-scrollbar">
                <SidebarItem 
                    id="home" 
                    conf={MODULES.home} 
                    active={activeModule === 'home'} 
                    open={sidebarOpen}
                    onClick={() => { setActiveModule('home'); setResult(null); setError(null); setMobileMenuOpen(false); }}
                />
                
                <div className="h-px bg-slate-800 my-2 mx-4"></div>
                
                <p className={`px-6 py-2 text-[10px] font-bold text-slate-600 uppercase ${!sidebarOpen && 'hidden'}`}>Ferramentas</p>
                {Object.keys(MODULES).filter(k => k !== 'home' && k !== 'settings').map(key => (
                    <SidebarItem 
                        key={key} 
                        id={key} 
                        conf={MODULES[key]} 
                        active={activeModule === key} 
                        open={sidebarOpen}
                        isLocked={MODULES[key].isPremium && userPlan === 'free'}
                        onClick={() => { setActiveModule(key as ModuleId); setResult(null); setError(null); setMobileMenuOpen(false); }}
                    />
                ))}
            </div>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex w-full items-center justify-center p-2 hover:bg-white/5 rounded-lg text-slate-500 mb-2 transition-colors">
                    <Menu size={18} />
                </button>
                <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors ${!sidebarOpen && 'justify-center'}`}>
                    <LogOut size={16} />
                    {(sidebarOpen || mobileMenuOpen) && "Sair"}
                </button>
            </div>
        </aside>
      </>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 pt-16 lg:pt-0">
          {activeModule === 'home' ? (
              // --- HOME VIEW ---
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="max-w-6xl mx-auto pb-20">
                    <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{formattedName}</span>.
                            </h1>
                            <p className="text-slate-400 text-sm md:text-base">O Quartel General do seu E-commerce está pronto.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {Object.entries(MODULES).filter(([k]) => k !== 'home' && k !== 'settings').map(([key, mod]) => (
                            <button 
                                key={key}
                                onClick={() => setActiveModule(key as ModuleId)}
                                className="group bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col h-full relative overflow-hidden"
                            >
                                {mod.isPremium && userPlan === 'free' && (
                                    <div className="absolute top-4 right-4 bg-slate-950/80 p-1.5 rounded-full border border-slate-700">
                                        <Lock className="w-3 h-3 text-yellow-500" />
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <mod.icon className={`w-6 h-6 ${mod.color}`} />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{mod.label}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
                            </button>
                        ))}
                    </div>
                  </div>
              </div>
          ) : (
              // --- TOOL VIEW (MOBILE OPTIMIZED) ---
              <div className="flex flex-col lg:flex-row h-full overflow-hidden relative z-10">
                  
                  {/* LEFT: CONTROLS (Top on Mobile) */}
                  <div className="w-full lg:w-[400px] bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col h-auto lg:h-full shadow-2xl z-20 shrink-0 max-h-[50vh] lg:max-h-full overflow-y-auto custom-scrollbar">
                     <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
                        <div className="flex items-center gap-3 text-white mb-1">
                            <button onClick={() => setActiveModule('home')} className="lg:hidden p-1 -ml-2 text-slate-400 hover:text-white"><ChevronRight className="rotate-180 w-5 h-5"/></button>
                            {React.createElement(MODULES[activeModule].icon, { className: `w-5 h-5 ${MODULES[activeModule].color}` })}
                            <span className="font-bold text-lg truncate">{MODULES[activeModule].label}</span>
                        </div>
                     </div>

                     <div className="p-4 md:p-6 space-y-6 relative">
                         {isModuleLocked && (
                             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                                 <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-3 border border-slate-700 shadow-xl">
                                     <Lock className="w-6 h-6 text-yellow-500" />
                                 </div>
                                 <h3 className="font-bold text-white mb-1">Recurso Premium</h3>
                                 <p className="text-xs text-slate-400 mb-4 max-w-[200px]">Atualize para o plano PRO para desbloquear o {MODULES[activeModule].label}.</p>
                                 <button 
                                     onClick={handleUpgradeClick}
                                     className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-xs font-bold shadow-lg shadow-purple-900/30 hover:scale-105 transition-transform flex items-center gap-2"
                                 >
                                     Desbloquear Agora
                                 </button>
                             </div>
                         )}

                         <div className="space-y-3">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entrada de Dados</label>
                             <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={MODULES[activeModule].placeholder || "Descreva o produto..."}
                                disabled={isModuleLocked}
                                className="w-full h-32 md:h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm leading-relaxed shadow-inner disabled:opacity-50"
                             />
                         </div>

                         {activeModule === 'generator' && (
                             <div className="grid grid-cols-2 gap-4">
                                <CustomSelect label="Tom" value={tone} onChange={setTone} options={['Agressivo', 'Amigável']} />
                                <CustomSelect label="Plat." value={platform} onChange={setPlatform} options={['FB Ads', 'TikTok']} />
                             </div>
                         )}
                         
                         {activeModule === 'video_script' && (
                             <CustomSelect label="Duração" value={videoDuration} onChange={setVideoDuration} options={['15s', '30s', '60s']} />
                         )}
                     </div>

                     <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-900/30 mt-auto">
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !input || isModuleLocked}
                            className="w-full py-3 md:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            {isGenerating ? <Loader2 className="animate-spin w-5 h-5"/> : <Wand2 className="w-5 h-5"/>}
                            {isGenerating ? 'HACKEANDO...' : 'GERAR AGORA'}
                        </button>
                     </div>
                  </div>

                  {/* RIGHT: PREVIEW (Bottom on Mobile) */}
                  <div id="result-area" className="flex-1 bg-transparent relative overflow-hidden flex flex-col min-h-[50vh]">
                      <div className="h-12 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
                          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles size={14} className="text-purple-500" /> Resultado
                          </span>
                          {result && (
                              <button 
                                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] md:text-xs flex items-center gap-2 text-slate-300 transition-colors border border-white/5"
                              >
                                  <Copy className="w-3 h-3"/> Copiar
                              </button>
                          )}
                      </div>

                      <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex items-start justify-center pb-24 md:pb-8">
                          {!result && !isGenerating && (
                              <div className="text-center opacity-40 mt-10 md:mt-20">
                                  <MousePointerClick className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-slate-500"/>
                                  <p className="text-slate-300 font-medium text-base md:text-lg">Aguardando comando...</p>
                              </div>
                          )}

                          {isGenerating && (
                              <div className="text-center mt-10 md:mt-20">
                                   <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                                       <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                                       <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                                       <Zap className="absolute inset-0 m-auto text-purple-400 w-6 h-6 md:w-8 md:h-8 animate-pulse"/>
                                   </div>
                                   <p className="text-purple-300 font-bold animate-pulse text-sm">IA trabalhando...</p>
                              </div>
                          )}

                          {result && !isGenerating && (
                              <div className="w-full max-w-4xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 pb-10">
                                  {result.type === 'image' ? (
                                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-2xl shadow-2xl inline-block w-full">
                                          <img src={result.url} className="w-full h-auto rounded-xl" />
                                          <div className="mt-3 flex justify-between items-center px-2">
                                              <span className="text-[10px] text-slate-500">Gemini 2.5 Image</span>
                                              <a href={result.url} download="dropai-img.png" className="text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg text-xs font-bold flex gap-2 items-center transition-colors"><Download size={14}/> Baixar</a>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="space-y-4 md:space-y-6">
                                          {Object.entries(result).map(([key, value]: any, idx) => (
                                              <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl">
                                                  <h3 className="text-xs md:text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2 flex items-center gap-2">
                                                    <Sparkles size={14} className="text-purple-500" />
                                                    {key.replace(/_/g, ' ')}
                                                  </h3>
                                                  {renderResultValue(value)}
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}
      </main>
    </div>
  );
};