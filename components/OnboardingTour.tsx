import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, PlusCircle, History, TrendingUp, UserCircle2, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const steps = [
    {
      title: "Bem-vindo ao EHOPA!",
      description: "Esta é a sua nova ferramenta de trabalho. Vamos fazer um tour rápido de 1 minuto para conhecer as funcionalidades principais?",
      icon: <img src="https://i.postimg.cc/BZg50YML/Grey-Black-Pink-80s-Aesthetic-Minimalist-Simple-Trending-New-Collection-Ins-20251214-004005-0000.png" alt="Bem-vindo" className="w-full h-full object-cover absolute inset-0" />,
      color: "bg-white"
    },
    {
      title: "Novo Registo",
      description: "Aqui é onde a magia acontece. Registe as capturas diárias, escolha o provedor, a espécie e obtenha a localização GPS automaticamente.",
      icon: <PlusCircle className="w-16 h-16 text-blue-600" />,
      color: "bg-blue-50"
    },
    {
      title: "Submissões",
      description: "Consulte o histórico de todos os registos enviados. Verifique o estado, valores e filtre por data para encontrar envios antigos.",
      icon: <History className="w-16 h-16 text-slate-600" />,
      color: "bg-slate-50"
    },
    {
      title: "Receita & Provedores",
      description: "Acompanhe o desempenho, controle de stock e estimativas de valores de cada provedor em tempo real.",
      icon: <TrendingUp className="w-16 h-16 text-green-600" />,
      color: "bg-green-50"
    },
    {
      title: "Tudo Pronto!",
      description: "Você está pronto para começar. Se tiver dúvidas, acesse o menu 'Ajuda' ou verifique seu 'Perfil' para atualizar seus dados.",
      icon: <CheckCircle2 className="w-16 h-16 text-indigo-600" />,
      color: "bg-indigo-50"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setIsClosing(true);
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    setIsClosing(true);
    setTimeout(onSkip, 300);
  };

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform ${isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
        
        {/* Header Image/Icon Area */}
        <div className={`h-48 ${steps[currentStep].color} flex flex-col items-center justify-center border-b border-slate-100 transition-colors duration-500 relative overflow-hidden`}>
           <button 
             onClick={handleSkip} 
             className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 transition-colors z-20"
             aria-label="Pular Tour"
           >
             <X className="w-5 h-5" />
           </button>
           
           <div className="animate-in zoom-in duration-300 key={currentStep} w-full h-full flex items-center justify-center">
             {steps[currentStep].icon}
           </div>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 flex flex-col text-center">
          <h2 className="text-2xl font-black text-slate-900 font-rounded mb-3 animate-in slide-in-from-bottom-2 duration-300 key={currentStep}-title">
            {steps[currentStep].title}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6 h-20 animate-in slide-in-from-bottom-3 duration-300 key={currentStep}-desc">
            {steps[currentStep].description}
          </p>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'
                }`} 
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-auto grid grid-cols-2 gap-3">
             {currentStep === 0 ? (
                <div className="col-span-2 space-y-3">
                   <Button onClick={handleNext} fullWidth className="h-12 shadow-lg shadow-blue-900/10">
                      Começar Tour
                   </Button>
                   <button onClick={handleSkip} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide">
                      Pular Apresentação
                   </button>
                </div>
             ) : (
                <>
                  <Button variant="secondary" onClick={handlePrev} className="h-12 border-slate-200">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
                  </Button>
                  <Button onClick={handleNext} className="h-12 shadow-lg shadow-slate-900/10">
                    {currentStep === steps.length - 1 ? (
                        'Concluir' 
                    ) : (
                        <span className="flex items-center">Próximo <ChevronRight className="w-4 h-4 ml-1" /></span>
                    )}
                  </Button>
                </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};