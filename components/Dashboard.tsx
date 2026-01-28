'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, Video, 
  Search, Users, Calculator, Megaphone, 
  Menu, MousePointerClick, 
  Camera, Home, ChevronRight, Wand2, LucideIcon, Download,
  Lock, AlertTriangle, X, LayoutTemplate,
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Star, ShoppingCart, Truck, MapPin
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
  generator: { label: 'Criador de Anúncios', icon: Megaphone, color: 'text-blue-400', desc: 'Simulador de posts e anúncios reais', placeholder: 'Ex: Fone de Ouvido Bluetooth, Corretor Postural...' },
  product_desc: { label: 'Descrições de Produto', icon: Search, color: 'text-cyan-400', desc: 'SEO para sua loja (Shopify/Nuvem)', placeholder: 'Ex: Fone Bluetooth à prova d\'água...' },
  roas_analyzer: { label: 'Calculadora de Lucro', icon: Calculator, color: 'text-emerald-400', desc: 'Previsão de lucro e viabilidade', placeholder: 'Ex: Custo do Produto R$50, Preço de Venda R$129, Taxa da Maquininha 5%...' },
  
  // Módulos Premium
  video_script: { label: 'Roteiros TikTok/Reels', icon: Video, color: 'text-pink-400', desc: 'Scripts virais para vídeos curtos', placeholder: 'Ex: Escova Alisadora 3 em 1...', isPremium: true },
  studio: { label: 'Studio Product AI', icon: Camera, color: 'text-orange-400', desc: 'Fotos profissionais de produtos', placeholder: 'Ex: Garrafa Térmica Preta em cima de uma mesa de madeira...', isPremium: true },
  persona: { label: 'Hacker de Público', icon: Users, color: 'text-indigo-400', desc: 'Descubra quem compra seu produto', placeholder: 'Ex: Kit de Ferramentas para Jardim...', isPremium: true },
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

// --- PREVIEW COMPONENTS (SIMULADORES) ---

const SocialStats = () => (
    <div className="flex items-center gap-4 py-2">
        <Heart className="w-5 h-5 text-slate-300" />
        <MessageCircle className="w-5 h-5 text-slate-300" />
        <Send className="w-5 h-5 text-slate-300" />
        <div className="flex-1"></div>
        <Bookmark className="w-5 h-5 text-slate-300" />
    </div>
);

// MOCKUP INSTAGRAM
const InstagramPreview = ({ data }: { data: any }) => (
    <div className="bg-black text-white rounded-xl border border-slate-800 overflow-hidden max-w-sm mx-auto font-sans shadow-2xl">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-black border-2 border-black"></div>
                </div>
                <span className="text-xs font-bold">sua_loja_oficial</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-white" />
        </div>
        <div className="bg-slate-900 aspect-square w-full flex items-center justify-center text-slate-600 border-b border-white/10 relative">
            <ImageIcon className="w-12 h-12 opacity-20" />
            <span className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-bold">Patrocinado</span>
        </div>
        <div className="p-3">
            <div className="flex justify-between items-center mb-2">
                 <div className="flex gap-4"><Heart /><MessageCircle /><Send /></div>
                 <Bookmark />
            </div>
            <div className="text-xs text-white mb-1 font-bold">2.493 curtidas</div>
            <p className="text-sm leading-snug">
                <span className="font-bold mr-2">sua_loja_oficial</span>
                {data.headline || data.title}
                <br/><br/>
                <span className="text-slate-300 text-xs font-normal whitespace-pre-wrap">{data.body || data.description}</span>
            </p>
            <div className="mt-2 text-blue-400 text-xs cursor-pointer">#{data.tags || "promoção #oferta #novidade"}</div>
        </div>
        <div className="bg-[#262626] p-3 flex justify-between items-center">
             <span className="text-sm font-bold text-white">{data.cta || "Saiba Mais"}</span>
             <ChevronRight className="w-4 h-4 text-slate-400"/>
        </div>
    </div>
);

