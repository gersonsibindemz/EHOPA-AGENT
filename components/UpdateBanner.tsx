import React from 'react';
import { X, RefreshCw, ArrowUpCircle } from 'lucide-react';
import { useCheckForUpdates } from '../hooks/useCheckForUpdates';

export const UpdateBanner: React.FC = () => {
  const { hasUpdate, dismissUpdate } = useCheckForUpdates();

  if (!hasUpdate) return null;

  const handleRefresh = () => {
    dismissUpdate(); // Save the new hash
    window.location.reload(); // Reload to fetch new assets
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in slide-in-from-bottom duration-500 fade-in">
      <div className="bg-slate-900/95 backdrop-blur shadow-2xl shadow-slate-900/20 text-white p-4 rounded-2xl flex items-center justify-between gap-3 border border-slate-700/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 animate-pulse">
            <ArrowUpCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold truncate">Nova versão disponível</p>
            <p className="text-xs text-slate-300 truncate">Atualize para obter melhorias.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
           <button 
            onClick={dismissUpdate}
            className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-white/10 rounded-full"
            aria-label="Ignorar"
          >
            <X className="w-5 h-5" />
          </button>
          <button 
            onClick={handleRefresh}
            className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-transform active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
};
