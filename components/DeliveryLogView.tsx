import React, { useState } from 'react';
import { Header } from './Header';
import { ViewState, ProviderStats } from '../types';
import { Calendar, Package, CheckCircle2, Clock, Truck, ChevronDown, Filter, MapPin, Building2, Banknote, CreditCard, Wallet } from 'lucide-react';

interface DeliveryLogViewProps {
  onNavigate: (view: ViewState) => void;
  provider: ProviderStats | null;
}

type PaymentStatus = 'FULL' | 'PARTIAL' | 'CREDIT';
type PaymentTiming = 'ON_DELIVERY' | 'PREPAID' | null;
type PaymentMethod = 'CASH' | 'EMOLA' | 'MPESA' | 'MKESH' | 'BANK_TRANSFER' | null;

interface DeliveryLogItem {
    id: string;
    date: string;
    species: string;
    quantity: number;
    amount: number;
    batchId: string;
    clientName: string;
    location: string;
    
    paymentStatus: PaymentStatus;
    paymentTiming: PaymentTiming;
    paymentMethod: PaymentMethod;
    paymentDate: string | null;
}

// Mock Data for Deliveries based on provider stats
const generateMockDeliveries = (provider: ProviderStats): DeliveryLogItem[] => {
  const deliveries: DeliveryLogItem[] = [];
  const speciesList = ['Pargo', 'Garoupa', 'Serra', 'Lagosta', 'Camarão', 'Magumba'];
  const clients = ['Restaurante Marítimo', 'Hotel Polana', 'Mercado Central', 'Peixaria do Zé', 'Restaurante Zambi', 'Casa de Peixe', 'Supermercado Spar', 'Peixaria Oceano'];
  const locations = ['Maputo, Costa do Sol', 'Maputo, Polana Cimento', 'Maputo, Baixa', 'Matola, Malhampsene', 'Maputo, Sommerschield', 'Maputo, Triunfo', 'Matola, Rio', 'Maputo, Museu'];
  
  const methods: PaymentMethod[] = ['CASH', 'EMOLA', 'MPESA', 'MKESH', 'BANK_TRANSFER'];
  
  // Create entries to roughly match totalSubmitted
  for (let i = 0; i < provider.totalSubmitted; i++) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - (i * 3)); // Spread dates back in time
    const dateStr = dateObj.toISOString().split('T')[0];
    
    // Determine payment status randomly but skewed towards paid for older items
    let status: PaymentStatus = 'FULL';
    const rand = Math.random();
    if (i < 2) { // recent ones might be credit or partial
        if (rand > 0.6) status = 'CREDIT';
        else if (rand > 0.3) status = 'PARTIAL';
    } else {
        if (rand > 0.9) status = 'CREDIT'; // rare old debts
        else if (rand > 0.8) status = 'PARTIAL';
    }

    let timing: PaymentTiming = null;
    let method: PaymentMethod = null;
    let payDate: string | null = null;

    if (status !== 'CREDIT') {
        timing = Math.random() > 0.4 ? 'ON_DELIVERY' : 'PREPAID';
        method = methods[Math.floor(Math.random() * methods.length)];
        
        // Payment date logic
        if (timing === 'PREPAID') {
             const pd = new Date(dateObj);
             pd.setDate(pd.getDate() - 2);
             payDate = pd.toISOString().split('T')[0];
        } else {
             payDate = dateStr;
        }
    }

    deliveries.push({
      id: `del-${i}`,
      date: dateStr,
      species: speciesList[i % speciesList.length],
      quantity: Math.floor(Math.random() * 50) + 10,
      amount: Math.floor(Math.random() * 5000) + 2000,
      batchId: `BATCH-${1000 + i}`,
      clientName: clients[i % clients.length],
      location: locations[i % locations.length],
      paymentStatus: status,
      paymentTiming: timing,
      paymentMethod: method,
      paymentDate: payDate
    });
  }
  return deliveries;
};