// MOCKUP FACEBOOK
const FacebookPreview = ({ data }: { data: any }) => (
    <div className="bg-[#242526] text-white rounded-xl border border-slate-700 overflow-hidden max-w-sm mx-auto font-sans shadow-2xl">
        <div className="p-3 flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600"></div>
            <div>
                <div className="font-bold text-sm">Sua Loja <span className="text-xs font-normal text-slate-400">• Patrocinado</span></div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">Publicado agora <div className="w-3 h-3 rounded-full bg-slate-500"></div></div>
            </div>
            <div className="ml-auto"><MoreHorizontal className="text-slate-400"/></div>
        </div>
        <div className="px-3 pb-2 text-sm text-slate-200 whitespace-pre-wrap">
            {data.body || data.description}
        </div>
        <div className="bg-slate-800 aspect-video w-full flex items-center justify-center relative">
             <ImageIcon className="w-12 h-12 text-slate-600 opacity-50" />
        </div>
        <div className="bg-[#3A3B3C] p-3 flex items-center justify-between">
            <div className="flex-1">
                <div className="text-xs text-slate-400 uppercase">LOJAOFICIAL.COM.BR</div>
                <div className="font-bold text-sm leading-tight truncate pr-2">{data.headline || data.title}</div>
            </div>
            <button className="bg-slate-600 px-4 py-1.5 rounded text-sm font-bold">{data.cta || "Saiba mais"}</button>
        </div>
        <div className="p-2 border-t border-slate-700 flex justify-between text-slate-400 text-xs font-medium">
             <div className="flex gap-2 items-center"><div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white">👍</div> 420</div>
             <div className="flex gap-3"><span>34 Comentários</span><span>12 Compartilhamentos</span></div>
        </div>
    </div>
);

// MOCKUP SHOPEE
const ShopeePreview = ({ data }: { data: any }) => (
    <div className="bg-[#F5F5F5] text-slate-800 rounded-xl overflow-hidden max-w-sm mx-auto font-sans shadow-2xl border border-slate-300 relative">
        <div className="bg-[#EE4D2D] text-white p-3 flex items-center gap-2 text-sm font-bold sticky top-0 z-10">
            <div className="bg-white text-[#EE4D2D] px-1 rounded text-xs">Mall</div>
            <span>Shopee</span>
            <div className="ml-auto flex gap-3"><ShoppingCart size={18}/><MoreHorizontal size={18}/></div>
        </div>
        <div className="bg-white aspect-square w-full flex items-center justify-center relative border-b border-slate-100">
             <ImageIcon className="w-16 h-16 text-slate-300" />
             <div className="absolute bottom-0 left-0 bg-[#EE4D2D]/90 text-white text-[10px] px-2 py-0.5">Frete Grátis</div>
             <div className="absolute top-2 right-2 bg-[#FFD424] text-[#EE4D2D] text-xs font-bold px-1 py-0.5 rounded">-40%</div>
        </div>
        <div className="p-3 bg-white">
            <div className="line-clamp-2 text-sm text-[#1d1d1f] font-medium leading-snug mb-2">
                {data.headline || data.title}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
                <span className="text-xs text-[#EE4D2D]">R$</span>
                <span className="text-lg font-bold text-[#EE4D2D]">{data.price || "97,90"}</span>
                <span className="text-xs text-slate-400 line-through ml-2">R$ {((parseFloat((data.price || "97,90").replace(',','.')) || 100) * 1.5).toFixed(2).replace('.',',')}</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
                <div className="flex text-[#FFD424]"><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/><Star size={10} fill="currentColor"/></div>
                <span className="text-[10px] text-slate-500 border-l border-slate-300 pl-1 ml-1">1.2k Vendidos</span>
            </div>
            <div className="bg-[#FAFAFA] p-2 rounded text-[10px] text-slate-600 line-clamp-3 leading-relaxed border border-slate-100">
                {data.body || data.description}
            </div>
        </div>
        <div className="p-2 bg-white border-t border-slate-200 flex justify-end gap-2">
            <button className="flex-1 bg-[#EE4D2D]/10 text-[#EE4D2D] py-2 text-xs border border-[#EE4D2D] rounded">Adicionar ao Carrinho</button>
            <button className="flex-1 bg-[#EE4D2D] text-white py-2 text-xs rounded font-bold">Comprar Agora</button>
        </div>
    </div>
);

