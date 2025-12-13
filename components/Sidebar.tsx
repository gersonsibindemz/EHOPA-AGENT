import React from 'react';
import { PlusCircle, History, HelpCircle, TrendingUp, UserCircle2, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'FORM' as ViewState, label: 'Novo Registo', icon: PlusCircle },
    { id: 'HISTORY' as ViewState, label: 'Submissões', icon: History },
    { id: 'REVENUE' as ViewState, label: 'Receita', icon: TrendingUp },
    { id: 'PROFILE' as ViewState, label: 'Meu Perfil', icon: UserCircle2 },
    { id: 'HELP' as ViewState, label: 'Ajuda', icon: HelpCircle },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col shadow-xl z-50">
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'REVENUE' && currentView === 'PROVIDER_DETAIL');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Terminar Sessão</span>
        </button>
        <div className="mt-4 text-[10px] text-center text-slate-600">
          Versão Alpha 1.0
        </div>
      </div>
    </aside>
  );
};