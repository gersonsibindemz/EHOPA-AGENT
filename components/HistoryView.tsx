import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { HistoryRecord } from '../types';
import { AlertCircle } from 'lucide-react';

interface HistoryViewProps {
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ehopa_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header title="Histórico" showBack onBack={onBack} />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="w-full md:max-w-md md:mx-auto">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Registos Locais ({history.length})</h2>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-60">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">Nenhum registo encontrado no dispositivo.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {history.map((record, index) => (
                <div key={index} className="py-3 cursor-default text-xs sm:text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                     <span className="font-bold text-slate-900 truncate">{record.species}</span>
                     <span className="text-slate-400 whitespace-nowrap text-[10px]">{record.date}</span>
                  </div>
                  <div className="text-slate-600 mt-1 truncate font-mono">
                    {record.quantity}kg • {record.price}MT • {record.condition} • {record.origin}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};