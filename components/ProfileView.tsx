import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { ViewState, UserProfile } from '../types';
import { Button } from './Button';
import { Camera, LogOut, Save, User } from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (view: ViewState) => void;
  onLogout?: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  surname: '',
  mobileMain: '',
  mobileSecondary: '',
  email: '',
  province: '',
  district: '',
  praia: '',
  age: '',
  gender: '',
  role: '',
  affiliationDate: new Date().toISOString(),
  photoUrl: ''
};

const AUTH_API_URL = 'https://sheetdb.io/api/v1/5dieu2x35n3q2';

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, onLogout }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ehopa_user_profile');
    if (stored) {
      try {
        const parsedProfile = JSON.parse(stored);
        setProfile({ ...DEFAULT_PROFILE, ...parsedProfile });
        setOriginalEmail(parsedProfile.email || '');
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    } else {
      // Set affiliation date on first load if not exists
      setProfile(prev => ({ ...prev, affiliationDate: new Date().toISOString() }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name || !profile.surname) {
      alert("Nome e Apelido são obrigatórios.");
      return;
    }
    setLoading(true);

    try {
      // Use original email to find the record, in case the user is changing their email
      const lookupEmail = originalEmail || profile.email;

      const payload = {
        "Nome": profile.name,
        "Apelido": profile.surname,
        "Email": profile.email,
        "Telemóvel": profile.mobileMain,
        "Telemóvel (Secundário)": profile.mobileSecondary,
        "Cargo": profile.role,
        "Província": profile.province,
        "Distrito": profile.district,
        "Praia": profile.praia,
        "Idade": profile.age,
        "Género": profile.gender
      };

      // PATCH request to update the user row identified by Email
      const response = await fetch(`${AUTH_API_URL}/Email/${encodeURIComponent(lookupEmail)}?sheet=User`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: payload })
      });

      if (response.ok) {
        localStorage.setItem('ehopa_user_profile', JSON.stringify(profile));
        setOriginalEmail(profile.email); // Update original email reference
        setMessage("Perfil atualizado com sucesso!");
      } else {
        // If API fails, we still save locally but warn the user
        console.warn("API update failed", response.statusText);
        localStorage.setItem('ehopa_user_profile', JSON.stringify(profile));
        setMessage("Salvo localmente (Sincronização pendente).");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      localStorage.setItem('ehopa_user_profile', JSON.stringify(profile));
      setMessage("Salvo localmente (Sem conexão).");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback
      onNavigate('AUTH');
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400";
  const labelClasses = "block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5 ml-1";
  const sectionClasses = "bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4";

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <Header title="Meu Perfil" onNavigate={onNavigate} currentView="PROFILE" />
      
      <main className="flex-1 p-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-6 px-1">
          <button onClick={() => onNavigate('FORM')} className="hover:text-blue-600 transition-colors">
            Início
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Cartão de Agente</span>
        </div>

        <form onSubmit={handleSave} className="space-y-6 max-w-lg mx-auto">
          
          {/* Profile Header */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-lg bg-slate-100 flex items-center justify-center">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="mt-3 text-center">
               <h2 className="text-xl font-bold text-slate-900">{profile.name} {profile.surname}</h2>
               <p className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full inline-block mt-1">
                 Membro desde {new Date(profile.affiliationDate).toLocaleDateString()}
               </p>
            </div>
          </div>

          {message && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium border text-center animate-in fade-in slide-in-from-top-2 ${
              message.includes('Erro') || message.includes('Sem conexão') 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              {message}
            </div>
          )}

          {/* Personal Info */}
          <section className={sectionClasses}>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Nome <span className="text-red-500">*</span></label>
                <input name="name" value={profile.name} onChange={handleChange} className={inputClasses} placeholder="Nome" required />
              </div>
              <div>
                <label className={labelClasses}>Apelido <span className="text-red-500">*</span></label>
                <input name="surname" value={profile.surname} onChange={handleChange} className={inputClasses} placeholder="Apelido" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className={labelClasses}>Idade</label>
                 <input type="number" name="age" value={profile.age} onChange={handleChange} className={inputClasses} placeholder="Ex: 35" />
              </div>
              <div>
                 <label className={labelClasses}>Género</label>
                 <select name="gender" value={profile.gender} onChange={handleChange} className={inputClasses}>
                   <option value="">Selecione...</option>
                   <option value="M">Masculino</option>
                   <option value="F">Feminino</option>
                 </select>
              </div>
            </div>
          </section>

          {/* Contacts */}
          <section className={sectionClasses}>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Contactos</h3>
            <div>
              <label className={labelClasses}>Email</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} className={inputClasses} placeholder="exemplo@email.com" />
            </div>
            <div>
              <label className={labelClasses}>Telemóvel (Principal)</label>
              <input type="tel" name="mobileMain" value={profile.mobileMain} onChange={handleChange} className={inputClasses} placeholder="+258..." />
            </div>
            <div>
              <label className={labelClasses}>Telemóvel (Secundário)</label>
              <input type="tel" name="mobileSecondary" value={profile.mobileSecondary} onChange={handleChange} className={inputClasses} placeholder="+258..." />
            </div>
          </section>

          {/* Professional / Location */}
          <section className={sectionClasses}>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">Profissional</h3>
            <div>
              <label className={labelClasses}>Função / Cargo</label>
              <input name="role" value={profile.role} onChange={handleChange} className={inputClasses} placeholder="Ex: Agente de Zona" />
            </div>
            <div>
                <label className={labelClasses}>Província</label>
                <select name="province" value={profile.province} onChange={handleChange} className={inputClasses}>
                  <option value="">Selecione...</option>
                  <option value="Zambézia">Zambézia</option>
                  <option value="Sofala">Sofala</option>
                </select>
            </div>
            <div>
                <label className={labelClasses}>Distrito</label>
                <input name="district" value={profile.district} onChange={handleChange} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Praia (Base)</label>
              <input name="praia" value={profile.praia} onChange={handleChange} className={inputClasses} />
            </div>
          </section>

          <div className="pt-4 pb-8 space-y-4">
            <Button type="submit" fullWidth disabled={loading} className="h-14 font-bold shadow-lg shadow-blue-900/10">
              {loading ? 'A guardar...' : (
                <span className="flex items-center gap-2">
                  <Save className="w-5 h-5" /> Guardar Alterações
                </span>
              )}
            </Button>

            <button 
              type="button"
              onClick={handleLogoutClick} 
              className="w-full flex items-center justify-center gap-2 text-red-600 font-bold text-sm py-3 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Terminar Sessão
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};