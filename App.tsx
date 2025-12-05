import React, { useState } from 'react';
import { HomeView } from './components/HomeView';
import { RegistrationForm } from './components/RegistrationForm';
import { HistoryView } from './components/HistoryView';
import { ViewState } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return (
          <HomeView 
            onOpenForm={() => setCurrentView('FORM')} 
            onOpenHistory={() => setCurrentView('HISTORY')}
          />
        );
      case 'FORM':
        return (
          <RegistrationForm 
            onClose={() => setCurrentView('HOME')} 
            onOpenHistory={() => setCurrentView('HISTORY')}
          />
        );
      case 'HISTORY':
        return (
          <HistoryView 
            onBack={() => setCurrentView('HOME')} 
          />
        );
      default:
        return <HomeView onOpenForm={() => setCurrentView('FORM')} onOpenHistory={() => setCurrentView('HISTORY')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-200">
      {renderView()}
    </div>
  );
}