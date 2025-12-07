import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { HistoryRecord, ViewState } from '../types';
import { CalendarClock, Filter, X } from 'lucide-react';

interface HistoryViewProps {
  onNavigate: (view: ViewState) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [filterDate, setFilterDate] = useState<string>('');

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

  const filteredHistory = history.filter(record => {
    if (!filterDate) return true;
    // record.date is stored as DD/MM/YYYY in local storage from RegistrationForm
    const parts = record.date.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Convert to YYYY-MM-DD for comparison with input type="date" value
      const recordIso = `${year}-${month}-${day}`;
      return recordIso === filterDate;
    }
    return false;
  });

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      // Format time as HH:MM
      return new Date(isoString).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header title="Submissões" onNavigate={onNavigate} currentView="HISTORY" />
      
      <main className="flex-1 p-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4 px-1">
          <button onClick={() => onNavigate('FORM')} className="hover:text-blue-600 transition-colors">
            Novo Registo
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Submissões</span>
        </div>

        {/* Filter */}
        <div className="mb-6">
           <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
             <Filter className="w-5 h-5 text-slate-400" />
             <div className="flex-1">
               <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">Filtrar por Data</label>
               <input 
                 type="date" 
                 value={filterDate}
                 onChange={(e) => setFilterDate(e.target.value)}
                 className="w-full text-sm font-medium text-slate-900 outline-none bg-transparent"
               />
             </div>
             {filterDate && (
               <button onClick={() => setFilterDate('')} className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                 <X className="w-4 h-4" />
               </button>
             )}
           </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 opacity-50">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
              <CalendarClock className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <p className="text-slate-900 font-bold">Sem Submissões</p>
              <p className="text-slate-500 text-sm mt-1">
                {filterDate ? 'Nenhum registo nesta data.' : 'Seus envios aparecerão aqui.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
             <div className="min-w-max font-mono text-xs">
                {filteredHistory.map((record, index) => (
                  <div key={index} className="flex items-center gap-3 py-3 border-b border-slate-200 last:border-0 text-slate-600 px-1">
                     <span className="text-slate-400 w-24 shrink-0 font-medium">
                        {record.date.slice(0,5)} <span className="text-slate-500">{formatTime(record.timestamp)}</span>
                     </span>
                     <span className="text-slate-900 font-bold shrink-0">
                        {record.species}
                     </span>
                     <span className="text-slate-300 shrink-0 select-none">|</span>
                     <span className="shrink-0 font-medium text-slate-700">
                        {record.quantity}kg
                     </span>
                     <span className="text-emerald-600 font-bold shrink-0">
                        {record.price} MZN
                     </span>
                     <span className="text-slate-400 shrink-0">
                        ({record.condition})
                     </span>
                     <span className="text-slate-400 shrink-0 italic">
                        @ {record.origin}
                     </span>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};