import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  Sparkles, 
  Copy, 
  Image as ImageIcon, 
  Zap, 
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  onLogout: () => void;
}

interface GeneratedContent {
  headlines: string[];
  adCopy: string;
  imagePrompts: string[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [productName, setProductName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<'copy' | 'images'>('copy');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // ---------------------------------------------------------
      // GEMINI API INTEGRATION
      // ---------------------------------------------------------
      // Note: In a real production app, never expose keys in client code.
      // This implementation uses the key from environment variables.
      // If the key is missing (common in demos), it falls back to a mock response.
      
      const apiKey = process.env.API_KEY;
      
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `
          You are a world-class direct response copywriter. 
          Create a marketing campaign for a product named: "${productName}".
          
          Return ONLY a JSON object with this structure:
          {
            "headlines": ["Headline 1", "Headline 2", "Headline 3"],
            "adCopy": "A high-converting facebook ad body text using AIDA framework.",
            "imagePrompts": ["Description of a high converting image 1", "Description of image 2"]
          }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-latest',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text;
        if (text) {
          setResult(JSON.parse(text));
        }
      } else {
        // FALLBACK MOCK FOR DEMO (If API Key is not set in Vercel)
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate thinking
        setResult({
          headlines: [
            `Pare de sofrer com ${productName} de baixa qualidade`,
            `O segredo do ${productName} que viralizou no TikTok`,
            `Transforme sua rotina com o novo ${productName}`
          ],
          adCopy: `🔥 ATENÇÃO: O Estoque Está Acabando!\n\nVocê já se imaginou usando um ${productName} que realmente entrega o que promete?\n\nChega de gastar dinheiro com soluções que não funcionam. Apresentamos a tecnologia definitiva que vai mudar seu dia a dia.\n\n✅ Durabilidade Extrema\n✅ Design Premium\n✅ Garantia de Satisfação\n\n👇 Clique em "Saiba Mais" e garanta o seu com 50% OFF e Frete Grátis hoje!`,
          imagePrompts: [
            `Foto realista de ${productName} em uma mesa de madeira moderna, iluminação suave de estúdio, 4k`,
            `Pessoa sorrindo usando ${productName} em um ambiente lifestyle, luz natural, alta resolução`,
            `Close-up detalhado da textura do ${productName}, fundo desfocado, estilo cinemático`
          ]
        });
        setError("Modo Demo: Adicione sua API Key para resultados reais com IA.");
      }

    } catch (err) {
      console.error(err);
      setError("Erro ao gerar. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-purple-600/20 rounded border border-purple-500/30">
                <Zap className="w-5 h-5 text-purple-400" />
             </div>
             <span className="text-lg font-bold text-white tracking-tight">DROPHACKER</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-900/20 transition-all">
            <Sparkles className="w-5 h-5" />
            Gerador AI
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-all">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-all">
            <Package className="w-5 h-5" />
            Meus Produtos
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-all">
            <Settings className="w-5 h-5" />
            Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl font-medium transition-all"
           >
             <LogOut className="w-5 h-5" />
             Sair
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
          <span className="font-bold text-white">DROPHACKER.AI</span>
          <button onClick={onLogout}><LogOut className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="max-w-5xl mx-auto p-6 md:p-12">
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Novo Criativo</h1>
            <p className="text-slate-400">Gere copys virais e imagens para seu produto em segundos.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Produto</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Corretor Postural Premium, Smartwatch Ultra..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  <Package className="absolute right-4 top-4 text-slate-600 w-5 h-5" />
                </div>
                
                <button 
                  onClick={handleGenerate}
                  disabled={!productName || isGenerating}
                  className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                    !productName || isGenerating 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 transform hover:-translate-y-1'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Hackeando o Algoritmo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 fill-white/20" />
                      Gerar Campanha
                    </>
                  )}
                </button>
              </div>

              {/* Status/Tips */}
              {!result && !isGenerating && (
                <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center text-center text-slate-500">
                  <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                  <p>Seus resultados aparecerão aqui.</p>
                  <p className="text-sm opacity-60">A IA analisa 1M+ de anúncios vencedores.</p>
                </div>
              )}
            </div>

            {/* Output Section */}
            <div className="relative">
               {isGenerating && (
                 <div className="absolute inset-0 z-10 bg-slate-950/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                   <div className="text-center">
                     <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="text-purple-300 font-medium animate-pulse">Escrevendo Copy...</p>
                   </div>
                 </div>
               )}

               {result && (
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-fade-in">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-800">
                      <button 
                        onClick={() => setActiveTab('copy')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'copy' ? 'text-purple-400 bg-slate-800/50 border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'}`}
                      >
                        <Copy className="w-4 h-4" />
                        Texto & Headlines
                      </button>
                      <button 
                        onClick={() => setActiveTab('images')}
                        className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'images' ? 'text-purple-400 bg-slate-800/50 border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'}`}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Ideias de Imagem
                      </button>
                    </div>

                    <div className="p-6">
                      {error && (
                        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-yellow-200 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          {error}
                        </div>
                      )}

                      {activeTab === 'copy' ? (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Headlines Vencedoras</h3>
                            <div className="space-y-2">
                              {result.headlines.map((head, i) => (
                                <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-white font-medium hover:border-purple-500/50 transition-colors cursor-copy group relative">
                                  {head}
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs">Copiar</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Facebook Ad Body</h3>
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {result.adCopy}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Prompts para Gerador de Imagem</h3>
                          {result.imagePrompts.map((prompt, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                              <div className="shrink-0 w-8 h-8 bg-purple-900/30 rounded-full flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">
                                {i + 1}
                              </div>
                              <p className="text-slate-300 text-sm italic">"{prompt}"</p>
                            </div>
                          ))}
                          <div className="mt-4 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
                            <p className="flex items-center gap-2 mb-1 font-bold"><Sparkles className="w-3 h-3"/> Dica Pro:</p>
                            Copie estes prompts e cole no Midjourney ou Leonardo.ai para resultados fotográficos.
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
               )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};