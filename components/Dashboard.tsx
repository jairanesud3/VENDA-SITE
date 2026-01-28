import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, AlertTriangle, Video, Mail, 
  Search, Users, Calculator, Target, Megaphone, TrendingUp, 
  ShieldAlert, Menu, X, MessageSquare, MousePointerClick, 
  Camera, DollarSign, Clock, Hash, Smartphone, MapPin, 
  BarChart2, PieChart, ArrowRight, CheckCircle2, ThumbsUp, ThumbsDown
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

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<number>(12);
  
  // --- STATES DE INPUTS PERSONALIZADOS ---
  // Geral (Generator, Video, Studio)
  const [mainInput, setMainInput] = useState('');
  
  // Configs Globais
  const [tone, setTone] = useState('Agressivo (Venda Direta)');
  const [platform, setPlatform] = useState('Facebook / Instagram Ads');

  // Video Script
  const [videoDuration, setVideoDuration] = useState('30s');
  const [videoStyle, setVideoStyle] = useState('Viral/Curiosidade');

  // Studio AI
  const [imageStyle, setImageStyle] = useState('Estúdio Luxuoso');

  // Calculadora ROAS (ESTADO ESPECÍFICO)
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

  // --- LÓGICA DA CÂMERA (Mantida) ---
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

  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
       (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  // --- PROMPTS REFINADOS E AGRESSIVOS ---
  const getPrompt = () => {
    switch (activeModule) {
      case 'roas_analyzer':
        return `
          VOCÊ É UM AUDITOR FINANCEIRO DE E-COMMERCE SÊNIOR. SEJA DURO E DIRETO.
          DADOS DO PRODUTO PARA ANÁLISE:
          - Nome: "${roasProductName}"
          - Preço Venda: R$ ${calcPrice || 0}
          - Custo Fornecedor: R$ ${calcCost || 0}
          - CPA/Custo Ads: R$ ${calcAds || 0}
          - Impostos: ${calcTax}%

          TAREFA CRÍTICA:
          1. Calcule a MARGEM LÍQUIDA REAL em % e R$.
          2. Se a margem for abaixo de 15%, classifique como "PREJUÍZO/ALERTA" e mande parar.
          3. Liste 2 concorrentes REAIS (Shopee, Amazon, Mercado Livre) e seus preços médios para este produto.
          4. Dê um VEREDITO final em letras maiúsculas.

          SAÍDA JSON OBRIGATÓRIA:
          {
            "financials": {
              "revenue": "100,00",
              "totalCost": "85,00",
              "netProfit": "15,00",
              "margin": "15%"
            },
            "analysis": {
              "status": "WINNER" ou "RISCO" ou "PARE AGORA",
              "marketSaturation": "Alta/Média/Baixa",
              "competition": ["Concorrente A - R$ XX", "Concorrente B - R$ XX"],
              "strategyTip": "Uma dica tática de uma frase para vender isso.",
              "verdict": "Resumo brutalmente honesto."
            }
          }
        `;
      
      case 'video_script':
        return `
          VOCÊ É O DIRETOR CRIATIVO DO TIKTOK BRASIL.
          Crie um roteiro de retenção máxima para: "${mainInput}".
          Duração: ${videoDuration}.
          Estilo: ${videoStyle}.
          
          O roteiro deve ter cortes rápidos. O primeiro segundo deve ser chocante.
          SAÍDA JSON: { "title": "Título Clickbait", "scenes": [{ "time": "0-3s", "visual": "Descrição visual exata", "audio": "Fala do narrador" }] }
        `;

      case 'studio':
        return `
          VOCÊ É UM FOTÓGRAFO DA APPLE/NIKE.
          Produto: "${mainInput}".
          Estilo Visual: ${imageStyle}.
          Gere prompts para IA de imagem (Midjourney v6).
          SAÍDA JSON: { "concepts": [{ "style": "${imageStyle}", "midjourneyPrompt": "/imagine prompt: ... --v 6.0", "explanation": "Por que essa foto vende." }] }
        `;

      default:
        return `
          VOCÊ É O MELHOR COPYWRITER DO MUNDO (Estilo Ogilvy/Gary Halbert).
          Produto: "${mainInput}".
          Tom: ${tone}.
          Plataforma: ${platform}.
          Crie anúncios que geram desejo incontrolável.
          SAÍDA JSON: { "headlines": ["Headline 1", "Headline 2"], "adCopy": "Texto persuasivo curto com emojis.", "creativeIdeas": ["Ideia visual 1"] }
        `;
    }
  };

  // --- GERAÇÃO COM DEBUG ---
  const handleGenerate = async () => {
    // Validação Estrita
    if (activeModule === 'roas_analyzer') {
        if (!calcPrice || !calcCost || !roasProductName) { setError("Preencha NOME, PREÇO e CUSTO para calcular."); return; }
    } else {
        if (!mainInput && !capturedImage) return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("Chave API ausente.");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = getPrompt();
      
      // Monta payload
      let contents: any = prompt;
      if (capturedImage) {
        const base64Data = capturedImage.split(',')[1];
        contents = {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
            ]
        };
      }

      // Configuração para resposta JSON garantida
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', 
        contents: contents,
        config: { 
            responseMimeType: 'application/json', 
            temperature: 0.8 // Mais criatividade mas mantendo formato
        }
      });

      const text = response.text;
      if (text) {
        // Limpeza de segurança para JSON
        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const first = cleanJson.indexOf('{');
        const last = cleanJson.lastIndexOf('}');
        if (first !== -1 && last !== -1) cleanJson = cleanJson.substring(first, last + 1);
        
        setResult(JSON.parse(cleanJson));
      } else {
        throw new Error("IA não retornou dados.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao processar. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  // --- RENDERIZADORES DE INPUT (BIGGER, BOLDER, BETTER) ---
  const RenderInputSection = () => {
    switch(activeModule) {
      // 1. CALCULADORA (ROAS)
      case 'roas_analyzer':
        return (
          <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl shadow-2xl animate-fade-in relative overflow-hidden group">
             {/* Product Input */}
             <div className="mb-8">
                <label className="text-sm font-extrabold text-emerald-400 uppercase mb-3 block tracking-wider flex items-center gap-2">
                   <Package className="w-5 h-5"/> Nome do Produto
                </label>
                <input 
                  type="text" 
                  value={roasProductName} 
                  onChange={e => setRoasProductName(e.target.value)} 
                  placeholder="Ex: Corretor Postural, Fone Bluetooth..." 
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl p-4 text-white text-lg font-semibold focus:border-emerald-500 focus:outline-none placeholder-slate-600 transition-all focus:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
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
                       <label className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-1">
                          <field.icon size={12}/> {field.label}
                       </label>
                       <input 
                          type="number" 
                          value={field.val} 
                          onChange={e => field.set(e.target.value)} 
                          placeholder="0" 
                          className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none font-sans text-xl font-bold tracking-tight" 
                       />
                    </div>
                ))}
             </div>

             <button 
                onClick={handleGenerate} 
                disabled={isGenerating || !calcPrice || !roasProductName} 
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-white text-lg shadow-[0_10px_20px_rgba(5,150,105,0.4)] hover:shadow-[0_15px_30px_rgba(5,150,105,0.6)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isGenerating ? <Loader2 className="animate-spin w-6 h-6"/> : <BarChart2 className="w-6 h-6"/>} 
                {isGenerating ? 'ANALISANDO MERCADO...' : 'ANALISAR VIABILIDADE AGORA'}
             </button>
          </div>
        );

      // 2. ROTEIRO DE VÍDEO
      case 'video_script':
        return (
          <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl shadow-2xl animate-fade-in space-y-6">
             <div>
                <label className="text-sm font-extrabold text-cyan-400 uppercase mb-3 block tracking-wider">Qual o tema do vídeo?</label>
                <div className="relative">
                   <input 
                    type="text" 
                    value={mainInput} 
                    onChange={e => setMainInput(e.target.value)} 
                    placeholder="Ex: Unboxing do Smartwatch X8..." 
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl p-5 pl-14 text-white text-lg font-medium focus:border-cyan-500 focus:outline-none focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                   />
                   <Video className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
                </div>
             </div>
             
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                   <label className="text-[11px] font-black text-slate-500 uppercase mb-3 block">Duração</label>
                   <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1">
                      {['15s', '30s', '60s'].map(d => (
                        <button key={d} onClick={() => setVideoDuration(d)} className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${videoDuration === d ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
                          {d}
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                   <label className="text-[11px] font-black text-slate-500 uppercase mb-3 block">Estilo</label>
                   <div className="relative">
                     <select value={videoStyle} onChange={e => setVideoStyle(e.target.value)} className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-3 text-white text-sm font-bold focus:outline-none focus:border-cyan-500 appearance-none">
                        <option>Viral/Curiosidade</option>
                        <option>Unboxing ASMR</option>
                        <option>Depoimento (UGC)</option>
                        <option>Polêmico</option>
                     </select>
                     <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none rotate-90" />
                   </div>
                </div>
             </div>
             <button onClick={handleGenerate} disabled={isGenerating || !mainInput} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-white text-lg shadow-[0_10px_20px_rgba(8,145,178,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-wide mt-4">
                {isGenerating ? <Loader2 className="animate-spin w-6 h-6"/> : <Zap className="w-6 h-6"/>} GERAR ROTEIRO VIRAL
             </button>
          </div>
        );

      // 3. STUDIO AI
      case 'studio':
        return (
          <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl shadow-2xl animate-fade-in space-y-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                 <div className="flex-1 space-y-6 w-full">
                    <div>
                      <label className="text-sm font-extrabold text-pink-500 uppercase mb-3 block tracking-wider">Descrição do Produto</label>
                      <textarea
                        value={mainInput} 
                        onChange={e => setMainInput(e.target.value)} 
                        placeholder="Ex: Tênis de corrida preto com detalhes em neon..." 
                        className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl p-4 text-white focus:border-pink-500 focus:outline-none resize-none h-32 text-lg font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase mb-3 block">Estilo de Fotografia</label>
                      <div className="relative">
                        <select value={imageStyle} onChange={e => setImageStyle(e.target.value)} className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-3 text-white text-sm font-bold focus:outline-none focus:border-pink-500 appearance-none">
                          <option>Estúdio Luxuoso (Fundo Infinito)</option>
                          <option>Minimalista/Clean (Apple Style)</option>
                          <option>Natureza/Outdoor (Lifestyle)</option>
                          <option>Neon/Cyberpunk (Gamer)</option>
                          <option>Caseiro (UGC Realista)</option>
                        </select>
                         <Camera className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500 pointer-events-none" />
                      </div>
                    </div>
                 </div>

                 {/* Camera Module */}
                 <div className="w-full md:w-1/3 shrink-0">
                    <div className="border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/50 h-[220px] flex flex-col items-center justify-center relative overflow-hidden group hover:border-pink-500 transition-all cursor-pointer">
                        {!showCamera && !capturedImage && (
                          <button onClick={startCamera} className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-pink-400 p-4 transition-colors">
                             <div className="p-4 bg-slate-900 rounded-full border-2 border-slate-800 group-hover:border-pink-500 transition-all group-hover:scale-110"><Camera size={32}/></div>
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
                              <div className="absolute bottom-0 w-full bg-pink-600 text-white text-[10px] font-black text-center py-2 uppercase tracking-widest">Imagem Carregada</div>
                           </>
                        )}
                    </div>
                 </div>
              </div>

              <button onClick={handleGenerate} disabled={isGenerating || (!mainInput && !capturedImage)} className="w-full py-5 bg-pink-600 hover:bg-pink-500 rounded-2xl font-black text-white text-lg shadow-[0_10px_20px_rgba(219,39,119,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-wide">
                {isGenerating ? <Loader2 className="animate-spin w-6 h-6"/> : <Sparkles className="w-6 h-6"/>} GERAR CONCEITOS VISUAIS
             </button>
          </div>
        );

      // DEFAULT
      default:
        return (
          <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl shadow-2xl animate-fade-in relative">
             <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="bg-slate-950 px-4 py-2 rounded-xl border-2 border-slate-800 flex items-center gap-3 flex-1">
                   <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">TOM DE VOZ</span>
                   <select value={tone} onChange={e => setTone(e.target.value)} className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer w-full"><option>Agressivo (Venda Direta)</option><option>Amigável (Influencer)</option><option>Profissional (B2B)</option></select>
                </div>
                <div className="bg-slate-950 px-4 py-2 rounded-xl border-2 border-slate-800 flex items-center gap-3 flex-1">
                   <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">PLATAFORMA</span>
                   <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer w-full"><option>Facebook / Instagram Ads</option><option>TikTok Ads</option><option>Google Ads</option></select>
                </div>
             </div>

             <div className="flex flex-col md:flex-row gap-6">
                <textarea 
                  value={mainInput} 
                  onChange={e => setMainInput(e.target.value)} 
                  placeholder={modules[activeModule].description}
                  className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-2xl p-5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 min-h-[140px] text-lg font-medium resize-none transition-all"
                />
                
                <div className="w-full md:w-40 shrink-0 h-[140px]">
                   {!showCamera && !capturedImage && (
                     <button onClick={startCamera} className="w-full h-full border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-purple-400 hover:border-purple-400 hover:bg-slate-800 transition-all gap-2 group">
                        <Camera size={28} className="group-hover:scale-110 transition-transform"/> <span className="text-xs font-black uppercase text-center">Usar<br/>Câmera</span>
                     </button>
                   )}
                   {showCamera && (
                     <div className="relative h-full rounded-2xl overflow-hidden bg-black shadow-lg">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                        <button onClick={captureImage} className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full border-2 border-slate-400 hover:scale-110 transition-transform"></button>
                     </div>
                   )}
                   {capturedImage && !showCamera && (
                     <div className="relative h-full rounded-2xl overflow-hidden border-2 border-purple-500 group shadow-lg">
                        <img src={capturedImage} className="w-full h-full object-cover"/>
                        <button onClick={() => setCapturedImage(null)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"><X size={14}/></button>
                     </div>
                   )}
                </div>
             </div>

             <div className="mt-6 flex justify-end">
                <button onClick={handleGenerate} disabled={isGenerating || (!mainInput && !capturedImage)} className="px-10 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl text-white font-black text-lg shadow-[0_10px_20px_rgba(147,51,234,0.4)] hover:-translate-y-1 transition-all flex items-center gap-3 w-full md:w-auto justify-center uppercase tracking-wide">
                   {isGenerating ? <Loader2 className="animate-spin w-5 h-5"/> : <Zap className="w-5 h-5 fill-white"/>} GERAR AGORA
                </button>
             </div>
          </div>
        );
    }
  };

  // --- RENDERIZADORES DE RESULTADO (CARD ESPECÍFICOS) ---

  const RenderROASResult = ({ data }: { data: any }) => (
     <div className="animate-fade-in grid md:grid-cols-2 gap-8">
        {/* Card Financeiro */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col shadow-xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>
           <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
              <div className="p-3 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20"><DollarSign size={24} className="text-white"/></div>
              <div>
                 <h3 className="text-white font-black text-lg uppercase tracking-wide">Resultado Financeiro</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Baseado nos inputs</p>
              </div>
           </div>
           
           <div className="space-y-6 flex-1">
              <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-sm font-bold uppercase">Faturamento Bruto</span>
                 <span className="text-white font-sans font-bold text-xl">R$ {data.financials.revenue}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-sm font-bold uppercase">Custos Totais</span>
                 <span className="text-red-400 font-sans font-bold text-xl">-R$ {data.financials.totalCost}</span>
              </div>
              
              <div className="bg-slate-950 rounded-2xl p-6 border-2 border-slate-800 mt-4 relative overflow-hidden">
                 <div className="flex justify-between items-end mb-2 relative z-10">
                    <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">LUCRO LÍQUIDO</span>
                    <span className={`font-sans text-4xl font-black tracking-tighter ${data.financials.netProfit.includes('-') ? 'text-red-500' : 'text-emerald-400'}`}>
                       R$ {data.financials.netProfit}
                    </span>
                 </div>
                 <div className="mt-2 text-right relative z-10">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mr-2">MARGEM REAL: </span>
                    <span className={`font-sans text-lg font-bold ${data.financials.margin.includes('-') ? 'text-red-400' : 'text-emerald-400'}`}>{data.financials.margin}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Card Análise de Mercado */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col shadow-xl">
           <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-6">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"><Target size={24} className="text-white"/></div>
              <div>
                 <h3 className="text-white font-black text-lg uppercase tracking-wide">Raio-X de Mercado</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-wider line-clamp-1">Produto: <span className="text-blue-400">{roasProductName}</span></p>
              </div>
           </div>
           
           <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-slate-500 text-xs font-black uppercase tracking-widest">VEREDITO DA IA</span>
                 <div className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${
                    data.analysis.status.includes('WINNER') ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                    data.analysis.status.includes('RISCO') ? 'bg-yellow-500 text-black border-yellow-400' : 
                    'bg-red-600 text-white border-red-500 animate-pulse'
                 }`}>
                    {data.analysis.status}
                 </div>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-medium bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                 "{data.analysis.verdict}"
              </p>
           </div>

           <div className="space-y-4 mt-auto">
              <div>
                 <span className="text-slate-500 text-[10px] font-black uppercase block mb-2 tracking-widest">CONCORRÊNCIA DETECTADA</span>
                 <div className="flex flex-col gap-2">
                    {data.analysis.competition?.map((c: string, i: number) => (
                       <div key={i} className="bg-slate-800 text-slate-300 px-3 py-2 rounded-lg text-xs font-bold border border-slate-700 flex justify-between">
                          <span>{c.split('-')[0]}</span>
                          <span className="text-white">{c.split('-')[1]}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="pt-4 border-t border-slate-800">
                  <span className="text-purple-400 text-[10px] font-black uppercase flex items-center gap-1 tracking-widest"><Sparkles size={12}/> HACK DE VENDA</span>
                  <p className="text-white text-sm font-bold mt-2">{data.analysis.strategyTip}</p>
              </div>
           </div>
        </div>
     </div>
  );

  const RenderVideoResult = ({ data }: { data: any }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 animate-fade-in max-w-4xl mx-auto shadow-2xl">
       <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2">{data.title}</h2>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[10px] bg-cyan-950 text-cyan-400 px-3 py-1 rounded-full border border-cyan-900 font-bold uppercase">{videoDuration}</span>
               <span className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-bold uppercase">{videoStyle}</span>
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20"><Video className="text-cyan-500" size={32}/></div>
       </div>
       
       <div className="space-y-0 relative pl-4">
          <div className="absolute left-[35px] top-6 bottom-10 w-0.5 bg-slate-800"></div>
          {data.scenes.map((scene: any, idx: number) => (
             <div key={idx} className="relative pl-12 pb-8 last:pb-0 group">
                <div className="absolute left-0 top-0 w-16 h-8 rounded-lg bg-slate-900 border-2 border-cyan-900 group-hover:border-cyan-500 group-hover:bg-cyan-950 transition-all flex items-center justify-center z-10 shadow-lg">
                   <span className="text-[10px] font-black text-cyan-500 uppercase">{scene.time}</span>
                </div>
                <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-all hover:translate-x-1">
                   <div className="mb-3">
                      <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest block mb-1">O QUE MOSTRAR (VISUAL)</span>
                      <p className="text-slate-200 text-sm font-medium leading-relaxed">{scene.visual}</p>
                   </div>
                   <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-1">O QUE FALAR (ÁUDIO)</span>
                      <p className="text-white text-base font-bold italic">"{scene.audio}"</p>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const RenderGenericResult = ({ data }: { data: any }) => (
    <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-slate-300 animate-fade-in shadow-2xl">
       {data.headlines ? (
          <div className="space-y-8">
             <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-purple-400 font-black mb-4 uppercase text-xs flex items-center gap-2 tracking-widest"><Sparkles size={14}/> Headlines Vencedoras</h3>
                    <div className="space-y-3">{data.headlines.map((h: string, i: number) => <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-white font-bold text-sm hover:border-purple-500 transition-colors cursor-pointer hover:shadow-lg shadow-purple-500/10" onClick={() => copyToClipboard(h)}>{h}</div>)}</div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-pink-400 font-black mb-4 uppercase text-xs flex items-center gap-2 tracking-widest"><ImageIcon size={14}/> Sugestão Visual</h3>
                    <div className="space-y-3">{data.creativeIdeas?.map((h: string, i: number) => <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-xs font-medium border-l-4 border-l-pink-500">{h}</div>)}</div>
                </div>
             </div>
             <div>
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-white font-black uppercase text-xs flex items-center gap-2 tracking-widest"><MessageSquare size={14}/> Copy Completa</h3>
                   <button onClick={() => copyToClipboard(data.adCopy)} className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-lg text-white hover:bg-slate-700 font-bold uppercase transition-colors">Copiar Texto</button>
                </div>
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans shadow-inner">
                  {data.adCopy}
                </div>
             </div>
          </div>
       ) : (
         <div className="space-y-6">
             {data.concepts ? (
                 <div className="grid gap-6">
                    {data.concepts.map((concept: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg">
                           <div className="flex justify-between items-center mb-4">
                              <span className="font-black text-pink-400 text-sm uppercase tracking-wide bg-pink-900/20 px-3 py-1 rounded-lg">{concept.style}</span>
                              <button className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white font-bold uppercase" onClick={() => copyToClipboard(concept.midjourneyPrompt)}>Copiar Prompt</button>
                           </div>
                           <code className="block bg-black p-4 rounded-xl border border-slate-800 text-xs text-green-400 font-mono mb-4 shadow-inner">{concept.midjourneyPrompt}</code>
                           <div className="flex items-start gap-2">
                              <Sparkles size={14} className="text-yellow-500 mt-0.5 shrink-0"/>
                              <p className="text-xs text-slate-400 font-medium italic">{concept.explanation}</p>
                           </div>
                        </div>
                    ))}
                 </div>
             ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto bg-black p-4 rounded-xl">{JSON.stringify(data, null, 2)}</pre>
             )}
         </div>
       )}
    </div>
  );

  const renderResult = () => {
    switch (activeModule) {
      case 'roas_analyzer': return <RenderROASResult data={result} />;
      case 'video_script': return <RenderVideoResult data={result} />;
      default: return <RenderGenericResult data={result} />;
    }
  };

  const currentModule = modules[activeModule];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-slate-950/90 z-40 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#020617] border-r border-slate-900 transform transition-transform duration-300 ease-in-out flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-24 flex items-center px-6 border-b border-slate-900/50">
           <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl mr-3 shadow-[0_0_20px_rgba(147,51,234,0.3)]"><Zap className="w-6 h-6 text-white" /></div>
           <span className="text-xl font-black text-white tracking-tighter italic">DROPHACKER</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
           {Object.keys(modules).map(key => {
              if (key === 'my_products') return <div key={key} className="mt-6 pt-6 border-t border-slate-900"><button onClick={() => {setActiveModule(key as ModuleId); setResult(null);}} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeModule === key ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Package className="w-4 h-4"/> Meus Produtos <span className="ml-auto text-[10px] bg-slate-800 py-1 px-2 rounded-full text-white">{savedItems}</span></button></div>;
              if (key === 'settings') return <button key={key} onClick={() => {setActiveModule(key as ModuleId); setResult(null);}} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeModule === key ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Settings className="w-4 h-4"/> Minha Conta</button>;
              
              const m = modules[key];
              return (
                 <button key={key} onClick={() => { setActiveModule(key as ModuleId); setResult(null); setIsGenerating(false); setError(null); setCapturedImage(null); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all border border-transparent ${activeModule === key ? 'bg-slate-900 text-white shadow-lg border-slate-800 scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'}`}>
                    <m.icon className={`w-4 h-4 ${activeModule === key ? m.color : 'text-slate-600'}`} /> {m.label}
                 </button>
              );
           })}
        </nav>
        <div className="p-4 border-t border-slate-900 bg-[#020617]"><button onClick={onLogout} className="w-full flex items-center gap-3 px-6 py-4 text-slate-500 hover:text-red-400 hover:bg-red-950/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"><LogOut className="w-4 h-4" /> Sair da Plataforma</button></div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto h-screen w-full bg-slate-950 relative custom-scrollbar">
        <div className="md:hidden h-20 bg-slate-950/80 backdrop-blur border-b border-slate-900 flex items-center justify-between px-6 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-400"><Menu/></button>
          <span className="font-black text-white text-lg tracking-tight">DROPHACKER</span>
          <div className="w-6"/>
        </div>

        <div className="max-w-6xl mx-auto p-6 md:p-10 pb-40">
          {currentModule.isTool && (
            <div className="mb-10 animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-black text-white flex items-center gap-4 tracking-tight">
                    <span className={`p-3 rounded-2xl ${currentModule.bgColor} border ${currentModule.borderColor} shadow-lg`}><currentModule.icon className={`w-8 h-8 ${currentModule.color}`} /></span>
                    {currentModule.label}
                  </h1>
                  <p className="text-slate-400 text-sm font-medium mt-2 ml-1">{currentModule.description}</p>
                </div>
                <span className="self-start md:self-center text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> SISTEMA ONLINE
                </span>
            </div>
          )}

          {/* ÁREA DE INPUT CUSTOMIZADA */}
          {currentModule.isTool && <RenderInputSection />}

          {/* CANVAS OCULTO PARA FOTOS */}
          <canvas ref={canvasRef} className="hidden"></canvas>

          {/* RESULTADOS */}
          <div className="mt-12 min-h-[400px]">
             {isGenerating && (
                <div className="flex flex-col items-center justify-center h-80 animate-fade-in">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-8 border-slate-800 rounded-full"></div>
                    <div className="w-24 h-24 border-8 border-purple-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent shadow-[0_0_20px_rgba(147,51,234,0.5)]"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white w-8 h-8 animate-pulse"/>
                  </div>
                  <h3 className="text-white font-black text-2xl animate-pulse tracking-tight">HACKEANDO O MERCADO...</h3>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Isso pode levar alguns segundos</p>
                </div>
             )}
             
             {!isGenerating && result && renderResult()}
             
             {!isGenerating && !result && !error && (
                <div className="flex flex-col items-center justify-center h-64 opacity-40 select-none border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                   <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800"><MousePointerClick className="text-white w-8 h-8"/></div>
                   <p className="text-lg text-slate-300 font-bold">Aguardando comando...</p>
                </div>
             )}

             {error && (
               <div className="bg-red-950/30 border border-red-500/50 p-6 rounded-2xl flex items-center gap-4 animate-shake shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                 <div className="p-3 bg-red-500 rounded-full text-white"><AlertTriangle size={24}/></div>
                 <div>
                    <h4 className="font-bold text-white">Ops! Algo deu errado.</h4>
                    <p className="text-red-300 text-sm font-medium">{error}</p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};