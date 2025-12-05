import React, { useState } from 'react';
import { HomeView } from './components/HomeView';
import { RegistrationForm } from './components/RegistrationForm';
import { ViewState } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-200">
      {currentView === 'HOME' ? (
        <HomeView onOpenForm={() => setCurrentView('FORM')} />
      ) : (
        <RegistrationForm onClose={() => setCurrentView('HOME')} />
      )}
    </div>
  );
}