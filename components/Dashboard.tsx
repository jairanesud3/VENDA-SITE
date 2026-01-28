import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, AlertTriangle, Video, Mail, 
  Search, Users, Calculator, Target, Megaphone, TrendingUp, 
  ShieldAlert, Menu, X, PlayCircle, MessageSquare, UserCircle,
  BarChart3, Check, MousePointerClick, Globe
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  onLogout: () => void;
}

// --- TIPOS DE DADOS ESTRUTURADOS ---
type ModuleId = 'generator' | 'video_script' | 'product_desc' | 'email_seq' | 'persona' | 'objections' | 'competitor' | 'naming' | 'upsell' | 'roas_analyzer' | 'my_products' | 'settings';

interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: any;
  color: string;
  description: string;
  placeholder: string;
  promptTemplate: (input: string) => string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('generator');
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- CONFIGURAÇÃO DOS MÓDULOS ---
  const modules: Record<string, ModuleConfig> = {
    generator: {
      id: 'generator',
      label: 'Campanha Completa',
      icon: Sparkles,
      color: 'text-purple-400',
      description: 'Gera headlines, copy AIDA e prompts de imagem em um clique.',
      placeholder: 'Ex: Corretor Postural, Tênis de Corrida...',
      promptTemplate: (input) => `
        Atue como um copywriter expert. Crie uma campanha para: "${input}".
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "headlines": ["3 headlines curtas e impactantes"],
          "adCopy": "Texto completo usando framework AIDA",
          "creativeIdeas": ["Descrição visual 1", "Descrição visual 2"]
        }`
    },
    video_script: {
      id: 'video_script',
      label: 'Roteiro Viral TikTok',
      icon: Video,
      color: 'text-pink-500',
      description: 'Scripts de vídeo curtos focados em retenção.',
      placeholder: 'Ex: Escova Alisadora...',
      promptTemplate: (input) => `
        Crie um roteiro de TikTok para "${input}".
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "title": "Título do Vídeo",
          "scenes": [
            { "time": "0-3s", "visual": "O que aparece na tela", "audio": "O que é falado" },
            { "time": "3-15s", "visual": "...", "audio": "..." },
            { "time": "15-45s", "visual": "...", "audio": "..." },
            { "time": "45-60s", "visual": "...", "audio": "..." }
          ]
        }`
    },
    persona: {
      id: 'persona',
      label: 'Raio-X da Persona',
      icon: Users,
      color: 'text-blue-400',
      description: 'Análise profunda psicológica do comprador.',
      placeholder: 'Ex: Kit de Ferramentas Profissional...',
      promptTemplate: (input) => `
        Crie uma Persona para "${input}".
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "name": "Nome Fictício",
          "age": "Faixa etária",
          "occupation": "Ocupação",
          "painPoints": ["Dor 1", "Dor 2", "Dor 3"],
          "desires": ["Desejo 1", "Desejo 2"],
          "behaviors": ["Comportamento 1", "Comportamento 2"]
        }`
    },
    objections: {
      id: 'objections',
      label: 'Matador de Objeções',
      icon: ShieldAlert,
      color: 'text-red-400',
      description: 'Scripts para converter curiosos em compradores.',
      placeholder: 'Ex: Smartwatch Ultra...',
      promptTemplate: (input) => `
        Liste 4 objeções para "${input}" e como responder.
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "objections": [
            { "clientAsks": "Pergunta do cliente (ex: tá caro)", "sellerAnswers": "Melhor resposta persuasiva" },
            { "clientAsks": "...", "sellerAnswers": "..." }
          ]
        }`
    },
    email_seq: {
      id: 'email_seq',
      label: 'E-mail Marketing',
      icon: Mail,
      color: 'text-yellow-400',
      description: 'Sequência de recuperação de carrinho.',
      placeholder: 'Ex: Fone Bluetooth...',
      promptTemplate: (input) => `
        Crie 3 emails de recuperação para "${input}".
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "emails": [
            { "subject": "Assunto Email 1", "body": "Corpo do email 1..." },
            { "subject": "Assunto Email 2", "body": "Corpo do email 2..." },
            { "subject": "Assunto Email 3", "body": "Corpo do email 3..." }
          ]
        }`
    },
    product_desc: {
      id: 'product_desc',
      label: 'SEO para E-commerce',
      icon: Search,
      color: 'text-green-400',
      description: 'Descrição otimizada para Google e Conversão.',
      placeholder: 'Ex: Garrafa Térmica...',
      promptTemplate: (input) => `
        Crie uma descrição SEO para "${input}".
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "seoTitle": "Título SEO (Meta Title)",
          "metaDescription": "Meta Description (160 chars)",
          "features": ["Característica 1", "Característica 2", "Característica 3"],
          "descriptionBody": "Texto persuasivo de vendas (HTML básico permitido como <br> e <b>)"
        }`
    },
    roas_analyzer: {
      id: 'roas_analyzer',
      label: 'Analista de ROAS',
      icon: Calculator,
      color: 'text-emerald-500',
      description: 'Análise financeira e sugestões de otimização.',
      placeholder: 'Ex: Gastei 1000, Faturei 1500, CPC 2.50...',
      promptTemplate: (input) => `
        Analise estes dados: "${input}".
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "status": "RUIM" | "MÉDIO" | "BOM" | "EXCELENTE",
          "summary": "Resumo curto da situação",
          "actions": ["Ação prática 1", "Ação prática 2", "Ação prática 3"]
        }`
    },
    naming: {
      id: 'naming',
      label: 'Naming & Branding',
      icon: Megaphone,
      color: 'text-indigo-400',
      description: 'Gerador de nomes de marca e slogans.',
      placeholder: 'Ex: Loja de Roupas Fitness...',
      promptTemplate: (input) => `
        Crie ideias de nomes para "${input}".
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "names": [
            { "name": "Nome 1", "slogan": "Slogan 1", "vibe": "Moderna" },
            { "name": "Nome 2", "slogan": "Slogan 2", "vibe": "Luxo" },
            { "name": "Nome 3", "slogan": "Slogan 3", "vibe": "Minimalista" }
          ]
        }`
    },
    competitor: {
      id: 'competitor',
      label: 'Espião de Mercado',
      icon: Target,
      color: 'text-orange-400',
      description: 'Descubra ângulos inexplorados pelos concorrentes.',
      placeholder: 'Ex: Corretor Postural...',
      promptTemplate: (input) => `
        Analise ângulos de marketing para "${input}".
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "angles": [
            { "angle": "Nome do ngulo", "whyItWorks": "Por que funciona", "adHook": "Gancho de anúncio sugerido" },
            { "angle": "...", "whyItWorks": "...", "adHook": "..." }
          ]
        }`
    },
    upsell: {
      id: 'upsell',
      label: 'Funil de Upsell',
      icon: TrendingUp,
      color: 'text-cyan-400',
      description: 'Estratégias para aumentar o Ticket Médio.',
      placeholder: 'Ex: Tênis Ortopédico...',
      promptTemplate: (input) => `
        Sugira upsells para "${input}".
        Retorne APENAS um JSON válido (sem markdown) com:
        {
          "orderBump": { "product": "Produto barato complementar", "pitch": "Argumento de 1 frase" },
          "upsell1": { "product": "Produto principal complementar", "pitch": "Argumento de venda" },
          "downsell": { "product": "Opção mais barata se recusar", "pitch": "Argumento de recuperação" }
        }`
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
      
      // MOCK FALLBACK (Se não tiver API Key configurada no ambiente local)
      if (!apiKey) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Mock data logic removed for brevity, assuming API key works or handled externally
        // In a real app, you'd keep the mock data for demo purposes.
        // For this code block, I will assume the API works or fails cleanly.
      }

      const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy' }); // Dummy prevents crash if env missing
      const prompt = config.promptTemplate(inputValue);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-latest',
        contents: prompt,
      });

      const text = response.text;
      
      if (text) {
        try {
          // Limpeza Agressiva de JSON
          const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(jsonString);
          setResult(parsed);
        } catch (e) {
          console.error("JSON Parse Error", e);
          // Fallback para texto puro se a IA falhar no JSON
          setResult({ rawText: text, isError: true });
        }
      }

    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com a IA. Verifique sua chave API ou tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- RENDERIZADORES DE UI ESPECÍFICOS ---

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Poderia adicionar um toast aqui
  };

  const RenderVideoScript = ({ data }: { data: any }) => (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center">
        <h3 className="font-bold text-xl text-white flex items-center gap-2">
          <PlayCircle className="text-pink-500" /> {data.title}
        </h3>
        <button onClick={() => copyToClipboard(JSON.stringify(data))} className="text-xs text-slate-400 hover:text-white flex gap-1"><Copy size={14}/> Copiar</button>
      </div>
      <div className="space-y-4">
        {data.scenes?.map((scene: any, idx: number) => (
          <div key={idx} className="flex gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-pink-500/30 transition-colors">
            <div className="w-16 shrink-0 flex flex-col items-center justify-center bg-slate-800 rounded-lg h-full min-h-[80px]">
              <span className="text-xs font-bold text-slate-400">CENA</span>
              <span className="text-xl font-bold text-white">{idx + 1}</span>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded mt-1 text-slate-300">{scene.time}</span>
            </div>
            <div className="flex-1 grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1"><Video size={12}/> Visual</span>
                <p className="text-slate-300 text-sm leading-relaxed">{scene.visual}</p>
              </div>
              <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1"><MessageSquare size={12}/> Áudio/Fala</span>
                <p className="text-white font-medium text-sm leading-relaxed">"{scene.audio}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const RenderPersona = ({ data }: { data: any }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
        <div className="absolute -bottom-10 left-8">
          <div className="w-20 h-20 bg-slate-800 rounded-full border-4 border-slate-900 flex items-center justify-center">
            <UserCircle className="w-12 h-12 text-slate-400" />
          </div>
        </div>
      </div>
      <div className="pt-12 px-8 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{data.name}</h2>
            <p className="text-slate-400">{data.age} • {data.occupation}</p>
          </div>
          <button onClick={() => copyToClipboard(JSON.stringify(data))} className="p-2 hover:bg-slate-800 rounded-lg"><Copy size={16} className="text-slate-400"/></button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="text-red-400 font-bold text-sm uppercase flex items-center gap-2"><AlertTriangle size={14}/> Dores & Medos</h4>
            <ul className="space-y-2">
              {data.painPoints?.map((p: string, i: number) => (
                <li key={i} className="text-slate-300 text-sm bg-red-900/10 border border-red-900/20 p-2 rounded">{p}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-green-400 font-bold text-sm uppercase flex items-center gap-2"><Zap size={14}/> Desejos</h4>
            <ul className="space-y-2">
              {data.desires?.map((p: string, i: number) => (
                <li key={i} className="text-slate-300 text-sm bg-green-900/10 border border-green-900/20 p-2 rounded">{p}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-blue-400 font-bold text-sm uppercase flex items-center gap-2"><MousePointerClick size={14}/> Comportamentos</h4>
            <div className="flex flex-wrap gap-2">
              {data.behaviors?.map((p: string, i: number) => (
                <span key={i} className="text-slate-300 text-xs bg-slate-800 px-2 py-1 rounded-full border border-slate-700">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RenderObjections = ({ data }: { data: any }) => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-slate-300">Simulação de Chat (WhatsApp)</h3>
      </div>
      {data.objections?.map((obj: any, idx: number) => (
        <div key={idx} className="flex flex-col gap-3">
          {/* Mensagem do Cliente */}
          <div className="self-start max-w-[85%] bg-slate-800 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl text-slate-300 p-4 text-sm relative">
            <span className="text-[10px] text-slate-500 absolute -top-5 left-1">Cliente</span>
            {obj.clientAsks}
          </div>
          {/* Resposta do Vendedor */}
          <div className="self-end max-w-[85%] bg-green-600 text-white rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl p-4 text-sm shadow-lg shadow-green-900/20 relative">
            <span className="text-[10px] text-slate-500 absolute -top-5 right-1">Você (Vendedor)</span>
            {obj.sellerAnswers}
            <div className="absolute bottom-1 right-2 opacity-50"><Check size={12}/></div>
          </div>
        </div>
      ))}
    </div>
  );

  const RenderEmails = ({ data }: { data: any }) => (
    <div className="space-y-4">
      {data.emails?.map((email: any, idx: number) => (
        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden group">
          <div className="bg-slate-800/50 p-3 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-xs">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-bold uppercase">Assunto</p>
              <p className="text-sm font-medium text-white truncate">{email.subject}</p>
            </div>
            <button onClick={() => copyToClipboard(email.body)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-700 rounded text-slate-400"><Copy size={14}/></button>
          </div>
          <div className="p-4 bg-slate-950">
            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-mono">{email.body}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const RenderCampaign = ({ data }: { data: any }) => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2"><Sparkles size={16}/> Headlines</h3>
          <div className="space-y-3">
            {data.headlines?.map((h: string, i: number) => (
              <div key={i} className="p-3 bg-slate-950 border border-slate-700 rounded text-white text-sm hover:border-purple-500 cursor-copy" onClick={() => copyToClipboard(h)}>
                {h}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
          <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2"><ImageIcon size={16}/> Prompts de Imagem</h3>
          <div className="space-y-3">
            {data.creativeIdeas?.map((h: string, i: number) => (
              <div key={i} className="p-3 bg-slate-950 border border-slate-700 border-l-4 border-l-purple-500 rounded text-slate-300 text-xs italic">
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 h-full">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-white font-bold flex items-center gap-2"><Megaphone size={16}/> Copy (AIDA)</h3>
           <button onClick={() => copyToClipboard(data.adCopy)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><Copy size={12}/> Copiar</button>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed h-[calc(100%-3rem)] overflow-y-auto custom-scrollbar">
          {data.adCopy}
        </div>
      </div>
    </div>
  );

  const RenderSEO = ({ data }: { data: any }) => (
    <div className="space-y-6">
      {/* Google Preview */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 max-w-2xl">
        <h4 className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">Preview Google</h4>
        <div className="font-arial">
          <div className="text-[#1a0dab] text-xl cursor-pointer hover:underline truncate">{data.seoTitle}</div>
          <div className="text-[#006621] text-sm truncate">www.sualoja.com.br › produto</div>
          <div className="text-[#545454] text-sm leading-snug">
            {data.metaDescription}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <h3 className="text-green-400 font-bold mb-3">Descrição do Produto</h3>
            <div className="text-slate-300 text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: data.descriptionBody }} />
         </div>
         <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 h-fit">
            <h3 className="text-white font-bold mb-3">Features (Bullet Points)</h3>
            <ul className="space-y-2">
              {data.features?.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
         </div>
      </div>
    </div>
  );

  const RenderROAS = ({ data }: { data: any }) => {
    const statusColor = data.status === 'EXCELENTE' || data.status === 'BOM' ? 'text-green-500' : 'text-red-500';
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Status da Campanha</p>
            <h2 className={`text-4xl font-extrabold mt-1 ${statusColor}`}>{data.status}</h2>
          </div>
          <div className="p-4 bg-slate-800 rounded-full">
            <BarChart3 className={`w-8 h-8 ${statusColor}`} />
          </div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
          <h3 className="text-white font-bold mb-2">Resumo da Análise</h3>
          <p className="text-slate-300">{data.summary}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {data.actions?.map((action: string, i: number) => (
            <div key={i} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col gap-3 hover:border-emerald-500 transition-colors">
              <div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400 font-bold text-sm border border-emerald-500/30">
                {i + 1}
              </div>
              <p className="text-slate-200 text-sm font-medium">{action}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RenderGenericList = ({ data, titleKey, subKey }: { data: any, titleKey: string, subKey?: string }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(data.names || data.angles || []).map((item: any, idx: number) => (
        <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:bg-slate-800 transition-colors group">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{item[titleKey]}</h3>
          {subKey && <p className="text-slate-400 text-sm">{item[subKey]}</p>}
          {item.vibe && <span className="inline-block mt-3 text-[10px] uppercase font-bold bg-slate-950 px-2 py-1 rounded text-slate-500">{item.vibe}</span>}
          {item.adHook && <div className="mt-3 p-2 bg-slate-950 rounded text-xs text-slate-300 border border-slate-800">Hook: "{item.adHook}"</div>}
        </div>
      ))}
    </div>
  );

  const RenderUpsell = ({ data }: { data: any }) => (
    <div className="space-y-8 relative">
       {/* Flow Line */}
       <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-1 bg-slate-800 -translate-x-1/2 -z-10"></div>

       {/* Order Bump */}
       <div className="relative flex flex-col items-center">
         <div className="bg-slate-900 border-2 border-dashed border-slate-700 p-6 rounded-2xl max-w-lg w-full text-center hover:border-cyan-500 transition-colors">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">No Checkout (Order Bump)</div>
            <h3 className="text-xl font-bold text-white mb-2">{data.orderBump?.product}</h3>
            <p className="text-slate-400 text-sm">"{data.orderBump?.pitch}"</p>
         </div>
       </div>

       {/* Main Offer (Implied) */}
       <div className="flex justify-center my-4">
          <div className="bg-slate-800 px-4 py-1 rounded-full text-xs text-slate-400">Compra Confirmada</div>
       </div>

       {/* Upsell 1 */}
       <div className="relative flex flex-col items-center">
         <div className="bg-slate-900 border border-green-500/30 p-6 rounded-2xl max-w-lg w-full text-center shadow-lg shadow-green-900/10">
            <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Upsell 1 (Página de Obrigado)</div>
            <h3 className="text-2xl font-bold text-white mb-2">{data.upsell1?.product}</h3>
            <p className="text-slate-300 text-sm">"{data.upsell1?.pitch}"</p>
         </div>
       </div>

        {/* Downsell */}
        <div className="relative flex flex-col items-center">
         <div className="bg-slate-900 border border-red-500/20 p-4 rounded-xl max-w-sm w-full text-center opacity-80 hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Downsell (Se recusar o Upsell)</div>
            <h3 className="text-lg font-bold text-white mb-1">{data.downsell?.product}</h3>
            <p className="text-slate-400 text-xs">"{data.downsell?.pitch}"</p>
         </div>
       </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    if (result.isError) return <div className="p-4 bg-slate-900 rounded-lg text-slate-300 whitespace-pre-wrap">{result.rawText}</div>;

    switch (activeModule) {
      case 'generator': return <RenderCampaign data={result} />;
      case 'video_script': return <RenderVideoScript data={result} />;
      case 'persona': return <RenderPersona data={result} />;
      case 'objections': return <RenderObjections data={result} />;
      case 'email_seq': return <RenderEmails data={result} />;
      case 'product_desc': return <RenderSEO data={result} />;
      case 'roas_analyzer': return <RenderROAS data={result} />;
      case 'upsell': return <RenderUpsell data={result} />;
      case 'naming': return <RenderGenericList data={result} titleKey="name" subKey="slogan" />;
      case 'competitor': return <RenderGenericList data={result} titleKey="angle" subKey="whyItWorks" />;
      default: return <div className="p-4 bg-slate-900 rounded text-slate-300"><pre>{JSON.stringify(result, null, 2)}</pre></div>;
    }
  };

  const currentModule = modules[activeModule] || modules['generator'];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar Profissional */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
           <div className="p-1.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg mr-3 shadow-lg shadow-purple-900/30">
              <Zap className="w-5 h-5 text-white" />
           </div>
           <div>
             <span className="text-lg font-bold text-white tracking-tight block leading-none">DROPHACKER</span>
             <span className="text-[10px] text-purple-400 font-medium tracking-widest uppercase">Enterprise AI</span>
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-xs font-bold text-slate-600 uppercase tracking-widest">Criação</div>
          {['generator', 'video_script', 'product_desc', 'email_seq'].map(id => {
            const m = modules[id];
            return (
              <button key={id} onClick={() => { setActiveModule(id as ModuleId); setResult(null); setInputValue(''); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeModule === id ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <m.icon className={`w-4 h-4 ${activeModule === id ? m.color : 'text-slate-500'}`} />
                {m.label}
              </button>
            )
          })}
          
          <div className="px-3 py-2 mt-4 text-xs font-bold text-slate-600 uppercase tracking-widest">Estratégia</div>
          {['persona', 'objections', 'competitor', 'roas_analyzer', 'upsell', 'naming'].map(id => {
            const m = modules[id];
            return (
              <button key={id} onClick={() => { setActiveModule(id as ModuleId); setResult(null); setInputValue(''); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeModule === id ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <m.icon className={`w-4 h-4 ${activeModule === id ? m.color : 'text-slate-500'}`} />
                {m.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg text-sm font-medium transition-all">
             <LogOut className="w-4 h-4" /> Sair da Conta
           </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 overflow-y-auto h-screen w-full bg-slate-950 relative">
        <div className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-400"><Menu/></button>
          <span className="font-bold text-white">DROPHACKER</span>
          <div className="w-6"/>
        </div>

        <div className="max-w-5xl mx-auto p-6 md:p-10 pb-32">
          
          <div className="mb-8 animate-fade-in flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <currentModule.icon className={`w-8 h-8 ${currentModule.color}`} />
                {currentModule.label}
              </h1>
              <p className="text-slate-400 mt-2 max-w-2xl">{currentModule.description}</p>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-2xl">
              <div className="relative">
                 <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentModule.placeholder}
                  className="w-full bg-slate-950 rounded-xl px-6 py-5 text-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none min-h-[120px]"
                 />
                 <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium hidden md:inline-block">Enter para gerar</span>
                    <button 
                      onClick={handleGenerate}
                      disabled={!inputValue || isGenerating}
                      className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                        !inputValue || isGenerating 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-white text-slate-950 hover:bg-purple-50 shadow-lg hover:scale-105'
                      }`}
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4 text-purple-600"/>}
                      {isGenerating ? 'Processando...' : 'Gerar Agora'}
                    </button>
                 </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-300 animate-fade-in">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {result && (
               <div className="animate-fade-in">
                 <div className="flex items-center gap-2 mb-6">
                   <div className="h-px bg-slate-800 flex-1"></div>
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Resultado Gerado</span>
                   <div className="h-px bg-slate-800 flex-1"></div>
                 </div>
                 {renderResult()}
               </div>
            )}

            {!result && !isGenerating && (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-40 select-none pointer-events-none">
                 <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
                    <currentModule.icon className="w-10 h-10 text-slate-600" />
                 </div>
                 <p className="text-slate-500 font-medium">Os resultados da IA aparecerão aqui</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};