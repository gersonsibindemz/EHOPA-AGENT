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

interface UserHeaderData {
  name: string;
  surname: string;
  district: string;
  praia: string;
}

export const Header: React.FC<HeaderProps> = ({ title, onNavigate, currentView }) => {
  const [userData, setUserData] = useState<UserHeaderData | null>(null);

  useEffect(() => {
    // Retrieve user profile from local storage to display name and location
    const stored = localStorage.getItem('ehopa_user_profile');
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        if (profile) {
          setUserData({
            name: profile.name || '',
            surname: profile.surname || '',
            district: profile.district || '',
            praia: profile.praia || ''
          });
        }
      } catch (e) {
        console.error("Failed to load user profile in header", e);
      }
    }
  }, [currentView]);

  const isAuthView = currentView === 'AUTH' || currentView === 'RECOVERY';

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 h-16 flex items-center px-4 justify-between shadow-sm">
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

      <div className="flex items-center gap-3">
        {!isAuthView && userData && (
          <div className="flex flex-col items-end text-right">
            <span className="text-xs sm:text-sm font-bold text-slate-900 leading-none">
              {userData.name} {userData.surname}
            </span>
            {(userData.district || userData.praia) && (
              <span className="text-[10px] text-slate-500 font-medium leading-tight mt-1 max-w-[150px] truncate">
                {userData.district} {userData.district && userData.praia ? '•' : ''} {userData.praia}
              </span>
            )}
          </div>
        )}

        <button 
          onClick={() => onNavigate('PROFILE')}
          className={`p-1.5 -mr-1.5 rounded-full transition-colors ${currentView === 'PROFILE' ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-50'}`}
          aria-label="Perfil"
        >
          <UserCircle2 className="w-8 h-8 stroke-[1.5]" />
        </button>
      </div>
    </header>
  );
};