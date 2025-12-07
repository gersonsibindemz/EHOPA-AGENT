import React, { useState } from 'react';
import { Header } from './Header';
import { Button } from './Button';
import { ViewState } from '../types';
import { Send, ArrowLeft } from 'lucide-react';

interface RecoveryViewProps {
  onNavigate: (view: ViewState) => void;
}

export const RecoveryView: React.FC<RecoveryViewProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    reason: 'password'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Solicitação enviada! Verifique seu email ou telefone.");
      onNavigate('AUTH');
    }, 1500);
  };

  const inputClasses = "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-base";
  const labelClasses = "block text-sm font-bold text-slate-700 mb-1.5 ml-1";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header 
        title="Recuperação" 
        onNavigate={onNavigate}
        currentView="RECOVERY"
      />
      
      <main className="flex-1 flex flex-col justify-center p-6 md:p-8 max-w-md mx-auto w-full">
        
        <button 
          onClick={() => onNavigate('AUTH')}
          className="flex items-center gap-2 text-slate-500 font-medium mb-6 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Login
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 font-rounded mb-2">
            Recuperar Acesso
          </h2>
          <p className="text-slate-500">
            Preencha os dados abaixo para localizarmos sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Nome</label>
              <input 
                name="firstName"
                type="text" 
                placeholder="Seu nome"
                className={inputClasses}
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>Apelido</label>
              <input 
                name="lastName"
                type="text" 
                placeholder="Apelido"
                className={inputClasses}
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Telemóvel</label>
            <div className="relative flex">
              <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 font-medium">
                +258
              </span>
              <input 
                name="mobile"
                type="tel" 
                placeholder="84/85..."
                className={`${inputClasses} rounded-l-none`}
                value={formData.mobile}
                onChange={handleChange}
                pattern="[0-9]*"
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Email</label>
            <input 
              name="email"
              type="email" 
              placeholder="seu@email.com"
              className={inputClasses}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className={labelClasses}>Tipo de Problema</label>
            <select 
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="password">Esqueci a minha senha</option>
              <option value="credentials">Esqueci meu email/telemóvel</option>
            </select>
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth disabled={loading} className="h-14 text-lg">
              {loading ? 'A enviar...' : (
                <span className="flex items-center gap-2">
                  Enviar Solicitação <Send className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};