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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {renderView()}
      
      {/* Show Bottom Nav only if not in Auth view or Recovery view */}
      {currentView !== 'AUTH' && currentView !== 'RECOVERY' && (
        <BottomNav currentView={currentView} onNavigate={handleNavigate} />
      )}
      
      <UpdateBanner />
    </div>
  );
}