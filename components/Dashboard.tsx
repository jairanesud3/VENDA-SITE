'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, Video, 
  Search, Users, Calculator, Megaphone, 
  Menu, Camera, Home, ChevronRight, Wand2, LucideIcon, Download,
  Lock, X, LayoutTemplate,
  Palette, Box, Moon, Sun, Grid3X3, Aperture, Leaf, Gem, Monitor,
  History, Trash2, Calendar, FileText, CheckCircle,
  Mail, UserPlus, FileEdit, Shield, Type,
  ChevronDown, Upload, Eraser, DollarSign, Tag, Text,
  Clock
} from 'lucide-react';
import { generateCopy } from '@/app/actions/generate-copy';
import { getUserHistory, deleteHistoryItem } from '@/app/actions/history';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ImageTool } from './ImageTool';

interface DashboardProps {
  onLogout: () => void;
  userEmail?: string | null;
}

// --- TEMAS GLOBAIS (BACKGROUNDS) ---
export const BACKGROUNDS = [
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

// --- COMPONENTE SELETOR DE TEMA ---
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
        className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shadow-lg border ${
          isOpen 
            ? 'bg-purple-600 border-purple-400 text-white' 
            : 'bg-black/40 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
        }`}
        title="Alterar Cenário/Tema"
      >
        <Palette className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-[260px] md:w-[280px] bg-[#0f0f11] border border-slate-700 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Selecionar Ambiente
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setActiveTheme(bg)} 
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
        </div>
      )}
    </div>
  );
};


// --- CONFIGURAÇÃO MÓDULOS ---
type ModuleId = 
  | 'home'
  | 'generator' | 'video_script' | 'studio'
  | 'email_marketing' | 'influencer_dm' | 'blog_post' 
  | 'product_desc' | 'persona' | 'roas_analyzer' 
  | 'policy_gen' | 'headline_optimizer'
  | 'history' | 'settings';

interface ModuleConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  desc: string;
  category: 'core' | 'marketing' | 'strategy' | 'legal' | 'system';
  placeholder?: string;
  isPremium?: boolean;
}

const MODULES: Record<string, ModuleConfig> = {
  home: { label: 'Visão Geral', icon: Home, color: 'text-purple-400', desc: 'Resumo da conta', category: 'system' },
  
  // CRIAÇÃO (CORE)
  generator: { label: 'Criador de Anúncios', icon: Megaphone, color: 'text-blue-400', desc: 'Posts para Face/Insta/TikTok', category: 'core', placeholder: 'Ex: Corretor Postural Ortopédico...' },
  video_script: { label: 'Roteiros Virais', icon: Video, color: 'text-pink-400', desc: 'Scripts para TikTok e Reels', category: 'core', isPremium: true, placeholder: 'Ex: Escova Alisadora 3 em 1...' },
  studio: { label: 'Studio Product AI', icon: Camera, color: 'text-orange-400', desc: 'Fotos de produto 4K', category: 'core', isPremium: true },
  
  // MARKETING 
  email_marketing: { label: 'E-mail Marketing', icon: Mail, color: 'text-yellow-400', desc: 'Recuperação e Boas-vindas', category: 'marketing', isPremium: true, placeholder: 'Ex: Cliente abandonou carrinho com um Smartwatch...' },
  influencer_dm: { label: 'Influencer Outreach', icon: UserPlus, color: 'text-rose-400', desc: 'Scripts para parcerias', category: 'marketing', placeholder: 'Ex: Parceria para loja de joias...' },
  blog_post: { label: 'SEO Blog Builder', icon: FileEdit, color: 'text-green-400', desc: 'Artigos para tráfego orgânico', category: 'marketing', isPremium: true, placeholder: 'Ex: 5 Benefícios de usar palmilhas ortopédicas...' },

  // ESTRATÉGIA
  product_desc: { label: 'Descrições SEO', icon: Search, color: 'text-cyan-400', desc: 'Páginas de produto que convertem', category: 'strategy', placeholder: 'Ex: Fone Bluetooth à prova d\'água...' },
  persona: { label: 'Hacker de Público', icon: Users, color: 'text-indigo-400', desc: 'Avatar do cliente ideal', category: 'strategy', isPremium: true, placeholder: 'Ex: Kit de Ferramentas para Jardim...' },
  roas_analyzer: { label: 'Calculadora de Lucro', icon: Calculator, color: 'text-emerald-400', desc: 'Previsão de viabilidade', category: 'strategy', placeholder: 'Ex: Custo R$50, Venda R$129...' },
  headline_optimizer: { label: 'Headline Tester', icon: Type, color: 'text-red-400', desc: '10 Variações de Títulos', category: 'strategy', placeholder: 'Ex: Tênis de Corrida Ultra Leve...' },

  // LEGAL & SISTEMA
  policy_gen: { label: 'Gerador de Políticas', icon: Shield, color: 'text-slate-400', desc: 'Termos e Privacidade', category: 'legal', placeholder: 'Ex: Nome da Loja: TechStore, Email: suporte@techstore.com...' },
  history: { label: 'Minha Biblioteca', icon: History, color: 'text-slate-300', desc: 'Histórico salvo', category: 'system' },
};

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

// --- PREVIEWS (SIMULADORES) ---

const FacebookPreview = ({ data, userImage }: { data: any, userImage: string | null }) => (
    <div className="bg-[#242526] text-white rounded-xl border border-slate-700 overflow-hidden max-w-sm mx-auto font-sans shadow-2xl animate-in fade-in zoom-in-95">
        <div className="p-3 flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">SL</div>
            <div className="flex-1">
                <div className="font-bold text-sm">Sua Loja Oficial</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">Patrocinado <span className="text-[8px]">🌐</span></div>
            </div>
            <div className="text-slate-400">•••</div>
        </div>
        
        <div className="px-3 pb-2 text-sm text-slate-200 whitespace-pre-wrap">{data.body || data.description}</div>
        
        <div className="bg-black aspect-square w-full relative overflow-hidden flex items-center justify-center">
             {userImage ? (
                <img src={userImage} alt="Produto" className="w-full h-full object-cover" />
             ) : (
                <div className="text-slate-600 flex flex-col items-center">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs">Imagem do Produto</span>
                </div>
             )}
             <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full">
                 {data.price ? `R$ ${data.price}` : 'Promoção'}
             </div>
        </div>
        
        <div className="bg-[#3A3B3C] p-3 flex items-center justify-between">
            <div>
                <div className="text-[10px] text-slate-400">LOJAOFICIAL.COM.BR</div>
                <div className="font-bold text-sm leading-tight">{data.headline || data.title}</div>
            </div>
            <button className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded text-sm font-bold transition-colors">{data.cta || "Saiba mais"}</button>
        </div>
        
        <div className="p-3 border-t border-slate-700 flex justify-between text-slate-400 text-xs">
             <span>👍 1.2 mil</span>
             <span>45 comentários • 12 compartilhamentos</span>
        </div>
    </div>
);

const InstagramPreview = ({ data, userImage }: { data: any, userImage: string | null }) => (
    <div className="bg-black text-white rounded-xl border border-slate-800 overflow-hidden max-w-sm mx-auto font-sans shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                    <div className="w-full h-full bg-black rounded-full border border-black"></div>
                </div>
                <span className="text-xs font-bold">sua_loja_br</span>
            </div>
            <div className="text-xs text-slate-400">Patrocinado</div>
        </div>

        <div className="bg-slate-900 aspect-square w-full relative overflow-hidden flex items-center justify-center">
             {userImage ? (
                <img src={userImage} alt="Produto" className="w-full h-full object-cover" />
             ) : (
                <ImageIcon className="w-12 h-12 opacity-20" />
             )}
        </div>

        <div className="p-3 bg-[#121212]">
            <div className="flex justify-between items-center mb-3">
               <button className="bg-blue-600 text-white w-full py-1.5 rounded font-bold text-xs">{data.cta || "Comprar Agora"}</button>
            </div>
            <p className="text-sm leading-snug">
                <span className="font-bold mr-2">sua_loja_br</span>
                {data.headline || data.title}
                <br/><br/>
                <span className="text-slate-300 text-xs font-normal whitespace-pre-wrap">{data.body || data.description}</span>
            </p>
             <div className="mt-2 text-[10px] text-slate-500 uppercase">HÁ 2 HORAS</div>
        </div>
    </div>
);


// COMPONENTES AUXILIARES

const SidebarItem = ({ id, conf, active, onClick, userPlan }: any) => (
  <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all rounded-lg group mb-1
          ${active 
          ? 'bg-purple-600/10 text-white border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
  >
      <div className="relative">
        <conf.icon className={`w-4 h-4 ${active ? conf.color : 'text-slate-500 group-hover:text-white'} transition-colors`} />
        {conf.isPremium && userPlan === 'free' && (
             <div className="absolute -top-1 -right-1 bg-slate-950 rounded-full p-[1px] border border-slate-800"><Lock className="w-2 h-2 text-yellow-500" /></div>
        )}
      </div>
      <span className="truncate">{conf.label}</span>
  </button>
);

const CategoryLabel = ({ label }: { label: string }) => (
    <div className="px-3 mt-4 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</div>
);

// --- COMPONENTE DE RENDERIZAÇÃO DO HISTÓRICO (PRETTY JSON) ---
const HistoryContentRenderer = ({ content }: { content: any }) => {
    // Se for string simples
    if (typeof content !== 'object' || content === null) {
        return <p className="text-slate-300 text-sm whitespace-pre-wrap">{String(content)}</p>;
    }

    // Se for Objeto JSON
    return (
        <div className="space-y-4">
            {Object.entries(content).map(([key, value], idx) => {
                // Remove chaves técnicas se houver (opcional)
                if (key === 'tags' || key === 'technical_info') return null;

                const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();

                return (
                    <div key={idx} className="bg-black/30 rounded-lg p-3 border border-white/5">
                        <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">
                            {label}
                        </h4>
                        
                        {Array.isArray(value) ? (
                            <ul className="list-disc list-inside space-y-1">
                                {value.map((v: any, i: number) => (
                                    <li key={i} className="text-slate-300 text-sm">
                                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                    </li>
                                ))}
                            </ul>
                        ) : typeof value === 'object' ? (
                            <pre className="text-xs text-slate-400 overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                        ) : (
                            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                {String(value)}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, userEmail }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [activeTheme, setActiveTheme] = useState(BACKGROUNDS[0]);
  const [themePrefs, setThemePrefs] = useState<Record<string, string>>({});

  // History State
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyType, setHistoryType] = useState<'text' | 'image'>('text');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const router = useRouter();
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free'); 
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // --- STATE DO FORMULÁRIO (GERAL) ---
  const [input, setInput] = useState(''); // Fallback para outros módulos
  
  // --- STATE ESTRUTURADO PARA O GERADOR DE ANÚNCIOS ---
  const [adFormData, setAdFormData] = useState({
      productName: '',
      price: '',
      details: '',
      image: null as string | null // Base64 ou URL para preview
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [platform, setPlatform] = useState('Facebook');
  const [videoDuration, setVideoDuration] = useState('30s');

  const userName = userEmail ? userEmail.split('@')[0] : null;
  const formattedName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "Visitante";

  useEffect(() => {
    const init = async () => {
        const saved = localStorage.getItem('drophacker_themes');
        if (saved) setThemePrefs(JSON.parse(saved));
        
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.plan === 'pro') setUserPlan('pro');
        setIsLoadingPlan(false);
    };
    init();
  }, []);

  useEffect(() => {
    const savedThemeId = themePrefs[activeModule];
    if (savedThemeId) {
        const found = BACKGROUNDS.find(b => b.id === savedThemeId);
        if (found) setActiveTheme(found);
    } else {
        setActiveTheme(BACKGROUNDS[0]);
    }
  }, [activeModule, themePrefs]);

  const handleThemeChange = (newTheme: typeof BACKGROUNDS[0]) => {
     setActiveTheme(newTheme);
     const newPrefs = { ...themePrefs, [activeModule]: newTheme.id };
     setThemePrefs(newPrefs);
     localStorage.setItem('drophacker_themes', JSON.stringify(newPrefs));
  };

  useEffect(() => {
    if (activeModule === 'history') fetchHistory();
  }, [activeModule, historyType]);

  const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
          const items = await getUserHistory(historyType);
          setHistoryItems(items || []);
      } catch (e) { console.error(e); } 
      finally { setIsLoadingHistory(false); }
  };

  const handleUpgradeClick = () => { router.push('/plans'); };
  const isModuleLocked = MODULES[activeModule].isPremium && userPlan === 'free';

  // --- LÓGICA DE UPLOAD SIMULADO (PARA PREVIEW) ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setAdFormData(prev => ({ ...prev, image: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleClearForm = () => {
      setResult(null);
      setError(null);
      setInput('');
      setAdFormData({
          productName: '',
          price: '',
          details: '',
          image: null
      });
  };

  const handleGenerate = async () => {
    // Validação básica
    if (activeModule === 'generator') {
        if (!adFormData.productName) { setError("Por favor, informe o nome do produto."); return; }
    } else {
        if (!input && !isModuleLocked) return;
    }

    if(isModuleLocked) return;

    setIsGenerating(true);
    setResult(null);
    setError(null);

    if (window.innerWidth < 1024) {
        setTimeout(() => document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    try {
        let prompt = "";
        
        switch (activeModule) {
            case 'generator':
                // MONTA O PROMPT COM OS DADOS ESTRUTURADOS
                const adContext = `
                    Produto: ${adFormData.productName}
                    Preço: ${adFormData.price || 'Não informado'}
                    Detalhes/Benefícios: ${adFormData.details}
                `;

                prompt = `Atue como Copywriter Brasileiro Especialista em ${platform}. Crie 1 variação de anúncio baseada nestes dados:
                ${adContext}
                
                Se for Marketplace (Shopee/Mercado Livre), foque em SEO e Preço. Se for Social (Insta/Face), foque em Emoção e CTA.
                Retorne JSON EXATAMENTE assim: { "title": "...", "body": "...", "price": "${adFormData.price || '97,90'}", "cta": "...", "tags": "..." }`;
                break;

            case 'video_script':
                prompt = `Roteiro viral de TikTok (${videoDuration}) para: "${input}". 
                Retorne JSON: { "hook_visual": "...", "hook_audio": "...", "scenes": [{"seconds": "...", "visual": "...", "audio": "..."}] }`;
                break;
            case 'product_desc':
                prompt = `Descrição SEO E-commerce para: "${input}". 
                Retorne JSON: { "product_title": "...", "meta_description": "...", "description_body": "...", "features_list": ["..."], "faq": [{"q":"...","a":"..."}] }`;
                break;
            case 'persona':
                prompt = `Avatar do cliente ideal para: "${input}". 
                Retorne JSON: { "name": "...", "age_range": "...", "job": "...", "interests": ["..."], "pain_points": ["..."], "objections": ["..."] }`;
                break;
            case 'email_marketing':
                prompt = `Crie uma sequência de email marketing (Assunto + Corpo) para: "${input}".
                Retorne JSON: { "email_1_subject": "...", "email_1_body": "...", "email_2_subject": "...", "email_2_body": "..." }`;
                break;
            case 'influencer_dm':
                prompt = `Crie 3 scripts de DM para abordar influenciadores para o produto: "${input}". 
                Retorne JSON: { "script_formal": "...", "script_casual": "...", "script_partnership": "..." }`;
                break;
            case 'blog_post':
                prompt = `Escreva um post de blog Otimizado para SEO (Título H1, Introdução, 3 H2s, Conclusão) sobre: "${input}".
                Retorne JSON: { "title": "...", "intro": "...", "section_1": {"title": "...", "content": "..."}, "section_2": {"title": "...", "content": "..."}, "conclusion": "..." }`;
                break;
            case 'policy_gen':
                prompt = `Gere textos legais padrão para loja de dropshipping com os dados: "${input}".
                Retorne JSON: { "terms_of_service": "...", "privacy_policy": "...", "refund_policy": "..." }`;
                break;
            case 'headline_optimizer':
                prompt = `Gere 10 Headlines de alta conversão (Clickbait ético) para: "${input}".
                Retorne JSON: { "headlines": ["...", "..."] }`;
                break;
            case 'roas_analyzer':
                prompt = `Análise de viabilidade dropshipping para: "${input}". 
                Retorne JSON: { "verdict": "...", "break_even_point": "...", "target_cpa": "...", "suggested_price": "..." }`;
                break;
            default:
                prompt = `Ajude com: ${input}`;
        }
        
        if (activeModule !== 'studio') {
            const text = await generateCopy(prompt, activeModule);
            try {
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                setResult(JSON.parse(cleanText));
            } catch (e) {
                setResult({ "Resposta": text }); 
            }
        }

    } catch (err: any) {
        if (err.message.includes("Upgrade required")) {
            setError("🔒 ACESSO NEGADO: Recurso PRO.");
        } else {
            setError("Erro ao processar. Tente novamente.");
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const renderGenericResult = (data: any) => (
    <div className="space-y-4">
        {Object.entries(data).map(([key, value]: any, idx) => (
            <div key={idx} className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                    {key.replace(/_/g, ' ')}
                    </h3>
                </div>
                <div className="p-5">
                    {Array.isArray(value) ? (
                        <ul className="space-y-2">
                            {value.map((v, i) => (
                                <li key={i} className="text-sm text-slate-300 bg-black/20 p-2.5 rounded border border-white/5">
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

  return (
    <div className="flex h-screen bg-[#0B0518] text-white font-sans overflow-hidden relative selection:bg-purple-500/30">
      
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">DROP<span className="text-purple-400">HACKER</span></span>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-400 active:text-white transition-colors">
            <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <>
        {mobileMenuOpen && <div className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>}
        
        <aside className={`
            fixed lg:static top-0 left-0 bottom-0 z-50 
            bg-[#0B0518] border-r border-slate-800 flex flex-col transition-all duration-300 shadow-2xl
            ${mobileMenuOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
            ${sidebarOpen ? 'lg:w-[260px]' : 'lg:w-[72px]'}
        `}>
            {/* Sidebar Header */}
            <div className="hidden lg:flex h-16 items-center px-5 border-b border-slate-800/50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg shadow-lg shadow-purple-500/20 shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    {sidebarOpen && <span className="font-bold tracking-tight text-lg">DROPHACKER</span>}
                </div>
            </div>

            {/* User Plan Card (Mobile/Full Sidebar) */}
            <div className={`px-4 py-4 ${!sidebarOpen && 'hidden lg:hidden'}`}>
                {isLoadingPlan ? (
                    <div className="h-14 w-full bg-slate-900 rounded-lg animate-pulse"></div>
                ) : (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${userPlan === 'pro' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-slate-700'}`}>
                                    {userPlan === 'pro' ? <Zap className="w-4 h-4 text-white fill-white" /> : <Users className="w-4 h-4 text-slate-400" />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-white leading-none">{userPlan === 'pro' ? 'Membro PRO' : 'Visitante'}</div>
                                    <div className="text-[10px] text-slate-500">{userPlan === 'pro' ? 'Acesso Total' : 'Plano Grátis'}</div>
                                </div>
                            </div>
                        </div>
                        {userPlan === 'free' && (
                            <button onClick={handleUpgradeClick} className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg transition-colors shadow-lg">
                                Fazer Upgrade
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
                <SidebarItem 
                    id="home" conf={MODULES.home} active={activeModule === 'home'} 
                    onClick={() => { setActiveModule('home'); setMobileMenuOpen(false); }} userPlan={userPlan} 
                />

                {/* Categories */}
                {sidebarOpen && <CategoryLabel label="Criação" />}
                {['generator', 'video_script', 'studio'].map(k => (
                    <SidebarItem key={k} id={k} conf={MODULES[k]} active={activeModule === k} onClick={() => { setActiveModule(k as any); setMobileMenuOpen(false); }} userPlan={userPlan} />
                ))}

                {sidebarOpen && <CategoryLabel label="Marketing" />}
                {['email_marketing', 'influencer_dm', 'blog_post'].map(k => (
                    <SidebarItem key={k} id={k} conf={MODULES[k]} active={activeModule === k} onClick={() => { setActiveModule(k as any); setMobileMenuOpen(false); }} userPlan={userPlan} />
                ))}

                {sidebarOpen && <CategoryLabel label="Estratégia" />}
                {['product_desc', 'persona', 'roas_analyzer', 'headline_optimizer'].map(k => (
                    <SidebarItem key={k} id={k} conf={MODULES[k]} active={activeModule === k} onClick={() => { setActiveModule(k as any); setMobileMenuOpen(false); }} userPlan={userPlan} />
                ))}

                 {sidebarOpen && <CategoryLabel label="Sistema" />}
                 {['policy_gen', 'history'].map(k => (
                    <SidebarItem key={k} id={k} conf={MODULES[k]} active={activeModule === k} onClick={() => { setActiveModule(k as any); setMobileMenuOpen(false); }} userPlan={userPlan} />
                ))}

            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-slate-800 bg-[#0B0518]">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex w-full items-center justify-center p-2 hover:bg-white/5 rounded-lg text-slate-500 mb-2 transition-colors">
                    <Menu className="w-5 h-5" />
                </button>
                <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition-colors ${!sidebarOpen && 'justify-center'}`}>
                    <LogOut className="w-4 h-4" />
                    {(sidebarOpen) && "Sair da Conta"}
                </button>
            </div>
        </aside>
      </>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 pt-16 lg:pt-0">
          
          {activeModule === 'home' ? (
              // === DASHBOARD HOME ===
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#0B0518]">
                   <div className="max-w-7xl mx-auto pb-20">
                        <div className="mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{formattedName}</span>
                            </h1>
                            <p className="text-slate-400">Seu centro de comando de vendas está pronto.</p>
                        </div>

                        {/* Grid de Ferramentas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Object.entries(MODULES)
                                .filter(([k, v]) => k !== 'home' && k !== 'settings' && k !== 'history')
                                .map(([key, mod]) => (
                                <button 
                                    key={key}
                                    onClick={() => setActiveModule(key as ModuleId)}
                                    className="group relative bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-purple-500/30 p-5 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform">
                                            <mod.icon className={`w-6 h-6 ${mod.color}`} />
                                        </div>
                                        {mod.isPremium && userPlan === 'free' && <Lock className="w-4 h-4 text-slate-600" />}
                                    </div>
                                    <h3 className="font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{mod.label}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{mod.desc}</p>
                                </button>
                            ))}
                        </div>
                   </div>
              </div>

          ) : activeModule === 'history' ? (
             // === HISTÓRICO REFORMULADO ===
             <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0B0518]">
                <div className="h-20 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md shrink-0 z-20">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg border border-slate-800"><History className="w-5 h-5 text-purple-400"/></div>
                        Minha Biblioteca
                    </h2>
                    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button onClick={() => setHistoryType('text')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${historyType === 'text' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white'}`}>Textos</button>
                        <button onClick={() => setHistoryType('image')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${historyType === 'image' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-white'}`}>Imagens</button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-grid-white/[0.02]">
                    {isLoadingHistory ? (
                         <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>
                    ) : historyItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-20 opacity-50">
                            <History className="w-16 h-16 text-slate-600 mb-4" />
                            <p className="text-slate-400">Nenhum item salvo no histórico ainda.</p>
                        </div>
                    ) : (
                        <div className={`grid gap-6 ${historyType === 'image' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                            {historyItems.map(item => {
                                const ModuleIcon = MODULES[item.module]?.icon || Zap;
                                return (
                                    <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group flex flex-col h-full shadow-lg">
                                        
                                        {/* HEADER DO CARD */}
                                        <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between shrink-0">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                                                    <ModuleIcon className="w-3.5 h-3.5 text-purple-400" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider truncate max-w-[120px]">
                                                    {MODULES[item.module]?.label || item.module}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                                </div>
                                                <button 
                                                    onClick={() => { if(confirm('Excluir este item?')) deleteHistoryItem(item.id).then(fetchHistory); }} 
                                                    className="p-1 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* CORPO DO CARD */}
                                        <div className="p-4 flex-1 flex flex-col min-h-0">
                                            {/* Prompt (Pergunta) */}
                                            <div className="mb-3">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <Search className="w-3 h-3 text-slate-500" />
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Entrada</span>
                                                </div>
                                                <p className="text-xs text-slate-400 italic line-clamp-2 bg-slate-950/50 p-2 rounded border border-slate-800/50">
                                                    "{item.prompt}"
                                                </p>
                                            </div>

                                            {/* Resultado (Conteúdo) */}
                                            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[300px] min-h-[150px]">
                                                {historyType === 'image' ? (
                                                    <div className="relative group/img cursor-pointer aspect-square rounded-lg overflow-hidden border border-slate-800">
                                                        <img src={item.result?.url} className="w-full h-full object-cover transition-transform group-hover/img:scale-105" />
                                                        <a href={item.result?.url} target="_blank" className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                            <Download className="w-6 h-6 text-white" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <HistoryContentRenderer content={item.result} />
                                                )}
                                            </div>
                                        </div>

                                        {/* FOOTER DO CARD (AÇÕES) */}
                                        {historyType === 'text' && (
                                            <div className="p-3 border-t border-slate-800 bg-slate-950/30">
                                                <button 
                                                    onClick={() => {
                                                        const textToCopy = typeof item.result === 'object' ? JSON.stringify(item.result, null, 2) : item.result;
                                                        navigator.clipboard.writeText(textToCopy);
                                                        alert('Copiado!');
                                                    }}
                                                    className="w-full py-2 flex items-center justify-center gap-2 bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-xs font-bold rounded-lg transition-all border border-slate-700 hover:border-purple-500"
                                                >
                                                    <Copy className="w-3.5 h-3.5" /> Copiar Conteúdo
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
             </div>

          ) : activeModule === 'studio' ? (
              // === STUDIO (IMAGENS) ===
              <ImageTool userPlan={userPlan} onUpgrade={handleUpgradeClick} activeTheme={activeTheme} setActiveTheme={handleThemeChange} />
          
          ) : (
              // === FERRAMENTAS DE TEXTO (GERADOR) ===
              <div className="flex flex-col lg:flex-row h-full overflow-hidden relative">
                  
                  {/* --- INPUT PANEL --- */}
                  <div className="w-full lg:w-[380px] bg-slate-950 border-r border-slate-800 flex flex-col h-auto lg:h-full z-20 shadow-2xl overflow-y-auto custom-scrollbar">
                        <div className="p-6 sticky top-0 bg-slate-950 z-10 border-b border-slate-800/50 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <button onClick={() => setActiveModule('home')} className="lg:hidden flex items-center gap-1 text-xs text-slate-500"><ChevronRight className="rotate-180 w-3 h-3"/> Voltar</button>
                                <button onClick={handleClearForm} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors ml-auto" title="Limpar Campos e Começar Novo">
                                    <Eraser className="w-3 h-3" /> Limpar
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800`}>
                                    {React.createElement(MODULES[activeModule].icon, { className: `w-5 h-5 ${MODULES[activeModule].color}` })}
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg leading-tight">{MODULES[activeModule].label}</h2>
                                    <p className="text-[10px] text-slate-500 line-clamp-1">{MODULES[activeModule].desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 flex-1 relative">
                            {isModuleLocked && (
                                <div className="absolute inset-0 z-50 backdrop-blur-[4px] bg-slate-950/60 flex flex-col items-center justify-center p-6 text-center animate-in fade-in rounded-xl">
                                    <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/10 shadow-2xl">
                                        <Lock className="w-8 h-8 text-yellow-500 mb-3 mx-auto" />
                                        <h3 className="text-base font-bold text-white mb-1">Recurso Premium</h3>
                                        <p className="text-xs text-slate-400 mb-4">Atualize para o plano PRO para desbloquear.</p>
                                        <button onClick={handleUpgradeClick} className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xs font-bold text-white shadow-lg">Liberar Acesso</button>
                                    </div>
                                </div>
                            )}

                            {/* --- FORMULÁRIO ESPECÍFICO DO GERADOR DE ANÚNCIOS --- */}
                            {activeModule === 'generator' ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Tag className="w-3 h-3"/> Nome do Produto</label>
                                        <input 
                                            type="text"
                                            value={adFormData.productName}
                                            onChange={(e) => setAdFormData({...adFormData, productName: e.target.value})}
                                            placeholder="Ex: Fone Bluetooth Pro..."
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><DollarSign className="w-3 h-3"/> Preço (Opcional)</label>
                                        <input 
                                            type="text"
                                            value={adFormData.price}
                                            onChange={(e) => setAdFormData({...adFormData, price: e.target.value})}
                                            placeholder="Ex: 97,90"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 justify-between">
                                            <span className="flex items-center gap-1.5"><ImageIcon className="w-3 h-3"/> Foto do Produto (Para Simulação)</span>
                                            {adFormData.image && <span className="text-[9px] text-green-400 bg-green-900/20 px-1.5 rounded">Imagem OK</span>}
                                        </label>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-20 border border-dashed border-slate-700 hover:border-purple-500/50 hover:bg-slate-900/50 rounded-lg flex items-center justify-center cursor-pointer transition-all gap-2"
                                        >
                                            <Upload className="w-4 h-4 text-slate-500" />
                                            <span className="text-xs text-slate-500">Clique para enviar foto</span>
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Text className="w-3 h-3"/> Detalhes / Benefícios</label>
                                        <textarea 
                                            value={adFormData.details}
                                            onChange={(e) => setAdFormData({...adFormData, details: e.target.value})}
                                            placeholder="Descreva o produto, benefícios, dores que resolve..."
                                            className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none resize-none transition-colors"
                                        />
                                    </div>
                                    
                                    <CustomSelect label="Plataforma" value={platform} onChange={setPlatform} options={['Facebook', 'Instagram', 'Shopee', 'Mercado Livre', 'TikTok']} />
                                </div>
                            ) : (
                                /* --- FORMULÁRIO GENÉRICO PARA OUTROS MÓDULOS --- */
                                <>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Entrada de Dados</label>
                                        <textarea 
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={MODULES[activeModule].placeholder || "Descreva o que você precisa..."}
                                            disabled={isModuleLocked}
                                            className="w-full h-40 bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none resize-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                    
                                    {activeModule === 'video_script' && (
                                        <CustomSelect label="Duração" value={videoDuration} onChange={setVideoDuration} options={['15s', '30s', '60s']} />
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-6 bg-slate-900/30 border-t border-slate-800 mt-auto">
                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || isModuleLocked}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <Loader2 className="animate-spin w-5 h-5"/> : <Wand2 className="w-5 h-5"/>}
                                {isGenerating ? 'Trabalhando...' : 'Gerar Resultado'}
                            </button>
                        </div>
                  </div>

                  {/* --- RESULT PANEL --- */}
                  <div id="result-area" className={`flex-1 relative overflow-hidden flex flex-col min-h-[60vh] transition-all duration-700 ${activeTheme.class}`}>
                        <div className="absolute top-4 right-4 z-50">
                            <ThemeSelector activeTheme={activeTheme} setActiveTheme={handleThemeChange} />
                        </div>

                        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar relative z-10 flex flex-col items-center">
                             {!result && !isGenerating && (
                                 <div className="my-auto text-center opacity-30 flex flex-col items-center animate-in zoom-in-95 duration-700">
                                     <LayoutTemplate className="w-16 h-16 text-white mb-4" />
                                     <p className="text-white font-medium">Preencha os dados e gere sua copy.</p>
                                 </div>
                             )}

                             {isGenerating && (
                                 <div className="my-auto text-center">
                                     <div className="w-16 h-16 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin mb-4 mx-auto"></div>
                                     <p className="text-purple-300 text-sm font-bold animate-pulse">IA Escrevendo...</p>
                                 </div>
                             )}

                             {result && !isGenerating && (
                                 <div className="w-full max-w-3xl pb-20">
                                     <div className="flex justify-between items-center mb-6">
                                         <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                             <Sparkles className="w-4 h-4 text-purple-500" /> Resultado Gerado
                                         </h3>
                                         <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                                             <Copy className="w-3 h-3" /> Copiar JSON
                                         </button>
                                     </div>
                                     
                                     {/* SE FOR GENERATOR, USA A PREVIEW COM A IMAGEM DO USUÁRIO SE TIVER */}
                                     {activeModule === 'generator' ? (
                                         platform === 'Instagram' ? (
                                            <InstagramPreview data={result} userImage={adFormData.image} />
                                         ) : (
                                            <FacebookPreview data={result} userImage={adFormData.image} />
                                         )
                                     ) : (
                                         renderGenericResult(result)
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