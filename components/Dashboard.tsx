'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, AlertTriangle, Video, Mail, 
  Search, Users, Calculator, Target, Megaphone, TrendingUp, 
  ShieldAlert, Menu, X, MessageSquare, MousePointerClick, 
  Camera, DollarSign, Clock, Hash, Smartphone, MapPin, 
  BarChart2, PieChart, ArrowRight, CheckCircle2, ThumbsUp, ThumbsDown,
  ChevronDown, Check, Moon, Sun, Monitor, Type, Download
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  onLogout: () => void;
}

// --- TIPOS ---
type ModuleId = 
  | 'generator' | 'video_script' | 'product_desc' | 'email_seq' 
  | 'persona' | 'objections' | 'competitor' | 'studio'
  | 'upsell' | 'roas_analyzer' 
  | 'my_products' | 'settings';

interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  isTool?: boolean;
}

type FontSize = 'small' | 'normal' | 'large';

// --- COMPONENTE CUSTOM SELECT (DROPDOWN PROFISSIONAL) ---
interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  icon?: any;
  label?: string;
  placeholder?: string;
  themeClasses: any;
  sizeClasses: any;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, icon: Icon, label, placeholder, themeClasses, sizeClasses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className={`${sizeClasses.label} font-black uppercase mb-2 block tracking-wider ${themeClasses.label} transition-all`}>{label}</label>}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border-2 rounded-xl p-3 flex items-center justify-between text-left transition-all duration-200 group active:scale-[0.98] ${isOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : themeClasses.border} ${themeClasses.inputBg}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon size={16} className={`group-hover:text-purple-400 transition-colors ${themeClasses.subText}`} />}
          <span className={`${sizeClasses.input} font-bold truncate ${value ? themeClasses.text : themeClasses.subText}`}>
            {value || placeholder || "Selecione..."}
          </span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-purple-500' : themeClasses.subText}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 w-full mt-2 border rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200 ${themeClasses.cardBg} ${themeClasses.border}`}>
          <div className="p-1">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => { onChange(option); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg ${sizeClasses.text} font-medium transition-all flex items-center justify-between group
                  ${value === option ? 'bg-purple-600 text-white' : `${themeClasses.text} hover:${themeClasses.hoverBg}`}
                `}
              >
                {option}
                {value === option && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<number>(12);
  
  // --- SETTINGS STATE ---
  const [appSettings, setAppSettings] = useState({
    theme: 'dark', // 'dark' | 'light'
    fontSize: 'normal' as FontSize // 'small' | 'normal' | 'large'
  });

  // --- STATES DE INPUTS PERSONALIZADOS ---
  const [mainInput, setMainInput] = useState('');
  const [tone, setTone] = useState('Agressivo (Venda Direta)');
  const [platform, setPlatform] = useState('Facebook / Instagram Ads');
  const [videoDuration, setVideoDuration] = useState('30s');
  const [videoStyle, setVideoStyle] = useState('Viral/Curiosidade');
  const [imageStyle, setImageStyle] = useState('Estúdio Luxuoso (Fundo Infinito)');

  // Calculadora ROAS
  const [roasProductName, setRoasProductName] = useState(''); 
  const [calcPrice, setCalcPrice] = useState('');
  const [calcCost, setCalcCost] = useState('');
  const [calcAds, setCalcAds] = useState(''); 
  const [calcTax, setCalcTax] = useState('10');

  // Camera
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- HELPER DE TEMA (DINÂMICO E ROBUSTO) ---
  const getThemeClasses = () => {
    const isDark = appSettings.theme === 'dark';
    return {
      isDark,
      bg: isDark ? 'bg-slate-950' : 'bg-slate-50',
      text: isDark ? 'text-white' : 'text-slate-900',
      heading: isDark ? 'text-white' : 'text-slate-900',
      subText: isDark ? 'text-slate-500' : 'text-slate-500',
      cardBg: isDark ? 'bg-slate-900' : 'bg-white',
      inputBg: isDark ? 'bg-slate-950' : 'bg-white',
      border: isDark ? 'border-slate-800' : 'border-slate-300',
      hoverBg: isDark ? 'bg-slate-800' : 'bg-slate-100',
      sidebarBg: isDark ? 'bg-[#020617]' : 'bg-white',
      sidebarBorder: isDark ? 'border-slate-900' : 'border-slate-200',
      label: isDark ? 'text-slate-500' : 'text-slate-600',
      shadow: isDark ? 'shadow-2xl' : 'shadow-xl shadow-slate-200/50',
      // Novos helpers específicos
      sidebarActive: isDark ? 'bg-slate-900 text-white border-slate-800' : 'bg-purple-50 text-purple-700 border-purple-100',
      sidebarInactive: isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' : 'text-slate-500 hover:text-purple-600 hover:bg-slate-50',
      primaryBtn: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20',
      divider: isDark ? 'border-slate-800' : 'border-slate-200',
    };
  };

  const theme = getThemeClasses();
  
  // --- HELPER DE TAMANHO DE FONTE (ESCALÁVEL) ---
  const getSizeClasses = () => {
    switch(appSettings.fontSize) {
      case 'small': return {
        label: 'text-[10px]',
        input: 'text-sm',
        text: 'text-xs',
        h1: 'text-xl',
        h2: 'text-lg',
        icon: 16
      };
      case 'large': return {
        label: 'text-sm',
        input: 'text-lg',
        text: 'text-base',
        h1: 'text-4xl',
        h2: 'text-2xl',
        icon: 24
      };
      default: return { // Normal
        label: 'text-[11px]',
        input: 'text-base',
        text: 'text-sm',
        h1: 'text-2xl',
        h2: 'text-xl',
        icon: 20
      };
    }
  };

  const sizes = getSizeClasses();

  // --- CONFIGURAÇÃO DOS MÓDULOS ---
  const modules: Record<string, ModuleConfig> = {
    generator: {
      id: 'generator', label: 'CRIAR ANÚNCIO', icon: Megaphone,
      color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
      description: 'Copywriting e Ideias Visuais', isTool: true
    },
    roas_analyzer: {
      id: 'roas_analyzer', label: 'CALCULADORA DE LUCRO', icon: Calculator,
      color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30',
      description: 'Análise Financeira e de Mercado', isTool: true
    },
    video_script: {
      id: 'video_script', label: 'ROTEIRO DE VÍDEO', icon: Video,
      color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30',
      description: 'Scripts para TikTok e Reels', isTool: true
    },
    studio: {
      id: 'studio', label: 'IDEIAS DE FOTOS', icon: Camera,
      color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30',
      description: 'Direção de Arte com IA', isTool: true
    },
    product_desc: { id: 'product_desc', label: 'DESCRIÇÃO LOJA', icon: Search, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', description: 'SEO E-commerce', isTool: true },
    persona: { id: 'persona', label: 'PÚBLICO ALVO', icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', description: 'Análise de Avatar', isTool: true },
    objections: { id: 'objections', label: 'QUEBRA DE OBJEÇÕES', icon: ShieldAlert, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', description: 'Scripts de Vendas', isTool: true },
    email_seq: { id: 'email_seq', label: 'E-MAIL MARKETING', icon: Mail, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', description: 'Recuperação de Vendas', isTool: true },
    my_products: { id: 'my_products', label: 'Meus Produtos', icon: Package, color: 'text-slate-400', bgColor: 'bg-slate-800', borderColor: 'border-slate-800', description: '', isTool: false },
    settings: { id: 'settings', label: 'Minha Conta', icon: Settings, color: 'text-slate-400', bgColor: 'bg-slate-800', borderColor: 'border-slate-800', description: '', isTool: false },
  };

  // --- LÓGICA DA CÂMERA ---
  const startCamera = async () => {
    setShowCamera(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Erro ao acessar câmera. Verifique permissões.");
      setShowCamera(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        setCapturedImage(canvasRef.current.toDataURL('image/jpeg'));
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      }
    }
  };

  // --- PROMPT LOGIC ---
  const getPrompt = () => {
    switch (activeModule) {
      case 'roas_analyzer':
        return `AUDITOR FINANCEIRO E-COMMERCE. Analise: "${roasProductName}", Venda: ${calcPrice}, Custo: ${calcCost}, Ads: ${calcAds}, Imposto: ${calcTax}%. Saída JSON: { "financials": { "revenue": "...", "totalCost": "...", "netProfit": "...", "margin": "..." }, "analysis": { "status": "WINNER/RISCO", "verdict": "...", "competition": ["..."], "strategyTip": "..." } }`;
      case 'video_script':
        return `DIRETOR TIKTOK. Roteiro para "${mainInput}", Duração ${videoDuration}, Estilo ${videoStyle}. Saída JSON: { "title": "...", "scenes": [{ "time": "...", "visual": "...", "audio": "..." }] }`;
      case 'studio':
         return `Professional product photography of ${mainInput}, style: ${imageStyle}, high resolution, 8k, detailed texture, cinematic lighting.`;
      default:
        return `COPYWRITER EXPERT. Produto "${mainInput}", Tom ${tone}, Plataforma ${platform}. Saída JSON: { "headlines": ["..."], "adCopy": "...", "creativeIdeas": ["..."] }`;
    }
  };

  const handleGenerate = async () => {
    if (activeModule === 'roas_analyzer' && (!calcPrice || !calcCost || !roasProductName)) { setError("Preencha todos os campos."); return; }
    if (activeModule !== 'roas_analyzer' && !mainInput && !capturedImage) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("Chave API ausente.");
      const ai = new GoogleGenAI({ apiKey });
      const prompt = getPrompt();
      
      let contents: any = prompt;
      
      if (activeModule === 'studio') {
         if (capturedImage) {
            contents = {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: capturedImage.split(',')[1] } },
                    { text: prompt + " (Use the attached image as reference for the product)" },
                ]
            }
         } else {
             contents = { parts: [{ text: prompt }] };
         }

         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash-image',
             contents: contents,
             config: {
                 imageConfig: { aspectRatio: "1:1" }
             }
         });

         let foundImage = false;
         if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64String = part.inlineData.data;
                    const imageUrl = `data:image/png;base64,${base64String}`;
                    setResult({ type: 'image', url: imageUrl, prompt: prompt });
                    foundImage = true;
                    break;
                }
            }
         }
         
         if (!foundImage) throw new Error("A IA não gerou uma imagem válida. Tente mudar a descrição.");

      } else {
          if (capturedImage) {
            contents = { parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: capturedImage.split(',')[1] } }] };
          }

          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash', 
            contents: contents,
            config: { responseMimeType: 'application/json', temperature: 0.8 }
          });

          const text = response.text;
          if (text) {
            let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const first = cleanJson.indexOf('{');
            const last = cleanJson.lastIndexOf('}');
            if (first !== -1 && last !== -1) cleanJson = cleanJson.substring(first, last + 1);
            setResult(JSON.parse(cleanJson));
          }
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao processar. Tente novamente. " + (err.message || ""));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  // --- RENDERIZADORES DE INPUT ---
  const renderInputSection = () => {
    switch(activeModule) {
      case 'roas_analyzer':
        return (
          <div className={`${theme.cardBg} border-2 ${theme.border} p-8 rounded-3xl ${theme.shadow} animate-fade-in relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
             <div className="mb-8">
                <label className={`${sizes.label} font-extrabold text-emerald-400 uppercase mb-3 block tracking-wider flex items-center gap-2`}>
                   <Package className="w-5 h-5"/> Nome do Produto
                </label>
                <input 
                  type="text" 
                  value={roasProductName} 
                  onChange={e => setRoasProductName(e.target.value)} 
                  placeholder="Ex: Corretor Postural..." 
                  className={`w-full ${theme.inputBg} border-2 ${theme.border} rounded-2xl p-4 ${theme.text} ${sizes.input} font-semibold focus:border-emerald-500 focus:outline-none transition-all focus:ring-4 focus:ring-emerald-500/10`}
                />
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Venda (R$)', val: calcPrice, set: setCalcPrice, icon: DollarSign },
                    { label: 'Custo (R$)', val: calcCost, set: setCalcCost, icon: Package },
                    { label: 'Ads (R$)', val: calcAds, set: setCalcAds, icon: Target },
                    { label: 'Imposto (%)', val: calcTax, set: setCalcTax, icon: TrendingUp }
                ].map((field, idx) => (
                    <div key={idx} className="space-y-2">
                       <label className={`${sizes.label} font-black uppercase flex items-center gap-1 ${theme.label}`}>
                          <field.icon size={12}/> {field.label}
                       </label>
                       <input 
                          type="number" 
                          value={field.val} 
                          onChange={e => field.set(e.target.value)} 
                          placeholder="0" 
                          className={`w-full ${theme.inputBg} border-2 ${theme.border} rounded-xl p-3 ${theme.text} focus:border-emerald-500 focus:outline-none font-sans ${sizes.input} font-bold tracking-tight focus:ring-2 focus:ring-emerald-500/20 transition-all`} 
                       />
                    </div>
                ))}
             </div>
             <button onClick={handleGenerate} disabled={isGenerating || !calcPrice} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all rounded-2xl font-black text-white text-lg shadow-lg flex items-center justify-center gap-3 uppercase tracking-wide disabled:opacity-50">
                {isGenerating ? <Loader2 className="animate-spin w-6 h-6"/> : <BarChart2 className="w-6 h-6"/>} {isGenerating ? 'Analisando...' : 'Analisar Viabilidade'}
             </button>
          </div>
        );

      case 'video_script':
        return (
          <div className={`${theme.cardBg} border-2 ${theme.border} p-8 rounded-3xl ${theme.shadow} animate-fade-in space-y-6 hover:-translate-y-1 transition-transform duration-300`}>
             <div>
                <label className={`${sizes.label} font-extrabold text-cyan-400 uppercase mb-3 block tracking-wider`}>Qual o tema do vídeo?</label>
                <div className="relative">
                   <input type="text" value={mainInput} onChange={e => setMainInput(e.target.value)} placeholder="Ex: Unboxing do Smartwatch..." className={`w-full ${theme.inputBg} border-2 ${theme.border} rounded-2xl p-5 pl-14 ${theme.text} ${sizes.input} font-medium focus:border-cyan-500 focus:outline-none transition-all focus:ring-4 focus:ring-cyan-500/10`} />
                   <Video className={`absolute left-5 top-1/2 -translate-y-1/2 ${theme.subText} w-6 h-6`} />
                </div>
             </div>
             <div className="grid md:grid-cols-2 gap-6 z-20 relative">
                <div>
                   <label className={`${sizes.label} font-black uppercase mb-3 block ${theme.label}`}>Duração</label>
                   <div className={`flex ${theme.inputBg} p-1.5 rounded-xl border ${theme.border} gap-1`}>
                      {['15s', '30s', '60s'].map(d => (
                        <button key={d} onClick={() => setVideoDuration(d)} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all active:scale-95 ${videoDuration === d ? 'bg-cyan-600 text-white shadow-lg' : `${theme.subText} hover:${theme.text} hover:${theme.hoverBg}`}`}>
                          {d}
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                   <CustomSelect themeClasses={theme} sizeClasses={sizes} label="Estilo do Vídeo" value={videoStyle} onChange={setVideoStyle} options={['Viral/Curiosidade', 'Unboxing ASMR', 'Depoimento (UGC)', 'Polêmico', 'Tutorial Rápido', 'Humor/Meme']} />
                </div>
             </div>
             <button onClick={handleGenerate} disabled={isGenerating || !mainInput} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 transition-all rounded-2xl font-black text-white text-lg shadow-lg flex items-center justify-center gap-3 uppercase tracking-wide mt-4 relative z-10">
                {isGenerating ? <Loader2 className="animate-spin w-6 h-6"/> : <Zap className="w-6 h-6"/>} GERAR ROTEIRO
             </button>
          </div>
        );

      case 'studio':
        return (
          <div className={`${theme.cardBg} border-2 ${theme.border} p-8 rounded-3xl ${theme.shadow} animate-fade-in space-y-6 hover:-translate-y-1 transition-transform duration-300`}>
              <div className="flex flex-col md:flex-row items-start gap-6">
                 <div className="flex-1 space-y-6 w-full">
                    <div>
                      <label className={`${sizes.label} font-extrabold text-pink-500 uppercase mb-3 block tracking-wider`}>Descrição do Produto</label>
                      <textarea value={mainInput} onChange={e => setMainInput(e.target.value)} placeholder="Ex: Tênis de corrida preto com neon..." className={`w-full ${theme.inputBg} border-2 ${theme.border} rounded-2xl p-4 ${theme.text} focus:border-pink-500 focus:outline-none resize-none h-32 ${sizes.input} font-medium transition-all focus:ring-4 focus:ring-pink-500/10`} />
                    </div>
                    <div className="relative z-20">
                      <CustomSelect themeClasses={theme} sizeClasses={sizes} label="Estilo de Fotografia" value={imageStyle} onChange={setImageStyle} options={['Estúdio Luxuoso (Fundo Infinito)', 'Minimalista/Clean (Apple Style)', 'Natureza/Outdoor (Lifestyle)', 'Neon/Cyberpunk (Gamer)', 'Caseiro (UGC Realista)']} icon={Camera} />
                    </div>
                 </div>
                 <div className="w-full md:w-1/3 shrink-0">
                    <div className={`border-2 border-dashed ${theme.border} rounded-2xl ${theme.inputBg} h-[220px] flex flex-col items-center justify-center relative overflow-hidden group hover:border-pink-500 transition-all cursor-pointer`}>
                        {!showCamera && !capturedImage && (
                          <button onClick={startCamera} className={`w-full h-full flex flex-col items-center justify-center gap-3 ${theme.subText} hover:text-pink-400 p-4 transition-colors`}>
                             <div className={`p-4 ${theme.cardBg} rounded-full border-2 ${theme.border} group-hover:border-pink-500 transition-all group-hover:scale-110`}><Camera size={32}/></div>
                             <span className="text-xs font-black text-center uppercase tracking-wide">Adicionar Foto<br/>de Referência</span>
                          </button>
                        )}
                        {showCamera && (
                          <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                            <button onClick={captureImage} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full border-4 border-slate-300 hover:scale-110 transition-transform shadow-lg"></button>
                          </>
                        )}
                        {capturedImage && !showCamera && (
                           <>
                              <img src={capturedImage} className="w-full h-full object-cover" />
                              <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-500 shadow-lg"><X size={16}/></button>
                           </>
                        )}
                    </div>
                 </div>
              </div>
              <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-5 bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all rounded-2xl font-black text-white text-lg shadow-lg flex items-center justify-center gap-3 uppercase tracking-wide relative z-10">
                {isGenerating ? <Loader2 className="animate-spin w-6 h-6"/> : <Sparkles className="w-6 h-6"/>} GERAR FOTO REAL
             </button>
          </div>
        );

      case 'settings':
        return (
          <div className={`${theme.cardBg} border-2 ${theme.border} p-8 rounded-3xl ${theme.shadow} animate-fade-in space-y-8`}>
             <h2 className={`font-black ${theme.heading} ${sizes.h1}`}>Configurações da Conta</h2>
             
             {/* Theme Toggle */}
             <div className={`flex items-center justify-between p-6 rounded-2xl border border-dashed ${theme.border} transition-colors`}>
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-full ${appSettings.theme === 'dark' ? 'bg-purple-600' : 'bg-yellow-500 text-white shadow-lg'}`}>
                      {appSettings.theme === 'dark' ? <Moon size={24}/> : <Sun size={24}/>}
                   </div>
                   <div>
                      <h3 className={`font-bold ${sizes.h2} ${theme.text}`}>Tema da Aplicação</h3>
                      <p className={`${sizes.text} ${theme.subText}`}>Escolha entre Cyberpunk (Escuro) ou Corporate (Claro).</p>
                   </div>
                </div>
                <div className={`flex items-center p-1.5 rounded-full border ${theme.border} ${theme.inputBg}`}>
                   <button onClick={() => setAppSettings({...appSettings, theme: 'light'})} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${appSettings.theme === 'light' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-400'}`}>Claro</button>
                   <button onClick={() => setAppSettings({...appSettings, theme: 'dark'})} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${appSettings.theme === 'dark' ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'text-slate-500 hover:text-slate-400'}`}>Escuro</button>
                </div>
             </div>

             {/* Font Size Toggle */}
             <div className={`flex items-center justify-between p-6 rounded-2xl border border-dashed ${theme.border} transition-colors`}>
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/20`}>
                      <Type size={24}/>
                   </div>
                   <div>
                      <h3 className={`font-bold ${sizes.h2} ${theme.text}`}>Tamanho da Fonte</h3>
                      <p className={`${sizes.text} ${theme.subText}`}>Ajuste o tamanho do texto para melhor leitura.</p>
                   </div>
                </div>
                <div className={`flex items-center p-1.5 rounded-full border ${theme.border} ${theme.inputBg}`}>
                   {['small', 'normal', 'large'].map((size) => (
                      <button 
                        key={size}
                        onClick={() => setAppSettings({...appSettings, fontSize: size as FontSize})} 
                        className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all active:scale-95 ${appSettings.fontSize === size ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-400'}`}
                      >
                        {size === 'small' ? 'Pequeno' : size === 'normal' ? 'Médio' : 'Grande'}
                      </button>
                   ))}
                </div>
             </div>
             
             <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="text-green-500"/>
                <p className="text-green-600 font-bold text-sm">Todas as alterações são salvas automaticamente.</p>
             </div>
          </div>
        );

      default:
        return (
          <div className={`${theme.cardBg} border-2 ${theme.border} p-8 rounded-3xl ${theme.shadow} animate-fade-in relative hover:-translate-y-1 transition-transform duration-300`}>
             <div className="flex flex-col md:flex-row gap-4 mb-6 z-20 relative">
                <div className="flex-1">
                   <CustomSelect themeClasses={theme} sizeClasses={sizes} label="TOM DE VOZ" value={tone} onChange={setTone} options={['Agressivo (Venda Direta)', 'Amigável (Influencer)', 'Profissional (B2B)', 'Urgente (Escassez)']} />
                </div>
                <div className="flex-1">
                   <CustomSelect themeClasses={theme} sizeClasses={sizes} label="PLATAFORMA" value={platform} onChange={setPlatform} options={['Facebook / Instagram Ads', 'TikTok Ads', 'Google Ads', 'E-mail Marketing']} />
                </div>
             </div>
             <div className="flex flex-col md:flex-row gap-6 relative z-10">
                <textarea value={mainInput} onChange={e => setMainInput(e.target.value)} placeholder={modules[activeModule].description} className={`flex-1 ${theme.inputBg} border-2 ${theme.border} rounded-2xl p-5 ${theme.text} focus:outline-none focus:border-purple-500 min-h-[140px] ${sizes.input} font-medium resize-none transition-all focus:ring-4 focus:ring-purple-500/10`} />
                <div className="w-full md:w-40 shrink-0 h-[140px]">
                   {!showCamera && !capturedImage && (
                     <button onClick={startCamera} className={`w-full h-full border-2 border-dashed ${theme.border} rounded-2xl flex flex-col items-center justify-center ${theme.subText} hover:text-purple-400 hover:border-purple-400 ${theme.hoverBg} transition-all gap-2 group`}>
                        <Camera size={28} className="group-hover:scale-110 transition-transform"/> <span className="text-xs font-black uppercase text-center">Usar<br/>Câmera</span>
                     </button>
                   )}
                   {showCamera && (
                     <div className="relative h-full rounded-2xl overflow-hidden bg-black shadow-lg">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                        <button onClick={captureImage} className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full border-2 border-slate-400 hover:scale-110 transition-transform active:scale-95"></button>
                     </div>
                   )}
                   {capturedImage && !showCamera && (
                     <div className="relative h-full rounded-2xl overflow-hidden border-2 border-purple-500 group shadow-lg">
                        <img src={capturedImage} className="w-full h-full object-cover"/>
                        <button onClick={() => setCapturedImage(null)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 active:scale-90"><X size={14}/></button>
                     </div>
                   )}
                </div>
             </div>
             <div className="mt-6 flex justify-end">
                <button onClick={handleGenerate} disabled={isGenerating || (!mainInput && !capturedImage)} className="px-10 py-4 bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all rounded-2xl text-white font-black text-lg shadow-lg flex items-center gap-3 w-full md:w-auto justify-center uppercase tracking-wide">
                   {isGenerating ? <Loader2 className="animate-spin w-5 h-5"/> : <Zap className="w-5 h-5 fill-white"/>} GERAR AGORA
                </button>
             </div>
          </div>
        );
    }
  };

  // --- RENDERIZADORES DE RESULTADO ---
  const renderResult = () => {
    if (!result) return null;

    if (activeModule === 'studio' && result.type === 'image') {
        return (
            <div className={`${theme.cardBg} border ${theme.border} rounded-3xl p-8 animate-fade-in shadow-2xl hover:scale-[1.01] transition-transform duration-300`}>
                <div className="flex justify-between items-center mb-6">
                   <h3 className={`font-black uppercase text-xl ${theme.heading} flex items-center gap-2`}><Sparkles className="text-pink-500"/> Imagem Gerada</h3>
                   <a 
                     href={result.url} 
                     download={`dropai-image-${Date.now()}.png`} 
                     className="px-4 py-2 bg-pink-600 hover:bg-pink-500 active:scale-95 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-pink-900/20"
                   >
                     <Download size={16}/> Baixar HD
                   </a>
                </div>
                
                <div className="rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl relative group">
                   <img src={result.url} alt="Generated by AI" className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"/>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <p className="text-white text-xs font-mono">{result.prompt}</p>
                   </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`${theme.cardBg} border ${theme.border} rounded-3xl p-8 animate-fade-in shadow-2xl hover:scale-[1.01] transition-transform duration-300`}>
             <div className="flex justify-between items-center mb-6">
                <h3 className={`font-black uppercase text-xl ${theme.heading}`}>Resultado Gerado</h3>
                <div className="flex gap-2">
                    <button className={`${theme.inputBg} p-2 rounded-lg ${theme.text} hover:bg-purple-500 hover:text-white active:scale-95 transition-colors border ${theme.border}`} onClick={() => copyToClipboard(JSON.stringify(result))}><Copy size={16}/></button>
                </div>
             </div>
             <div className={`${theme.inputBg} p-6 rounded-2xl border ${theme.border} ${theme.subText} text-sm font-mono whitespace-pre-wrap overflow-x-auto`}>
                {activeModule === 'video_script' ? result.title : JSON.stringify(result, null, 2)}
             </div>
        </div>
    );
  };

  const currentModule = modules[activeModule];

  return (
    <div className={`min-h-screen ${theme.bg} flex font-sans overflow-hidden transition-colors duration-500`}>
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 ${theme.sidebarBg} border-r ${theme.sidebarBorder} transform transition-transform duration-300 ease-in-out flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className={`h-24 flex items-center px-6 border-b ${theme.sidebarBorder}`}>
           <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl mr-3 shadow-lg shadow-purple-500/20"><Zap className="w-6 h-6 text-white" /></div>
           <span className={`text-xl font-black ${theme.heading} tracking-tighter italic`}>DROPHACKER</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
           {Object.keys(modules).map(key => {
              if (key === 'my_products') return <div key={key} className={`mt-6 pt-6 border-t ${theme.sidebarBorder}`}><button onClick={() => {setActiveModule(key as ModuleId); setResult(null);}} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeModule === key ? theme.sidebarActive : theme.sidebarInactive}`}><Package className="w-4 h-4"/> Meus Produtos <span className="ml-auto text-[10px] bg-slate-500/20 py-1 px-2 rounded-full">{savedItems}</span></button></div>;
              if (key === 'settings') return <button key={key} onClick={() => {setActiveModule(key as ModuleId); setResult(null);}} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeModule === key ? theme.sidebarActive : theme.sidebarInactive}`}><Settings className="w-4 h-4"/> Minha Conta</button>;
              
              const m = modules[key];
              return (
                 <button key={key} onClick={() => { setActiveModule(key as ModuleId); setResult(null); setIsGenerating(false); setError(null); setCapturedImage(null); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all border active:scale-95 ${activeModule === key ? `${theme.sidebarActive} shadow-lg scale-[1.02]` : `border-transparent ${theme.sidebarInactive}`}`}>
                    <m.icon className={`w-4 h-4 ${activeModule === key ? (appSettings.theme === 'light' ? 'text-purple-600' : m.color) : theme.subText}`} /> {m.label}
                 </button>
              );
           })}
        </nav>
        <div className={`p-4 border-t ${theme.sidebarBorder} ${theme.sidebarBg}`}><button onClick={onLogout} className="w-full flex items-center gap-3 px-6 py-4 text-slate-500 hover:text-red-400 hover:bg-red-950/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"><LogOut className="w-4 h-4" /> Sair da Plataforma</button></div>
      </aside>

      {/* MAIN */}
      <main className={`flex-1 overflow-y-auto h-screen w-full ${theme.bg} relative custom-scrollbar transition-colors duration-500`}>
        <div className={`md:hidden h-20 ${theme.bg}/80 backdrop-blur border-b ${theme.border} flex items-center justify-between px-6 sticky top-0 z-30`}>
          <button onClick={() => setMobileMenuOpen(true)} className={theme.subText}><Menu/></button>
          <span className={`font-black ${theme.heading} text-lg tracking-tight`}>DROPHACKER</span>
          <div className="w-6"/>
        </div>

        <div className="max-w-6xl mx-auto p-6 md:p-10 pb-40">
          {currentModule.isTool || activeModule === 'settings' ? (
            <div className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className={`${sizes.h1} font-black ${theme.heading} flex items-center gap-4 tracking-tight`}>
                    <span className={`p-3 rounded-2xl ${currentModule.bgColor} border ${currentModule.borderColor} shadow-lg`}><currentModule.icon className={`w-8 h-8 ${currentModule.color}`} /></span>
                    {currentModule.label}
                  </h1>
                  <p className={`${theme.subText} ${sizes.text} font-medium mt-2 ml-1`}>{currentModule.description}</p>
                </div>
            </div>
          ) : null}

          {/* ÁREA DE INPUT CUSTOMIZADA */}
          {renderInputSection()}

          {/* CANVAS OCULTO PARA FOTOS */}
          <canvas ref={canvasRef} className="hidden"></canvas>

          {/* RESULTADOS */}
          <div className="mt-12 min-h-[400px]">
             {isGenerating && (
                <div className="flex flex-col items-center justify-center h-80 animate-fade-in">
                  <div className="relative mb-8">
                    <div className={`w-24 h-24 border-8 ${theme.border} rounded-full`}></div>
                    <div className="w-24 h-24 border-8 border-purple-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent shadow-lg"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500 w-8 h-8 animate-pulse"/>
                  </div>
                  <h3 className={`${theme.heading} font-black text-2xl animate-pulse tracking-tight`}>HACKEANDO O MERCADO...</h3>
                  <p className={`${theme.subText} text-sm font-bold uppercase tracking-widest mt-2`}>Isso pode levar alguns segundos</p>
                </div>
             )}
             
             {!isGenerating && result && renderResult()}
             
             {!isGenerating && !result && !error && activeModule !== 'settings' && (
                <div className={`flex flex-col items-center justify-center h-64 opacity-40 select-none border-2 border-dashed ${theme.border} rounded-3xl ${theme.inputBg}`}>
                   <div className={`w-16 h-16 ${theme.cardBg} rounded-full flex items-center justify-center mb-4 border ${theme.border}`}><MousePointerClick className={`${theme.text} w-8 h-8`}/></div>
                   <p className={`text-lg ${theme.subText} font-bold`}>Aguardando comando...</p>
                </div>
             )}

             {error && (
               <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex items-center gap-4 animate-shake shadow-lg">
                 <div className="p-3 bg-red-500 rounded-full text-white"><AlertTriangle size={24}/></div>
                 <div>
                    <h4 className={`font-bold ${theme.text}`}>Ops! Algo deu errado.</h4>
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};