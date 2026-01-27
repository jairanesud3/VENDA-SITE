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
  AlertTriangle,
  Video,
  Mail,
  Search,
  Users,
  Calculator,
  Target,
  Megaphone,
  TrendingUp,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface DashboardProps {
  onLogout: () => void;
}

// Definição dos Módulos do Sistema
type ModuleId = 
  | 'generator' 
  | 'video_script' 
  | 'product_desc' 
  | 'email_seq' 
  | 'persona' 
  | 'objections' 
  | 'competitor' 
  | 'naming' 
  | 'upsell' 
  | 'roas_analyzer'
  | 'my_products'
  | 'settings';

interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: any;
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

  // Configuração de todas as ferramentas
  const modules: Record<string, ModuleConfig> = {
    generator: {
      id: 'generator',
      label: 'Gerador de Criativos',
      icon: Sparkles,
      description: 'Crie headlines, copys de anúncios e prompts de imagem.',
      placeholder: 'Ex: Corretor Postural, Tênis de Corrida...',
      promptTemplate: (input) => `
        Atue como um copywriter de resposta direta. Crie uma campanha para: "${input}".
        Retorne APENAS um JSON válido com esta estrutura, sem markdown:
        {
          "type": "campaign",
          "headlines": ["Headline Curta 1", "Headline Curta 2", "Headline Curta 3"],
          "adCopy": "Texto persuasivo para Facebook Ads usando framework AIDA.",
          "imagePrompts": ["Descrição visual detalhada 1", "Descrição visual detalhada 2"]
        }`
    },
    video_script: {
      id: 'video_script',
      label: 'Roteiros Virais (TikTok)',
      icon: Video,
      description: 'Scripts de vídeo curtos focados em retenção e conversão.',
      placeholder: 'Ex: Escova Alisadora 3 em 1...',
      promptTemplate: (input) => `
        Crie um roteiro viral para TikTok/Reels vendendo: "${input}".
        Use o formato: Hook (3s), Problema, Solução, Prova Social e CTA.
        Retorne em formato de texto estruturado/Markdown.`
    },
    product_desc: {
      id: 'product_desc',
      label: 'Descrição SEO (Shopify)',
      icon: Search,
      description: 'Descrições de produto otimizadas para ranquear no Google.',
      placeholder: 'Ex: Fone de Ouvido Bluetooth Pro...',
      promptTemplate: (input) => `
        Escreva uma descrição de produto para E-commerce (Shopify/Nuvemshop) para: "${input}".
        Inclua: Título SEO, Parágrafo de dor/prazer, Bullet points de benefícios técnicos e FAQ (3 perguntas).
        Use Markdown.`
    },
    email_seq: {
      id: 'email_seq',
      label: 'E-mail Marketing',
      icon: Mail,
      description: 'Sequência de recuperação de carrinho e boas-vindas.',
      placeholder: 'Ex: Kit de Ferramentas...',
      promptTemplate: (input) => `
        Escreva uma sequência de 3 e-mails para recuperação de carrinho abandonado para o produto: "${input}".
        E-mail 1: Lembrete amigável.
        E-mail 2: Escassez/Benefício.
        E-mail 3: Oferta final/Cupom.
        Use Markdown.`
    },
    persona: {
      id: 'persona',
      label: 'Gerador de Persona',
      icon: Users,
      description: 'Descubra quem é seu comprador ideal e suas dores.',
      placeholder: 'Ex: Cinta Modeladora...',
      promptTemplate: (input) => `
        Crie uma análise de Persona detalhada para quem compraria: "${input}".
        Inclua: Idade, Gênero, Interesses, Principais Dores, Principais Desejos e Objeções de compra.
        Use Markdown.`
    },
    objections: {
      id: 'objections',
      label: 'Quebra de Objeções',
      icon: ShieldAlert,
      description: 'Respostas prontas para matar dúvidas no WhatsApp.',
      placeholder: 'Ex: Smartwatch Ultra 9...',
      promptTemplate: (input) => `
        Liste as 5 principais objeções de compra para "${input}" e escreva um script de resposta persuasiva para cada uma (focado em conversão no WhatsApp).
        Use Markdown.`
    },
    competitor: {
      id: 'competitor',
      label: 'Espião de ngulos',
      icon: Target,
      description: 'Encontre ângulos de venda que seus concorrentes ignoram.',
      placeholder: 'Ex: Massageador de Pescoço...',
      promptTemplate: (input) => `
        Atue como um estrategista de mercado. Para o produto "${input}", liste 3 ângulos de marketing únicos e pouco explorados pelos concorrentes.
        Para cada ângulo, sugira uma Hook (Gancho) de anúncio.
        Use Markdown.`
    },
    naming: {
      id: 'naming',
      label: 'Gerador de Nomes',
      icon: Megaphone,
      description: 'Crie nomes de marca e branding para seu produto.',
      placeholder: 'Ex: Garrafa Térmica Inteligente...',
      promptTemplate: (input) => `
        Crie 10 sugestões de nomes de marca criativos e disponíveis (provavelmente) para vender: "${input}".
        Divida em: Nomes Curtos, Nomes Compostos e Nomes Abstratos.
        Use Markdown.`
    },
    upsell: {
      id: 'upsell',
      label: 'Ideias de Upsell',
      icon: TrendingUp,
      description: 'Aumente seu Ticket Médio com ofertas complementares.',
      placeholder: 'Ex: Tênis Ortopédico...',
      promptTemplate: (input) => `
        Para o produto principal "${input}", sugira 3 opções de Order Bump (no checkout) e 2 opções de Upsell (pós-compra) que façam sentido lógico.
        Explique por que o cliente compraria.
        Use Markdown.`
    },
    roas_analyzer: {
      id: 'roas_analyzer',
      label: 'Estrategista de ROAS',
      icon: Calculator,
      description: 'IA analisa seus números e sugere o que fazer.',
      placeholder: 'Ex: Gastei R$100, Voltou R$150. CPC R$2,00...',
      promptTemplate: (input) => `
        Atue como um gestor de tráfego sênior. Analise estes dados brutos: "${input}".
        Diga se a campanha está boa ou ruim, e dê 3 ações práticas para otimizar o lucro agora.
        Use Markdown.`
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
      
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = config.promptTemplate(inputValue);
        
        // Seleciona o modelo adequado (Flash é mais rápido para tarefas simples, Pro para complexas)
        const modelName = 'gemini-2.5-flash-latest';

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        const text = response.text;
        
        if (text) {
          // Tenta parsear JSON se for o módulo gerador, senão usa texto puro
          if (activeModule === 'generator') {
            try {
              // Limpeza básica para garantir JSON válido caso a IA coloque blocos de código
              const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
              setResult(JSON.parse(cleanText));
            } catch (e) {
              // Fallback se o JSON falhar, mostra como texto
              setResult({ rawText: text });
            }
          } else {
            setResult({ rawText: text });
          }
        }
      } else {
        // MOCK DATA PARA DEMONSTRAÇÃO (Caso sem chave)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (activeModule === 'generator') {
          setResult({
            type: 'campaign',
            headlines: [
              `O Segredo do ${inputValue} revelado`,
              `Por que todos estão comprando ${inputValue}?`,
              `Não compre ${inputValue} antes de ler isso`
            ],
            adCopy: `Texto simulado de alta conversão para ${inputValue}...\n\nBenefícios...\nChamada para ação...`,
            imagePrompts: [`Foto de ${inputValue} em uso`, `Close do ${inputValue}`]
          });
        } else {
          setResult({
             rawText: `## Resultado Simulado para ${config.label}\n\nComo você não configurou a API Key, este é um texto de exemplo.\n\n* **Ponto 1**: Estratégia para ${inputValue}\n* **Ponto 2**: Ação recomendada\n\nConfigure a variável de ambiente para ver a mágica real da IA.`
          });
        }
      }

    } catch (err) {
      console.error(err);
      setError("A IA estava sobrecarregada ou houve um erro de conexão. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    // Renderização condicional baseada no tipo de resposta
    if (!result) return null;

    if (result.type === 'campaign') {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Headlines</h3>
               {result.headlines?.map((h: string, i: number) => (
                 <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-white">{h}</div>
               ))}
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mt-6">Ad Copy</h3>
               <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 whitespace-pre-wrap">{result.adCopy}</div>
            </div>
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Prompts de Imagem</h3>
               {result.imagePrompts?.map((p: string, i: number) => (
                 <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-sm italic">"{p}"</div>
               ))}
               <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg text-purple-200 text-sm">
                 💡 Dica: Use estes prompts no Midjourney ou Leonardo.ai.
               </div>
            </div>
          </div>
        </div>
      );
    }

    // Renderização genérica para Markdown/Texto (Outras ferramentas)
    return (
      <div className="animate-fade-in bg-slate-950 p-6 rounded-xl border border-slate-800">
        <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-a:text-purple-400">
           <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{result.rawText}</pre>
        </div>
      </div>
    );
  };

  const currentModule = modules[activeModule] || modules['generator'];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-purple-600/20 rounded border border-purple-500/30">
                <Zap className="w-5 h-5 text-purple-400" />
             </div>
             <span className="text-lg font-bold text-white tracking-tight">DROPHACKER</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2">Ferramentas AI</div>
          {Object.values(modules).map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => {
                  setActiveModule(module.id as ModuleId);
                  setResult(null);
                  setInputValue('');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeModule === module.id 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {module.label}
              </button>
            );
          })}
          
          <div className="my-4 border-t border-slate-800 mx-2"></div>
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Conta</div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-all">
            <Package className="w-4 h-4" />
            Meus Produtos
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-all">
            <Settings className="w-4 h-4" />
            Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg text-sm font-medium transition-all"
           >
             <LogOut className="w-4 h-4" />
             Sair
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative w-full">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-400">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-white">DROPHACKER</span>
          <div className="w-6" /> {/* Spacer */}
        </div>

        <div className="max-w-5xl mx-auto p-6 md:p-10 pb-20">
          
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                 <currentModule.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{currentModule.label}</h1>
            </div>
            <p className="text-slate-400 ml-1">{currentModule.description}</p>
          </div>

          <div className="grid lg:grid-cols-1 gap-8">
            
            {/* Input Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {activeModule === 'roas_analyzer' ? 'Dados da Campanha' : 'Nome do Produto / Contexto'}
              </label>
              <div className="relative">
                {activeModule === 'roas_analyzer' || activeModule === 'video_script' || activeModule === 'email_seq' ? (
                   <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentModule.placeholder}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                   />
                ) : (
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentModule.placeholder}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                )}
                <div className="absolute right-4 top-4 text-slate-600">
                   <currentModule.icon className="w-5 h-5" />
                </div>
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={!inputValue || isGenerating}
                className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                  !inputValue || isGenerating 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 transform hover:-translate-y-1'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-white/20" />
                    Gerar {currentModule.label.split(' ')[0]}
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-200">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Output Section */}
            {result && (
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <Zap className="w-5 h-5 text-yellow-500" /> Resultado Gerado
                   </h2>
                   <button 
                    onClick={() => {
                        const text = result.rawText || JSON.stringify(result, null, 2);
                        navigator.clipboard.writeText(text);
                        alert("Copiado!");
                    }}
                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                   >
                     <Copy className="w-3 h-3" /> Copiar Tudo
                   </button>
                 </div>
                 {renderContent()}
               </div>
            )}

            {/* Empty State */}
            {!result && !isGenerating && !error && (
              <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
                 <currentModule.icon className="w-16 h-16 text-slate-500 mb-4" />
                 <p className="text-slate-400 text-lg font-medium">Aguardando comando...</p>
                 <p className="text-slate-600 text-sm">Preencha o campo acima para iniciar.</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};