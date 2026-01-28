import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, Settings, LogOut, Sparkles, Copy, 
  Image as ImageIcon, Zap, Loader2, AlertTriangle, Video, Mail, 
  Search, Users, Calculator, Target, Megaphone, TrendingUp, 
  ShieldAlert, Menu, X, MessageSquare, MousePointerClick, 
  Camera, DollarSign, Clock, Hash, Smartphone, MapPin, 
  BarChart2, PieChart, ArrowRight, CheckCircle2
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
  const [tone, setTone] = useState('Agressivo');
  const [platform, setPlatform] = useState('Instagram/Facebook');

  // Video Script
  const [videoDuration, setVideoDuration] = useState('30s');
  const [videoStyle, setVideoStyle] = useState('Viral/Curiosidade');

  // Studio AI
  const [imageStyle, setImageStyle] = useState('Estúdio Luxuoso');

  // Calculadora ROAS (ESTADO ESPECÍFICO)
  const [roasProductName, setRoasProductName] = useState(''); // NOVO CAMPO OBRIGATÓRIO
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
      id: 'generator', label: 'Criar Anúncio', icon: Megaphone,
      color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20',
      description: 'Copywriting e Ideias Visuais', isTool: true
    },
    roas_analyzer: {
      id: 'roas_analyzer', label: 'Calculadora de Lucro', icon: Calculator,
      color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20',
      description: 'Análise Financeira e de Mercado', isTool: true
    },
    video_script: {
      id: 'video_script', label: 'Roteiro de Vídeo', icon: Video,
      color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20',
      description: 'Scripts para TikTok e Reels', isTool: true
    },
    studio: {
      id: 'studio', label: 'Ideias de Fotos', icon: Camera,
      color: 'text-pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20',
      description: 'Direção de Arte com IA', isTool: true
    },
    product_desc: { id: 'product_desc', label: 'Descrição Loja', icon: Search, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', description: 'SEO E-commerce', isTool: true },
    persona: { id: 'persona', label: 'Público Alvo', icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', description: 'Análise de Avatar', isTool: true },
    objections: { id: 'objections', label: 'Quebra de Objeções', icon: ShieldAlert, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', description: 'Scripts de Vendas', isTool: true },
    email_seq: { id: 'email_seq', label: 'E-mail Marketing', icon: Mail, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', description: 'Recuperação de Vendas', isTool: true },
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

  // --- PREPARAÇÃO DO PROMPT DINÂMICO ---
  const getPrompt = () => {
    switch (activeModule) {
      case 'roas_analyzer':
        return `
          CONTEXTO: CFO e Estrategista Sênior de E-commerce.
          PRODUTO ANALISADO: "${roasProductName}"
          DADOS FINANCEIROS:
          - Preço de Venda: R$ ${calcPrice}
          - Custo Produto: R$ ${calcCost}
          - CPA/Ads Estimado: R$ ${calcAds}
          - Impostos: ${calcTax}%
          
          TAREFA: 
          1. Calcule lucro líquido e margem exata.
          2. Analise o MERCADO para "${roasProductName}".
          3. Liste concorrentes reais (Marketplaces, Dropshipping, Grandes Marcas).
          4. Veredito honesto.

          FORMATO JSON:
          {
            "financials": {
              "revenue": "100.00",
              "totalCost": "55.00",
              "netProfit": "45.00",
              "margin": "45%"
            },
            "analysis": {
              "status": "WINNER" | "RISCO MÉDIO" | "NÃO VENDA",
              "marketSaturation": "Alta/Média/Baixa",
              "competition": ["Concorrente A (Preço aprox)", "Concorrente B"],
              "strategyTip": "Dica curta de como se diferenciar",
              "verdict": "Resumo executivo de 2 linhas."
            }
          }
        `;
      
      case 'video_script':
        return `
          CONTEXTO: Roteirista Viral TikTok.
          PRODUTO: "${mainInput}"
          DURAÇÃO: ${videoDuration}
          ESTILO: ${videoStyle}
          TAREFA: Roteiro cena a cena.
          FORMATO JSON: { "title": "Gancho", "scenes": [{ "time": "0-3s", "visual": "...", "audio": "..." }] }
        `;

      case 'studio':
        return `
          CONTEXTO: Fotógrafo Profissional.
          PRODUTO: "${mainInput}"
          ESTILO: ${imageStyle}
          TAREFA: 3 prompts Midjourney/Flux.
          FORMATO JSON: { "concepts": [{ "style": "Nome Estilo", "midjourneyPrompt": "...", "explanation": "..." }] }
        `;

      default:
        return `
          CONTEXTO: Marketing Expert.
          PRODUTO: "${mainInput}"
          TOM: ${tone}
          PLATAFORMA: ${platform}
          TAREFA: Copy AIDA.
          FORMATO JSON: { "headlines": ["..."], "adCopy": "...", "creativeIdeas": ["..."] }
        `;
    }
  };

  // --- GERAÇÃO ---
  const handleGenerate = async () => {
    if (activeModule === 'roas_analyzer') {
        if (!calcPrice || !calcCost || !roasProductName) { setError("Preencha Nome do Produto, Preço e Custo."); return; }
    } else {
        if (!mainInput && !capturedImage) return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key não configurada.");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = getPrompt();
      
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash', 
        contents: contents,
        config: { responseMimeType: 'application/json', temperature: 0.7 }
      });

      const text = response.text;
      if (text) {
        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const first = cleanJson.indexOf('{');
        const last = cleanJson.lastIndexOf('}');
        if (first !== -1 && last !== -1) cleanJson = cleanJson.substring(first, last + 1);
        setResult(JSON.parse(cleanJson));
      } else {
        throw new Error("Sem resposta da IA");
      }
    } catch (err: any) {
      console.error(err);
      setError("Erro ao processar. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  // --- UI: INPUTS (DESIGN ÚNICO POR FERRAMENTA) ---
  
  const RenderInputSection = () => {
    switch(activeModule) {
      // 1. CALCULADORA (ROAS) - VISUAL FINANCEIRO / FINTECH
      case 'roas_analyzer':
        return (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl animate-fade-in relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Calculator size={60} className="text-emerald-500"/></div>
             
             {/* Product Input Critical */}
             <div className="mb-6">
                <label className="text-xs font-bold text-emerald-500 uppercase mb-2 block tracking-wider">Qual Produto você quer analisar?</label>
                <input 
                  type="text" 
                  value={roasProductName} 
                  onChange={e => setRoasProductName(e.target.value)} 
                  placeholder="Ex: Corretor Postural, Garrafa Térmica, Fone Bluetooth..." 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none placeholder-slate-600 transition-all font-medium"
                />
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">Venda (R$)</label>
                   <input type="number" value={calcPrice} onChange={e => setCalcPrice(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none font-mono text-lg font-bold tracking-tight" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">Custo (R$)</label>
                   <input type="number" value={calcCost} onChange={e => setCalcCost(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none font-mono text-lg font-bold tracking-tight" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">CPA/Ads (R$)</label>
                   <input type="number" value={calcAds} onChange={e => setCalcAds(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none font-mono text-lg font-bold tracking-tight" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">Imposto (%)</label>
                   <input type="number" value={calcTax} onChange={e => setCalcTax(e.target.value)} placeholder="10" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none font-mono text-lg font-bold tracking-tight" />
                </div>
             </div>
             <button onClick={handleGenerate} disabled={isGenerating || !calcPrice || !roasProductName} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-white shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <BarChart2 className="w-4 h-4"/>} Analisar Viabilidade
             </button>
          </div>
        );

      // 2. ROTEIRO DE VÍDEO - VISUAL TIMELINE / STUDIO
      case 'video_script':
        return (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl animate-fade-in space-y-5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             
             <div>
                <label className="text-xs font-bold text-cyan-500 uppercase mb-2 block tracking-wider">Tópico do Vídeo</label>
                <div className="relative">
                   <input 
                    type="text" 
                    value={mainInput} 
                    onChange={e => setMainInput(e.target.value)} 
                    placeholder="Ex: Unboxing do Smartwatch X8..." 
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 pl-12 text-white focus:border-cyan-500 focus:outline-none"
                   />
                   <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
                </div>
             </div>
             
             <div className="flex gap-4">
                <div className="flex-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Duração</label>
                   <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {['15s', '30s', '60s'].map(d => (
                        <button key={d} onClick={() => setVideoDuration(d)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${videoDuration === d ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                          {d}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="flex-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Estilo</label>
                   <select value={videoStyle} onChange={e => setVideoStyle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 h-[38px]">
                      <option>Viral/Curiosidade</option>
                      <option>Unboxing ASMR</option>
                      <option>Depoimento (UGC)</option>
                      <option>Polêmico</option>
                   </select>
                </div>
             </div>
             <button onClick={handleGenerate} disabled={isGenerating || !mainInput} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-2">
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Zap className="w-4 h-4"/>} Gerar Roteiro
             </button>
          </div>
        );

      // 3. STUDIO AI - VISUAL GALERIA / CLEAN
      case 'studio':
        return (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl animate-fade-in space-y-4">
              <div className="flex items-start gap-4">
                 <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-pink-500 uppercase mb-2 block tracking-wider">O que vamos fotografar?</label>
                      <textarea
                        value={mainInput} 
                        onChange={e => setMainInput(e.target.value)} 
                        placeholder="Ex: Tênis de corrida preto com detalhes em neon..." 
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-pink-500 focus:outline-none resize-none h-24 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Estilo de Fotografia</label>
                      <select value={imageStyle} onChange={e => setImageStyle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-pink-500">
                        <option>Estúdio Luxuoso (Fundo Infinito)</option>
                        <option>Minimalista/Clean (Apple Style)</option>
                        <option>Natureza/Outdoor (Lifestyle)</option>
                        <option>Neon/Cyberpunk (Gamer)</option>
                        <option>Caseiro (UGC Realista)</option>
                      </select>
                    </div>
                 </div>

                 {/* Camera Module Vertical */}
                 <div className="w-1/3">
                    <div className="border border-dashed border-slate-700 rounded-xl bg-slate-950/50 h-[190px] flex flex-col items-center justify-center relative overflow-hidden group hover:border-pink-500/50 transition-colors">
                        {!showCamera && !capturedImage && (
                          <button onClick={startCamera} className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-pink-400 p-2 transition-colors">
                             <div className="p-3 bg-slate-900 rounded-full border border-slate-800 group-hover:border-pink-500"><Camera size={20}/></div>
                             <span className="text-[10px] font-bold text-center leading-tight">Adicionar Foto<br/>de Referência</span>
                          </button>
                        )}
                        {showCamera && (
                          <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                            <button onClick={captureImage} className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full border-4 border-slate-300 hover:scale-110 transition-transform"></button>
                          </>
                        )}
                        {capturedImage && !showCamera && (
                           <>
                              <img src={capturedImage} className="w-full h-full object-cover" />
                              <button onClick={() => setCapturedImage(null)} className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 hover:bg-red-600"><X size={12}/></button>
                              <div className="absolute bottom-0 w-full bg-pink-600/90 text-white text-[9px] font-bold text-center py-1">IMAGEM CARREGADA</div>
                           </>
                        )}
                    </div>
                 </div>
              </div>

              <button onClick={handleGenerate} disabled={isGenerating || (!mainInput && !capturedImage)} className="w-full py-3 bg-pink-600 hover:bg-pink-500 rounded-xl font-bold text-white shadow-lg shadow-pink-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Sparkles className="w-4 h-4"/>} Gerar Conceitos Visuais
             </button>
          </div>
        );

      // DEFAULT: TEXTO + CAMERA (Generator, Descrição, etc)
      default:
        return (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl animate-fade-in relative">
             <div className="flex gap-3 mb-4">
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                   <span className="text-[10px] text-slate-500 uppercase font-bold">Tom</span>
                   <select value={tone} onChange={e => setTone(e.target.value)} className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"><option>Agressivo</option><option>Amigável</option><option>Profissional</option></select>
                </div>
                <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                   <span className="text-[10px] text-slate-500 uppercase font-bold">Plataforma</span>
                   <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"><option>Facebook Ads</option><option>TikTok Ads</option><option>Google Ads</option></select>
                </div>
             </div>

             <div className="flex gap-4">
                <textarea 
                  value={mainInput} 
                  onChange={e => setMainInput(e.target.value)} 
                  placeholder={modules[activeModule].description}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 min-h-[100px] text-sm resize-none"
                />
                
                <div className="w-32 shrink-0 h-[100px]">
                   {!showCamera && !capturedImage && (
                     <button onClick={startCamera} className="w-full h-full border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-purple-400 hover:bg-slate-800 transition-all gap-1">
                        <Camera size={18}/> <span className="text-[10px] font-bold">Usar Câmera</span>
                     </button>
                   )}
                   {showCamera && (
                     <div className="relative h-full rounded-xl overflow-hidden bg-black">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                        <button onClick={captureImage} className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border-2 border-slate-400"></button>
                     </div>
                   )}
                   {capturedImage && !showCamera && (
                     <div className="relative h-full rounded-xl overflow-hidden border border-purple-500 group">
                        <img src={capturedImage} className="w-full h-full object-cover"/>
                        <button onClick={() => setCapturedImage(null)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                     </div>
                   )}
                </div>
             </div>

             <div className="mt-4 flex justify-end">
                <button onClick={handleGenerate} disabled={isGenerating || (!mainInput && !capturedImage)} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 text-sm">
                   {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Zap className="w-4 h-4"/>} GERAR
                </button>
             </div>
          </div>
        );
    }
  };

  // --- RENDERIZADORES DE RESULTADO (CARD ESPECÍFICOS) ---

  const RenderROASResult = ({ data }: { data: any }) => (
     <div className="animate-fade-in grid md:grid-cols-2 gap-6">
        {/* Card Financeiro */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col">
           <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg"><DollarSign size={20} className="text-emerald-500"/></div>
              <div>
                 <h3 className="text-white font-bold text-sm">Resultado Financeiro</h3>
                 <p className="text-slate-500 text-[10px] uppercase">Baseado nos inputs</p>
              </div>
           </div>
           
           <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-xs font-medium">Faturamento Bruto</span>
                 <span className="text-white font-mono font-bold">R$ {data.financials.revenue}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-slate-400 text-xs font-medium">Custos Totais</span>
                 <span className="text-red-400 font-mono font-bold">-R$ {data.financials.totalCost}</span>
              </div>
              
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mt-4">
                 <div className="flex justify-between items-end mb-1">
                    <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">Lucro Líquido</span>
                    <span className={`font-mono text-2xl font-bold tracking-tighter ${data.financials.netProfit.includes('-') ? 'text-red-500' : 'text-emerald-400'}`}>
                       R$ {data.financials.netProfit}
                    </span>
                 </div>
                 <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${data.financials.netProfit.includes('-') ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: '75%'}}></div>
                 </div>
                 <div className="mt-2 text-right">
                    <span className="text-slate-500 text-[10px] font-bold">Margem Real: </span>
                    <span className="text-white font-mono text-xs">{data.financials.margin}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Card Análise de Mercado */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
           <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Target size={20} className="text-blue-500"/></div>
              <div>
                 <h3 className="text-white font-bold text-sm">Análise de Mercado IA</h3>
                 <p className="text-slate-500 text-[10px] uppercase">Produto: <span className="text-blue-400">{roasProductName}</span></p>
              </div>
           </div>
           
           <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-slate-500 text-[10px] font-bold uppercase">Veredito</span>
                 <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                    data.analysis.status === 'WINNER' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                    data.analysis.status === 'RISCO MÉDIO' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                    'bg-red-500/20 text-red-400 border-red-500/30'
                 }`}>
                    {data.analysis.status}
                 </div>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed italic bg-slate-950 p-3 rounded-lg border border-slate-800">
                 "{data.analysis.verdict}"
              </p>
           </div>

           <div className="space-y-3 mt-auto">
              <div>
                 <span className="text-slate-500 text-[10px] font-bold uppercase block mb-1">Onde tem concorrência?</span>
                 <div className="flex flex-wrap gap-1.5">
                    {data.analysis.competition?.map((c: string, i: number) => (
                       <span key={i} className="bg-slate-800 text-slate-300 px-2 py-1 rounded-md text-[10px] border border-slate-700">{c}</span>
                    ))}
                 </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                  <span className="text-purple-400 text-[10px] font-bold uppercase flex items-center gap-1"><Sparkles size={10}/> Dica de Diferenciação</span>
                  <p className="text-slate-400 text-xs mt-1">{data.analysis.strategyTip}</p>
              </div>
           </div>
        </div>
     </div>
  );

  const RenderVideoResult = ({ data }: { data: any }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-fade-in max-w-3xl mx-auto">
       <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{data.title}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-900">{videoDuration}</span>
               <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{videoStyle}</span>
            </div>
          </div>
          <div className="p-2 bg-cyan-500/10 rounded-lg"><Video className="text-cyan-500" size={20}/></div>
       </div>
       
       <div className="space-y-0 relative pl-4">
          <div className="absolute left-[29px] top-4 bottom-8 w-px bg-slate-800"></div>
          {data.scenes.map((scene: any, idx: number) => (
             <div key={idx} className="relative pl-8 pb-6 last:pb-0 group">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-900 group-hover:border-cyan-500 transition-colors flex items-center justify-center z-10">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/30 transition-colors">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{scene.time}</span>
                      <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider">Visual</span>
                   </div>
                   <p className="text-slate-300 text-xs mb-3 leading-relaxed">{scene.visual}</p>
                   <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/50">
                      <span className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Locução / Áudio</span>
                      <p className="text-white text-sm font-medium italic">"{scene.audio}"</p>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );

  const RenderGenericResult = ({ data }: { data: any }) => (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-slate-300 animate-fade-in">
       {/* Simplificando a visualização de JSONs genéricos ou do Generator */}
       {data.headlines ? (
          <div className="space-y-6">
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-purple-400 font-bold mb-3 uppercase text-xs flex items-center gap-2"><Sparkles size={12}/> Headlines Vencedoras</h3>
                    <div className="space-y-2">{data.headlines.map((h: string, i: number) => <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-white font-bold text-sm hover:border-purple-500 transition-colors cursor-pointer" onClick={() => copyToClipboard(h)}>{h}</div>)}</div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-pink-400 font-bold mb-3 uppercase text-xs flex items-center gap-2"><ImageIcon size={12}/> Sugestão Visual</h3>
                    <div className="space-y-2">{data.creativeIdeas?.map((h: string, i: number) => <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 text-xs">{h}</div>)}</div>
                </div>
             </div>
             <div>
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-white font-bold uppercase text-xs flex items-center gap-2"><MessageSquare size={12}/> Copy Completa</h3>
                   <button onClick={() => copyToClipboard(data.adCopy)} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-white hover:bg-slate-700">COPIAR</button>
                </div>
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap leading-7 font-sans">
                  {data.adCopy}
                </div>
             </div>
          </div>
       ) : (
         // Fallback para Studio e outros que retornam JSON puro
         <div className="space-y-4">
             {data.concepts ? (
                 <div className="grid gap-4">
                    {data.concepts.map((concept: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                           <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-pink-400 text-sm">{concept.style}</span>
                              <button className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-white" onClick={() => copyToClipboard(concept.midjourneyPrompt)}>Copiar Prompt</button>
                           </div>
                           <code className="block bg-black/30 p-3 rounded border border-slate-800/50 text-xs text-slate-400 font-mono mb-2">{concept.midjourneyPrompt}</code>
                           <p className="text-xs text-slate-500 italic">{concept.explanation}</p>
                        </div>
                    ))}
                 </div>
             ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
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
        <div className="h-20 flex items-center px-6 border-b border-slate-900/50">
           <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-lg mr-3 shadow-lg shadow-purple-900/20"><Zap className="w-5 h-5 text-white" /></div>
           <span className="text-lg font-bold text-white tracking-tight">DROPHACKER</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
           {Object.keys(modules).map(key => {
              if (key === 'my_products') return <div key={key} className="mt-4 pt-4 border-t border-slate-900"><button onClick={() => {setActiveModule(key as ModuleId); setResult(null);}} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${activeModule === key ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Package className="w-4 h-4"/> Meus Produtos <span className="ml-auto text-[10px] bg-slate-800 py-0.5 px-2 rounded-full">{savedItems}</span></button></div>;
              if (key === 'settings') return <button key={key} onClick={() => {setActiveModule(key as ModuleId); setResult(null);}} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${activeModule === key ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Settings className="w-4 h-4"/> Minha Conta</button>;
              
              const m = modules[key];
              return (
                 <button key={key} onClick={() => { setActiveModule(key as ModuleId); setResult(null); setIsGenerating(false); setError(null); setCapturedImage(null); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all border border-transparent ${activeModule === key ? 'bg-slate-900 text-white shadow-md border-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-900/50'}`}>
                    <m.icon className={`w-4 h-4 ${activeModule === key ? m.color : 'text-slate-600'}`} /> {m.label}
                 </button>
              );
           })}
        </nav>
        <div className="p-4 border-t border-slate-900 bg-[#020617]"><button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-950/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"><LogOut className="w-4 h-4" /> Sair</button></div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto h-screen w-full bg-slate-950 relative custom-scrollbar">
        <div className="md:hidden h-16 bg-slate-950/80 backdrop-blur border-b border-slate-900 flex items-center justify-between px-4 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-400"><Menu/></button>
          <span className="font-bold text-white text-sm">DROPHACKER</span>
          <div className="w-6"/>
        </div>

        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
          {currentModule.isTool && (
            <div className="mb-6 animate-fade-in flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                    <span className={`p-1.5 rounded-lg ${currentModule.bgColor} border ${currentModule.borderColor}`}><currentModule.icon className={`w-5 h-5 ${currentModule.color}`} /></span>
                    {currentModule.label}
                  </h1>
                </div>
                {/* Micro badge to show 'Active' status */}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900 px-2 py-1 rounded border border-slate-800">Módulo Ativo</span>
            </div>
          )}

          {/* ÁREA DE INPUT CUSTOMIZADA */}
          {currentModule.isTool && <RenderInputSection />}

          {/* CANVAS OCULTO PARA FOTOS */}
          <canvas ref={canvasRef} className="hidden"></canvas>

          {/* RESULTADOS */}
          <div className="mt-8 min-h-[400px]">
             {isGenerating && (
                <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-800 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-purple-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
                  </div>
                  <h3 className="text-white font-bold mt-4 animate-pulse">Processando Inteligência...</h3>
                  <p className="text-slate-500 text-xs">Analisando milhares de dados em tempo real.</p>
                </div>
             )}
             
             {!isGenerating && result && renderResult()}
             
             {!isGenerating && !result && !error && (
                <div className="flex flex-col items-center justify-center h-48 opacity-30 select-none border-2 border-dashed border-slate-800 rounded-2xl">
                   <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-2"><MousePointerClick className="text-white"/></div>
                   <p className="text-sm text-slate-400 font-medium">Aguardando comando...</p>
                </div>
             )}

             {error && (
               <div className="bg-red-950/20 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 animate-shake">
                 <AlertTriangle className="text-red-500" size={20}/>
                 <p className="text-red-300 text-sm font-medium">{error}</p>
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};