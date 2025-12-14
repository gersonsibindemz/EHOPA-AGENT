import React, { useState, useEffect } from 'react';
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
import { Sidebar } from './components/Sidebar';
import { OnboardingTour } from './components/OnboardingTour';
import { Button } from './components/Button';
import { ViewState, ProviderStats } from './types';
import { UserCircle2 } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [profoundLoading, setProfoundLoading] = useState<boolean>(true); // For initial load
  const [currentView, setCurrentView] = useState<ViewState>('AUTH');
  const [selectedProvider, setSelectedProvider] = useState<ProviderStats | null>(null);
  
  // Tour state
  const [showTour, setShowTour] = useState(false);
  const [showProfileAdvice, setShowProfileAdvice] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const storedProfile = localStorage.getItem('ehopa_user_profile');
    if (storedProfile) {
      setIsAuthenticated(true);
      setCurrentView('FORM');
    } else {
      setIsAuthenticated(false);
      setCurrentView('AUTH');
    }
    setProfoundLoading(false);
  }, []);

  // Check for tour eligibility whenever authentication status changes to true
  useEffect(() => {
    if (isAuthenticated) {
      const tourCompleted = localStorage.getItem('ehopa_tour_completed');
      if (!tourCompleted) {
        // Preload image before showing tour
        const imgUrl = "https://i.postimg.cc/BZg50YML/Grey-Black-Pink-80s-Aesthetic-Minimalist-Simple-Trending-New-Collection-Ins-20251214-004005-0000.png";
        const img = new Image();
        let timeoutId: ReturnType<typeof setTimeout>;

        const show = () => {
           setShowTour(true);
           if (timeoutId) clearTimeout(timeoutId);
        };

        img.onload = show;
        img.onerror = show; // Show anyway if error
        img.src = imgUrl;

        // Fallback if image loading hangs
        timeoutId = setTimeout(show, 4000);

        return () => {
           if (timeoutId) clearTimeout(timeoutId);
           img.onload = null;
           img.onerror = null;
        };
      }
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('FORM');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('ehopa_user_profile');
    setIsAuthenticated(false);
    setCurrentView('AUTH');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProvider = (provider: ProviderStats) => {
    setSelectedProvider(provider);
    handleNavigate('PROVIDER_DETAIL');
  };
  
  const handleTourComplete = () => {
    localStorage.setItem('ehopa_tour_completed', 'true');
    setShowTour(false);
    // Show advice after tour closes
    setTimeout(() => setShowProfileAdvice(true), 500);
  };

  const handleGoToProfile = () => {
    setShowProfileAdvice(false);
    handleNavigate('PROFILE');
  };

  const renderView = () => {
    // Force Auth view if not authenticated, unless accessing Recovery
    if (!isAuthenticated) {
       if (currentView === 'RECOVERY') {
         return <RecoveryView onNavigate={handleNavigate} />;
       }
       return <AuthView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
    }

    switch (currentView) {
      case 'FORM':
        return <RegistrationForm onNavigate={handleNavigate} />;
      case 'HISTORY':
        return <HistoryView onNavigate={handleNavigate} />;
      case 'HELP':
        return <HelpView onNavigate={handleNavigate} />;
      // Auth/Recovery handled above or in specific flow cases
      case 'AUTH': 
         return <AuthView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
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
        return <ProfileView onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return <RegistrationForm onNavigate={handleNavigate} />;
    }
  };

  if (profoundLoading) return null; // Or a splash screen

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 flex">
      
      {/* Desktop Sidebar - Hidden on mobile */}
      {isAuthenticated && (
        <div className="hidden lg:block w-64 shrink-0">
           <Sidebar currentView={currentView} onNavigate={handleNavigate} onLogout={handleLogout} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* On desktop, constrain the max-width to simulate the mobile app feel but cleaner */}
        <div className="mx-auto w-full lg:max-w-3xl lg:mt-8 lg:mb-8 lg:bg-white lg:shadow-xl lg:rounded-3xl lg:overflow-hidden lg:min-h-[calc(100vh-4rem)] lg:border lg:border-slate-200">
           {renderView()}
        </div>
      </div>
      
      {/* Bottom Nav - Hidden on Desktop (handled via CSS in BottomNav component) */}
      {isAuthenticated && (
        <BottomNav currentView={currentView} onNavigate={handleNavigate} />
      )}
      
      {isAuthenticated && <UpdateBanner />}
      
      {/* Onboarding Tour Overlay */}
      {showTour && isAuthenticated && (
        <OnboardingTour onComplete={handleTourComplete} onSkip={handleTourComplete} />
      )}

      {/* Profile Update Advice Modal */}
      {showProfileAdvice && isAuthenticated && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600 mx-auto">
                 <UserCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 text-center mb-2">Atualize seu Perfil</h3>
              <p className="text-sm text-slate-500 text-center leading-relaxed mb-6">
                 Para garantir que recebe e partilha informações locais reais e precisas, por favor reserve um momento para atualizar os seus dados de agente.
              </p>
              <div className="space-y-3">
                 <Button onClick={handleGoToProfile} fullWidth className="h-12 shadow-lg shadow-blue-900/10">
                    Ir para o Perfil
                 </Button>
                 <button onClick={() => setShowProfileAdvice(false)} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 py-2 transition-colors">
                    Fazer isso mais tarde
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}