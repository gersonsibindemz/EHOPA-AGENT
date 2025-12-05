import React from 'react';
import { Header } from './Header';
import { Button } from './Button';

interface HomeViewProps {
  onOpenForm: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenForm }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header title="EHOPA AGENT" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
        
        <div className="flex flex-col items-center max-w-sm w-full z-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Novo Registo</h2>
            <p className="text-slate-500">Adicione um novo registo de pescado ao sistema.</p>
          </div>

          <Button 
            onClick={onOpenForm} 
            fullWidth 
            className="h-14 text-lg shadow-lg shadow-slate-900/10"
          >
            Registar Novo
          </Button>
        </div>
      </main>
      
      <footer className="p-6 text-center text-xs text-slate-400">
        EHOPA AGENT v1.0
      </footer>
    </div>
  );
};