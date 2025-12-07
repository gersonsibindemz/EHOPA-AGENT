import React from 'react';
import { Header } from './Header';
import { ViewState, ProviderStats } from '../types';
import { Package, Calendar, Snowflake, Sun } from 'lucide-react';

interface StockDetailViewProps {
  onNavigate: (view: ViewState) => void;
  provider: ProviderStats | null;
}

export const StockDetailView: React.FC<StockDetailViewProps> = ({ onNavigate, provider }) => {
  if (!provider) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Data N/D';
    try {
        return new Date(dateStr).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
        return dateStr;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header title="Detalhes do Stock" onNavigate={onNavigate} currentView="STOCK_DETAIL" />
      
      <main className="flex-1 p-4 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-1">
           <button onClick={() => onNavigate('PROVIDER_DETAIL')} className="hover:text-blue-600 transition-colors">
            {provider.name}
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Stock</span>
        </div>

        {/* Overview Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Package className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900">Stock Disponível</h2>
                </div>
            </div>
            
            <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-slate-900 tracking-tight">{provider.stockRemainingKg}</span>
                <span className="text-lg font-bold text-slate-400 mb-1.5">kg</span>
            </div>
            
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min((provider.stockRemainingKg / provider.totalKg) * 100, 100)}%` }}></div>
            </div>
            <div className="mt-2 text-xs text-slate-500 font-medium flex justify-between">
                <span>{((provider.stockRemainingKg / provider.totalKg) * 100).toFixed(1)}% do total submetido</span>
                <span>Total: {provider.totalKg} kg</span>
            </div>
        </div>

        {/* Species List */}
        <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 px-1">Espécies Disponíveis</h3>
            
            {(!provider.speciesStock || provider.speciesStock.length === 0) ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <p className="text-slate-400 font-medium text-sm">Nenhum stock registado.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {provider.speciesStock.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {item.condition === 'Congelado' ? (
                                            <Snowflake className="w-3 h-3 text-cyan-500" />
                                        ) : (
                                            <Sun className="w-3 h-3 text-orange-500" />
                                        )}
                                        <span className={`text-xs font-medium ${item.condition === 'Congelado' ? 'text-cyan-700' : 'text-orange-700'}`}>
                                            {item.condition || 'N/D'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xl font-black text-slate-900">{item.quantityKg} <span className="text-sm text-slate-400">kg</span></span>
                                </div>
                            </div>
                            
                            <div className="pt-3 border-t border-slate-50 flex items-center text-slate-500 text-xs font-medium">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                Capturado em: <span className="text-slate-700 ml-1">{formatDate(item.date)}</span>
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