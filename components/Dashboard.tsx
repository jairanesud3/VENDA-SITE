import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, AlertTriangle, Video, Mail, 
  Search, Users, Calculator, Target, Megaphone, TrendingUp, 
  ShieldAlert, Menu, X, PlayCircle, MessageSquare, UserCircle,
  BarChart3, Check, MousePointerClick, Globe, Camera, Save,
  CreditCard, Bell, Lock, ChevronRight, HelpCircle, Scan,
  RefreshCw, StopCircle
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
  placeholder: string;
  promptTemplate: (input: string, hasImage?: boolean) => string;
  isTool?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('generator');
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<number>(12);
  
  // States da Câmera
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States de Configuração (Para parecer App e não Chat)
  const [selectedTone, setSelectedTone] = useState('Agressivo');
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram/Facebook');

  // --- CONFIGURAÇÃO DOS MÓDULOS (NOMES SIMPLIFICADOS) ---
  const modules: Record<string, ModuleConfig> = {
    // === CRIAÇÃO ===
    generator: {
      id: 'generator',
      label: 'Criar Anúncio Completo', // Antes: Campanha 360
      icon: Megaphone,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      description: 'Cria o texto, a headline e a ideia da imagem para seu anúncio vender muito.',
      placeholder: 'Digite o nome do produto ou use a câmera...',
      isTool: true,
      promptTemplate: (input, hasImage) => `
        CONTEXTO: Você é o maior copywriter de resposta direta do mundo.
        TAREFA: Crie uma campanha de marketing ${selectedTone} para a plataforma ${selectedPlatform}.
        PRODUTO: "${input}" ${hasImage ? "(Analise a imagem fornecida do produto)" : ""}.
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "headlines": ["Headline Impactante 1", "Headline Curta 2", "Headline Curta 3"],
          "adCopy": "Texto persuasivo completo usando framework AIDA. Use quebras de linha \\n.",
          "creativeIdeas": ["Descrição visual detalhada para imagem 1", "Descrição visual 2"]
        }`
    },
    studio: {
      id: 'studio',
      label: 'Ideias de Fotos', // Antes: Studio AI
      icon: Camera,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      description: 'Transforme fotos caseiras em fotos profissionais (Gera Prompts).',
      placeholder: 'Descreva como você quer a foto...',
      isTool: true,
      promptTemplate: (input, hasImage) => `
        CONTEXTO: Diretor de Arte Sênior.
        TAREFA: Crie 3 conceitos visuais profissionais para o produto: "${input}".
        ${hasImage ? "Baseie-se na imagem do produto fornecida." : ""}
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "concepts": [
            {
              "style": "Nome do Estilo (ex: Luxo, Minimalista)",
              "midjourneyPrompt": "/imagine prompt: [descrição técnica em inglês --v 6.0]",
              "explanation": "Por que esse visual vende."
            },
            { "style": "...", "midjourneyPrompt": "...", "explanation": "..." },
            { "style": "...", "midjourneyPrompt": "...", "explanation": "..." }
          ]
        }`
    },
    video_script: {
      id: 'video_script',
      label: 'Roteiro de Vídeo Viral', // Antes: Roteiro TikTok
      icon: Video,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      description: 'O que falar e mostrar em vídeos de 15 a 60 segundos.',
      placeholder: 'Sobre o que é o vídeo?',
      isTool: true,
      promptTemplate: (input, hasImage) => `
        CONTEXTO: Roteirista viral do TikTok/Reels.
        TAREFA: Roteiro de alta retenção para "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "title": "Gancho Principal",
          "scenes": [
            { "time": "0-3s", "visual": "Gancho Visual", "audio": "Fale isso..." },
            { "time": "3-15s", "visual": "Mostrando problema", "audio": "..." },
            { "time": "15-45s", "visual": "Solução/Produto", "audio": "..." },
            { "time": "45-60s", "visual": "Chamada para Ação", "audio": "..." }
          ]
        }`
    },
    product_desc: {
      id: 'product_desc',
      label: 'Descrição para Loja', // Antes: SEO E-commerce
      icon: Search,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      description: 'Texto pronto para colocar na página do produto (Shopify/Nuvemshop).',
      placeholder: 'Nome do produto...',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Especialista em E-commerce.
        TAREFA: Descrição de produto otimizada para "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "seoTitle": "Título do Produto",
          "metaDescription": "Resumo curto",
          "features": ["Benefício 1", "Benefício 2", "Benefício 3"],
          "descriptionBody": "Descrição completa e envolvente. Use tags HTML simples como <p>, <b>, <br>."
        }`
    },

    // === ESTRATÉGIA ===
    persona: {
      id: 'persona',
      label: 'Descobrir Público Alvo', // Antes: Raio-X da Persona
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'Descubra quem compra seu produto e do que eles gostam.',
      placeholder: 'O que você vende?',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Analista de Mercado.
        TAREFA: Quem compra "${input}"?
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "name": "Perfil do Comprador",
          "age": "Idade",
          "occupation": "Trabalho",
          "painPoints": ["Dor 1", "Dor 2", "Dor 3"],
          "desires": ["Desejo 1", "Desejo 2"],
          "behaviors": ["Comportamento", "Redes sociais"]
        }`
    },
    objections: {
      id: 'objections',
      label: 'Respostas para Vendas', // Antes: Matador de Objeções
      icon: ShieldAlert,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      description: 'O que responder quando o cliente diz "tá caro" ou "vou ver".',
      placeholder: 'Qual a dúvida do cliente?',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Vendedor experiente.
        TAREFA: Como responder objeções sobre "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "objections": [
            { "clientAsks": "Ex: Tá caro", "sellerAnswers": "Resposta persuasiva" },
            { "clientAsks": "...", "sellerAnswers": "..." }
          ]
        }`
    },
    email_seq: {
      id: 'email_seq',
      label: 'E-mails que Vendem', // Antes: Funil de E-mail
      icon: Mail,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      description: 'Recupere clientes que abandonaram o carrinho.',
      placeholder: 'Produto...',
      isTool: true,
      promptTemplate: (input) => `
        TAREFA: 3 e-mails de recuperação para "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "emails": [
            { "subject": "Assunto", "body": "Corpo do email" },
            { "subject": "...", "body": "..." },
            { "subject": "...", "body": "..." }
          ]
        }`
    },
    roas_analyzer: {
      id: 'roas_analyzer',
      label: 'Analisar Lucro', // Antes: Analista de ROAS
      icon: Calculator,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      description: 'Cole seus números e veja se está perdendo dinheiro.',
      placeholder: 'Ex: Gastei 100, vendi 200...',
      isTool: true,
      promptTemplate: (input) => `
        TAREFA: Analise estes dados de campanha: "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "status": "RUIM" | "MÉDIO" | "BOM" | "EXCELENTE",
          "summary": "Resumo",
          "actions": ["Ação 1", "Ação 2", "Ação 3"]
        }`
    },

    // === SISTEMA ===
    my_products: {
      id: 'my_products',
      label: 'Meus Produtos Salvos',
      icon: Package,
      color: 'text-slate-400',
      bgColor: 'bg-slate-800',
      borderColor: 'border-slate-800',
      description: '',
      placeholder: '',
      isTool: false,
      promptTemplate: () => ''
    },
    settings: {
      id: 'settings',
      label: 'Minha Conta',
      icon: Settings,
      color: 'text-slate-400',
      bgColor: 'bg-slate-800',
      borderColor: 'border-slate-800',
      description: '',
      placeholder: '',
      isTool: false,
      promptTemplate: () => ''
    },
    competitor: { id: 'competitor', label: '', icon: Target, color: '', bgColor: '', borderColor: '', description: '', placeholder: '', isTool: false, promptTemplate: () => '' }, 
    upsell: { id: 'upsell', label: '', icon: TrendingUp, color: '', bgColor: '', borderColor: '', description: '', placeholder: '', isTool: false, promptTemplate: () => '' }
  };

  // --- LÓGICA DA CÂMERA ---
  const startCamera = async () => {
    setShowCamera(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
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
        
        const imageBase64 = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageBase64);
        
        // Parar stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      }
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  // --- GERAÇÃO IA (AGORA COM VISÃO) ---
  const handleGenerate = async () => {
    if (!inputValue.trim() && !capturedImage) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    const config = modules[activeModule];

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("Chave de API não configurada.");

      const ai = new GoogleGenAI({ apiKey: apiKey });
      const prompt = config.promptTemplate(inputValue, !!capturedImage);
      
      let contents: any = prompt;

      // Se tiver imagem, formata para multimodal
      if (capturedImage) {
        // Remove header data url para enviar raw base64 se necessário, 
        // mas a SDK do Google costuma aceitar inlineData estruturado
        const base64Data = capturedImage.split(',')[1];
        contents = {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
            ]
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', 
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7, 
          systemInstruction: "Você é uma IA de Marketing de Elite. Retorne APENAS JSON."
        }
      });

      const text = response.text;
      
      if (text) {
        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        setResult(JSON.parse(cleanJson));
      } else {
        throw new Error("Resposta vazia da IA");
      }
    } catch (err: any) {
      console.error(err);
      setError(`Erro na IA: ${err.message || "Erro desconhecido."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // --- RENDERIZADORES DE UI (SIMPLIFICADOS) ---
  const RenderStudio = ({ data }: { data: any }) => (
    <div className="space-y-6 animate-fade-in">
      {data.concepts?.map((concept: any, idx: number) => (
        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-white font-bold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-pink-500" /> Opção {idx + 1}: {concept.style}
            </span>
            <button onClick={() => copyToClipboard(concept.midjourneyPrompt)} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
              Copiar Prompt
            </button>
          </div>
          <div className="p-4 space-y-3">
             <div className="bg-black/30 p-3 rounded-lg border border-slate-800/50 text-slate-300 font-mono text-xs">
               {concept.midjourneyPrompt}
             </div>
             <p className="text-slate-400 text-sm italic border-l-2 border-pink-500/30 pl-3">{concept.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const RenderCampaign = ({ data }: { data: any }) => (
    <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-purple-400 font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            <Megaphone size={16}/> Headlines (Títulos)
          </h3>
          <div className="space-y-2">
            {data.headlines?.map((h: string, i: number) => (
              <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm font-medium hover:border-purple-500 cursor-pointer transition-colors" onClick={() => copyToClipboard(h)}>
                {h}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-pink-400 font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
            <ImageIcon size={16}/> Ideia Visual (Para o Editor)
          </h3>
          <div className="space-y-2">
            {data.creativeIdeas?.map((item: string, i: number) => (
              <div key={i} className="p-3 bg-pink-900/10 border border-pink-500/20 rounded-lg text-pink-100 text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-full">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><MessageSquare size={16}/> Texto do Anúncio</h3>
           <button onClick={() => copyToClipboard(data.adCopy)} className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors">Copiar</button>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans max-h-[500px] overflow-y-auto custom-scrollbar">
          {data.adCopy}
        </div>
      </div>
    </div>
  );

  // ... (Outros renderizadores mantidos simples)
  const RenderGeneric = () => (
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-slate-300">
        <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
      </div>
  );

  const renderResult = () => {
      switch (activeModule) {
          case 'generator': return <RenderCampaign data={result} />;
          case 'studio': return <RenderStudio data={result} />;
          default: return <RenderGeneric />;
      }
  };

  const currentModule = modules[activeModule];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR ENTERPRISE */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#020617] border-r border-slate-900 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-20 flex items-center px-6 border-b border-slate-900/50">
           <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg mr-3 shadow-lg shadow-purple-900/20">
              <Zap className="w-5 h-5 text-white" />
           </div>
           <div>
             <span className="text-lg font-bold text-white tracking-tight block leading-none">DROPHACKER</span>
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="px-3 py-3 mt-2 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Criação</div>
          {['generator', 'studio', 'video_script', 'product_desc'].map(id => {
            const m = modules[id];
            return (
              <button key={id} onClick={() => { setActiveModule(id as ModuleId); setResult(null); setInputValue(''); setCapturedImage(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all border border-transparent ${
                  activeModule === id ? 'bg-slate-900 text-white shadow-md border-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}>
                <m.icon className={`w-4 h-4 ${activeModule === id ? m.color : 'text-slate-600'}`} />
                {m.label}
              </button>
            )
          })}
          
          <div className="px-3 py-3 mt-6 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Estratégia</div>
          {['persona', 'objections', 'email_seq', 'roas_analyzer'].map(id => {
            const m = modules[id];
            return (
              <button key={id} onClick={() => { setActiveModule(id as ModuleId); setResult(null); setInputValue(''); setCapturedImage(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all border border-transparent ${
                  activeModule === id ? 'bg-slate-900 text-white shadow-md border-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}>
                <m.icon className={`w-4 h-4 ${activeModule === id ? m.color : 'text-slate-600'}`} />
                {m.label}
              </button>
            )
          })}
          
          <div className="my-6 border-t border-slate-900 mx-2"></div>
          
           <button onClick={() => setActiveModule('my_products')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${activeModule === 'my_products' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
             <Package className="w-4 h-4" /> Meus Produtos Salvos <span className="ml-auto text-[10px] bg-slate-800 py-0.5 px-2 rounded-full">{savedItems}</span>
           </button>
           <button onClick={() => setActiveModule('settings')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${activeModule === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>
             <Settings className="w-4 h-4" /> Minha Conta
           </button>
        </nav>

        <div className="p-4 border-t border-slate-900 bg-[#020617]">
           <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-950/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
             <LogOut className="w-4 h-4" /> Sair
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto h-screen w-full bg-slate-950 relative custom-scrollbar">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-950/80 backdrop-blur border-b border-slate-900 flex items-center justify-between px-4 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-400"><Menu/></button>
          <span className="font-bold text-white text-sm">DROPHACKER</span>
          <div className="w-6"/>
        </div>

        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
          
          {/* Header Módulo */}
          {currentModule.isTool && (
            <div className="mb-6 animate-fade-in">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2">
                  <span className={`p-2 rounded-lg ${currentModule.bgColor} border ${currentModule.borderColor}`}>
                    <currentModule.icon className={`w-6 h-6 ${currentModule.color}`} />
                  </span>
                  {currentModule.label}
                </h1>
                <p className="text-slate-400 text-sm md:text-base ml-1">{currentModule.description}</p>
            </div>
          )}

          {/* ÁREA DE COMANDO (PAINEL DE CONTROLE) */}
          {currentModule.isTool && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl mb-8 animate-fade-in relative overflow-hidden group">
              {/* Efeito de Scan se tiver imagem capturada */}
              {capturedImage && !isGenerating && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-[shimmer_2s_infinite] z-20 pointer-events-none"></div>
              )}

              {/* BARRA DE FERRAMENTAS DO INPUT */}
              <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-800 pb-4">
                 <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-3 py-1.5 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Tom de Voz</span>
                    <select 
                      value={selectedTone} 
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Agressivo">Agressivo (Venda Direta)</option>
                      <option value="Amigável">Amigável (Influencer)</option>
                      <option value="Profissional">Profissional (Institucional)</option>
                      <option value="Curioso">Curiosidade (Viral)</option>
                    </select>
                 </div>
                 
                 <div className="flex items-center gap-2 bg-slate-950 rounded-lg px-3 py-1.5 border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Plataforma</span>
                    <select 
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Facebook/Instagram">Facebook / Instagram Ads</option>
                      <option value="TikTok">TikTok Ads</option>
                      <option value="Google">Google Ads</option>
                      <option value="Email">E-mail</option>
                    </select>
                 </div>
              </div>

              {/* ÁREA PRINCIPAL DE INPUT */}
              <div className="flex flex-col md:flex-row gap-4">
                 {/* Input de Texto */}
                 <div className="flex-1">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={currentModule.placeholder}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors h-32 resize-none"
                    />
                 </div>

                 {/* Botão de Câmera / Preview */}
                 <div className="md:w-48 shrink-0 flex flex-col gap-2">
                    {!showCamera && !capturedImage && (
                      <button 
                        onClick={startCamera}
                        className="flex-1 border-2 border-dashed border-slate-700 hover:border-purple-500 hover:bg-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-purple-400 transition-all min-h-[100px]"
                      >
                         <Camera size={24} />
                         <span className="text-xs font-bold">Usar Câmera</span>
                      </button>
                    )}

                    {showCamera && (
                      <div className="relative rounded-xl overflow-hidden bg-black aspect-video md:aspect-auto md:h-32 border border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                         <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                           <button onClick={captureImage} className="w-10 h-10 bg-white rounded-full border-4 border-slate-300 shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                             <div className="w-8 h-8 bg-white rounded-full border-2 border-black"></div>
                           </button>
                           <button onClick={closeCamera} className="p-2 bg-red-600 rounded-full text-white shadow-lg"><X size={16}/></button>
                         </div>
                         <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-green-400 font-bold uppercase animate-pulse">
                           <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Live
                         </div>
                      </div>
                    )}

                    {capturedImage && !showCamera && (
                      <div className="relative rounded-xl overflow-hidden border border-purple-500 group h-32">
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <button onClick={() => setCapturedImage(null)} className="p-2 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors"><X size={14}/></button>
                        </div>
                        <div className="absolute bottom-0 w-full bg-purple-600/90 text-white text-[10px] font-bold text-center py-1">Imagem Analisada</div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Rodapé do Input */}
              <div className="mt-4 flex justify-between items-center border-t border-slate-800 pt-4">
                 <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                    <Sparkles size={12} className="text-purple-500" /> IA Pronta
                 </div>
                 <div className="flex gap-2 w-full md:w-auto">
                    {(inputValue || capturedImage) && (
                      <button onClick={() => {setInputValue(''); setCapturedImage(null)}} className="px-4 py-2 text-slate-400 text-sm hover:text-white transition-colors">Limpar</button>
                    )}
                    <button 
                      onClick={handleGenerate}
                      disabled={(!inputValue && !capturedImage) || isGenerating}
                      className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                        (!inputValue && !capturedImage) || isGenerating 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40 hover:-translate-y-1'
                      }`}
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4 fill-white"/>}
                      {isGenerating ? 'Criando...' : 'GERAR AGORA'}
                    </button>
                 </div>
              </div>
              
              {/* Canvas Oculto para captura */}
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          )}

          {/* RENDERIZAR CONTEÚDO */}
          <div className="min-h-[400px]">
             {isGenerating && (
                <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
                  <div className="relative w-20 h-20">
                     <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                     <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                     <Sparkles className="absolute inset-0 m-auto text-purple-500 w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="mt-6 text-white font-bold text-lg animate-pulse">Consultando 1 Milhão de Anúncios...</h3>
                  <p className="text-slate-500 text-sm">Nossa IA está criando a melhor estratégia.</p>
                </div>
             )}

             {!isGenerating && !result && !error && currentModule.isTool && (
                <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 select-none">
                   <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                      <MousePointerClick className="text-slate-600 w-8 h-8" />
                   </div>
                   <p className="text-slate-500 text-sm">Preencha acima para começar.</p>
                </div>
             )}

             {!isGenerating && result && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {renderResult()}
               </div>
             )}

             {error && (
                <div className="bg-red-950/30 border border-red-500/30 p-6 rounded-xl text-center">
                   <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                   <p className="text-red-200">{error}</p>
                   <button onClick={handleGenerate} className="mt-4 text-sm font-bold text-red-400 hover:text-white underline">Tentar novamente</button>
                </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};