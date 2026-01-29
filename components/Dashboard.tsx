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
  Clock, HelpCircle, Briefcase, GraduationCap, Globe, Heart,
  Save, Smile
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

// --- 1. TEMAS GLOBAIS (NOVOS E CORRIGIDOS) ---
export const BACKGROUNDS = [
  { id: 'studio', name: 'Estúdio Dark', icon: Moon, class: 'bg-[#050505] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/20 via-[#050505] to-[#000000]' },
  { id: 'purple_haze', name: 'Roxo Profundo', icon: Zap, class: 'bg-[#0f0518] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0f0518] to-black' },
  { id: 'midnight_blue', name: 'Azul Meia-Noite', icon: Monitor, class: 'bg-[#020617] bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/30 via-[#020617] to-black' },
  { id: 'forest', name: 'Floresta Noturna', icon: Leaf, class: 'bg-[#021c0b] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#021c0b] to-black' },
  { id: 'sunset', name: 'Pôr do Sol', icon: Sun, class: 'bg-[#1c0808] bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-orange-900/40 via-[#1c0808] to-black' },
  { id: 'concrete', name: 'Urbano Cinza', icon: Box, class: 'bg-[#18181b] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-700/30 via-[#18181b] to-black' },
  { id: 'matrix', name: 'Matrix Code', icon: Grid3X3, class: 'bg-black bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]' },
  { id: 'royal', name: 'Ouro Real', icon: Gem, class: 'bg-[#120800] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-[#120800] to-black' },
  { id: 'clean_dark', name: 'Preto Puro', icon: Palette, class: 'bg-black' },
  { id: 'nebula', name: 'Nebulosa Rosa', icon: Sparkles, class: 'bg-[#150510] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-900/30 via-[#150510] to-black' },
  { id: 'ocean', name: 'Fundo do Mar', icon: Globe, class: 'bg-[#00101f] bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-cyan-900/30 via-[#00101f] to-black' },
  { id: 'crimson', name: 'Vermelho Sangue', icon: Heart, class: 'bg-[#1a0000] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-900/30 via-[#1a0000] to-black' },
  { id: 'cyber', name: 'Cyberpunk', icon: Aperture, class: 'bg-[#050510] bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]' },
  { id: 'coffee', name: 'Café Expresso', icon: Briefcase, class: 'bg-[#140a05] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#382010] via-[#140a05] to-black' },
  { id: 'slate', name: 'Ardósia', icon: LayoutTemplate, class: 'bg-slate-900' }
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
        title="Mudar Fundo da Tela"
      >
        <Palette className="w-4 h-4 md:w-5 md:h-5" />
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-[280px] bg-[#0f0f11] border border-slate-700 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Escolha o Visual
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><X className="w-3 h-3" /></button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setActiveTheme(bg)} 
                className={`
                  relative group aspect-square rounded-lg flex flex-col items-center justify-center transition-all border
                  ${activeTheme.id === bg.id 
                    ? 'bg-purple-600 text-white border-purple-400' 
                    : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700 hover:text-white'}
                `}
                title={bg.name}
              >
                <bg.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// --- CONFIGURAÇÃO MÓDULOS (NOMES SIMPLES) ---
type ModuleId = 
  | 'home' | 'settings' | 'history'
  | 'generator' | 'video_script' | 'studio'
  | 'email_marketing' | 'influencer_dm' | 'blog_post' 
  | 'product_desc' | 'persona' | 'roas_analyzer' 
  | 'policy_gen' | 'headline_optimizer';

interface ModuleConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  desc: string;
  category: 'core' | 'marketing' | 'strategy' | 'legal' | 'system';
  explanation: string; // Explicação para leigos
  isPremium?: boolean;
}

