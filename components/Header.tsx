import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center px-4 justify-between shadow-sm">
      <div className="flex items-center gap-3 w-full">
        {showBack ? (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-2" /> /* Spacer to align title if needed, or remove for left align */
        )}
        <h1 className={`text-xl font-black text-slate-900 tracking-tight font-rounded ${!showBack ? '-ml-2' : ''}`}>
          {title}
        </h1>
      </div>
    </header>
  );
};