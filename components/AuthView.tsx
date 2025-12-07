import React, { useState } from 'react';
import { Button } from './Button';
import { ViewState } from '../types';
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface AuthViewProps {
  onNavigate: (view: ViewState) => void;
  onLoginSuccess?: () => void;
}

const AUTH_API_URL = 'https://sheetdb.io/api/v1/5dieu2x35n3q2';

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    loginIdentifier: '', // Used for login (email or phone)
    password: '',
    confirmPassword: ''
  });

  const showMessage = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message });
    // Auto hide after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear notification when user starts typing to try again
    if (notification) setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      showMessage('warning', "As senhas não coincidem. Por favor, tente novamente.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const identifier = formData.loginIdentifier.trim();
        const isEmail = identifier.includes('@');
        
        // Construct search URL based on input type
        let searchUrl = `${AUTH_API_URL}/search?sheet=User`;
        
        // Variables for validation after fetch
        let inputBaseNumber = '';

        if (isEmail) {
          searchUrl += `&Email=${encodeURIComponent(identifier)}`;
        } else {
          // Mobile Login Logic
          // 1. Clean input to digits only
          let cleanInput = identifier.replace(/\D/g, '');
          
          // 2. If user typed 258 prefix (and length is sufficient), strip it to get the base number
          // Assuming base number (e.g. 841234567) is 9 digits.
          if (cleanInput.startsWith('258') && cleanInput.length > 9) {
             cleanInput = cleanInput.substring(3);
          }
          
          inputBaseNumber = cleanInput;

          // 3. Construct search term. Data in sheet starts with 258.
          // We search for 258 + baseNumber to find the record.
          const searchPhone = `258${cleanInput}`;
          searchUrl += `&Telemóvel=${encodeURIComponent(searchPhone)}`;
        }

        const response = await fetch(searchUrl);
        
        if (!response.ok) {
          throw new Error('Falha na conexão com o servidor.');
        }
        
        const users = await response.json();
        
        if (Array.isArray(users) && users.length > 0) {
           const user = users[0];

           // Additional Validation for Mobile Login as requested:
           // "check only the remaining numbers which needs to be the same"
           if (!isEmail) {
              let storedPhone = String(user.Telemóvel || '').replace(/\D/g, '');
              // Ignore the 258 from the sheet
              if (storedPhone.startsWith('258')) {
                 storedPhone = storedPhone.substring(3);
              }
              
              if (storedPhone !== inputBaseNumber) {
                 showMessage('error', "O número de telemóvel inserido não corresponde ao registo desta conta.");
                 setLoading(false);
                 return;
              }
           }
           
           // Check password
           if (user.Senha === formData.password) {
              // Login Success - Create local session with full profile data
              
              // Preserve existing photo if email matches (Photo Persistence)
              let existingPhotoUrl = '';
              try {
                  const stored = localStorage.getItem('ehopa_user_profile');
                  if (stored) {
                      const p = JSON.parse(stored);
                      if (p.email === user.Email && p.photoUrl) {
                          existingPhotoUrl = p.photoUrl;
                      }
                  }
              } catch(e) {}

              const profile = {
                name: user.Nome || '',
                surname: user.Apelido || '',
                email: user.Email || '',
                mobileMain: user.Telemóvel || '',
                mobileSecondary: user['Telemóvel (Secundário)'] || '',
                age: user['Idade'] || '',
                gender: user['Género'] || '',
                role: user['Cargo'] || '',
                province: user['Província'] || '',
                district: user['Distrito'] || '',
                praia: user['Praia'] || '',
                affiliationDate: new Date().toISOString(),
                photoUrl: existingPhotoUrl
              };
              localStorage.setItem('ehopa_user_profile', JSON.stringify(profile));
              
              if (onLoginSuccess) {
                onLoginSuccess();
              } else {
                onNavigate('FORM');
              }
           } else {
             showMessage('error', "A senha inserida está incorreta.");
           }
        } else {
           showMessage('error', "Utilizador não encontrado. Verifique se os dados estão corretos.");
        }

      } else {
        // --- SIGN UP LOGIC ---
        // Clean mobile input for storage
        const cleanMobile = formData.mobile.replace(/\D/g, '');
        
        const payload = {
           "Nome": formData.firstName,
           "Apelido": formData.lastName,
           "Email": formData.email,
           "Telemóvel": `258${cleanMobile}`, // Storing with 258 prefix as per sheet format
           "Senha": formData.password
        };

        const response = await fetch(`${AUTH_API_URL}?sheet=User`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: payload })
        });

        if (!response.ok) {
          throw new Error('Erro ao criar conta.');
        }

        // On success, create local session and redirect
        const profile = {
           name: formData.firstName,
           surname: formData.lastName,
           email: formData.email,
           mobileMain: `258${cleanMobile}`,
           affiliationDate: new Date().toISOString(),
           photoUrl: ''
        };
        localStorage.setItem('ehopa_user_profile', JSON.stringify(profile));
        
        showMessage('success', "Conta criada com sucesso! A redirecionar...");
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            onNavigate('FORM');
          }
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      showMessage('error', "Ocorreu um erro de conexão. Verifique sua internet.");
    } finally {
      if (!notification || notification.type !== 'success') {
          setLoading(false);
      }
    }
  };

  const inputClasses = "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-base";
  const labelClasses = "block text-sm font-bold text-slate-700 mb-1.5 ml-1";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* Simple Auth Header */}
      <div className="flex justify-center pt-8 pb-4">
        <img 
          src="https://i.postimg.cc/bNBDGq5Q/ehopa-agent-logo.png" 
          alt="Logo" 
          className="h-16 w-auto object-contain"
        />
      </div>
      
      <main className="flex-1 flex flex-col justify-center p-6 md:p-8 max-w-md mx-auto w-full">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-slate-900 font-rounded mb-2">
            {isLogin ? 'Bem-vindo' : 'Criar Conta'}
          </h2>
          <p className="text-slate-500">
            {isLogin ? 'Faça login para aceder à plataforma.' : 'Preencha os dados para começar.'}
          </p>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium animate-in slide-in-from-top-2 fade-in duration-300 shadow-sm border ${
            notification.type === 'error' ? 'bg-red-50 text-red-900 border-red-100' :
            notification.type === 'success' ? 'bg-green-50 text-green-900 border-green-100' :
            'bg-amber-50 text-amber-900 border-amber-100'
          }`}>
            {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            <p className="leading-relaxed">{notification.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Sign Up Fields */}
          {!isLogin && (
            <>
              <div>
                <label className={labelClasses}>Nome</label>
                <input 
                  name="firstName"
                  type="text" 
                  placeholder="Nome"
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
                <label className={labelClasses}>Telemóvel</label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 font-medium select-none">
                    +258
                  </span>
                  <input 
                    name="mobile"
                    type="tel" 
                    placeholder="84 123 4567"
                    className={`${inputClasses} rounded-l-none`}
                    value={formData.mobile}
                    onChange={handleChange}
                    pattern="[0-9]*"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Login Fields */}
          {isLogin && (
            <div>
              <label className={labelClasses}>Email ou Telemóvel</label>
              <input 
                name="loginIdentifier"
                type="text" 
                placeholder="email@exemplo.com ou 84..."
                className={inputClasses}
                value={formData.loginIdentifier}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-slate-400 mt-1 ml-1">Para telemóvel, pode usar o número direto (ex: 84123...).</p>
            </div>
          )}

          {/* Password Fields */}
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-sm font-bold text-slate-700">Senha</label>
              {isLogin && (
                <button 
                  type="button" 
                  onClick={() => onNavigate('RECOVERY')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Esqueceu a senha?
                </button>
              )}
            </div>
            <div className="relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className={`${inputClasses} pr-12`}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className={labelClasses}>Confirmar Senha</label>
              <div className="relative">
                <input 
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className={`${inputClasses} pr-12`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" fullWidth disabled={loading} className="h-14 text-lg">
              {loading ? 'A processar...' : (isLogin ? 'Entrar' : 'Criar Conta Agente')}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setNotification(null);
              // Clear form data when switching modes to avoid confusion
              setFormData({
                firstName: '', lastName: '', mobile: '', email: '',
                loginIdentifier: '', password: '', confirmPassword: ''
              });
            }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2 px-4 rounded-lg hover:bg-slate-50"
          >
            {isLogin ? 'Não tem conta? Criar agora' : 'Já tem uma Conta Agente? Inicie Sessão'}
          </button>
          
          {!isLogin && (
             <p className="mt-2 text-xs text-slate-400">
               Ao criar conta, concorda com os Termos de Serviço.
             </p>
          )}
        </div>
      </main>
    </div>
  );
};