const MODULES: Record<string, ModuleConfig> = {
  home: { label: 'Início', icon: Home, color: 'text-purple-400', desc: 'Resumo da conta', category: 'system', explanation: 'Sua tela principal.' },
  
  // CRIAÇÃO (CORE)
  generator: { 
      label: 'Criador de Anúncios', 
      icon: Megaphone, 
      color: 'text-blue-400', 
      desc: 'Posts para Insta/Face/TikTok', 
      category: 'core',
      explanation: 'Cria o texto (legenda) e simula como seu anúncio vai ficar no Instagram ou Facebook. Ajuda a vender o produto.'
  },
  video_script: { 
      label: 'Roteiros de Vídeo', 
      icon: Video, 
      color: 'text-pink-400', 
      desc: 'Para TikTok, Reels e Shorts', 
      category: 'core', isPremium: true,
      explanation: 'Escreve o que você deve falar ou mostrar em vídeos curtos para viralizar no TikTok ou Instagram Reels.'
  },
  studio: { 
      label: 'Estúdio de Fotos IA', 
      icon: Camera, 
      color: 'text-orange-400', 
      desc: 'Fotos profissionais de produto', 
      category: 'core', isPremium: true,
      explanation: 'Transforma uma foto caseira do seu produto em uma foto profissional de estúdio usando Inteligência Artificial.'
  },
  
  // MARKETING 
  email_marketing: { 
      label: 'E-mails que Vendem', 
      icon: Mail, 
      color: 'text-yellow-400', 
      desc: 'Recuperação e Promoções', 
      category: 'marketing', isPremium: true,
      explanation: 'Escreve e-mails para enviar aos seus clientes, seja para recuperar uma venda perdida ou anunciar promoções.'
  },
  influencer_dm: { 
      label: 'Parceria com Influencers', 
      icon: UserPlus, 
      color: 'text-rose-400', 
      desc: 'Mensagens de abordagem', 
      category: 'marketing',
      explanation: 'Cria a mensagem perfeita para você mandar no direct de influenciadores e fechar parcerias de divulgação.'
  },
  blog_post: { 
      label: 'Artigos para Blog (SEO)', 
      icon: FileEdit, 
      color: 'text-green-400', 
      desc: 'Conteúdo para Google', 
      category: 'marketing', isPremium: true,
      explanation: 'Escreve textos completos para blogs que ajudam sua loja a aparecer nas pesquisas do Google (SEO).'
  },

  // ESTRATÉGIA
  product_desc: { 
      label: 'Descrição de Produto', 
      icon: Search, 
      color: 'text-cyan-400', 
      desc: 'Páginas que convencem', 
      category: 'strategy',
      explanation: 'Cria aquele texto bonito que fica na página do produto, explicando os benefícios e convencendo o cliente a comprar.'
  },
  persona: { 
      label: 'Descobrir Cliente Ideal', 
      icon: Users, 
      color: 'text-indigo-400', 
      desc: 'Quem é seu comprador?', 
      category: 'strategy', isPremium: true,
      explanation: 'Analisa seu produto e te diz exatamente quem é a pessoa que compraria ele (idade, interesses, comportamentos).'
  },
  roas_analyzer: { 
      label: 'Calculadora de Lucro', 
      icon: Calculator, 
      color: 'text-emerald-400', 
      desc: 'Vale a pena vender?', 
      category: 'strategy',
      explanation: 'Faz as contas para você: diz quanto você pode gastar em anúncios e qual deve ser o preço para ter lucro.'
  },
  headline_optimizer: { 
      label: 'Gerador de Títulos', 
      icon: Type, 
      color: 'text-red-400', 
      desc: 'Chamadas que clicam', 
      category: 'strategy',
      explanation: 'Cria 10 opções de títulos chamativos (headlines) para usar em anúncios ou na página do produto.'
  },

  // LEGAL & SISTEMA
  policy_gen: { 
      label: 'Termos e Políticas', 
      icon: Shield, 
      color: 'text-slate-400', 
      desc: 'Textos jurídicos da loja', 
      category: 'legal',
      explanation: 'Gera automaticamente os textos de "Política de Privacidade" e "Termos de Uso" obrigatórios para sua loja.'
  },
  history: { label: 'Minha Biblioteca', icon: History, color: 'text-slate-300', desc: 'Tudo que você criou', category: 'system', explanation: 'Seu histórico salvo.' },
  settings: { label: 'Configurações', icon: Settings, color: 'text-slate-300', desc: 'Ajustes da conta', category: 'system', explanation: 'Ajustes da sua conta.' },
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
  
  // DADOS DO USUÁRIO EDITÁVEIS
  const [displayName, setDisplayName] = useState(userEmail ? userEmail.split('@')[0] : 'Visitante');

  // --- NOVO: STATE DINÂMICO PARA FORMULÁRIOS MÚLTIPLOS ---
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, string>>({});
  // Campos especiais
  const [adImage, setAdImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Modals de Ajuda
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const init = async () => {
        // Tenta recuperar tema do localStorage
        const savedPrefs = localStorage.getItem('drophacker_themes');
        if (savedPrefs) {
             const prefs = JSON.parse(savedPrefs);
             setThemePrefs(prefs);
             // Aplica tema global se existir preferência para 'home'
             if(prefs['home']) {
                 const found = BACKGROUNDS.find(b => b.id === prefs['home']);
                 if(found) setActiveTheme(found);
             }
        }
        
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.plan === 'pro') setUserPlan('pro');
        
        // Recupera nome salvo se houver
        const savedName = localStorage.getItem('drophacker_username');
        if(savedName) setDisplayName(savedName);

        setIsLoadingPlan(false);
    };
    init();
  }, []);

  // Aplica tema quando muda de módulo (se tiver salvo)
  useEffect(() => {
    const savedThemeId = themePrefs[activeModule] || themePrefs['global'];
    if (savedThemeId) {
        const found = BACKGROUNDS.find(b => b.id === savedThemeId);
        if (found) setActiveTheme(found);
    }
    // Se não tiver salvo, mantém o atual
  }, [activeModule]);

  const handleThemeChange = (newTheme: typeof BACKGROUNDS[0]) => {
     setActiveTheme(newTheme);
     const newPrefs = { ...themePrefs, [activeModule]: newTheme.id, 'global': newTheme.id }; // Salva como global também
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

  // --- UPDATE: INPUT HANDLERS GENÉRICOS ---
  const handleInputChange = (field: string, value: string) => {
      setDynamicFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setAdImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleClearForm = () => {
      setResult(null);
      setError(null);
      setDynamicFormData({});
      setAdImage(null);
  };

  const handleGenerate = async () => {
    if(isModuleLocked) return;

    // Validação Simples
    const fields = Object.values(dynamicFormData);
    if (fields.length === 0 || fields.some(f => String(f).trim() === '')) {
         // Permite passar se for image tool, senão pede preenchimento
         if(activeModule !== 'studio' && activeModule !== 'settings' && activeModule !== 'history') {
             // Verificação relaxada, apenas checa se tem algo
         }
    }

    setIsGenerating(true);
    setResult(null);
    setError(null);

    // Auto scroll mobile
    if (window.innerWidth < 1024) {
        setTimeout(() => document.getElementById('result-area')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    try {
        let prompt = "";
        const data = dynamicFormData; // Atalho

        // --- CONSTRUÇÃO INTELIGENTE DO PROMPT ---
        switch (activeModule) {
            case 'generator':
                prompt = `Atue como Copywriter Brasileiro Especialista em ${data.platform || 'Facebook'}. Crie 1 anúncio para:
                Produto: ${data.productName}
                Preço: ${data.price || 'Não informado'}
                Público: ${data.audience || 'Geral'}
                Oferta: ${data.offer || 'Normal'}
                Retorne JSON: { "title": "...", "body": "...", "price": "${data.price || '99,90'}", "cta": "...", "tags": "..." }`;
                break;

            case 'video_script':
                prompt = `Roteiro viral de TikTok (${data.duration || '30s'}) para o produto "${data.productName}".
                Estilo: ${data.style || 'Engraçado'}.
                Foco: ${data.focus || 'Benefícios'}.
                Retorne JSON: { "hook_visual": "...", "hook_audio": "...", "scenes": [{"seconds": "...", "visual": "...", "audio": "..."}] }`;
                break;

            case 'email_marketing':
                prompt = `Sequência de Email Marketing para "${data.productName}".
                Objetivo: ${data.goal || 'Recuperar Carrinho'}.
                Desconto Oferecido: ${data.discount || 'Nenhum'}.
                Retorne JSON: { "email_1_subject": "...", "email_1_body": "...", "email_2_subject": "...", "email_2_body": "..." }`;
                break;

            case 'influencer_dm':
                prompt = `Script de abordagem para Influencer. Produto: "${data.productName}".
                Nicho: ${data.niche || 'Beleza'}.
                Proposta: ${data.proposal || 'Permuta'}.
                Retorne JSON: { "script_formal": "...", "script_casual": "...", "dicas_negociacao": "..." }`;
                break;

            case 'blog_post':
                prompt = `Artigo de Blog Otimizado (SEO) sobre: "${data.topic}".
                Palavra-chave foco: ${data.keyword}.
                Tom de voz: ${data.tone || 'Informativo'}.
                Retorne JSON: { "title": "...", "meta_description": "...", "intro": "...", "h2_topics": [{"subtitle": "...", "content": "..."}], "conclusion": "..." }`;
                break;
            
            case 'product_desc':
                prompt = `Descrição de Produto E-commerce para: "${data.productName}".
                Características: ${data.features}.
                Benefício Principal: ${data.benefit}.
                Retorne JSON: { "headline": "...", "emotional_description": "...", "bullets_features": ["..."], "technical_specs": "..." }`;
                break;

            case 'persona':
                prompt = `Defina o Cliente Ideal (Persona) para o produto: "${data.productName}".
                Categoria: ${data.category}.
                Preço Médio: ${data.price}.
                Retorne JSON: { "nome_ficticio": "...", "idade": "...", "profisssao": "...", "dores": ["..."], "desejos": ["..."], "comportamentos_compra": "..." }`;
                break;

            case 'roas_analyzer':
                prompt = `Análise de Lucro Dropshipping.
                Custo do Produto (Fornecedor): ${data.cost}.
                Preço de Venda: ${data.salePrice}.
                Custo Estimado por Venda (CPA): ${data.cpa || '25% do preço'}.
                Retorne JSON: { "lucro_bruto": "...", "margem_porcentagem": "...", "analise_viabilidade": "...", "sugestao_preco": "..." }`;
                break;

             case 'policy_gen':
                prompt = `Gere textos legais para loja: "${data.storeName}".
                Email de Suporte: ${data.supportEmail}.
                Prazo de Entrega: ${data.deliveryTime}.
                Retorne JSON: { "termos_servico_resumo": "...", "politica_privacidade_resumo": "...", "politica_reembolso_resumo": "..." }`;
                break;

            case 'headline_optimizer':
                 prompt = `Gere 10 Headlines (Títulos) Altamente Persuasivos para: "${data.productName}".
                 Promessa: ${data.promise}.
                 Retorne JSON: { "titulos_curiosidade": ["..."], "titulos_beneficio": ["..."], "titulos_urgencia": ["..."] }`;
                 break;

            default:
                prompt = `Ajude com: ${JSON.stringify(data)}`;
        }
        
        if (activeModule !== 'studio') {
            const text = await generateCopy(prompt, activeModule);
            const textStr = typeof text === 'string' ? text : String(text || '');
            try {
                const cleanText = textStr.replace(/```json/g, '').replace(/```/g, '').trim();
                setResult(JSON.parse(cleanText));
            } catch (e) {
                setResult({ "Resposta": textStr }); 
            }
        }

    } catch (err: any) {
        if (err.message.includes("Upgrade required")) {
            setError("🔒 ACESSO NEGADO: Recurso PRO.");
        } else {
            setError("Ops! Tente novamente. Verifique se preencheu tudo.");
        }
    } finally {
        setIsGenerating(false);
    }
  };

  // --- RENDERIZADOR DE CAMPOS DO FORMULÁRIO (Switch Case Gigante Organizado) ---
  const renderFormFields = () => {
    switch(activeModule) {
        case 'generator':
            return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">Nome do Produto</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none" placeholder="Ex: Corretor de Postura" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Preço (R$)</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none" placeholder="97,90" value={dynamicFormData.price || ''} onChange={e => handleInputChange('price', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Plataforma</label>
                             <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none" value={dynamicFormData.platform || 'Facebook'} onChange={e => handleInputChange('platform', e.target.value)}>
                                 <option value="Facebook">Facebook</option>
                                 <option value="Instagram">Instagram</option>
                                 <option value="TikTok">TikTok</option>
                                 <option value="Shopee">Shopee</option>
                             </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                            <span>Foto (Opcional)</span> {adImage && <span className="text-green-400 text-[9px]">OK</span>}
                        </label>
                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-16 border border-dashed border-slate-700 hover:border-purple-500 rounded-lg flex items-center justify-center cursor-pointer gap-2">
                             <Upload className="w-4 h-4 text-slate-500"/> <span className="text-xs text-slate-500">Enviar Foto</span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>
                </>
            );
        case 'video_script':
            return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Produto / Tema</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Escova Alisadora" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Duração</label>
                             <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" value={dynamicFormData.duration || '30s'} onChange={e => handleInputChange('duration', e.target.value)}>
                                 <option value="15s">15 Segundos</option>
                                 <option value="30s">30 Segundos</option>
                                 <option value="60s">1 Minuto</option>
                             </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Estilo</label>
                             <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" value={dynamicFormData.style || 'Engraçado'} onChange={e => handleInputChange('style', e.target.value)}>
                                 <option value="Engraçado">Divertido / Meme</option>
                                 <option value="Sério">Sério / Profissional</option>
                                 <option value="Urgente">Urgência / Promoção</option>
                                 <option value="Storytelling">História / Depoimento</option>
                             </select>
                        </div>
                    </div>
                </>
            );
        case 'email_marketing':
             return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Produto</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Smartwatch X8" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase">Objetivo do E-mail</label>
                         <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" value={dynamicFormData.goal || 'Recuperar Carrinho'} onChange={e => handleInputChange('goal', e.target.value)}>
                             <option value="Recuperar Carrinho">Recuperar Carrinho (Abandono)</option>
                             <option value="Boas Vindas">Boas Vindas (Novo Cliente)</option>
                             <option value="Promoção Relâmpago">Promoção Relâmpago</option>
                             <option value="Pedir Avaliação">Pedir Review (Pós-venda)</option>
                         </select>
                    </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Desconto (Opcional)</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: 10% OFF ou Frete Grátis" value={dynamicFormData.discount || ''} onChange={e => handleInputChange('discount', e.target.value)} />
                    </div>
                </>
             );
        case 'influencer_dm':
             return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Produto</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Kit de Maquiagem" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nicho do Influencer</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Moda, Gamer, Fitness..." value={dynamicFormData.niche || ''} onChange={e => handleInputChange('niche', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Proposta</label>
                         <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" value={dynamicFormData.proposal || 'Permuta'} onChange={e => handleInputChange('proposal', e.target.value)}>
                             <option value="Permuta">Permuta (Produto Grátis)</option>
                             <option value="Pagamento">Pagamento (Publi Paga)</option>
                             <option value="Comissão">Comissão por Venda (Afiliado)</option>
                         </select>
                    </div>
                </>
             );
        case 'blog_post':
             return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Assunto do Artigo</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Como escolher o melhor tênis de corrida" value={dynamicFormData.topic || ''} onChange={e => handleInputChange('topic', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Palavra-chave (Para Google)</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: tênis de corrida barato" value={dynamicFormData.keyword || ''} onChange={e => handleInputChange('keyword', e.target.value)} />
                    </div>
                </>
             );
        case 'product_desc':
             return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Produto</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Fone Bluetooth Pro" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Características Principais</label>
                        <textarea className="w-full h-20 bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none resize-none" placeholder="Ex: À prova d'água, bateria de 24h, cancelamento de ruído..." value={dynamicFormData.features || ''} onChange={e => handleInputChange('features', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Benefício Principal (A "promessa")</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Ouvir música sem interrupções em qualquer lugar" value={dynamicFormData.benefit || ''} onChange={e => handleInputChange('benefit', e.target.value)} />
                    </div>
                </>
             );
        case 'persona':
             return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Produto</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Cinta Modeladora" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Beleza e Estética" value={dynamicFormData.category || ''} onChange={e => handleInputChange('category', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Preço do Produto</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: R$ 129,90" value={dynamicFormData.price || ''} onChange={e => handleInputChange('price', e.target.value)} />
                    </div>
                </>
             );
        case 'roas_analyzer':
             return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Custo do Produto (Fornecedor)</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: R$ 30,00" value={dynamicFormData.cost || ''} onChange={e => handleInputChange('cost', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Preço de Venda (Site)</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: R$ 99,00" value={dynamicFormData.salePrice || ''} onChange={e => handleInputChange('salePrice', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Custo por Venda Estimado (Marketing)</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: R$ 25,00" value={dynamicFormData.cpa || ''} onChange={e => handleInputChange('cpa', e.target.value)} />
                    </div>
                </>
             );
        case 'policy_gen':
             return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nome da Loja</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Minha Loja Inc" value={dynamicFormData.storeName || ''} onChange={e => handleInputChange('storeName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail de Suporte</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: contato@minhaloja.com" value={dynamicFormData.supportEmail || ''} onChange={e => handleInputChange('supportEmail', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Prazo de Entrega Médio</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: 10 a 20 dias úteis" value={dynamicFormData.deliveryTime || ''} onChange={e => handleInputChange('deliveryTime', e.target.value)} />
                    </div>
                </>
             );
        case 'headline_optimizer':
             return (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Produto</label>
                        <input type="text" className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none" placeholder="Ex: Tênis Ortopédico" value={dynamicFormData.productName || ''} onChange={e => handleInputChange('productName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Qual a promessa?</label>
                        <textarea className="w-full h-24 bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white outline-none resize-none" placeholder="Ex: Acabar com dores nas costas em 3 dias" value={dynamicFormData.promise || ''} onChange={e => handleInputChange('promise', e.target.value)} />
                    </div>
                </>
             );
        default:
            return <div className="text-slate-500 text-xs">Selecione uma ferramenta.</div>;
    }
  }

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

            {/* User Plan Card */}
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
                 {['policy_gen', 'history', 'settings'].map(k => (
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
              <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTheme.class}`}>
                   <div className="absolute top-4 right-4 z-20">
                      <ThemeSelector activeTheme={activeTheme} setActiveTheme={handleThemeChange} />
                   </div>
                   <div className="max-w-7xl mx-auto pb-20 relative z-10">
                        <div className="mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{displayName}</span>
                            </h1>
                            <p className="text-slate-400">Tudo pronto para vender hoje?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Object.entries(MODULES)
                                .filter(([k, v]) => k !== 'home' && k !== 'settings' && k !== 'history')
                                .map(([key, mod]) => (
                                <button 
                                    key={key}
                                    onClick={() => setActiveModule(key as ModuleId)}
                                    className="group relative bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-purple-500/30 p-5 rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden backdrop-blur-sm"
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
             // === HISTÓRICO ===
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
                                                <button 
                                                    onClick={() => { if(confirm('Excluir este item?')) deleteHistoryItem(item.id).then(fetchHistory); }} 
                                                    className="p-1 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col min-h-0">
                                            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[300px] min-h-[150px]">
                                                {historyType === 'image' ? (
                                                    <div className="relative group/img cursor-pointer aspect-square rounded-lg overflow-hidden border border-slate-800">
                                                        <img src={item.result?.url} className="w-full h-full object-cover" />
                                                        <a href={item.result?.url} target="_blank" className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                            <Download className="w-6 h-6 text-white" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <HistoryContentRenderer content={item.result} />
                                                )}
                                            </div>
                                        </div>
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

          ) : activeModule === 'settings' ? (
              // === CONFIGURAÇÕES ===
              <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0B0518]">
                  <div className="h-20 border-b border-slate-800 flex items-center px-6 bg-slate-950/50 backdrop-blur-md">
                      <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg border border-slate-800"><Settings className="w-5 h-5 text-purple-400"/></div>
                        Configurações da Conta
                      </h2>
                  </div>
                  <div className="p-8 max-w-2xl">
                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
                          <h3 className="text-lg font-bold text-white mb-4">Perfil</h3>
                          <div className="space-y-4">
                              <div>
                                  <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Seu E-mail (Login)</label>
                                  <input type="text" value={userEmail || ''} disabled className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-400 text-sm cursor-not-allowed" />
                              </div>
                              <div>
                                  <label className="text-xs text-slate-500 uppercase font-bold block mb-2">Como você quer ser chamado?</label>
                                  <input 
                                    type="text" 
                                    value={displayName} 
                                    onChange={(e) => {
                                        setDisplayName(e.target.value);
                                        localStorage.setItem('drophacker_username', e.target.value);
                                    }}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm focus:border-purple-500 outline-none" 
                                  />
                              </div>
                          </div>
                      </div>

                       <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                          <h3 className="text-lg font-bold text-white mb-4">Preferências</h3>
                          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg mb-3">
                              <span className="text-sm text-slate-300">Limpar todo o histórico de temas salvos</span>
                              <button onClick={() => { localStorage.removeItem('drophacker_themes'); alert('Temas resetados!'); }} className="text-xs bg-red-900/20 text-red-400 px-3 py-1.5 rounded hover:bg-red-900/40">Limpar</button>
                          </div>
                      </div>
                  </div>
              </div>

          ) : activeModule === 'studio' ? (
              // === STUDIO (IMAGENS) ===
              <ImageTool userPlan={userPlan} onUpgrade={handleUpgradeClick} activeTheme={activeTheme} setActiveTheme={handleThemeChange} />
          
          ) : (
              // === GERADORES DE TEXTO (TODOS) ===
              <div className="flex flex-col lg:flex-row h-full overflow-hidden relative">
                  
                  {/* --- PAINEL DE ENTRADA (ESQUERDA) --- */}
                  <div className="w-full lg:w-[380px] bg-slate-950 border-r border-slate-800 flex flex-col h-auto lg:h-full z-20 shadow-2xl overflow-y-auto custom-scrollbar">
                        <div className="p-6 sticky top-0 bg-slate-950 z-10 border-b border-slate-800/50 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <button onClick={() => setActiveModule('home')} className="lg:hidden flex items-center gap-1 text-xs text-slate-500"><ChevronRight className="rotate-180 w-3 h-3"/> Voltar</button>
                                <button onClick={handleClearForm} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors ml-auto" title="Limpar Campos">
                                    <Eraser className="w-3 h-3" /> Limpar
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-3 relative">
                                <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800`}>
                                    {React.createElement(MODULES[activeModule].icon, { className: `w-5 h-5 ${MODULES[activeModule].color}` })}
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                                        {MODULES[activeModule].label}
                                        <button onClick={() => setShowHelp(!showHelp)} className="text-slate-600 hover:text-purple-400 transition-colors"><HelpCircle className="w-4 h-4" /></button>
                                    </h2>
                                    <p className="text-[10px] text-slate-500 line-clamp-1">{MODULES[activeModule].desc}</p>
                                </div>
                                {showHelp && (
                                    <div className="absolute top-12 left-0 w-full bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl z-50 text-xs text-slate-300 animate-in fade-in zoom-in-95">
                                        <p>{MODULES[activeModule].explanation}</p>
                                        <button onClick={() => setShowHelp(false)} className="mt-2 text-[10px] text-purple-400 underline">Entendi</button>
                                    </div>
                                )}
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

                            {/* --- FORMULÁRIOS DINÂMICOS --- */}
                            {renderFormFields()}
                            
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

                  {/* --- PAINEL DE RESULTADO (DIREITA) --- */}
                  <div id="result-area" className={`flex-1 relative overflow-hidden flex flex-col min-h-[60vh] transition-all duration-700 ${activeTheme.class}`}>
                        <div className="absolute top-4 right-4 z-50">
                            <ThemeSelector activeTheme={activeTheme} setActiveTheme={handleThemeChange} />
                        </div>

                        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar relative z-10 flex flex-col items-center">
                             {!result && !isGenerating && (
                                 <div className="my-auto text-center opacity-30 flex flex-col items-center animate-in zoom-in-95 duration-700">
                                     <LayoutTemplate className="w-16 h-16 text-white mb-4" />
                                     <p className="text-white font-medium">Preencha os dados ao lado e gere sua copy.</p>
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
                                     
                                     {activeModule === 'generator' ? (
                                         dynamicFormData.platform === 'Instagram' ? (
                                            <InstagramPreview data={result} userImage={adImage} />
                                         ) : (
                                            <FacebookPreview data={result} userImage={adImage} />
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