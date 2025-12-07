import React, { useState } from 'react';
import { Header } from './Header';
import { ViewState } from '../types';
import { ChevronRight, MessageCircle } from 'lucide-react';

interface HelpViewProps {
  onNavigate: (view: ViewState) => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onNavigate }) => {
  const faqs = [
    { q: "Como registar um novo pescado?", a: "Aceda ao menu 'Novo Registo', preencha os dados obrigatórios e a localização, e clique em Submeter." },
    { q: "É necessário internet?", a: "Sim, é necessária uma conexão ativa para carregar provedores e enviar dados." },
    { q: "Como corrigir um erro?", a: "Atualmente não é possível editar um envio. Contacte o suporte para correções." },
    { q: "A localização é obrigatória?", a: "Sim, para validar a origem do pescado, a geolocalização é mandatória." },
    { q: "O que fazer se o provedor não estiver na lista?", a: "Contacte o gestor para adicionar o novo provedor à base de dados." },
    { q: "Posso enviar fotos?", a: "Sim, pode adicionar até 5 fotos por registo." },
    { q: "Como ver meus registos anteriores?", a: "Aceda à aba 'Submissões' no menu inferior." },
    { q: "O app funciona em tablets?", a: "Sim, o layout é adaptado para telemóveis e tablets." },
    { q: "Como recuperar minha senha?", a: "Deverá contactar imediatamente a equipe de suporte para redefinição." },
    { q: "Quem vê os dados registados?", a: "Apenas a equipa de gestão e clientes autorizados da EHOPA." }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header title="Ajuda" onNavigate={onNavigate} currentView="HELP" />
      
      <main className="flex-1 p-4 space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-1">
          <button onClick={() => onNavigate('FORM')} className="hover:text-blue-600 transition-colors">
            Novo Registo
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Ajuda</span>
        </div>
        
        {/* App Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-2">EHOPA AGENT</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Plataforma móvel para registo de capturas diárias de pescado. 
            Desenvolvido para agilizar o processo de catalogação e venda.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">Versão Alpha 1.0</span>
          </div>
        </div>

        {/* Support Contact */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <h3 className="text-base font-bold text-blue-900 mb-3">Precisa de Suporte?</h3>
          <p className="text-sm text-blue-800 mb-4">
            Contacte o Gestor de Informação para reportar erros ou dúvidas.
          </p>
          <div className="space-y-3">
            <a 
              href={`https://wa.me/258874542394?text=${encodeURIComponent('Sou Agente Ehopa e preciso obter suporte.')}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-3 text-sm font-medium text-blue-700 bg-white p-3 rounded-xl shadow-sm hover:bg-blue-100 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Contactar Suporte WhatsApp
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Perguntas Frequentes</h3>
          <div className="space-y-2">
            {faqs.map((item, i) => (
              <details key={i} className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
                  <span className="text-sm font-medium text-slate-800">{item.q}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-slate-600 bg-white leading-relaxed border-t border-slate-50 mt-2 pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};