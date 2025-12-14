import React, { useState } from 'react';
import { Button } from './Button';
import { ViewState } from '../types';
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle, Info, X, MapPin, FileText, BarChart3, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';

interface AuthViewProps {
  onNavigate: (view: ViewState) => void;
  onLoginSuccess?: () => void;
}

const AUTH_API_URL = 'https://sheetdb.io/api/v1/5dieu2x35n3q2';

export const AuthView: React.FC<AuthViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
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

  const faqs = [
    { q: "Como registar um novo pescado?", a: "Aceda ao menu 'Novo Registo', preencha os dados obrigatórios e a localização, e clique em Submeter." },
    { q: "É necessário internet?", a: "Sim, é necessária uma conexão ativa para carregar provedores e enviar dados." },
    { q: "Como corrigir um erro?", a: "Atualmente não é possível editar um envio. Contacte o suporte para correções." },
    { q: "A localização é obrigatória?", a: "Sim, para validar a origem do pescado, a geolocalização é mandatória." },
    { q: "O que fazer se o provedor não estiver na lista?", a: "Contacte o gestor para adicionar o novo provedor à base de dados." },
    { q: "Posso enviar fotos?", a: "Sim, pode adicionar até 5 fotos por registo." },
    { q: "Como ver meus registos anteriores?", a: "Aceda à aba 'Submissões' no menu inferior." },
    { q: "O app funciona em tablets?", a: "Sim, o layout é adaptado para telemóveis e tablets." },
    { q: "Como recuperar minha senha?", a: "Deverá contactar imediatamente a equipe de suporte para redefinição." },
    { q: "Quem vê os dados registados?", a: "Apenas a equipa de gestão e clientes autorizados da EHOPA." }
  ];

  // Password validation state
  const isPasswordStrong = formData.password.length >= 6 && /\d/.test(formData.password);

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

  const handleGuestLogin = async () => {
    setLoading(true);
    setNotification(null);

    try {
      // Direct fetch for the demo user
      const response = await fetch(`${AUTH_API_URL}/search?sheet=User&Email=${encodeURIComponent('teste@gmail.com')}`);
      
      if (!response.ok) {
        throw new Error('Falha na conexão com o servidor.');
      }
      
      const users = await response.json();
      
      if (Array.isArray(users) && users.length > 0) {
           const user = users[0];
           
           if (user.Senha === '12345') {
              // Login Success
              let existingPhotoUrl = '';
              try {
                  const stored = localStorage.getItem('ehopa_user_profile');
                  if (stored) {
                      const p = JSON.parse(stored);
                      if ((p.email === 'agenteteste@gmail.com' || p.email === user.Email) && p.photoUrl) {
                          existingPhotoUrl = p.photoUrl;
                      }
                  }
              } catch(e) {}

              // Set specific demo profile data
              const profile = {
                name: 'Isabela',
                surname: 'Muroca',
                email: 'agenteteste@gmail.com',
                mobileMain: '258841234567',
                mobileSecondary: '871234567',
                age: '31',
                gender: 'F',
                role: 'Agente Ehopa',
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
              return; // End execution (prevent setLoading(false))
           } else {
             showMessage('error', "A senha da conta demo foi alterada no sistema.");
           }
      } else {
           showMessage('error', "Conta demo não encontrada.");
      }
    } catch (error) {
      console.error(error);
      showMessage('error', "Ocorreu um erro de conexão.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        showMessage('warning', "As senhas não coincidem. Por favor, tente novamente.");
        return;
      }
      if (!isPasswordStrong) {
        showMessage('warning', "A senha deve ter pelo menos 6 caracteres e incluir um número.");
        return;
      }
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

  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all text-sm placeholder:text-slate-400";
  const labelClasses = "block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1 ml-1";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* Redesigned Header: 2 Columns */}
      <div className="flex justify-between items-center px-6 pt-6 pb-2 w-full max-w-md mx-auto">
        {/* Left: Smaller Logo */}
        <img 
          src="https://i.postimg.cc/bNBDGq5Q/ehopa-agent-logo.png" 
          alt="Logo" 
          className="h-8 w-auto object-contain"
        />
        {/* Right: Help Text */}
        <button 
          onClick={() => setShowInfoModal(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Ajuda
        </button>
      </div>
      
      {/* Top Title Section - Moved out of the centered form container */}
      <div className="w-full max-w-md mx-auto px-6 pt-4 pb-2">
         <h2 className="text-2xl font-black text-slate-900 font-rounded tracking-tight">
            {isLogin ? 'Bem-vindo, Agente' : 'Criar Conta Agente'}
         </h2>
         <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            {isLogin ? 'Acesso à plataforma.' : 'Preencha os dados para começar.'}
         </p>
         <div className="w-full h-px bg-slate-100 mt-4" />
      </div>
      
      {/* Main Content Area - Form Area aligned to top with spacing */}
      <main className="flex-1 flex flex-col justify-start w-full max-w-md mx-auto px-6 pt-8 pb-4 overflow-y-auto">

        {notification && (
          <div className={`mb-6 p-3 rounded-xl flex items-start gap-2 text-sm font-medium animate-in slide-in-from-top-2 fade-in duration-300 shadow-sm border ${
            notification.type === 'error' ? 'bg-red-50 text-red-900 border-red-100' :
            notification.type === 'success' ? 'bg-green-50 text-green-900 border-green-100' :
            'bg-amber-50 text-amber-900 border-amber-100'
          }`}>
            {notification.type === 'error' && <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />}
            {notification.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
            <p className="leading-snug">{notification.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sign Up Fields */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClasses}>Primeiro Nome</label>
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
              </div>

              <div>
                <label className={labelClasses}>Email Preferido</label>
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
                <label className={labelClasses}>Telemóvel Principal</label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-100 bg-slate-100 text-slate-500 font-medium select-none text-sm">
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
                <p className="text-[10px] text-blue-600/80 mt-1 ml-1 font-medium flex items-center gap-1">
                  <Info className="w-3 h-3" /> Usado para Login.
                </p>
              </div>
            </>
          )}

          {/* Login Fields */}
          {isLogin && (
            <div>
              <div className="flex justify-between items-end mb-1 ml-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Telefone de Usuário</label>
                <button 
                   type="button" 
                   onClick={handleGuestLogin}
                   className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                   Entrar como Visitante
                </button>
              </div>
              <input 
                name="loginIdentifier"
                type="text" 
                placeholder="84/87..."
                className={inputClasses}
                value={formData.loginIdentifier}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* Password Fields */}
          <div>
            <div className="flex justify-between items-end mb-1.5 ml-1">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {isLogin ? 'Senha' : 'Sua Senha'}
              </label>
              {/* Esqueceu button removed */}
            </div>
            <div className="relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className={`${inputClasses} pr-10`}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isLogin && (
              <div className="mt-1 ml-1 text-[10px]">
                <p className={`flex items-center gap-1 ${formData.password.length === 0 ? 'text-slate-400' : isPasswordStrong ? 'text-green-600' : 'text-amber-600'}`}>
                   {isPasswordStrong ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                   Mínimo 6 caracteres e 1 número.
                </p>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className={labelClasses}>Confirmar Senha</label>
              <div className="relative">
                <input 
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className={`${inputClasses} pr-10`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" fullWidth disabled={loading} className="h-12 text-base font-bold shadow-lg shadow-slate-900/10">
              {loading ? 'A processar...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </Button>

            <div className="mt-3 text-center">
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setNotification(null);
                  // Clear form data when switching modes
                  setFormData({
                    firstName: '', lastName: '', mobile: '', email: '',
                    loginIdentifier: '', password: '', confirmPassword: ''
                  });
                }}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
              >
                {isLogin ? 'ou Criar Conta Agente' : 'Já tem conta? Inicie Sessão'}
              </button>
            </div>
          </div>
        </form>

        {!isLogin && (
           <div className="mt-auto pt-6 pb-4">
             <p className="text-[10px] text-slate-400 text-center leading-tight">
               Ao criar conta, concorda com os Termos de Serviço e Política de Privacidade da EHOPA.
             </p>
           </div>
        )}
      </main>

      {/* Unified Info/FAQ Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10">
                 <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    Central de Ajuda
                 </h3>
                 <button onClick={() => setShowInfoModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              {/* Modal Content - Scrollable */}
              <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 leading-relaxed">
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900">
                    <p className="font-medium">
                       O <strong>EHOPA AGENT</strong> é a sua ferramenta digital para registo e controlo de pescado em tempo real, eliminando a necessidade de papel e agilizando a comunicação com a central.
                    </p>
                 </div>

                 <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">Guia Rápido</h4>
                    
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-blue-600">
                          <FileText className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 mb-1">1. Novo Registo</p>
                          <p>Aceda a esta opção para registar uma nova captura. Preencha a espécie, peso, preço e estado. A data e hora são automáticas.</p>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-green-600">
                          <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 mb-1">2. Geolocalização</p>
                          <p>O sistema captura a sua localização GPS para validar a origem do pescado (Praia/Zona). É necessário dar permissão ao navegador.</p>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-orange-600">
                          <BarChart3 className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 mb-1">3. Histórico e Receita</p>
                          <p>Consulte todos os seus envios passados na aba "Submissões" e verifique estimativas de valores na aba "Receita".</p>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-purple-600">
                          <ShieldCheck className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 mb-1">4. Perfil e Segurança</p>
                          <p>Mantenha os seus dados atualizados no "Perfil". A sua conta é pessoal e intransmissível.</p>
                       </div>
                    </div>
                 </div>

                 {/* Divider and FAQ Section */}
                 <div className="pt-2 border-t border-slate-100"></div>

                 <div>
                    <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                       <HelpCircle className="w-4 h-4 text-blue-600" /> Perguntas Frequentes
                    </h4>
                    <div className="space-y-2">
                        {faqs.map((item, i) => (
                          <details key={i} className="group bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                            <summary className="flex items-center justify-between p-3.5 cursor-pointer list-none select-none hover:bg-slate-100 transition-colors">
                              <span className="text-xs font-bold text-slate-700 text-left pr-2">{item.q}</span>
                              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90 shrink-0" />
                            </summary>
                            <div className="px-3.5 pb-3.5 pt-0 text-xs text-slate-500 leading-relaxed border-t border-slate-100 bg-white mt-2 pt-2">
                              {item.a}
                            </div>
                          </details>
                        ))}
                    </div>
                 </div>
                 
                 <div className="pt-4 text-center">
                    <p className="text-xs text-slate-400">UBUNTU STORYTECH &copy; {new Date().getFullYear()}</p>
                 </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                 <Button onClick={() => setShowInfoModal(false)} fullWidth className="h-12">
                    Entendido
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};