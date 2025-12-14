import React, { useState } from 'react';
import { Header } from './Header';
import { ViewState, ProviderStats } from '../types';
import { ChevronRight, ChevronDown, MapPin, User, TrendingUp, Package, Snowflake, Sun, ExternalLink } from 'lucide-react';

interface ProviderDetailViewProps {
  onNavigate: (view: ViewState) => void;
  provider: ProviderStats | null;
}

const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children?: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
      >
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{title}</h3>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-slate-50 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export const ProviderDetailView: React.FC<ProviderDetailViewProps> = ({ onNavigate, provider }) => {
  if (!provider) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header title="Detalhes do Provedor" onNavigate={onNavigate} currentView="PROVIDER_DETAIL" />
      
      <main className="flex-1 p-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6 px-1">
          <button onClick={() => onNavigate('FORM')} className="hover:text-blue-600 transition-colors">
            Início
          </button>
          <span className="text-slate-300">/</span>
          <button onClick={() => onNavigate('REVENUE')} className="hover:text-blue-600 transition-colors">
            Receita
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 truncate max-w-[100px]">{provider.name}</span>
        </div>

        <div className="space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-10">
               <User className="w-32 h-32" />
             </div>
             
             <div className="relative z-10">
               <h2 className="text-2xl font-black text-slate-900 mb-1">{provider.name} {provider.surname}</h2>
               <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                 <MapPin className="w-4 h-4" />
                 {provider.praia}, {provider.district}
               </div>

               <div className="space-y-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                     <span className="text-slate-500">Idade / Género:</span>
                     <span className="font-medium">{provider.age} anos / {provider.gender}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-500">Província:</span>
                     <span className="font-medium">{provider.province}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-500">Endereço:</span>
                     <span className="font-medium text-right max-w-[60%]">{provider.address}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-slate-500">Contacto:</span>
                     <a href={`tel:${provider.contact}`} className="font-medium text-blue-600">{provider.contact}</a>
                  </div>
               </div>
             </div>
          </div>

          {/* Sales Progress Dashboard */}
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 px-1">Progresso de Vendas</h3>
            <div className="grid grid-cols-2 gap-3">
               
               {/* Total Sales Card - Clickable */}
               <button 
                  onClick={() => onNavigate('FINANCIAL_DETAIL')}
                  className="col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden group hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer text-left"
               >
                  <div className="absolute right-4 top-4 opacity-50 bg-white/20 p-1.5 rounded-full group-hover:bg-white/30 transition-colors">
                     <ExternalLink className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 mb-2 opacity-80">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Vendas Totais</span>
                  </div>
                  <div className="text-3xl font-black font-rounded">
                    {provider.totalSoldMt.toLocaleString('pt-PT')} <span className="text-lg font-medium opacity-70">MZN</span>
                  </div>
                  <div className="mt-2 text-xs opacity-60 flex items-center justify-between">
                    <span>Acumulado de todas as submissões vendidas</span>
                    <span className="font-bold bg-white/20 px-2 py-1 rounded text-[10px] group-hover:bg-white/30 transition-colors">Ver Detalhes</span>
                  </div>
               </button>

               {/* Stock Card - Clickable */}
               <button 
                  onClick={() => onNavigate('STOCK_DETAIL')}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-left group hover:border-blue-200 active:scale-[0.98] transition-all relative overflow-hidden"
               >
                  <div className="absolute top-2 right-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Disponibilidade
                    </div>
                    <div className="text-xl font-black text-slate-900">{provider.stockRemainingKg} <span className="text-sm font-medium text-slate-500">kg</span></div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-orange-400 h-full rounded-full" style={{ width: `${(provider.stockRemainingKg / provider.totalKg) * 100}%` }}></div>
                  </div>
               </button>

               {/* Total Volume Card - NOW CLICKABLE */}
               <button 
                  onClick={() => onNavigate('DELIVERY_LOG')}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-left group hover:border-blue-200 active:scale-[0.98] transition-all relative overflow-hidden"
               >
                  <div className="absolute top-2 right-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Entregas
                    </div>
                    <div className="text-xl font-black text-slate-900">{provider.totalKg} <span className="text-sm font-medium text-slate-500">kg</span></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-2 font-medium bg-slate-50 rounded px-1.5 py-0.5 inline-block">
                    {provider.totalSubmitted} entregas
                  </div>
               </button>
            </div>
          </div>

          {/* Species Stock Breakdown - Retractable */}
          {provider.speciesStock && provider.speciesStock.length > 0 && (
            <CollapsibleSection title="Espécies em Stock">
                <div className="space-y-3 pt-2">
                  {provider.speciesStock.map((item, index) => (
                    <div key={index} className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700 text-sm">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{item.quantityKg} <span className="text-xs text-slate-400 font-normal">kg</span></span>
                    </div>
                  ))}
                </div>
            </CollapsibleSection>
          )}

          {/* Condition Breakdown - Retractable */}
          <CollapsibleSection title="Condição do Stock">
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                         <Snowflake className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="font-bold text-slate-900">Congelado</div>
                         <div className="text-xs text-slate-500">Armazenado a baixa temp.</div>
                      </div>
                   </div>
                   <div className="text-lg font-black text-slate-900">{provider.stockFrozenKg} kg</div>
                </div>

                <div className="border-t border-slate-50"></div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                         <Sun className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="font-bold text-slate-900">Fresco</div>
                         <div className="text-xs text-slate-500">Captura recente</div>
                      </div>
                   </div>
                   <div className="text-lg font-black text-slate-900">{provider.stockFreshKg} kg</div>
                </div>
             </div>
          </CollapsibleSection>

        </div>
      </main>
    </div>
  );
};