import React from 'react';
import { PlusCircle, History, HelpCircle, TrendingUp } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'FORM' as ViewState, label: 'Novo Registo', icon: PlusCircle },
    { id: 'HISTORY' as ViewState, label: 'Submissões', icon: History },
    { id: 'REVENUE' as ViewState, label: 'Receita', icon: TrendingUp },
    { id: 'HELP' as ViewState, label: 'Ajuda', icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-4 h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'REVENUE' && currentView === 'PROVIDER_DETAIL');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};