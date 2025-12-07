import React from 'react';
import { Header } from './Header';
import { ViewState } from '../types';

interface AboutViewProps {
  onNavigate: (view: ViewState) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header 
        title="Sobre" 
        showBack 
        onBack={() => onNavigate('HOME')} 
        onNavigate={onNavigate}
        currentView="ABOUT"
      />
      
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Sobre a Aplicação</h2>
            
            <div className="text-slate-600 leading-relaxed space-y-4">
              <p>
                O <strong className="text-slate-900">EHOPA AGENT (Alpha)</strong> é um aplicativo destinado a agentes autorizados para registrar o pescado do dia.
              </p>
              <p>
                Ele permite inserir informações sobre espécie, quantidade, preço, condição, provedor e origem, capturar a localização geográfica e enviar os dados para a planilha do sistema.
              </p>
              <p>
                Também gera uma mensagem organizada para WhatsApp, facilitando atualizações rápidas de registros. O app é simples, rápido e pensado para uso móvel em campo.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Versão Alpha • Desenvolvido para EHOPA
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
