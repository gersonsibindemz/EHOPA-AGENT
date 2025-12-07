import React, { useState } from 'react';
import { RegistrationForm } from './components/RegistrationForm';
import { HistoryView } from './components/HistoryView';
import { HelpView } from './components/HelpView';
import { AuthView } from './components/AuthView';
import { RecoveryView } from './components/RecoveryView';
import { RevenueView } from './components/RevenueView';
import { ProviderDetailView } from './components/ProviderDetailView';
import { FinancialDetailView } from './components/FinancialDetailView';
import { StockDetailView } from './components/StockDetailView';
import { DeliveryLogView } from './components/DeliveryLogView';
import { ProfileView } from './components/ProfileView';
import { UpdateBanner } from './components/UpdateBanner';
import { BottomNav } from './components/BottomNav';
import { ViewState, ProviderStats } from './types';
import { Smartphone, Tablet } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('FORM');
  const [selectedProvider, setSelectedProvider] = useState<ProviderStats | null>(null);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProvider = (provider: ProviderStats) => {
    setSelectedProvider(provider);
    handleNavigate('PROVIDER_DETAIL');
  };

  const renderView = () => {
    switch (currentView) {
      case 'FORM':
        return <RegistrationForm onNavigate={handleNavigate} />;
      case 'HISTORY':
        return <HistoryView onNavigate={handleNavigate} />;
      case 'HELP':
        return <HelpView onNavigate={handleNavigate} />;
      case 'AUTH':
        return <AuthView onNavigate={handleNavigate} />;
      case 'RECOVERY':
        return <RecoveryView onNavigate={handleNavigate} />;
      case 'REVENUE':
        return <RevenueView onNavigate={handleNavigate} onSelectProvider={handleSelectProvider} />;
      case 'PROVIDER_DETAIL':
        return <ProviderDetailView onNavigate={handleNavigate} provider={selectedProvider} />;
      case 'FINANCIAL_DETAIL':
        return <FinancialDetailView onNavigate={handleNavigate} provider={selectedProvider} />;
      case 'STOCK_DETAIL':
        return <StockDetailView onNavigate={handleNavigate} provider={selectedProvider} />;
      case 'DELIVERY_LOG':
        return <DeliveryLogView onNavigate={handleNavigate} provider={selectedProvider} />;
      case 'PROFILE':
        return <ProfileView onNavigate={handleNavigate} />;
      default:
        return <RegistrationForm onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {/* Main App - Visible only on Mobile/Tablet (< 1024px) */}
      <div className="lg:hidden min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        {renderView()}
        
        {/* Show Bottom Nav only if not in Auth view or Recovery view */}
        {currentView !== 'AUTH' && currentView !== 'RECOVERY' && (
          <BottomNav currentView={currentView} onNavigate={handleNavigate} />
        )}
        
        <UpdateBanner />
      </div>

      {/* Desktop Block Message - Visible only on Laptop+ (>= 1024px) */}
      <div className="hidden lg:flex min-h-screen bg-slate-900 items-center justify-center p-8 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
           <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-md w-full text-center space-y-8 relative z-10">
          <div className="relative w-32 h-32 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/50 mb-8 border-4 border-slate-800">
             <img 
              src="https://i.postimg.cc/bNBDGq5Q/ehopa-agent-logo.png" 
              alt="Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Apenas Móvel & Tablet
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              O <span className="text-white font-bold">EHOPA AGENT</span> foi otimizado para uso exclusivo em campo através de dispositivos móveis.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-center gap-6 text-slate-400 mb-4">
              <div className="flex flex-col items-center gap-2">
                <Smartphone className="w-8 h-8 text-blue-400" />
                <span className="text-xs font-bold uppercase">Telemóvel</span>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="flex flex-col items-center gap-2">
                <Tablet className="w-8 h-8 text-blue-400" />
                <span className="text-xs font-bold uppercase">Tablet</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm font-medium border-t border-white/10 pt-4">
              Por favor, aceda através de um dispositivo compatível para continuar.
            </p>
          </div>
          
          <div className="pt-8 flex justify-center gap-2 opacity-30">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
          </div>
        </div>
      </div>
    </>
  );
}