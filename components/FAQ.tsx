import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-slate-800">
    <button 
      onClick={onClick}
      className="w-full py-6 flex items-center justify-between gap-4 text-left group focus:outline-none"
    >
      <span className={`text-lg font-semibold transition-colors ${isOpen ? 'text-purple-400' : 'text-white group-hover:text-purple-300'}`}>
        {question}
      </span>
      <div className={`shrink-0 p-1 rounded-full border transition-all duration-300 ${isOpen ? 'border-purple-500 bg-purple-500/10 rotate-180' : 'border-slate-700 bg-slate-800'}`}>
        {isOpen ? (
           <Minus className="w-5 h-5 text-purple-500" />
        ) : (
           <Plus className="w-5 h-5 text-slate-400 group-hover:text-white" />
        )}
      </div>
    </button>
    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]'}`}>
      <div className="overflow-hidden">
        <p className="text-slate-400 leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  </div>
);

export const FAQ: React.FC = () => {
  // Alterado de useState(0) para useState(null) para iniciar fechado
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const questions = [
    {
      q: "As imagens têm direitos autorais?",
      a: "Não! Ao gerar uma imagem na plataforma, a propriedade intelectual é 100% sua. Você pode usar em anúncios, lojas, redes sociais ou até revender sem pagar royalties."
    },
    {
      q: "Funciona para qualquer nicho?",
      a: "Absolutamente. Nossa IA foi treinada com milhões de produtos vencedores, desde eletrônicos e gadgets até moda, beleza, artigos para casa e pet shop."
    },
    {
      q: "Posso cancelar quando quiser?",
      a: "Sim. Não acreditamos em fidelidade forçada. Você pode cancelar sua assinatura a qualquer momento com um único clique no painel de controle, sem perguntas e sem burocracia."
    },
    {
      q: "Preciso saber design ou photoshop?",
      a: "Zero. Essa é a beleza da nossa ferramenta. Ela substitui a necessidade de um designer profissional. Você apenas descreve o que quer ou sobe a foto do produto, e a mágica acontece."
    },
    {
      q: "Existe alguma garantia?",
      a: "Sim, oferecemos uma garantia incondicional de 7 dias. Se você testar e achar que não vale o investimento, devolvemos 100% do seu dinheiro."
    },
    {
      q: "Quais são as formas de pagamento?",
      a: "Aceitamos Cartão de Crédito (em até 12x), PIX e Boleto Bancário. O acesso é liberado imediatamente após a aprovação (no caso de PIX e Cartão)."
    },
    {
      q: "Consigo exportar as imagens em alta qualidade?",
      a: "Sim! Todas as imagens são geradas em alta resolução (até 4K no plano Pro), perfeitas para telas de retina e impressão se necessário."
    }
  ];

  return (
    <section className="py-24 bg-slate-900/30" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="reveal text-3xl md:text-4xl font-bold text-center mb-4">Perguntas Frequentes</h2>
        <p className="reveal delay-100 text-slate-400 text-center mb-12">Tire suas dúvidas e comece a vender hoje.</p>
        
        <div className="reveal delay-200 space-y-2">
          {questions.map((item, index) => (
            <FAQItem 
              key={index}
              question={item.q}
              answer={item.a}
              isOpen={openIndex === index}
              onClick={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};