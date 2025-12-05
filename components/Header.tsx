import React, { useState } from 'react';
import { ArrowLeft, CircleHelp, X } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center px-4 justify-between shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          {showBack ? (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-2" /> /* Spacer to align title if needed */
          )}
          <h1 className={`text-xl font-black text-slate-900 tracking-tight font-rounded ${!showBack ? '-ml-2' : ''}`}>
            {title}
          </h1>
        </div>

        <button 
          onClick={() => setShowInfo(true)}
          className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Sobre o App"
        >
          <CircleHelp className="w-6 h-6" />
        </button>
      </header>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowInfo(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Sobre</h3>
                <button 
                  onClick={() => setShowInfo(false)}
                  className="p-1 -mr-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-sm text-slate-600 leading-relaxed space-y-4">
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
            </div>
            
            {/* Footer removed as requested */}
          </div>
        </div>
      )}
    </>
  );
};