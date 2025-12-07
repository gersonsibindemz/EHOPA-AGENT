import React, { useState } from 'react';
import { Header } from './Header';
import { ViewState, ProviderStats, TransactionRecord } from '../types';
import { TrendingUp, TrendingDown, Wallet, Filter, Calendar, ArrowUpRight, ArrowDownLeft, Banknote, Smartphone, Building2 } from 'lucide-react';

interface FinancialDetailViewProps {
  onNavigate: (view: ViewState) => void;
  provider: ProviderStats | null;
}

// Helper to generate mock transactions
const generateMockTransactions = (provider: ProviderStats): TransactionRecord[] => {
  const transactions: TransactionRecord[] = [];
  const baseDate = new Date();
  
  // Generate some withdrawals (Debits)
  transactions.push({
    id: 'tx-001',
    type: 'DEBIT',
    amount: provider.withdrawalApprovedMt * 0.4,
    date: new Date(baseDate.setDate(baseDate.getDate() - 2)).toISOString().split('T')[0],
    time: '14:30',
    description: 'Levantamento Aprovado',
    method: 'M-Pesa',
    accountNumber: provider.contact,
    status: 'COMPLETED'
  });

  transactions.push({
    id: 'tx-002',
    type: 'DEBIT',
    amount: provider.withdrawalApprovedMt * 0.6,
    date: new Date(baseDate.setDate(baseDate.getDate() - 5)).toISOString().split('T')[0],
    time: '09:15',
    description: 'Levantamento Aprovado',
    method: 'Bank Transfer',
    accountNumber: 'MZ...9921',
    status: 'COMPLETED'
  });

  // Pending withdrawal
  if (provider.withdrawalRequestedMt > 0) {
    transactions.push({
      id: 'tx-003',
      type: 'DEBIT',
      amount: provider.withdrawalRequestedMt,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      description: 'Solicitação de Levantamento',
      method: 'e-Mola',
      accountNumber: provider.contact,
      status: 'PENDING'
    });
  }

  // Generate some Sales (Credits)
  transactions.push({
    id: 'tx-004',
    type: 'CREDIT',
    amount: 15000,
    date: new Date(baseDate.setDate(baseDate.getDate() - 1)).toISOString().split('T')[0],
    time: '16:45',
    description: 'Venda: Pargo (50kg)',
    status: 'COMPLETED'
  });

  transactions.push({
    id: 'tx-005',
    type: 'CREDIT',
    amount: 25000,
    date: new Date(baseDate.setDate(baseDate.getDate() - 2)).toISOString().split('T')[0],
    time: '11:20',
    description: 'Venda: Lagosta (20kg)',
    status: 'COMPLETED'
  });

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const FinancialDetailView: React.FC<FinancialDetailViewProps> = ({ onNavigate, provider }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [dateFilter, setDateFilter] = useState('');

  if (!provider) return null;

  const transactions = generateMockTransactions(provider);
  const remainingBalance = provider.totalSoldMt - provider.withdrawalApprovedMt;

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (dateFilter && t.date !== dateFilter) return false;
    return true;
  });

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'M-Pesa':
      case 'e-Mola':
      case 'mKesh':
        return <Smartphone className="w-4 h-4" />;
      case 'Bank Transfer':
        return <Building2 className="w-4 h-4" />;
      case 'Cash':
        return <Banknote className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header title="Estado Financeiro" onNavigate={onNavigate} currentView="FINANCIAL_DETAIL" />
      
      <main className="flex-1 p-4 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-1">
           <button onClick={() => onNavigate('PROVIDER_DETAIL')} className="hover:text-blue-600 transition-colors">
            {provider.name}
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Financeiro</span>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <Wallet className="w-40 h-40" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Wallet className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Saldo Disponível</span>
            </div>
            <div className="text-4xl font-black font-rounded mb-4">
              {remainingBalance.toLocaleString('pt-PT')} <span className="text-xl font-medium opacity-70">MZN</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
               <div>
                  <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Total Ganho</div>
                  <div className="font-bold text-lg flex items-center gap-1 text-green-400">
                     <TrendingUp className="w-3 h-3" />
                     {provider.totalSoldMt.toLocaleString('pt-PT')}
                  </div>
               </div>
               <div>
                  <div className="text-[10px] uppercase font-bold opacity-60 mb-1">Total Retirado</div>
                  <div className="font-bold text-lg flex items-center gap-1 text-orange-400">
                     <TrendingDown className="w-3 h-3" />
                     {provider.withdrawalApprovedMt.toLocaleString('pt-PT')}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
           <div className="flex items-center gap-2 px-1">
              <Filter className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Filtrar Transações</h3>
           </div>
           <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                 {(['ALL', 'CREDIT', 'DEBIT'] as const).map(type => (
                   <button
                     key={type}
                     onClick={() => setFilterType(type)}
                     className={`flex-1 px-4 py-2 rounded-md text-xs font-bold transition-all ${
                       filterType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                     }`}
                   >
                     {type === 'ALL' ? 'Tudo' : type === 'CREDIT' ? 'Entradas' : 'Saídas'}
                   </button>
                 ))}
              </div>
              <div className="relative flex-1">
                 <input 
                   type="date"
                   value={dateFilter}
                   onChange={(e) => setDateFilter(e.target.value)}
                   className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-slate-900"
                 />
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
           </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
           {filteredTransactions.map((tx) => (
             <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                         tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                         {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                         <div className="font-bold text-slate-900 text-sm">{tx.description}</div>
                         <div className="text-xs text-slate-500">{tx.date} às {tx.time}</div>
                      </div>
                   </div>
                   <div className={`text-right font-black font-mono ${
                      tx.type === 'CREDIT' ? 'text-green-600' : 'text-slate-900'
                   }`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString('pt-PT')}
                      <span className="text-xs font-medium text-slate-400 ml-1">MZN</span>
                   </div>
                </div>

                {tx.type === 'DEBIT' && (
                   <div className="pt-3 border-t border-slate-50 grid grid-cols-2 gap-4 text-xs">
                      <div>
                         <span className="text-slate-400 font-bold uppercase block mb-0.5">Método</span>
                         <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            {getMethodIcon(tx.method)}
                            {tx.method}
                         </div>
                      </div>
                      <div>
                         <span className="text-slate-400 font-bold uppercase block mb-0.5">Conta / Ref</span>
                         <div className="font-mono text-slate-700">{tx.accountNumber}</div>
                      </div>
                      <div className="col-span-2 mt-1">
                         <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                            tx.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 
                            tx.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                         }`}>
                            {tx.status === 'COMPLETED' ? 'Concluído' : tx.status === 'PENDING' ? 'Pendente' : 'Falhou'}
                         </span>
                      </div>
                   </div>
                )}
             </div>
           ))}
           
           {filteredTransactions.length === 0 && (
              <div className="text-center py-10 opacity-50">
                 <p className="text-sm font-medium text-slate-500">Nenhuma transação encontrada.</p>
              </div>
           )}
        </div>

      </main>
    </div>
  );
};