import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, AlertTriangle, Video, Mail, 
  Search, Users, Calculator, Target, Megaphone, TrendingUp, 
  ShieldAlert, Menu, X, PlayCircle, MessageSquare, UserCircle,
  BarChart3, Check, MousePointerClick, Globe, Camera, Save,
  CreditCard, Bell, Lock, ChevronRight, HelpCircle
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
  promptTemplate: (input: string) => string;
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

  // --- CONFIGURAÇÃO DOS MÓDULOS ---
  const modules: Record<string, ModuleConfig> = {
    // === CRIAÇÃO ===
    generator: {
      id: 'generator',
      label: 'Campanha 360º',
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      description: 'Gera headlines, copy AIDA e estrutura completa de anúncio.',
      placeholder: 'Ex: Corretor Postural, Tênis de Corrida, Fone Bluetooth...',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Você é o maior copywriter de resposta direta do mundo.
        TAREFA: Crie uma campanha de marketing agressiva e profissional para: "${input}".
        REGRAS: Seja criativo, não use clichês, foque em dor e desejo.
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "headlines": ["Headline Curta e Impactante 1", "Headline Curta 2", "Headline Curta 3"],
          "adCopy": "Texto persuasivo completo usando framework AIDA (Atenção, Interesse, Desejo, Ação). Use quebras de linha \\n para formatar.",
          "creativeIdeas": ["Descrição visual detalhada para imagem 1 (cenário, iluminação, ação)", "Descrição visual 2"]
        }`
    },
    studio: {
      id: 'studio',
      label: 'Studio AI (Visual)',
      icon: Camera,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      description: 'Direção de arte e prompts técnicos para Midjourney/DALL-E.',
      placeholder: 'Ex: Garrafa Térmica futurista, Tênis Urbano...',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Você é um Diretor de Arte Sênior especializado em Midjourney v6.
        TAREFA: Crie 3 conceitos visuais de alta conversão para: "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "concepts": [
            {
              "style": "Nome do Estilo (ex: Fotorealista, 3D Render, Lifestyle)",
              "midjourneyPrompt": "/imagine prompt: [descrição técnica em inglês com iluminação, lente, estilo, --ar 4:5 --v 6.0]",
              "explanation": "Explicação curta de por que esse visual converte."
            },
            { "style": "...", "midjourneyPrompt": "...", "explanation": "..." },
            { "style": "...", "midjourneyPrompt": "...", "explanation": "..." }
          ]
        }`
    },
    video_script: {
      id: 'video_script',
      label: 'Roteiro TikTok',
      icon: Video,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      description: 'Scripts de 60s focados em retenção e viralidade.',
      placeholder: 'Ex: Escova Alisadora, Kit de Maquiagem...',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Você é um roteirista viral do TikTok.
        TAREFA: Crie um roteiro de alta retenção para "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "title": "Título Gancho (Hook)",
          "scenes": [
            { "time": "0-3s", "visual": "O que aparece na tela (Hook Visual)", "audio": "O que é falado/narração" },
            { "time": "3-15s", "visual": "Demonstração do problema/dor", "audio": "Narração agitando o problema" },
            { "time": "15-45s", "visual": "Revelação da solução/produto em uso", "audio": "Benefícios e transformação" },
            { "time": "45-60s", "visual": "CTA Claro e Oferta", "audio": "Chamada para ação urgente" }
          ]
        }`
    },
    product_desc: {
      id: 'product_desc',
      label: 'SEO E-commerce',
      icon: Search,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      description: 'Descrições que ranqueiam no Google e convertem.',
      placeholder: 'Ex: Garrafa Térmica Inteligente...',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Especialista em SEO e Neuromarketing.
        TAREFA: Descrição de produto otimizada para "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "seoTitle": "Título SEO (Meta Title) - Máx 60 chars",
          "metaDescription": "Meta Description persuasiva - Máx 160 chars",
          "features": ["Benefício Chave 1", "Benefício Chave 2", "Benefício Chave 3"],
          "descriptionBody": "Descrição completa e envolvente do produto. Use tags HTML simples como <p>, <b>, <br> para formatar."
        }`
    },

    // === ESTRATÉGIA ===
    persona: {
      id: 'persona',
      label: 'Raio-X da Persona',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'Psicografia profunda do seu comprador ideal.',
      placeholder: 'Ex: Kit de Ferramentas, Cinta Modeladora...',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Psicólogo de consumo e Analista de Dados.
        TAREFA: Análise de Persona Buyer para "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "name": "Nome Fictício e Arquétipo",
          "age": "Faixa Etária",
          "occupation": "Ocupação provável",
          "painPoints": ["Dor latente 1", "Dor 2", "Dor 3"],
          "desires": ["Desejo secreto 1", "Desejo 2"],
          "behaviors": ["Comportamento de compra", "Redes sociais favoritas"]
        }`
    },
    objections: {
      id: 'objections',
      label: 'Matador de Objeções',
      icon: ShieldAlert,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      description: 'Scripts de resposta para WhatsApp e Direct.',
      placeholder: 'Ex: Smartwatch Ultra...',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Closer de Vendas de alta performance.
        TAREFA: Liste 4 objeções para "${input}" e como quebrar cada uma.
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "objections": [
            { "clientAsks": "Pergunta do cliente (ex: tá caro, frete demorado)", "sellerAnswers": "Script de resposta persuasiva para fechar a venda" },
            { "clientAsks": "...", "sellerAnswers": "..." }
          ]
        }`
    },
    email_seq: {
      id: 'email_seq',
      label: 'Funil de E-mail',
      icon: Mail,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      description: 'Recuperação de carrinho e pós-venda.',
      placeholder: 'Ex: Fone Bluetooth...',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Especialista em Email Marketing e CRM.
        TAREFA: 3 e-mails para recuperação de carrinho de "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "emails": [
            { "subject": "Assunto instigante (alto open rate)", "body": "Corpo do email 1" },
            { "subject": "Assunto 2", "body": "Corpo do email 2" },
            { "subject": "Assunto 3", "body": "Corpo do email 3" }
          ]
        }`
    },
    roas_analyzer: {
      id: 'roas_analyzer',
      label: 'Analista de ROAS',
      icon: Calculator,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      description: 'Auditoria de campanhas e métricas.',
      placeholder: 'Ex: Gastei 1000, Faturei 1500, CPC 2.50, CTR 1.2%...',
      isTool: true,
      promptTemplate: (input) => `
        CONTEXTO: Gestor de Tráfego Sênior com foco em escala.
        TAREFA: Analise friamente estes dados: "${input}".
        
        FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
        {
          "status": "RUIM" | "MÉDIO" | "BOM" | "EXCELENTE",
          "summary": "Análise direta e sem rodeios sobre o desempenho.",
          "actions": ["Ação prática 1 para melhorar", "Ação 2", "Ação 3"]
        }`
    },

    // === SISTEMA ===
    my_products: {
      id: 'my_products',
      label: 'Meus Produtos',
      icon: Package,
      color: 'text-slate-400',
      bgColor: 'bg-slate-800',
      borderColor: 'border-slate-800',
      description: 'Gerencie seu catálogo.',
      placeholder: '',
      isTool: false,
      promptTemplate: () => ''
    },
    settings: {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      color: 'text-slate-400',
      bgColor: 'bg-slate-800',
      borderColor: 'border-slate-800',
      description: 'Preferências da conta.',
      placeholder: '',
      isTool: false,
      promptTemplate: () => ''
    },
    competitor: { id: 'competitor', label: '', icon: Target, color: '', bgColor: '', borderColor: '', description: '', placeholder: '', isTool: false, promptTemplate: () => '' }, 
    upsell: { id: 'upsell', label: '', icon: TrendingUp, color: '', bgColor: '', borderColor: '', description: '', placeholder: '', isTool: false, promptTemplate: () => '' }
  };

  const handleGenerate = async () => {
    if (!inputValue.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    const config = modules[activeModule];

    try {
      const apiKey = process.env.API_KEY;
      
      const ai = new GoogleGenAI({ apiKey: apiKey || '' });
      const prompt = config.promptTemplate(inputValue);
      
      // GEMINI 2.0 FLASH LITE (SLASH LITE) CONFIG
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite-preview-02-05', 
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7, 
          topK: 40,
          // Instrução crítica: Proíbe Markdown para evitar erros de parse
          systemInstruction: "Você é uma IA de Marketing de Elite. Retorne APENAS o JSON solicitado. NÃO use blocos de código Markdown (```json). NÃO inclua texto introdutório. Responda diretamente com o objeto JSON."
        }
      });

      const text = response.text;
      
      if (text) {
        // PARSER INTELIGENTE: Remove Markdown E texto extra (comum no Flash Lite)
        // Procura pelo primeiro '{' e último '}' para garantir apenas o JSON válido
        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }
        
        try {
          const parsed = JSON.parse(cleanJson);
          setResult(parsed);
        } catch (e) {
          console.error("JSON Parse Error", e);
          console.log("Raw Text:", text);
          setResult({ rawText: text, isError: true });
        }
      } else {
        throw new Error("Resposta vazia da IA");
      }
    } catch (err: any) {
      console.error(err);
      // Mensagem de erro amigável para o usuário
      const errorMessage = err.message || "Erro desconhecido na conexão.";
      setError(`Erro na IA: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Idealmente um toast aqui
  };

  // --- RENDERIZADORES DE UI ---

  const RenderStudio = ({ data }: { data: any }) => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-6">
        {data.concepts?.map((concept: any, idx: number) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-pink-500/50 transition-all group shadow-lg">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <span className="text-pink-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4" /> Conceito {idx + 1}: <span className="text-white">{concept.style}</span>
              </span>
              <button onClick={() => copyToClipboard(concept.midjourneyPrompt)} className="text-slate-400 hover:text-white flex gap-2 text-xs items-center transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-pink-500/50">
                <Copy size={14} /> Copiar Prompt
              </button>
            </div>
            <div className="p-6 space-y-5">
               <div>
                 <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest flex items-center gap-1">
                   <Sparkles className="w-3 h-3"/> Midjourney / DALL-E Prompt
                 </p>
                 <div className="bg-[#0f111a] p-4 rounded-xl border border-slate-800/50 text-pink-200/90 font-mono text-xs leading-relaxed select-all hover:bg-slate-950 transition-colors">
                   {concept.midjourneyPrompt}
                 </div>
               </div>
               <div>
                 <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest">Por que converte?</p>
                 <p className="text-slate-400 text-sm leading-relaxed">{concept.explanation}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RenderCampaign = ({ data }: { data: any }) => (
    <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="space-y-6">
        {/* Headlines */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Megaphone size={16}/> Headlines Vencedoras
          </h3>
          <div className="space-y-3">
            {data.headlines?.map((h: string, i: number) => (
              <div key={i} className="group flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-purple-500 transition-colors cursor-pointer active:scale-[0.99]" onClick={() => copyToClipboard(h)}>
                <span className="text-white text-sm font-medium">{h}</span>
                <Copy className="w-3 h-3 text-slate-600 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Ideias Visuais */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-pink-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <ImageIcon size={16}/> Sugestões Visuais
          </h3>
          <div className="space-y-3">
            {data.creativeIdeas?.map((item: string, i: number) => (
              <div key={i} className="p-3 bg-pink-900/10 border border-pink-500/20 rounded-lg text-pink-100 text-xs leading-relaxed">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copy Body */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col h-full shadow-sm">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><MessageSquare size={16}/> Copy (AIDA)</h3>
           <button onClick={() => copyToClipboard(data.adCopy)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800"><Copy size={12}/> Copiar Texto</button>
        </div>
        <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans overflow-y-auto max-h-[600px] custom-scrollbar selection:bg-purple-500/30">
          {data.adCopy}
        </div>
      </div>
    </div>
  );

  // --- PÁGINAS DO SISTEMA ---

  const RenderMyProducts = () => {
    const products = [
      { id: 1, name: "Corretor Postural Pro", niche: "Saúde", status: "Ativo", roas: "4.2", date: "Há 2 dias", color: "text-green-400", bg: "bg-green-900/20" },
      { id: 2, name: "Smartwatch Ultra 9", niche: "Eletrônicos", status: "Pausado", roas: "1.8", date: "Há 5 dias", color: "text-yellow-400", bg: "bg-yellow-900/20" },
      { id: 3, name: "Kit Clareador Dental", niche: "Beleza", status: "Ativo", roas: "3.5", date: "Há 1 semana", color: "text-green-400", bg: "bg-green-900/20" },
      { id: 4, name: "Cinta Modeladora Slim", niche: "Moda", status: "Rascunho", roas: "-", date: "Há 1 semana", color: "text-slate-400", bg: "bg-slate-800" },
      { id: 5, name: "Lâmpada Led RGB", niche: "Casa", status: "Ativo", roas: "2.1", date: "Há 2 semanas", color: "text-green-400", bg: "bg-green-900/20" },
    ];

    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Meus Produtos</h2>
            <p className="text-slate-400 text-sm">Gerencie todas as suas campanhas salvas.</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-900/20">
            <Package className="w-4 h-4" /> Novo Produto
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-all group cursor-pointer hover:shadow-xl hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:border-purple-500/50 group-hover:text-purple-400 transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${p.bg} ${p.color}`}>
                  {p.status}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1 truncate">{p.name}</h3>
              <p className="text-slate-500 text-xs mb-4">{p.niche} • Criado {p.date}</p>
              
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">ROAS</span>
                  <span className="text-white font-bold">{p.roas}</span>
                </div>
                <button className="text-purple-400 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                  Abrir <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {/* Add Placeholder */}
          <div className="border-2 border-dashed border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-slate-500 hover:border-slate-700 hover:bg-slate-900/30 hover:text-slate-300 transition-all cursor-pointer min-h-[180px]">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-2">
               <PlusIcon />
            </div>
            <span className="mt-1 text-sm font-medium">Adicionar Produto</span>
          </div>
        </div>
      </div>
    );
  };

  const RenderSettings = () => (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Configurações</h2>
      <p className="text-slate-400 text-sm mb-8">Gerencie suas preferências e assinatura.</p>
      
      <div className="grid gap-8">
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-purple-900/30 ring-4 ring-slate-900">
              J
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-xl font-bold text-white">Jair Anesud</h3>
              <p className="text-slate-400 text-sm mb-3">jair@exemplo.com</p>
              <div className="flex gap-2 justify-center md:justify-start">
                 <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">Admin</span>
                 <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">Pro</span>
              </div>
            </div>
            <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors border border-slate-700">
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400"/> Assinatura
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                   <p className="text-sm font-medium text-white">Plano Escala Pro</p>
                   <p className="text-xs text-slate-500">R$ 97,00/mês</p>
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded">Ativo</span>
              </div>
              <button className="text-purple-400 text-sm hover:underline">Gerenciar Cobrança</button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400"/> Notificações
            </h4>
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-slate-300">Alertas de E-mail</span>
                 <div className="w-9 h-5 bg-purple-600 rounded-full relative cursor-pointer"><div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div></div>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-slate-300">Novos Recursos</span>
                 <div className="w-9 h-5 bg-slate-700 rounded-full relative cursor-pointer"><div className="w-3 h-3 bg-white rounded-full absolute left-1 top-1"></div></div>
               </div>
            </div>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-slate-900">
          <p className="text-slate-600 text-xs mb-2">ID da Conta: 8493-2938-1029</p>
          <button className="text-red-500/70 hover:text-red-400 text-xs transition-colors" onClick={onLogout}>Sair da Conta</button>
        </div>
      </div>
    </div>
  );

  // Helper simples para UI
  const PlusIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

  // Controlador de Renderização Principal
  const renderContent = () => {
    if (activeModule === 'my_products') return <RenderMyProducts />;
    if (activeModule === 'settings') return <RenderSettings />;

    // Estado Vazio (Inicial)
    if (!result && !isGenerating && !error) {
      const CurrentIcon = modules[activeModule].icon;
      return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center select-none animate-fade-in">
           <div className={`w-20 h-20 rounded-2xl ${modules[activeModule].bgColor} border ${modules[activeModule].borderColor} flex items-center justify-center mb-6 shadow-lg shadow-black/20`}>
              <CurrentIcon className={`w-8 h-8 ${modules[activeModule].color}`} />
           </div>
           <h3 className="text-white font-bold text-xl mb-2">Pronto para criar</h3>
           <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
             O assistente está aguardando seu comando. Descreva seu produto acima e a mágica acontecerá.
           </p>
        </div>
      );
    }

    // Estado Carregando
    if (isGenerating) {
      return (
        <div className="h-[50vh] flex flex-col items-center justify-center animate-pulse">
           <div className="relative">
             <div className="w-16 h-16 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
               <Sparkles className="w-6 h-6 text-purple-500" />
             </div>
           </div>
           <p className="text-slate-300 font-medium mt-6">Analisando 1M+ de anúncios vencedores...</p>
           <p className="text-slate-500 text-sm mt-2">Gerando estratégia personalizada</p>
        </div>
      );
    }

    // Estado Erro
    if (error || (result && result.isError)) {
      return (
        <div className="bg-red-950/20 border border-red-500/20 p-8 rounded-2xl text-center max-w-lg mx-auto mt-10">
          <div className="w-14 h-14 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Ops, algo deu errado.</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error || result?.rawText || "A inteligência artificial encontrou um obstáculo. Verifique sua conexão ou tente simplificar o pedido."}
          </p>
          <button onClick={handleGenerate} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-900/20">
            Tentar Novamente
          </button>
        </div>
      );
    }

    // --- RENDERIZADORES DE RESULTADOS ---
    switch (activeModule) {
      case 'generator': return <RenderCampaign data={result} />;
      case 'studio': return <RenderStudio data={result} />;
      case 'video_script': 
        return (
          <div className="space-y-4 animate-fade-in">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Video className="w-4 h-4 text-cyan-400"/> {result.title}</h3>
             </div>
             {result.scenes?.map((scene: any, i: number) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-3 md:w-24 shrink-0">
                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 text-xs">{i+1}</div>
                    <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-slate-300">{scene.time}</span>
                  </div>
                  <div className="flex-1 grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Camera className="w-3 h-3"/> Visual</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{scene.visual}</p>
                    </div>
                    <div className="md:border-l md:border-slate-800 md:pl-4">
                      <p className="text-pink-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Áudio</p>
                      <p className="text-white text-sm font-medium leading-relaxed">"{scene.audio}"</p>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        );
      case 'persona':
        return (
           <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl animate-fade-in">
             <div className="flex flex-col md:flex-row items-center gap-6 mb-8 border-b border-slate-800 pb-8">
               <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-900/20"><UserCircle className="text-white w-10 h-10"/></div>
               <div className="text-center md:text-left">
                 <h2 className="text-3xl font-bold text-white mb-1">{result.name}</h2>
                 <p className="text-slate-400 text-lg">{result.age} • <span className="text-blue-400 font-medium">{result.occupation}</span></p>
               </div>
             </div>
             <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-red-950/10 p-5 rounded-xl border border-red-500/10">
                  <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Principais Dores</h4>
                  <ul className="space-y-3">
                    {result.painPoints?.map((p:string, i:number)=>(
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-950/10 p-5 rounded-xl border border-green-500/10">
                  <h4 className="text-green-400 font-bold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4"/> Desejos Secretos</h4>
                  <ul className="space-y-3">
                    {result.desires?.map((p:string, i:number)=>(
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
             </div>
           </div>
        );
      case 'objections':
         return (
            <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
               {result.objections?.map((obj: any, i: number) => (
                 <div key={i} className="space-y-2 group">
                    <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none text-slate-300 text-sm self-start w-fit max-w-[85%] border border-slate-700 relative">
                      <span className="absolute -top-5 left-0 text-[10px] text-slate-500 font-bold uppercase">Cliente</span>
                      {obj.clientAsks}
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-2xl rounded-br-none text-white text-sm w-fit max-w-[85%] shadow-lg relative">
                        <span className="absolute -top-5 right-0 text-[10px] text-slate-500 font-bold uppercase">Melhor Resposta</span>
                        {obj.sellerAnswers}
                      </div>
                    </div>
                 </div>
               ))}
            </div>
         );
      case 'email_seq':
         return (
           <div className="space-y-4 animate-fade-in">
             {result.emails?.map((email: any, i: number) => (
               <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-yellow-500/30 transition-colors">
                 <div className="bg-slate-950 p-3 px-4 text-sm font-medium text-white border-b border-slate-800 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-900/20 text-yellow-500 flex items-center justify-center text-xs font-bold border border-yellow-500/20">{i+1}</div>
                    <span className="text-slate-400">Assunto:</span> {email.subject}
                 </div>
                 <div className="p-5 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                   {email.body}
                 </div>
               </div>
             ))}
           </div>
         );
      case 'roas_analyzer':
        return (
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-8 border-b border-slate-800">
                <div>
                  <h2 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Diagnóstico da Campanha</h2>
                  <div className={`text-5xl font-extrabold ${result.status === 'EXCELENTE' || result.status === 'BOM' ? 'text-green-500' : 'text-yellow-500'}`}>{result.status}</div>
                </div>
                <div className={`mt-4 md:mt-0 px-4 py-2 rounded-lg font-bold text-sm ${result.status === 'EXCELENTE' || result.status === 'BOM' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                   Análise Concluída
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-slate-400"/> Resumo</h3>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">{result.summary}</p>
              </div>

              <div>
                <h3 className="text-white font-bold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-slate-400"/> Plano de Ação</h3>
                <ul className="space-y-3">
                  {result.actions?.map((a:string,i:number)=>(
                    <li key={i} className="flex gap-3 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3 h-3 text-green-500"/></div>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
           </div>
        );
      case 'product_desc':
         return (
            <div className="space-y-8 animate-fade-in">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-2xl shadow-xl shadow-black/5">
                  <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">Preview Google</h4>
                  <p className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate font-arial mb-1">{result.seoTitle}</p>
                  <p className="text-[#006621] text-xs mb-2 font-arial">www.seusite.com.br › produto › oferta</p>
                  <p className="text-[#545454] text-sm leading-snug font-arial">{result.metaDescription}</p>
               </div>
               
               <div className="grid md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2"><Search className="w-4 h-4"/> Descrição Completa</h3>
                    <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: result.descriptionBody }}></div>
                 </div>
                 <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit">
                    <h3 className="text-white font-bold mb-4">Destaques</h3>
                    <ul className="space-y-3">
                      {result.features?.map((f:string,i:number)=>(
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400 border-b border-slate-800 pb-2 last:border-0">
                          <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0"/> {f}
                        </li>
                      ))}
                    </ul>
                 </div>
               </div>
            </div>
         );
      default: 
        return (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-slate-300">
            <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        );
    }
  };

  const currentModule = modules[activeModule];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR ENTERPRISE */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#020617] border-r border-slate-900 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-900/50">
           <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg mr-3 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <Zap className="w-5 h-5 text-white" />
           </div>
           <div>
             <span className="text-lg font-bold text-white tracking-tight block leading-none">DROPHACKER</span>
             <span className="text-[9px] text-purple-400 font-bold tracking-widest uppercase opacity-80">Enterprise AI</span>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          
          <div className="px-3 py-3 mt-2 mb-1 flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span>Ferramentas de Criação</span>
          </div>
          {['generator', 'studio', 'video_script', 'product_desc'].map(id => {
            const m = modules[id];
            return (
              <button key={id} onClick={() => { setActiveModule(id as ModuleId); setResult(null); setInputValue(''); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group border border-transparent ${
                  activeModule === id ? 'bg-slate-900 text-white shadow-lg shadow-black/20 border-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}>
                <m.icon className={`w-4 h-4 transition-colors ${activeModule === id ? m.color : 'text-slate-600 group-hover:text-slate-400'}`} />
                {m.label}
              </button>
            )
          })}
          
          <div className="px-3 py-3 mt-6 mb-1 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Estratégia & Vendas</div>
          {['persona', 'objections', 'email_seq', 'roas_analyzer'].map(id => {
            const m = modules[id];
            return (
              <button key={id} onClick={() => { setActiveModule(id as ModuleId); setResult(null); setInputValue(''); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group border border-transparent ${
                  activeModule === id ? 'bg-slate-900 text-white shadow-lg shadow-black/20 border-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}>
                <m.icon className={`w-4 h-4 transition-colors ${activeModule === id ? m.color : 'text-slate-600 group-hover:text-slate-400'}`} />
                {m.label}
              </button>
            )
          })}

          <div className="my-6 border-t border-slate-900 mx-2"></div>

          {['my_products', 'settings'].map(id => {
            const m = modules[id];
            return (
              <button key={id} onClick={() => { setActiveModule(id as ModuleId); setResult(null); setInputValue(''); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group border border-transparent ${
                  activeModule === id ? 'bg-slate-900 text-white border-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}>
                <m.icon className={`w-4 h-4 ${activeModule === id ? 'text-white' : 'text-slate-600'}`} />
                {m.label}
                {id === 'my_products' && <span className="ml-auto text-[10px] bg-slate-800 text-slate-400 py-0.5 px-2 rounded-full">{savedItems}</span>}
              </button>
            )
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-900 bg-[#020617]">
           <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-950/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
             <LogOut className="w-4 h-4" /> Sair da Plataforma
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen w-full bg-slate-950 relative custom-scrollbar">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-950/80 backdrop-blur border-b border-slate-900 flex items-center justify-between px-4 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-400"><Menu/></button>
          <span className="font-bold text-white text-sm tracking-wide">DROPHACKER</span>
          <div className="w-6"/>
        </div>

        <div className="max-w-6xl mx-auto p-6 md:p-10 pb-32">
          
          {/* Header Módulo */}
          {currentModule.isTool ? (
            <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <span className={`p-2.5 rounded-xl ${currentModule.bgColor} border ${currentModule.borderColor}`}>
                    <currentModule.icon className={`w-6 h-6 ${currentModule.color}`} />
                  </span>
                  {currentModule.label}
                </h1>
                <p className="text-slate-400 mt-2 ml-1 text-sm max-w-2xl">{currentModule.description}</p>
              </div>
              {inputValue && (
                <div className="hidden md:flex items-center gap-2">
                   <button onClick={() => setInputValue('')} className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-900 rounded-lg border border-slate-800" title="Limpar"><X size={18}/></button>
                </div>
              )}
            </div>
          ) : null}

          {/* INPUT AREA (Apenas para ferramentas) */}
          {currentModule.isTool && (
            <div className={`bg-slate-900/30 border border-slate-800 rounded-2xl p-1.5 shadow-2xl mb-8 focus-within:border-slate-700 focus-within:ring-1 focus-within:ring-slate-700 transition-all ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="relative bg-slate-950 rounded-xl overflow-hidden">
                 <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentModule.placeholder}
                  className="w-full bg-transparent px-6 py-5 text-lg text-white placeholder-slate-600 focus:outline-none min-h-[100px] resize-none"
                 />
                 <div className="px-4 pb-4 flex justify-between items-center bg-slate-950 border-t border-slate-900/50 pt-3">
                    <div className="flex gap-2 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Sparkles size={12}/> AI Pro</span>
                      <span className="hidden md:inline">• Enterprise AI Turbo</span>
                    </div>
                    <button 
                      onClick={handleGenerate}
                      disabled={!inputValue || isGenerating}
                      className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
                        !inputValue || isGenerating 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/20 hover:shadow-purple-900/40 hover:-translate-y-0.5'
                      }`}
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                      {isGenerating ? 'Processando...' : 'Gerar com IA'}
                    </button>
                 </div>
              </div>
            </div>
          )}

          {/* CONTENT RENDER */}
          {renderContent()}

        </div>
      </main>
    </div>
  );
};