// MOCKUP MERCADO LIVRE
const MLPreview = ({ data }: { data: any }) => (
    <div className="bg-[#EDEDED] text-slate-800 rounded-xl overflow-hidden max-w-sm mx-auto font-sans shadow-2xl border border-slate-200">
        <div className="bg-[#FFF159] p-3 text-sm flex items-center gap-3 text-slate-700 font-medium">
             <Menu size={18} />
             <div className="bg-white/50 h-8 rounded-full flex-1 px-3 flex items-center text-xs text-slate-400">Buscar no Mercado Livre</div>
             <ShoppingCart size={18} />
        </div>
        <div className="bg-white p-4">
             <div className="text-[10px] text-slate-400 mb-1">Novo  |  +1000 vendidos</div>
             <div className="text-sm font-medium text-slate-900 leading-snug mb-2">{data.headline || data.title}</div>
             <div className="flex items-center gap-1 mb-3">
                 <div className="flex text-blue-500"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                 <span className="text-xs text-slate-400">(423)</span>
             </div>
             
             <div className="bg-slate-100 aspect-video rounded w-full flex items-center justify-center mb-4">
                 <ImageIcon className="text-slate-300 w-10 h-10" />
             </div>

             <div className="text-2xl font-light text-slate-900 mb-1">R$ {data.price || "129,90"}</div>
             <div className="text-sm text-green-600 font-medium mb-1">em 12x R$ {((parseFloat((data.price || "129,90").replace(',','.')) || 100) / 12).toFixed(2).replace('.',',')} sem juros</div>
             
             <div className="text-green-600 text-xs font-bold mb-1">Chegará grátis amanhã</div>
             <div className="text-[10px] text-slate-500 mb-4">Vendido por <span className="text-blue-500">Loja Oficial</span></div>

             <button className="w-full bg-[#3483FA] text-white font-bold py-3 rounded-lg text-sm mb-2 hover:bg-[#2968c8] transition-colors">Comprar agora</button>
             <button className="w-full bg-[#E3EDFB] text-[#3483FA] font-bold py-3 rounded-lg text-sm hover:bg-[#d0e0f8] transition-colors">Adicionar ao carrinho</button>
        </div>
        <div className="p-4 bg-white border-t border-slate-100 mt-2">
            <h4 className="text-sm font-medium mb-2">Descrição</h4>
            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{data.body || data.description}</p>
        </div>
    </div>
);

// MOCKUP AMAZON
const AmazonPreview = ({ data }: { data: any }) => (
    <div className="bg-white text-slate-900 rounded-xl overflow-hidden max-w-sm mx-auto font-sans shadow-2xl border border-slate-300">
        <div className="bg-[#232f3e] p-3 text-white flex items-center justify-between">
            <span className="font-bold tracking-tighter">amazon</span>
            <ShoppingCart size={20} />
        </div>
        <div className="p-4">
            <div className="text-xs text-[#007185] mb-1 hover:underline cursor-pointer">Visite a loja da marca</div>
            <div className="text-sm font-medium leading-snug mb-1">{data.headline || data.title}</div>
            <div className="flex items-center gap-1 mb-2">
                 <div className="flex text-[#F4A41D]"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                 <span className="text-xs text-[#007185]">12.493</span>
            </div>
            
            <div className="bg-slate-50 aspect-square w-full flex items-center justify-center my-2 p-4">
                 <ImageIcon className="text-slate-300 w-16 h-16" />
            </div>

            <div className="flex items-start gap-1 mb-1">
                 <span className="text-xs relative top-1">R$</span>
                 <span className="text-2xl font-medium">{String(data.price || "149,00").split(',')[0]}</span>
                 <span className="text-xs relative top-1">{String(data.price || "149,00").split(',')[1] || "00"}</span>
            </div>
            <div className="text-xs text-slate-500 mb-2">
                Entrega GRÁTIS: <span className="font-bold text-slate-800">Quarta-feira, 28 de Jun</span>
            </div>
            <div className="text-sm text-[#007185] mb-4 flex items-center gap-1">
                <div className="text-[#00A8E1] font-bold italic">prime</div>
            </div>

            <div className="space-y-2">
                <button className="w-full bg-[#FFD814] text-black text-sm py-2.5 rounded-full border border-[#FCD200] shadow-sm hover:bg-[#F7CA00]">Adicionar ao carrinho</button>
                <button className="w-full bg-[#FFA41C] text-black text-sm py-2.5 rounded-full border border-[#FF8F00] shadow-sm hover:bg-[#FA8900]">Comprar agora</button>
            </div>
        </div>
    </div>
);

