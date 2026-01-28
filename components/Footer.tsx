'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

// Modal Interno para Termos e Privacidade
const LegalModal = ({ title, content, isOpen, onClose }: { title: string, content: React.ReactNode, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    // Z-INDEX AUMENTADO PARA 1000 PARA COBRIR O CHAT
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-float">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto text-slate-300 text-sm leading-relaxed space-y-4 custom-scrollbar">
          {content}
        </div>
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  const termsContent = (
    <>
      <p><strong>1. Aceitação dos Termos</strong><br/>Ao acessar e usar o DROPHACKER.AI, você concorda em cumprir estes termos de serviço e todas as leis aplicáveis.</p>
      <p><strong>2. Uso da Licença</strong><br/>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site DROPHACKER.AI, apenas para visualização transitória pessoal e não comercial.</p>
      <p><strong>3. Isenção de Responsabilidade</strong><br/>Os materiais no site da DROPHACKER.AI são fornecidos 'como estão'. DROPHACKER.AI não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias.</p>
      <p><strong>4. Limitações</strong><br/>Em nenhum caso o DROPHACKER.AI ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em DROPHACKER.AI.</p>
    </>
  );

  const privacyContent = (
    <>
      <p><strong>1. Coleta de Dados</strong><br/>A sua privacidade é importante para nós. É política do DROPHACKER.AI respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site DROPHACKER.AI.</p>
      <p><strong>2. Uso de Dados</strong><br/>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.</p>
      <p><strong>3. Retenção de Dados</strong><br/>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos.</p>
      <p><strong>4. Compartilhamento</strong><br/>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.</p>
    </>
  );

  return (
    <>
      <footer className="py-12 bg-slate-950 border-t border-slate-900 text-center relative z-10 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">
            © 2026 DROPHACKER.AI. Todos os direitos reservados.
          </p>
          
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveModal('terms')}
              className="text-slate-500 hover:text-purple-400 text-sm transition-colors cursor-pointer hover:underline"
            >
              Termos de Uso
            </button>
            <button 
              onClick={() => setActiveModal('privacy')}
              className="text-slate-500 hover:text-purple-400 text-sm transition-colors cursor-pointer hover:underline"
            >
              Privacidade
            </button>
          </div>
        </div>
      </footer>

      <LegalModal 
        isOpen={activeModal === 'terms'} 
        onClose={() => setActiveModal(null)}
        title="Termos de Uso"
        content={termsContent}
      />
      
      <LegalModal 
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)}
        title="Política de Privacidade"
        content={privacyContent}
      />
    </>
  );
};