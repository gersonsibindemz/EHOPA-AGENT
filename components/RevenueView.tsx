import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { ViewState, ProviderStats, HistoryRecord } from '../types';
import { ChevronRight, Home, Users, TrendingUp, Package, Search, Info, CalendarRange } from 'lucide-react';

interface RevenueViewProps {
  onNavigate: (view: ViewState) => void;
  onSelectProvider: (provider: ProviderStats) => void;
}

// Mock Data Generation
const MOCK_PROVIDERS: ProviderStats[] = [
  { 
    id: '1', 
    name: 'João', 
    surname: 'Matusse', 
    address: 'Bairro dos Pescadores, Casa 12', 
    contact: '+258 84 123 4567', 
    province: 'Maputo', 
    district: 'Marracuene', 
    praia: 'Macaneta', 
    age: 45, 
    gender: 'M', 
    totalSubmitted: 12, 
    totalKg: 450.5, 
    totalSoldMt: 125000, 
    stockRemainingKg: 120, 
    stockFreshKg: 80, 
    stockFrozenKg: 40, 
    status: 'Active', 
    withdrawalRequestedMt: 5000, 
    withdrawalApprovedMt: 80000,
    speciesStock: [
      { name: 'Pargo', quantityKg: 50, condition: 'Fresco', date: '2023-10-25' },
      { name: 'Garoupa', quantityKg: 30, condition: 'Fresco', date: '2023-10-26' },
      { name: 'Serra', quantityKg: 40, condition: 'Congelado', date: '2023-10-20' }
    ]
  },
  { 
    id: '2', 
    name: 'Maria', 
    surname: 'Langa', 
    address: 'Zona Verde, Quarteirão 4', 
    contact: '+258 82 987 6543', 
    province: 'Maputo', 
    district: 'KaTembe', 
    praia: 'Ponta d\'Ouro', 
    age: 38, 
    gender: 'F', 
    totalSubmitted: 8, 
    totalKg: 320.0, 
    totalSoldMt: 89000, 
    stockRemainingKg: 50, 
    stockFreshKg: 10, 
    stockFrozenKg: 40, 
    status: 'Active', 
    withdrawalRequestedMt: 0, 
    withdrawalApprovedMt: 45000,
    speciesStock: [
      { name: 'Lagosta', quantityKg: 10, condition: 'Fresco', date: '2023-10-27' },
      { name: 'Camarão Tigre', quantityKg: 40, condition: 'Congelado', date: '2023-10-22' }
    ]
  },
  { 
    id: '3', 
    name: 'Pedro', 
    surname: 'Sitoe', 
    address: 'Vila de Inhaca', 
    contact: '+258 86 111 2222', 
    province: 'Maputo', 
    district: 'Ilha de Inhaca', 
    praia: 'Inhaca', 
    age: 52, 
    gender: 'M', 
    totalSubmitted: 15, 
    totalKg: 600.2, 
    totalSoldMt: 180500, 
    stockRemainingKg: 0, 
    stockFreshKg: 0, 
    stockFrozenKg: 0, 
    status: 'Active', 
    withdrawalRequestedMt: 20000, 
    withdrawalApprovedMt: 150000,
    speciesStock: []
  },
  { 
    id: '4', 
    name: 'Ana', 
    surname: 'Cossa', 
    address: 'Costa do Sol', 
    contact: '+258 85 555 4444', 
    province: 'Maputo', 
    district: 'Maputo Cidade', 
    praia: 'Costa do Sol', 
    age: 29, 
    gender: 'F', 
    totalSubmitted: 5, 
    totalKg: 150.0, 
    totalSoldMt: 42000, 
    stockRemainingKg: 150, 
    stockFreshKg: 150, 
    stockFrozenKg: 0, 
    status: 'Inactive', 
    withdrawalRequestedMt: 0, 
    withdrawalApprovedMt: 10000,
    speciesStock: [
      { name: 'Magumba', quantityKg: 100, condition: 'Fresco', date: '2023-10-26' },
      { name: 'Carapau', quantityKg: 50, condition: 'Fresco', date: '2023-10-27' }
    ]
  },
];