// MOCKUP OLX
const OLXPreview = ({ data }: { data: any }) => (
    <div className="bg-white text-slate-800 rounded-xl overflow-hidden max-w-sm mx-auto font-sans shadow-2xl border border-slate-200">
        <div className="bg-[#6E0AD6] p-3 flex justify-between items-center text-white">
            <Menu size={20} />
            <span className="font-bold text-xl tracking-tight">OLX</span>
            <Search size={20} />
        </div>
        <div className="bg-slate-200 aspect-video w-full flex items-center justify-center relative">
             <ImageIcon className="text-slate-400 w-12 h-12" />
             <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 rounded text-xs">1/4</div>
        </div>
        <div className="p-4">
            <div className="text-2xl font-medium text-slate-900 mb-1">R$ {data.price || "800"}</div>
            <div className="text-sm text-slate-800 leading-snug mb-2">{data.headline || data.title}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-4">Publicado hoje às 14:30</div>
            
            <div className="border-t border-slate-100 pt-3">
                <h4 className="font-bold text-sm text-slate-900 mb-2">Descrição</h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{data.body || data.description}</p>
            </div>
        </div>
        <div className="p-3 border-t border-slate-100 flex gap-2 bg-white sticky bottom-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            <button className="flex-1 bg-[#F78323] hover:bg-[#e07218] text-white font-bold py-2.5 rounded-full text-sm">Chat</button>
            <button className="bg-[#6E0AD6] hover:bg-[#5b08b3] text-white p-2.5 rounded-full"><MessageCircle/></button>
        </div>
    </div>
);

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
  
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free'); 
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // State for Generation
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Options State
  const [tone, setTone] = useState('Agressivo');
  const [platform, setPlatform] = useState('Facebook');
  const [videoDuration, setVideoDuration] = useState('30s');
  
  const userName = userEmail ? userEmail.split('@')[0] : null;
  const formattedName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "Visitante";

  useEffect(() => {
    const fetchUserPlan = async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
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
        
        switch (activeModule) {
            case 'generator':
                prompt = `Atue como um Copywriter Brasileiro Especialista em ${platform}. Crie 1 variação PERFEITA de anúncio para o produto: "${input}".
                
                REGRAS ESPECÍFICAS PARA ${platform.toUpperCase()}:
                ${platform === 'Shopee' || platform === 'Mercado Livre' || platform === 'Amazon' || platform === 'OLX'
                    ? "- Crie um Título SEO otimizado (Headline).\n- Crie uma Descrição técnica mas persuasiva.\n- Estime um preço fictício realista (Price) apenas número ex: 97,90." 
                    : "- Crie uma Headline curta (para imagem).\n- Crie uma Legenda (Body) engajadora com emojis.\n- Inclua Hashtags.\n- Crie um CTA curto."}

                Retorne APENAS um JSON: 
                { "title": "...", "body": "...", "price": "...", "cta": "...", "tags": "..." }`;
                break;
            case 'video_script':
                prompt = `Crie um roteiro viral de TikTok/Reels de ${videoDuration} para o produto: "${input}". 
                Idioma: Português do Brasil. Estrutura de Retenção Alta.
                Retorne APENAS um JSON válido: 
                { "hook_visual": "...", "hook_audio": "...", "scenes": [{"seconds": "0-3s", "visual": "...", "audio": "..."}] }`;
                break;
            case 'product_desc':
                prompt = `Especialista em SEO de E-commerce. Descreva: "${input}". 
                Retorne APENAS JSON: { "product_title": "...", "meta_description": "...", "description_body": "...", "features_list": ["...", "..."] }`;
                break;
            case 'persona':
                prompt = `Crie um Avatar brasileiro para: "${input}". 
                Retorne JSON: { "avatar_name": "...", "interests": ["..."], "pain_points": ["..."], "objections": ["..."], "buying_triggers": ["..."] }`;
                break;
            case 'roas_analyzer':
                prompt = `Análise financeira dropshipping para: "${input}". 
                Retorne JSON: { "analysis_summary": "...", "metrics": { "breakeven_cpa": "...", "target_roas": "...", "potential_profit": "..." }, "recommendation": "..." }`;
                break;
            case 'studio':
                prompt = `Professional product photography of ${input}, studio lighting, 4k, advertising standard, centered.`;
                break;
            default:
                prompt = `Ajude com: ${input}`;
        }
        
        if (activeModule === 'studio') {
             const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
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
            const text = await generateCopy(prompt, activeModule);
            
            if (text) {
              try {
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                setResult(JSON.parse(cleanText));
              } catch (e) {
                console.error("Erro parsing JSON:", e);
                setResult({ "Resposta": text }); 
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

  // --- SWITCH DE RENDERIZAÇÃO ---
  const renderPreview = () => {
    if (!result) return null;

    if (activeModule === 'generator') {
        switch(platform) {
            case 'Instagram': return <InstagramPreview data={result} />;
            case 'Facebook': return <FacebookPreview data={result} />;
            case 'Shopee': return <ShopeePreview data={result} />;
            case 'Mercado Livre': return <MLPreview data={result} />;
            case 'Amazon': return <AmazonPreview data={result} />;
            case 'OLX': return <OLXPreview data={result} />;
            default: return <FacebookPreview data={result} />;
        }
    }

    // Default renderer for other modules (Script, SEO, etc)
    if (result.type === 'image') {
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-2xl shadow-2xl inline-block w-full">
                <img src={result.url} className="w-full h-auto rounded-xl" />
                <div className="mt-3 flex justify-between items-center px-2">
                    <span className="text-[10px] text-slate-500">Gerado por IA (Studio Mode)</span>
                    <a href={result.url} download="dropai-img.png" className="text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg text-xs font-bold flex gap-2 items-center transition-colors"><Download size={14}/> Baixar Imagem</a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {Object.entries(result).map(([key, value]: any, idx) => (
                <div key={idx} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                        {key.replace(/_/g, ' ')}
                        </h3>
                    </div>
                    <div className="p-6">
                        {Array.isArray(value) ? (
                            <ul className="space-y-2">
                                {value.map((v, i) => (
                                    <li key={i} className="text-sm text-slate-300 bg-black/20 p-2 rounded border border-white/5">
                                        {typeof v === 'object' ? JSON.stringify(v) : v}
                                    </li>
                                ))}
                            </ul>
                        ) : typeof value === 'object' ? (
                            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono">{JSON.stringify(value, null, 2)}</pre>
                        ) : (
                            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{String(value)}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
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

      {/* SIDEBAR */}
      <>
        {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
        )}
        
        <aside className={`
            fixed lg:static top-0 left-0 bottom-0 z-50 
            bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 shadow-2xl
            ${mobileMenuOpen ? 'translate-x-0 w-[80%]' : '-translate-x-full lg:translate-x-0'}
            ${sidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}>
            <div className="hidden lg:flex h-20 items-center px-6 border-b border-slate-800 shrink-0">
                <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg mr-3 shadow-lg shadow-purple-500/20 shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                {sidebarOpen && <span className="font-bold tracking-tight italic text-lg">DROPHACKER</span>}
            </div>

            <div className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-slate-800">
                <span className="font-bold text-slate-300">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}><X className="text-slate-400" /></button>
            </div>

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
              // --- TOOL VIEW ---
              <div className="flex flex-col lg:flex-row h-full overflow-hidden relative z-10">
                  
                  {/* LEFT: CONTROLS */}
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
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">O que vamos vender?</label>
                             <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={MODULES[activeModule].placeholder || "Descreva o produto com detalhes..."}
                                disabled={isModuleLocked}
                                className="w-full h-32 md:h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm leading-relaxed shadow-inner disabled:opacity-50"
                             />
                         </div>

                         {activeModule === 'generator' && (
                             <div className="grid grid-cols-1 gap-4">
                                <CustomSelect 
                                    label="Simular Plataforma" 
                                    value={platform} 
                                    onChange={setPlatform} 
                                    options={['Facebook', 'Instagram', 'Shopee', 'Mercado Livre', 'Amazon', 'OLX']} 
                                />
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
                            {isGenerating ? 'CRIANDO MÁGICA...' : 'GERAR AGORA'}
                        </button>
                     </div>
                  </div>

                  {/* RIGHT: PREVIEW AREA */}
                  <div id="result-area" className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col min-h-[50vh]">
                      <div className="h-12 md:h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
                          <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles size={14} className="text-purple-500" /> Resultado Final
                          </span>
                          {result && (
                              <button 
                                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] md:text-xs flex items-center gap-2 text-slate-300 transition-colors border border-white/5"
                              >
                                  <Copy className="w-3 h-3"/> Copiar Tudo
                              </button>
                          )}
                      </div>

                      <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex items-start justify-center pb-24 md:pb-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                          {!result && !isGenerating && (
                              <div className="text-center opacity-40 mt-10 md:mt-20">
                                  <LayoutTemplate className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-slate-500"/>
                                  <p className="text-slate-300 font-medium text-base md:text-lg">Selecione a plataforma e gere seu anúncio.</p>
                              </div>
                          )}

                          {isGenerating && (
                              <div className="text-center mt-10 md:mt-20">
                                   <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-6">
                                       <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                                       <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                                       <Zap className="absolute inset-0 m-auto text-purple-400 w-6 h-6 md:w-8 md:h-8 animate-pulse"/>
                                   </div>
                                   <p className="text-purple-300 font-bold animate-pulse text-sm">Construindo Mockup do {platform}...</p>
                              </div>
                          )}

                          {result && !isGenerating && (
                              <div className="w-full max-w-4xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 pb-10">
                                  {renderPreview()}
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