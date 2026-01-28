'use client';

import React, { useState } from 'react';
import { 
  Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, Video, 
  Search, Users, Calculator, Megaphone, 
  Menu, MousePointerClick, 
  Camera, Home, ChevronRight, Wand2, LucideIcon, Download
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { generateCopy } from '@/app/actions/generate-copy';

interface DashboardProps {
  onLogout: () => void;
  userEmail?: string | null;
}

// --- BACKGROUND ANIMADO 10X (MUITO RÁPIDO) ---
const DashboardBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Orbe 1: Roxo, rápido */}
    <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-purple-900/20 rounded-full blur-[80px] animate-side-to-side-hyper"></div>
    {/* Orbe 2: Indigo, movimento oposto */}
    <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] bg-indigo-900/20 rounded-full blur-[80px] animate-blob-hyper"></div>
    {/* Noise Overlay para textura */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
  </div>
);

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
}

const MODULES: Record<string, ModuleConfig> = {
  home: { label: 'Visão Geral', icon: Home, color: 'text-purple-400', desc: 'Resumo da sua conta' },
  generator: { label: 'Copy Ad Facebook', icon: Megaphone, color: 'text-blue-400', desc: 'Textos de alta conversão', placeholder: 'Ex: Corretor Postural, Tênis de Corrida...' },
  video_script: { label: 'Roteiro TikTok', icon: Video, color: 'text-pink-400', desc: 'Scripts virais para vídeos curtos', placeholder: 'Ex: Escova Alisadora 3 em 1...' },
  studio: { label: 'Studio Product AI', icon: Camera, color: 'text-orange-400', desc: 'Fotos profissionais de produtos', placeholder: 'Ex: Garrafa Térmica Preta em cima de uma mesa de madeira...' },
  roas_analyzer: { label: 'Calculadora ROAS', icon: Calculator, color: 'text-emerald-400', desc: 'Previsão de lucro e viabilidade', placeholder: 'Ex: Custo do Produto R$50, Preço de Venda R$129...' },
  persona: { label: 'Hacker de Avatar', icon: Users, color: 'text-indigo-400', desc: 'Análise profunda do público', placeholder: 'Ex: Kit de Ferramentas para Jardim...' },
  product_desc: { label: 'SEO E-commerce', icon: Search, color: 'text-cyan-400', desc: 'Descrições otimizadas', placeholder: 'Ex: Fone Bluetooth à prova d\'água...' },
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
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  id, 
  conf, 
  active, 
  open, 
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
      <conf.icon className={`w-5 h-5 ${active ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-slate-500 group-hover:text-white'} transition-colors relative z-10`} />
      {open && <span className={`relative z-10 ${active ? 'font-bold tracking-wide' : ''}`}>{conf.label}</span>}
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, userEmail }) => {
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
  
  const userName = userEmail ? userEmail.split('@')[0] : null;
  const formattedName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "Visitante";

  // --- LÓGICA DA API ---
  const handleGenerate = async () => {
    if (!input) return;
    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
        let prompt = "";
        
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
             const apiKey = process.env.API_KEY;
             if (!apiKey) throw new Error("API Key não encontrada.");
             const ai = new GoogleGenAI({ apiKey });
             
             const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash-image',
                 contents: { parts: [{ text: prompt }] },
                 config: { imageConfig: { aspectRatio: "1:1" } }
             });
             const imgData = response.candidates?.[0]?.content?.parts?.find((p:any) => p.inlineData)?.inlineData?.data;
             if (imgData) setResult({ type: 'image', url: `data:image/png;base64,${imgData}`, prompt });
             else throw new Error("Falha ao gerar imagem.");
        
        } else {
            // Server Action para texto
            const text = await generateCopy(prompt);
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
        setError("Erro ao processar. Verifique sua API Key ou tente novamente.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0518] text-white font-sans overflow-hidden relative">
      <DashboardBackground />
      
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 z-50 shadow-2xl relative`}>
          <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0">
              <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg mr-3 shadow-lg shadow-purple-500/20 shrink-0">
                  <Zap className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && <span className="font-bold tracking-tight italic text-lg">DROPHACKER</span>}
          </div>

          <div className="flex-1 overflow-y-auto py-0 space-y-0 custom-scrollbar">
              <SidebarItem 
                  id="home" 
                  conf={MODULES.home} 
                  active={activeModule === 'home'} 
                  open={sidebarOpen}
                  onClick={() => { setActiveModule('home'); setResult(null); setError(null); }}
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
                      onClick={() => { setActiveModule(key as ModuleId); setResult(null); setError(null); }}
                  />
              ))}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center p-2 hover:bg-white/5 rounded-lg text-slate-500 mb-2 transition-colors">
                  <Menu size={18} />
              </button>
              <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors ${!sidebarOpen && 'justify-center'}`}>
                  <LogOut size={16} />
                  {sidebarOpen && "Sair"}
              </button>
          </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          {activeModule === 'home' ? (
              // --- HOME VIEW (Inline) ---
              <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                  <div className="mb-10 flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Bem-vindo(a), <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{formattedName}</span>.
                        </h1>
                        <p className="text-slate-400">O Quartel General do seu E-commerce está pronto.</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(MODULES).filter(([k]) => k !== 'home' && k !== 'settings').map(([key, mod]) => (
                          <button 
                            key={key}
                            onClick={() => setActiveModule(key as ModuleId)}
                            className="group bg-slate-900/40 backdrop-blur-md hover:bg-slate-800/60 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col h-full"
                          >
                              <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <mod.icon className={`w-6 h-6 ${mod.color}`} />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 p-1 rounded-full">
                                    <ChevronRight size={16} className="text-white"/>
                                </div>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{mod.label}</h3>
                              <p className="text-sm text-slate-500 leading-relaxed">{mod.desc}</p>
                          </button>
                      ))}
                  </div>
              </div>
          ) : (
              // --- TOOL VIEW (Inline) ---
              <div className="flex flex-col lg:flex-row h-full overflow-hidden relative z-10">
                  {/* LEFT: CONTROLS */}
                  <div className="w-full lg:w-[400px] bg-slate-950 border-r border-slate-800 flex flex-col h-full shadow-2xl z-20">
                     <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-3 text-white mb-1">
                            {React.createElement(MODULES[activeModule].icon, { className: `w-5 h-5 ${MODULES[activeModule].color}` })}
                            <span className="font-bold text-lg">{MODULES[activeModule].label}</span>
                        </div>
                        <p className="text-xs text-slate-500">{MODULES[activeModule].desc}</p>
                     </div>

                     <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                         <div className="space-y-3">
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Entrada de Dados</label>
                             <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={MODULES[activeModule].placeholder || "Descreva o produto ou cenário aqui..."}
                                className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm leading-relaxed shadow-inner"
                             />
                         </div>

                         {activeModule === 'generator' && (
                             <>
                                <CustomSelect label="Tom de Voz" value={tone} onChange={setTone} options={['Agressivo', 'Amigável', 'Urgente', 'Exclusivo']} />
                                <CustomSelect label="Plataforma" value={platform} onChange={setPlatform} options={['FB Ads', 'Instagram', 'Google', 'TikTok']} />
                             </>
                         )}
                         
                         {activeModule === 'video_script' && (
                             <CustomSelect label="Duração" value={videoDuration} onChange={setVideoDuration} options={['15s', '30s', '60s']} />
                         )}
                     </div>

                     <div className="p-6 border-t border-slate-800 bg-slate-900/30">
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
                  <div className="flex-1 bg-transparent relative overflow-hidden flex flex-col">
                      {/* Toolbar */}
                      <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles size={14} className="text-purple-500" /> Resultado Gerado
                          </span>
                          {result && (
                              <button 
                                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs flex items-center gap-2 text-slate-300 transition-colors border border-white/5"
                              >
                                  <Copy className="w-3 h-3"/> Copiar
                              </button>
                          )}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex items-start justify-center">
                          {!result && !isGenerating && (
                              <div className="text-center opacity-40 mt-20">
                                  <MousePointerClick className="w-20 h-20 mx-auto mb-6 text-slate-500"/>
                                  <p className="text-slate-300 font-medium text-lg">Aguardando comando...</p>
                                  <p className="text-slate-600 text-sm mt-2">Preencha os dados ao lado e clique em Gerar</p>
                              </div>
                          )}

                          {isGenerating && (
                              <div className="text-center mt-20">
                                   <div className="relative w-24 h-24 mx-auto mb-6">
                                       <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                                       <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                                       <Zap className="absolute inset-0 m-auto text-purple-400 w-8 h-8 animate-pulse"/>
                                   </div>
                                   <p className="text-purple-300 font-bold animate-pulse">Inteligência Artificial trabalhando...</p>
                              </div>
                          )}

                          {result && !isGenerating && (
                              <div className="w-full max-w-4xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 pb-20">
                                  {result.type === 'image' ? (
                                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-2xl shadow-2xl inline-block">
                                          <img src={result.url} className="max-w-full max-h-[600px] rounded-xl" />
                                          <div className="mt-3 flex justify-between items-center px-2">
                                              <span className="text-xs text-slate-500">Gerado com Gemini 2.5 Image</span>
                                              <a href={result.url} download="dropai-img.png" className="text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg text-xs font-bold flex gap-2 items-center transition-colors"><Download size={14}/> Baixar HD</a>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="space-y-6">
                                          {/* Renderização Inteligente de JSON */}
                                          {Object.entries(result).map(([key, value]: any, idx) => (
                                              <div key={idx} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                                                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">{key.replace(/_/g, ' ')}</h3>
                                                  {typeof value === 'object' ? (
                                                      <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                                                  ) : (
                                                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{value}</p>
                                                  )}
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