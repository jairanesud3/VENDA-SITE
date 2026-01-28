import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, AlertTriangle, Video, Mail, 
  Search, Users, Calculator, Target, Megaphone, TrendingUp, 
  ShieldAlert, Menu, X, PlayCircle, MessageSquare, UserCircle,
  BarChart3, Check, MousePointerClick, Globe, Camera, Save,
  CreditCard, Bell, Lock, ChevronRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  onLogout: () => void;
}

// --- TIPOS ---
type ModuleId = 
  | 'generator' | 'video_script' | 'product_desc' | 'email_seq' 
  | 'persona' | 'objections' | 'competitor' | 'studio' // A "Camera"
  | 'upsell' | 'roas_analyzer' 
  | 'my_products' | 'settings'; // Páginas do Sistema

interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  placeholder: string;
  promptTemplate: (input: string) => string;
  isTool?: boolean; // Se é uma ferramenta de IA ou uma página
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('generator');
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<number>(12); // Mock count

  // --- CONFIGURAÇÃO DOS MÓDULOS ---
  const modules: Record<string, ModuleConfig> = {
    // FERRAMENTAS DE CRIAÇÃO
    generator: {
      id: 'generator',
      label: 'Campanha 360º',
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      description: 'Gera headlines, copy AIDA e estrutura completa de anúncio.',
      placeholder: 'Ex: Corretor Postural, Tênis de Corrida...',
      isTool: true,
      promptTemplate: (input) => `
        Atue como um copywriter expert nível A-List. Crie uma campanha para: "${input}".
        Retorne APENAS um JSON válido (sem markdown, sem \`\`\`) com esta estrutura exata:
        {
          "headlines": ["Headline Curta e Impactante 1", "Headline Curta 2", "Headline Curta 3"],
          "adCopy": "Texto persuasivo completo usando framework AIDA (Atenção, Interesse, Desejo, Ação). Use quebras de linha \\n.",
          "creativeIdeas": ["Descrição visual detalhada para imagem 1", "Descrição visual 2"]
        }`
    },
    studio: {
      id: 'studio',
      label: 'Studio AI (Visual)',
      icon: Camera,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      description: 'Direção de arte e prompts técnicos para Midjourney/DALL-E.',
      placeholder: 'Ex: Garrafa Térmica futurista...',
      isTool: true,
      promptTemplate: (input) => `
        Atue como um Diretor de Arte Sênior. Crie 3 conceitos visuais para vender: "${input}".
        Retorne APENAS um JSON válido com:
        {
          "concepts": [
            {
              "style": "Fotorealista / 3D / Minimalista",
              "midjourneyPrompt": "/imagine prompt: [descrição técnica em inglês com iluminação, lente, estilo]",
              "explanation": "Por que esse visual converte?"
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
      description: 'Scripts de 60s focados em retenção e viralidade.',
      placeholder: 'Ex: Escova Alisadora...',
      isTool: true,
      promptTemplate: (input) => `
        Crie um roteiro de TikTok para "${input}".
        Retorne APENAS um JSON válido com:
        {
          "title": "Título Gancho",
          "scenes": [
            { "time": "0-3s", "visual": "O que aparece", "audio": "Hook falado" },
            { "time": "3-15s", "visual": "Demonstração do problema", "audio": "Narração" },
            { "time": "15-45s", "visual": "Solução/Produto", "audio": "Benefícios" },
            { "time": "45-60s", "visual": "CTA Claro", "audio": "Chamada para ação" }
          ]
        }`
    },
    // ESTRATÉGIA
    persona: {
      id: 'persona',
      label: 'Raio-X da Persona',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      description: 'Psicografia profunda do seu comprador ideal.',
      placeholder: 'Ex: Kit de Ferramentas...',
      isTool: true,
      promptTemplate: (input) => `
        Crie uma Persona Buyer para "${input}".
        Retorne APENAS um JSON válido com:
        {
          "name": "Nome da Persona",
          "age": "Idade",
          "occupation": "Profissão",
          "painPoints": ["Dor latente 1", "Dor 2", "Dor 3"],
          "desires": ["Desejo secreto 1", "Desejo 2"],
          "behaviors": ["Comportamento de compra 1", "Onde navega"]
        }`
    },
    objections: {
      id: 'objections',
      label: 'Matador de Objeções',
      icon: ShieldAlert,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      description: 'Scripts de resposta para WhatsApp e Direct.',
      placeholder: 'Ex: Smartwatch Ultra...',
      isTool: true,
      promptTemplate: (input) => `
        Liste 4 objeções comuns para "${input}" e a resposta perfeita.
        Retorne APENAS um JSON válido com:
        {
          "objections": [
            { "clientAsks": "Objeção (ex: tá caro)", "sellerAnswers": "Script de quebra de objeção" },
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
      description: 'Recuperação de carrinho e pós-venda.',
      placeholder: 'Ex: Fone Bluetooth...',
      isTool: true,
      promptTemplate: (input) => `
        Crie 3 emails curtos para recuperação de "${input}".
        Retorne APENAS um JSON válido com:
        {
          "emails": [
            { "subject": "Assunto instigante 1", "body": "Texto do email 1" },
            { "subject": "Assunto 2", "body": "Texto do email 2" },
            { "subject": "Assunto 3", "body": "Texto do email 3" }
          ]
        }`
    },
    product_desc: {
      id: 'product_desc',
      label: 'SEO E-commerce',
      icon: Search,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      description: 'Descrições que ranqueiam no Google.',
      placeholder: 'Ex: Garrafa Térmica...',
      isTool: true,
      promptTemplate: (input) => `
        Crie descrição SEO para "${input}".
        Retorne APENAS um JSON válido com:
        {
          "seoTitle": "Título SEO (50-60 chars)",
          "metaDescription": "Meta Description persuasiva (150 chars)",
          "features": ["Benefício 1", "Benefício 2", "Benefício 3"],
          "descriptionBody": "Descrição completa do produto em HTML simples (apenas <p>, <b>, <br>)"
        }`
    },
    roas_analyzer: {
      id: 'roas_analyzer',
      label: 'Analista de ROAS',
      icon: Calculator,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      description: 'Auditoria de campanhas e métricas.',
      placeholder: 'Ex: Gastei 1000, Faturei 1500, CPC 2.50...',
      isTool: true,
      promptTemplate: (input) => `
        Analise os dados: "${input}".
        Retorne APENAS um JSON válido com:
        {
          "status": "RUIM" | "MÉDIO" | "BOM" | "EXCELENTE",
          "summary": "Análise direta em 1 parágrafo",
          "actions": ["Ação corretiva 1", "Ação 2", "Ação 3"]
        }`
    },
    // PÁGINAS DO SISTEMA (MOCK)
    my_products: {
      id: 'my_products',
      label: 'Meus Produtos',
      icon: Package,
      color: 'text-slate-400',
      bgColor: 'bg-slate-800',
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
      description: 'Preferências da conta.',
      placeholder: '',
      isTool: false,
      promptTemplate: () => ''
    }
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
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-latest',
        contents: prompt,
      });

      const text = response.text;
      
      if (text) {
        try {
          // Limpeza Extrema para garantir JSON
          const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(jsonString);
          setResult(parsed);
        } catch (e) {
          console.error("JSON Parse Error", e);
          setResult({ rawText: text, isError: true });
        }
      }
    } catch (err) {
      console.error(err);
      setError("A IA encontrou um erro. Verifique sua conexão ou tente novamente.");
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
    <div className="space-y-6">
      <div className="grid gap-6">
        {data.concepts?.map((concept: any, idx: number) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-pink-500/50 transition-all group">
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
              <span className="text-pink-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4" /> Conceito {idx + 1}: {concept.style}
              </span>
              <button onClick={() => copyToClipboard(concept.midjourneyPrompt)} className="text-slate-400 hover:text-white flex gap-1 text-xs items-center transition-colors">
                <Copy size={14} /> Copiar Prompt
              </button>
            </div>
            <div className="p-5 space-y-4">
               <div>
                 <p className="text-xs text-slate-500 font-bold mb-1 uppercase">Midjourney / DALL-E Prompt</p>
                 <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 font-mono text-xs leading-relaxed select-all">
                   {concept.midjourneyPrompt}
                 </div>
               </div>
               <div>
                 <p className="text-xs text-slate-500 font-bold mb-1 uppercase">Por que funciona?</p>
                 <p className="text-slate-400 text-sm">{concept.explanation}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RenderCampaign = ({ data }: { data: any }) => (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Headlines */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
          <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Megaphone size={16}/> Headlines Vencedoras
          </h3>
          <div className="space-y-3">
            {data.headlines?.map((h: string, i: number) => (
              <div key={i} className="group flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-purple-500 transition-colors cursor-pointer" onClick={() => copyToClipboard(h)}>
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-wider"><MessageSquare size={16}/> Copy (Framework AIDA)</h3>
           <button onClick={() => copyToClipboard(data.adCopy)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-800"><Copy size={12}/> Copiar Texto</button>
        </div>
        <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans overflow-y-auto max-h-[500px] custom-scrollbar">
          {data.adCopy}
        </div>
      </div>
    </div>
  );

  // --- PÁGINAS COMPLETAS ---

  const RenderMyProducts = () => {
    const products = [
      { id: 1, name: "Corretor Postural Pro", niche: "Saúde", status: "Ativo", roas: "4.2", date: "Há 2 dias" },
      { id: 2, name: "Smartwatch Ultra 9", niche: "Eletrônicos", status: "Pausado", roas: "1.8", date: "Há 5 dias" },
      { id: 3, name: "Kit Clareador Dental", niche: "Beleza", status: "Ativo", roas: "3.5", date: "Há 1 semana" },
      { id: 4, name: "Cinta Modeladora Slim", niche: "Moda", status: "Rascunho", roas: "-", date: "Há 1 semana" },
    ];

    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Meus Produtos</h2>
          <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <Package className="w-4 h-4" /> Novo Produto
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-purple-900/20 group-hover:text-purple-400 transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                  p.status === 'Ativo' ? 'bg-green-900/30 text-green-400' : 
                  p.status === 'Pausado' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {p.status}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-slate-500 text-xs mb-4">{p.niche} • Criado {p.date}</p>
              
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">ROAS Atual</span>
                  <span className="text-white font-bold">{p.roas}</span>
                </div>
                <button className="text-purple-400 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
                  Abrir <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {/* Add Placeholder */}
          <div className="border-2 border-dashed border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-slate-500 hover:border-slate-700 hover:bg-slate-900/50 transition-all cursor-pointer min-h-[200px]">
            <PlusIcon />
            <span className="mt-2 text-sm font-medium">Adicionar Produto</span>
          </div>
        </div>
      </div>
    );
  };

  const RenderSettings = () => (
    <div className="animate-fade-in max-w-3xl">
      <h2 className="text-2xl font-bold text-white mb-6">Configurações da Conta</h2>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            J
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Jair Anesud</h3>
            <p className="text-slate-400 text-sm">jair@exemplo.com</p>
          </div>
          <button className="ml-auto px-4 py-2 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors">
            Editar Perfil
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/20 rounded text-purple-400"><CreditCard className="w-5 h-5"/></div>
              <div>
                <p className="text-white font-medium">Plano Atual</p>
                <p className="text-slate-400 text-xs">Escala Pro • R$ 97,00/mês</p>
              </div>
            </div>
            <span className="text-green-400 text-sm font-bold bg-green-900/20 px-3 py-1 rounded-full">Ativo</span>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded text-slate-400"><Lock className="w-5 h-5"/></div>
              <div>
                <p className="text-white font-medium">Senha e Segurança</p>
                <p className="text-slate-400 text-xs">ltima alteração há 30 dias</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white text-sm">Alterar</button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded text-slate-400"><Bell className="w-5 h-5"/></div>
              <div>
                <p className="text-white font-medium">Notificações</p>
                <p className="text-slate-400 text-xs">E-mails de novidades e alertas</p>
              </div>
            </div>
            <div className="w-10 h-5 bg-purple-600 rounded-full relative cursor-pointer">
              <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <button className="text-red-400 text-sm hover:underline">Excluir minha conta permanentemente</button>
      </div>
    </div>
  );

  // Helper simples para UI
  const PlusIcon = () => <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;

  // Componentes de Renderização de Conteúdo (Reutilizados do anterior com melhorias visuais)
  const RenderGenericList = ({ data, titleKey, subKey }: any) => (
    <div className="grid md:grid-cols-3 gap-4">
      {(data.names || data.angles || []).map((item: any, idx: number) => (
        <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:bg-slate-800 transition-colors">
          <h3 className="text-base font-bold text-white mb-2">{item[titleKey]}</h3>
          {subKey && <p className="text-slate-400 text-sm">{item[subKey]}</p>}
        </div>
      ))}
    </div>
  );

  // Controlador de Renderização Principal
  const renderContent = () => {
    // Páginas Estáticas
    if (activeModule === 'my_products') return <RenderMyProducts />;
    if (activeModule === 'settings') return <RenderSettings />;

    // Estado Vazio
    if (!result && !isGenerating && !error) {
      const CurrentIcon = modules[activeModule].icon;
      return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-40 select-none animate-fade-in">
           <div className={`w-24 h-24 rounded-3xl ${modules[activeModule].bgColor} flex items-center justify-center mb-6`}>
              <CurrentIcon className={`w-10 h-10 ${modules[activeModule].color}`} />
           </div>
           <p className="text-slate-300 font-medium text-lg">Pronto para criar.</p>
           <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">Preencha o contexto acima e a IA gerará o conteúdo em segundos.</p>
        </div>
      );
    }

    // Carregando
    if (isGenerating) {
      return (
        <div className="h-[40vh] flex flex-col items-center justify-center animate-pulse">
           <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
           <p className="text-slate-400 font-medium">Analisando 1M+ de anúncios vencedores...</p>
        </div>
      );
    }

    // Erro
    if (error || (result && result.isError)) {
      return (
        <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-xl text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-red-400 font-bold mb-2">Ops, algo deu errado.</h3>
          <p className="text-slate-400 text-sm">{error || result?.rawText || "Erro desconhecido na geração."}</p>
          <button onClick={handleGenerate} className="mt-4 text-white bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Tentar Novamente</button>
        </div>
      );
    }

    // Resultados
    switch (activeModule) {
      case 'generator': return <RenderCampaign data={result} />;
      case 'studio': return <RenderStudio data={result} />; // NEW
      case 'video_script': 
        return (
          <div className="space-y-4">
             {result.scenes?.map((scene: any, i: number) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="w-16 h-16 bg-slate-800 rounded flex items-center justify-center font-bold text-slate-500">{i+1}</div>
                  <div>
                    <p className="text-cyan-400 text-xs font-bold uppercase mb-1">Visual ({scene.time})</p>
                    <p className="text-slate-300 text-sm mb-2">{scene.visual}</p>
                    <p className="text-pink-400 text-xs font-bold uppercase mb-1">Áudio</p>
                    <p className="text-white text-sm font-medium">"{scene.audio}"</p>
                  </div>
                </div>
             ))}
          </div>
        );
      case 'persona':
        return (
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center"><UserCircle className="text-white w-8 h-8"/></div>
               <div><h2 className="text-xl font-bold text-white">{result.name}</h2><p className="text-slate-400">{result.age} • {result.occupation}</p></div>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                <div><h4 className="text-red-400 font-bold mb-2">Dores</h4><ul className="list-disc pl-4 text-slate-300 text-sm space-y-1">{result.painPoints?.map((p:string, i:number)=><li key={i}>{p}</li>)}</ul></div>
                <div><h4 className="text-green-400 font-bold mb-2">Desejos</h4><ul className="list-disc pl-4 text-slate-300 text-sm space-y-1">{result.desires?.map((p:string, i:number)=><li key={i}>{p}</li>)}</ul></div>
             </div>
           </div>
        );
      case 'objections':
         return (
            <div className="space-y-4 max-w-2xl mx-auto">
               {result.objections?.map((obj: any, i: number) => (
                 <div key={i} className="space-y-2">
                    <div className="bg-slate-800 p-3 rounded-t-xl rounded-br-xl rounded-bl-none text-slate-300 text-sm self-start w-fit max-w-[80%]">{obj.clientAsks}</div>
                    <div className="bg-green-600 p-3 rounded-t-xl rounded-bl-xl rounded-br-none text-white text-sm self-end w-fit max-w-[80%] ml-auto shadow-lg">{obj.sellerAnswers}</div>
                 </div>
               ))}
            </div>
         );
      case 'email_seq':
         return (
           <div className="space-y-4">
             {result.emails?.map((email: any, i: number) => (
               <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                 <div className="bg-slate-800 p-3 text-sm font-medium text-white border-b border-slate-700">Assunto: {email.subject}</div>
                 <div className="p-4 text-slate-300 text-sm whitespace-pre-wrap">{email.body}</div>
               </div>
             ))}
           </div>
         );
      case 'roas_analyzer':
        return (
           <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h2 className={`text-4xl font-bold mb-4 ${result.status === 'EXCELENTE' ? 'text-green-500' : 'text-yellow-500'}`}>{result.status}</h2>
              <p className="text-slate-300 mb-6">{result.summary}</p>
              <h3 className="text-white font-bold mb-2">Ações Recomendadas:</h3>
              <ul className="space-y-2">{result.actions?.map((a:string,i:number)=><li key={i} className="flex gap-2 text-sm text-slate-400"><Check className="w-4 h-4 text-green-500"/> {a}</li>)}</ul>
           </div>
        );
      case 'product_desc':
         return (
            <div className="space-y-6">
               <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">{result.seoTitle}</p>
                  <p className="text-[#006621] text-xs">www.seusite.com.br › produto</p>
                  <p className="text-[#545454] text-sm">{result.metaDescription}</p>
               </div>
               <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: result.descriptionBody }}></div>
            </div>
         );
      case 'naming': return <RenderGenericList data={result} titleKey="name" subKey="slogan" />;
      case 'competitor': return <RenderGenericList data={result} titleKey="angle" subKey="whyItWorks" />;
      case 'upsell': 
         return <div className="p-4 bg-slate-900 rounded border border-slate-800 text-slate-300 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</div>
      default: return <div className="text-slate-500">Formato não suportado visualmente.</div>;
    }
  };

  const currentModule = modules[activeModule];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  activeModule === id ? 'bg-slate-900 text-white shadow-lg shadow-black/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  activeModule === id ? 'bg-slate-900 text-white shadow-lg shadow-black/20' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  activeModule === id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
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
                  <span className={`p-2 rounded-lg ${currentModule.bgColor}`}>
                    <currentModule.icon className={`w-6 h-6 ${currentModule.color}`} />
                  </span>
                  {currentModule.label}
                </h1>
                <p className="text-slate-400 mt-2 ml-1 text-sm">{currentModule.description}</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                 <button className="p-2 text-slate-500 hover:text-white transition-colors" title="Limpar"><X size={20}/></button>
              </div>
            </div>
          ) : null}

          {/* INPUT AREA (Apenas para ferramentas) */}
          {currentModule.isTool && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1.5 shadow-2xl mb-8 focus-within:border-slate-700 focus-within:ring-1 focus-within:ring-slate-700 transition-all">
              <div className="relative bg-slate-950 rounded-xl overflow-hidden">
                 <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentModule.placeholder}
                  className="w-full bg-transparent px-6 py-5 text-lg text-white placeholder-slate-600 focus:outline-none min-h-[100px] resize-none"
                 />
                 <div className="px-4 pb-4 flex justify-between items-center bg-slate-950">
                    <div className="flex gap-2">
                      {/* Attachments buttons placeholders */}
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
                      {isGenerating ? 'Criando...' : 'Gerar com IA'}
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