export const RevenueView: React.FC<RevenueViewProps> = ({ onNavigate, onSelectProvider }) => {
  const [searchText, setSearchText] = useState('');
  const [displayedProviders, setDisplayedProviders] = useState<ProviderStats[]>(MOCK_PROVIDERS);
  const [weeklyEstimate, setWeeklyEstimate] = useState<number>(0);

  useEffect(() => {
    // Calculate weekly estimate from local history
    const calculateWeeklyRevenue = () => {
      try {
        const stored = localStorage.getItem('ehopa_history');
        if (!stored) return;
        
        const history: HistoryRecord[] = JSON.parse(stored);
        if (!Array.isArray(history)) return;

        const now = new Date();
        const startOfWeek = new Date(now);
        // Assume Monday is start of week
        const day = startOfWeek.getDay(); // 0=Sun, 1=Mon, etc.
        // If Sunday (0), go back 6 days to Monday. If Mon (1), go back 0 days.
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const total = history.reduce((acc, record) => {
          // Parse timestamp or fallback to date string if timestamp missing
          let recordDate: Date;
          if (record.timestamp) {
             recordDate = new Date(record.timestamp);
          } else {
             // Fallback for DD/MM/YYYY
             const parts = record.date.split('/');
             if (parts.length === 3) {
                 const [d, m, y] = parts;
                 recordDate = new Date(`${y}-${m}-${d}`);
             } else {
                 return acc;
             }
          }

          if (recordDate >= startOfWeek) {
             // Values stored with commas, need dots for float parsing
             const cleanQty = record.quantity.toString().replace(/,/g, '.');
             const cleanPrice = record.price.toString().replace(/,/g, '.');
             
             const q = parseFloat(cleanQty);
             const p = parseFloat(cleanPrice);
             
             if (!isNaN(q) && !isNaN(p)) {
               return acc + (q * p);
             }
          }
          return acc;
        }, 0);

        setWeeklyEstimate(total);
      } catch (e) {
        console.error("Revenue calculation error", e);
      }
    };
    
    calculateWeeklyRevenue();
  }, []);

  const handleSearch = () => {
    const query = searchText.toLowerCase().trim();
    if (!query) {
       setDisplayedProviders(MOCK_PROVIDERS);
       return;
    }
    const filtered = MOCK_PROVIDERS.filter(p => 
       p.name.toLowerCase().includes(query) || 
       p.surname.toLowerCase().includes(query)
    );
    setDisplayedProviders(filtered);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header title="Receita" onNavigate={onNavigate} currentView="REVENUE" />
      
      <main className="flex-1 p-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6 px-1">
          <button onClick={() => onNavigate('FORM')} className="hover:text-blue-600 transition-colors">
            Início
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Receita</span>
        </div>

        <div className="space-y-4">
          
          {/* Weekly Revenue Card - Clickable Link to Submissions */}
          <button 
            onClick={() => onNavigate('HISTORY')}
            className="w-full text-left bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-900/10 relative overflow-hidden group hover:scale-[1.02] transition-transform active:scale-[0.98]"
          >
             <div className="absolute -right-6 -bottom-6 opacity-10">
                <TrendingUp className="w-32 h-32" />
             </div>
             
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-2 text-indigo-100">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Estimativa Semanal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
               </div>
               
               <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black font-rounded tracking-tight">
                   {weeklyEstimate.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </span>
                 <span className="text-lg font-medium opacity-70">MZN</span>
               </div>
               
               <p className="text-[10px] text-indigo-200 mt-2 font-medium max-w-[85%] leading-relaxed">
                  Total acumulado dos registos de "Pescado do Dia" nesta semana (desde Segunda-feira).
               </p>
             </div>
          </button>

          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex gap-3 items-center">
             <Info className="w-5 h-5 text-blue-600 shrink-0" />
             <p className="text-xs text-blue-800 font-medium">
               Nenhuma transação é realizada diretamente nesta plataforma.
             </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Pesquisar provedor..." 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-900"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="px-5 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors active:scale-95 shadow-sm"
            >
              Pesquisar
            </button>
          </div>

          <div className="flex items-center justify-between px-1 pt-2">
             <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <Users className="w-5 h-5 text-blue-600" />
               Provedores
             </h2>
             <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{displayedProviders.length} Total</span>
          </div>

          <div className="grid gap-3">
            {displayedProviders.length > 0 ? (
              displayedProviders.map((provider) => (
                <button 
                  key={provider.id}
                  onClick={() => onSelectProvider(provider)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-[0.98] transition-all hover:border-blue-200 group text-left w-full"
                >
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{provider.name} {provider.surname}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{provider.praia} • {provider.district}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-slate-50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                        <TrendingUp className="w-3 h-3" /> Vendas
                      </div>
                      <p className="text-sm font-bold text-green-600">{provider.totalSoldMt.toLocaleString('pt-PT')} MZN</p>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                        <Package className="w-3 h-3" /> Stock
                      </div>
                      <p className="text-sm font-bold text-slate-700">{provider.stockRemainingKg} kg</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                       <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                       <p className="text-sm font-bold text-slate-900">{provider.totalKg} kg</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-100 border-dashed">
                <p className="text-slate-500 text-sm">Nenhum provedor encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};