export const DeliveryLogView: React.FC<DeliveryLogViewProps> = ({ onNavigate, provider }) => {
  if (!provider) return null;

  const [deliveries] = useState(generateMockDeliveries(provider));
  const [filter, setFilter] = useState<'ALL' | 'FULL' | 'PARTIAL' | 'CREDIT'>('ALL');

  const filteredDeliveries = deliveries.filter(d => {
    if (filter === 'ALL') return true;
    return d.paymentStatus === filter;
  });

  const getStatusLabel = (status: PaymentStatus) => {
      switch (status) {
          case 'FULL': return 'Total Pago';
          case 'PARTIAL': return 'Pago Parcial';
          case 'CREDIT': return 'Adquirido a Crédito';
      }
  };
  
  const getStatusColor = (status: PaymentStatus) => {
      switch (status) {
          case 'FULL': return 'text-green-700 bg-green-50 border-green-100';
          case 'PARTIAL': return 'text-amber-700 bg-amber-50 border-amber-100';
          case 'CREDIT': return 'text-blue-700 bg-blue-50 border-blue-100';
      }
  };

  const getMethodLabel = (method: PaymentMethod) => {
      switch (method) {
          case 'CASH': return 'Numerário';
          case 'EMOLA': return 'e-Mola';
          case 'MPESA': return 'M-Pesa';
          case 'MKESH': return 'mKesh';
          case 'BANK_TRANSFER': return 'Transferência Bancária';
          default: return '';
      }
  };

  const getTimingLabel = (timing: PaymentTiming) => {
      if (timing === 'ON_DELIVERY') return 'No acto da entrega';
      if (timing === 'PREPAID') return 'Pago antecipadamente';
      return '';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header title="Registo de Entregas" onNavigate={onNavigate} currentView="DELIVERY_LOG" />
      
      <main className="flex-1 p-4 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-1">
           <button onClick={() => onNavigate('PROVIDER_DETAIL')} className="hover:text-blue-600 transition-colors">
            {provider.name}
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Entregas</span>
        </div>

        {/* Summary Card - Truck Removed */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total de Entregas</h2>
                    <div className="text-2xl font-black text-slate-900">
                        {provider.totalKg} <span className="text-sm font-bold text-slate-400">kg</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg inline-block">
                    {provider.totalSubmitted} Lotes
                </div>
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 px-1">
            {(['ALL', 'FULL', 'PARTIAL', 'CREDIT'] as const).map(type => (
                <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                        filter === type 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                >
                    {type === 'ALL' ? 'Todas' : getStatusLabel(type)}
                </button>
            ))}
        </div>

        {/* List */}
        <div className="space-y-3">
            {filteredDeliveries.length === 0 ? (
                <div className="text-center py-10 opacity-50">
                    <p className="text-sm">Nenhuma entrega encontrada.</p>
                </div>
            ) : (
                filteredDeliveries.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                        {/* Status Strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            item.paymentStatus === 'FULL' ? 'bg-green-500' : 
                            item.paymentStatus === 'PARTIAL' ? 'bg-amber-400' : 'bg-blue-500'
                        }`}></div>
                        
                        <div className="flex justify-between items-start pl-2 mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-bold text-slate-900 text-lg">{item.species}</h3>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 rounded">{item.batchId}</span>
                                </div>
                                
                                <div className="space-y-1">
                                   <div className="flex items-start gap-2">
                                      <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                      <span className="text-sm font-bold text-slate-700">{item.clientName}</span>
                                   </div>
                                   <div className="flex items-start gap-2">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                      <span className="text-xs text-slate-500">{item.location}</span>
                                   </div>
                                   <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Calendar className="w-3.5 h-3.5" /> 
                                        <span>Entregue em: {item.date}</span>
                                   </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-black text-slate-900">{item.quantity} kg</span>
                                <span className="text-xs font-bold text-slate-500">{item.amount.toLocaleString('pt-PT')} MZN</span>
                            </div>
                        </div>

                        {/* Payment Details Section */}
                        <div className="mt-3 pt-3 border-t border-slate-50 pl-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${getStatusColor(item.paymentStatus)}`}>
                                    {getStatusLabel(item.paymentStatus)}
                                </span>
                                {item.paymentDate && (
                                    <span className="text-[10px] font-medium text-slate-400">
                                        Pago em: {item.paymentDate}
                                    </span>
                                )}
                            </div>

                            {(item.paymentStatus === 'FULL' || item.paymentStatus === 'PARTIAL') && (
                                <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600 flex flex-col gap-1">
                                   <div className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="font-medium">{getTimingLabel(item.paymentTiming)}</span>
                                   </div>
                                   <div className="flex items-center gap-1.5">
                                      <Wallet className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Via <span className="font-bold text-slate-700">{getMethodLabel(item.paymentMethod)}</span></span>
                                   </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>

      </main>
    </div>
  );
};