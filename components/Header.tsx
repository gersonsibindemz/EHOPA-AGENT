import React, { useEffect, useState } from 'react';
import { UserCircle2 } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  title: string;
  onNavigate: (view: ViewState) => void;
  currentView?: ViewState;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onNavigate, currentView }) => {
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    // Retrieve user profile from local storage to display name
    const stored = localStorage.getItem('ehopa_user_profile');
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        if (profile && profile.name) {
          // Extract first name
          const nameParts = profile.name.trim().split(' ');
          if (nameParts.length > 0) {
            setFirstName(nameParts[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load user profile in header", e);
      }
    }
  }, [currentView]);

  const isAuthView = currentView === 'AUTH' || currentView === 'RECOVERY';

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 h-14 flex items-center px-4 justify-between shadow-sm">
      <button 
        onClick={() => onNavigate('FORM')}
        className="flex items-center gap-3 active:opacity-70 transition-opacity focus:outline-none"
        aria-label="Ir para Novo Registo"
      >
        <img 
          src="https://i.postimg.cc/bNBDGq5Q/ehopa-agent-logo.png" 
          alt="Logo" 
          className="h-8 w-auto object-contain pointer-events-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{ WebkitTouchCallout: 'none' }}
        />
      </button>

      <div className="flex items-center gap-2">
        {!isAuthView && firstName && (
          <span className="text-sm font-bold text-slate-700 capitalize mr-1">
            {firstName}
          </span>
        )}

        <button 
          onClick={() => onNavigate('PROFILE')}
          className={`p-2 -mr-2 rounded-full transition-colors ${currentView === 'PROFILE' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          aria-label="Perfil"
        >
          <UserCircle2 className="w-7 h-7" />
        </button>
      </div>
    </header>
  );
};