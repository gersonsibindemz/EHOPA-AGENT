import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { Button } from './Button';
import { AlertCircle, Loader2, Locate, Map as MapIcon, Calendar, Camera, X, AlertTriangle } from 'lucide-react';
import { HistoryRecord, ViewState } from '../types';

interface RegistrationFormProps {
  onNavigate: (view: ViewState) => void;
}

interface Provider {
  id: string;
  fullName: string;
  origin?: string;
}

interface SpeciesData {
  name: string;
  price: string;
}

interface LocationData {
  lat: number;
  lng: number;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onNavigate }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [speciesList, setSpeciesList] = useState<SpeciesData[]>([]);
  
  const [loading, setLoading] = useState(true);
  // error state used for data loading errors
  const [error, setError] = useState<string | null>(null);
  
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  
  // Validation States
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [missingFieldNames, setMissingFieldNames] = useState<string[]>([]);
  
  // Set default date to Maputo Time (GMT+2)
  const getMaputoDate = () => {
    try {
      const maputoDateStr = new Date().toLocaleString('en-CA', { timeZone: 'Africa/Maputo' });
      return maputoDateStr.split(',')[0].trim(); 
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  const [selectedDate, setSelectedDate] = useState<string>(getMaputoDate());
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationDisabled, setIsLocationDisabled] = useState(false);
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const SHEET_ID = '1Rl9gd3kD6QnBFg1Iu9vgqsRjBSukGfqrjgQldADIRYQ';
        
        const providersUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Lista de Provedores')}`;
        const originsUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Pontos de Pescado')}`;
        const speciesUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Espécies')}`;
        
        const [providersRes, originsRes, speciesRes] = await Promise.all([
          fetch(providersUrl),
          fetch(originsUrl),
          fetch(speciesUrl)
        ]);

        if (!providersRes.ok || !originsRes.ok || !speciesRes.ok) throw new Error('Falha ao carregar dados');
        
        const providersText = await providersRes.text();
        const originsText = await originsRes.text();
        const speciesText = await speciesRes.text();

        setProviders(parseProvidersCSV(providersText));
        setOrigins(parseOriginsCSV(originsText));
        setSpeciesList(parseSpeciesCSV(speciesText));
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Erro de conexão. Verifique sua internet.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-fetch location on mount
  useEffect(() => {
    handleGetLocation();
  }, []);

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Robust CSV split function
  const splitCSVLine = (line: string): string[] => {
    // Regex matches comma only if not inside quotes
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return values.map(val => val.replace(/^"|"$/g, '').trim());
  };

  const parseProvidersCSV = (csvText: string): Provider[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = splitCSVLine(lines[0]);
    const nomeIdx = headers.findIndex(h => h.toLowerCase() === 'nome');
    const apelidoIdx = headers.findIndex(h => h.toLowerCase() === 'apelido');
    
    // Look for Praia or Origem column to associate with provider
    const originIdx = headers.findIndex(h => {
        const lower = h.toLowerCase();
        return lower === 'praia' || lower === 'origem';
    });

    if (nomeIdx === -1) return [];

    return lines.slice(1)
      .map((line, index): Provider | null => {
        if (!line.trim()) return null;
        const cleanValues = splitCSVLine(line);
        const nome = cleanValues[nomeIdx] || '';
        const apelido = apelidoIdx !== -1 ? cleanValues[apelidoIdx] : '';
        const origin = originIdx !== -1 ? cleanValues[originIdx] : undefined;
        
        if (!nome) return null;

        return {
          id: `prov-${index}`,
          fullName: `${nome} ${apelido}`.trim(),
          origin: origin
        };
      })
      .filter((p): p is Provider => p !== null)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  };

  const parseOriginsCSV = (csvText: string): string[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = splitCSVLine(lines[0]);
    const praiaIdx = headers.findIndex(h => h.toLowerCase() === 'praia');

    if (praiaIdx === -1) return [];

    return lines.slice(1)
      .map((line) => {
        if (!line.trim()) return null;
        const cleanValues = splitCSVLine(line);
        return cleanValues[praiaIdx] || '';
      })
      .filter((val) => val && val !== '')
      .sort((a, b) => a.localeCompare(b));
  };

  const parseSpeciesCSV = (csvText: string): SpeciesData[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = splitCSVLine(lines[0]);
    
    // Find column for Species Name
    const speciesIdx = headers.findIndex(h => {
      const normalized = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalized === 'especies' || normalized === 'especie';
    });

    // Find column for Price (Preço por Kg)
    const priceIdx = headers.findIndex(h => {
      const normalized = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalized.includes('preco') || normalized.includes('price');
    });

    if (speciesIdx === -1) return [];

    return lines.slice(1)
      .map((line) => {
        if (!line.trim()) return null;
        const cleanValues = splitCSVLine(line);
        const name = cleanValues[speciesIdx] || '';
        
        let price = '';
        if (priceIdx !== -1 && cleanValues[priceIdx]) {
           price = cleanValues[priceIdx].replace(/[^\d.,]/g, '');
        }

        if (!name) return null;

        return { name, price };
      })
      .filter((item): item is SpeciesData => item !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProvider(val);
    clearError('provider');
    
    // Auto-fill origin based on provider
    const provider = providers.find(p => p.fullName === val);
    if (provider && provider.origin) {
        const originVal = provider.origin;
        // Find if this origin exists in our origins list (case insensitive match)
        const matchedOrigin = origins.find(o => o.toLowerCase() === originVal.toLowerCase());
        
        if (matchedOrigin) {
            setSelectedOrigin(matchedOrigin);
            clearError('origin');
        } else {
            // If the provider's origin is not in the list, add it dynamically so it can be selected/shown
            setOrigins(prev => [...prev, originVal].sort());
            setSelectedOrigin(originVal);
            clearError('origin');
        }
    } else {
        setSelectedOrigin('');
    }
  };

  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpecies = e.target.value;
    setSelectedSpecies(newSpecies);
    clearError('species');

    // Auto-fill price based on selection
    const speciesData = speciesList.find(s => s.name === newSpecies);
    if (speciesData && speciesData.price) {
      setUnitPrice(speciesData.price.replace(',', '.'));
    } else {
      setUnitPrice('');
    }
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    setIsLocationDisabled(false);
    clearError('location');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não suportada.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationLoading(false);
        setIsLocationDisabled(false);
        if (submitStatus === 'error') setSubmitStatus('idle');
      },
      (err) => {
        console.error(err);
        setLocationLoading(false);
        
        if (err.code === 2) {
          setIsLocationDisabled(true);
          setLocationError(null);
        } else if (err.code === 1) {
          setLocationError('Permissão de localização negada.');
        } else {
          setLocationError('Erro ao obter sinal GPS. Tente novamente.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      const totalFiles = images.length + newFiles.length;

      if (totalFiles > 5) {
        alert("Máximo de 5 imagens.");
        e.target.value = ''; 
        return;
      }

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const calculateTotal = () => {
    const q = parseFloat(quantity.replace(',', '.')) || 0;
    const p = parseFloat(unitPrice.replace(',', '.')) || 0;
    return (q * p).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const sendWhatsAppNotification = () => {
    const q = parseFloat(quantity.replace(',', '.')) || 0;
    const p = parseFloat(unitPrice.replace(',', '.')) || 0;
    const total = (q * p).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    const message = `📌 *Novo registro EHOPA*
📅 Data: ${formattedDate}
🐟 Espécie: ${selectedSpecies}
⚖️ Quantidade: ${quantity} kg
💵 Preço: ${unitPrice} MZN/kg
📦 Total: ${total} MZN
❄️ Estado: ${selectedCondition}
🌊 Origem: ${selectedOrigin}`;

    const phoneNumber = "258856022244";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  const clearError = (field: string) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, boolean> = {};
    const missing: string[] = [];

    if (!selectedDate) { errors.date = true; missing.push("Data da Captura"); }
    if (!selectedProvider) { errors.provider = true; missing.push("Provedor"); }
    if (!selectedOrigin) { errors.origin = true; missing.push("Origem (Praia)"); }
    if (!location) { errors.location = true; missing.push("Geolocalização (Auto)"); }
    if (!selectedSpecies) { errors.species = true; missing.push("Espécie"); }
    if (!selectedCondition) { errors.condition = true; missing.push("Estado"); }
    if (!quantity) { errors.quantity = true; missing.push("Quantidade"); }
    if (!unitPrice) { errors.unitPrice = true; missing.push("Preço"); }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setMissingFieldNames(missing);
      setSubmitStatus('error');
      setShowValidationModal(true);
      return;
    }
    
    const qtyValue = parseFloat(quantity.replace(',', '.'));
    if (isNaN(qtyValue) || qtyValue <= 0) {
      alert("Quantidade inválida.");
      return;
    }
    const priceValue = parseFloat(unitPrice.replace(',', '.'));
    if (isNaN(priceValue) || priceValue < 0) {
      alert("Preço inválido.");
      return;
    }
    if (!providers.some(p => p.fullName === selectedProvider)) {
      alert("Provedor inválido.");
      return;
    }
    setShowConfirmation(true);
  };

  const executeSubmission = async () => {
    setShowConfirmation(false);
    setSubmitStatus('submitting');
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const SHEET_ID = '1Rl9gd3kD6QnBFg1Iu9vgqsRjBSukGfqrjgQldADIRYQ';
    let generatedId = '';

    try {
      const geralUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('GERAL')}`;
      const response = await fetch(geralUrl);
      const originSlug = selectedOrigin.trim().toLowerCase().replace(/\s+/g, '_');

      if (response.ok) {
        const csvText = await response.text();
        const lines = csvText.split('\n');
        let count = 0;
        if (lines.length > 1) {
          const headers = splitCSVLine(lines[0]);
          const originIdx = headers.findIndex(h => {
             const lower = h.toLowerCase();
             return lower.includes('origem') || lower.includes('praia');
          });
          if (originIdx !== -1) {
             count = lines.slice(1).reduce((acc, line) => {
               if (!line.trim()) return acc;
               const rowValues = splitCSVLine(line);
               if (rowValues[originIdx] && rowValues[originIdx].toLowerCase() === selectedOrigin.toLowerCase()) {
                 return acc + 1;
               }
               return acc;
             }, 0);
          }
        }
        const sequence = count + 1;
        generatedId = `${originSlug}_${sequence.toString().padStart(3, '0')}`;
      } else {
        generatedId = `${originSlug}_001`;
      }
    } catch (error) {
      const originSlug = selectedOrigin.trim().toLowerCase().replace(/\s+/g, '_');
      generatedId = `${originSlug}_ERROR`;
    }

    const registrationData = {
      "ID": generatedId,
      "Data de Captura": formattedDate,
      "Link da Imagem": "",
      "Espécie": selectedSpecies,
      "Qtd. (Kg)": quantity.replace('.', ','),
      "Preço Unit. (Kg)": unitPrice.replace('.', ','),
      "Estado": selectedCondition,
      "Provedor": selectedProvider,
      "Origem (Praia)": selectedOrigin,
      "Geo-Localização": `${location?.lat}, ${location?.lng}`,
      "Timestamp": new Date().toLocaleString('pt-PT', { timeZone: 'Africa/Maputo' })
    };

    try {
      const SHEETDB_API = 'https://sheetdb.io/api/v1/bfoqynbg612ad';
      await fetch(`${SHEETDB_API}?sheet=GERAL`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: registrationData })
      });

      try {
        const historyItem: HistoryRecord = {
          id: generatedId,
          date: formattedDate,
          species: selectedSpecies,
          quantity: quantity,
          price: unitPrice,
          condition: selectedCondition,
          origin: selectedOrigin,
          timestamp: new Date().toISOString()
        };
        const currentHistory = JSON.parse(localStorage.getItem('ehopa_history') || '[]');
        localStorage.setItem('ehopa_history', JSON.stringify([historyItem, ...currentHistory]));
      } catch (e) {}

      sendWhatsAppNotification();
      setSubmitStatus('success');
      setTimeout(() => {
        setSubmitStatus('idle');
        
        // Reset ALL fields to provide a blank form
        setQuantity('');
        setUnitPrice('');
        setLocation(null);
        setImages([]);
        setPreviews([]);
        setSelectedProvider('');
        setSelectedOrigin('');
        setSelectedSpecies('');
        setSelectedCondition('');
        
        setValidationErrors({});
        setMissingFieldNames([]);
        
        // Re-fetch location for next entry
        handleGetLocation();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500); // Shorter timeout for better flow
      
    } catch (err) {
      alert("Erro ao enviar. Tente novamente.");
      setSubmitStatus('error');
    }
  };

  const getInputClasses = (hasError: boolean) => 
    `block w-full px-3 py-2.5 text-sm rounded-lg shadow-sm text-slate-900 transition-all placeholder:text-slate-400 ${
      hasError 
        ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50 focus:border-red-500' 
        : 'border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
    }`;
  
  const labelClasses = "block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1 ml-0.5";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <Header title="Novo Registo" onNavigate={onNavigate} currentView="FORM" />
      
      <main className="flex-1 p-3 flex justify-center items-start">
        <div className="w-full max-w-[340px] bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="mb-5 text-center">
              <h2 className="text-lg font-black text-slate-900 font-rounded mb-1">Pescado do Dia</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                 Preencha os dados abaixo para registar captura.
              </p>
            </div>

            <div className="w-full h-px bg-slate-100 mb-5" />

            <form onSubmit={handlePreSubmit} className="space-y-4">
                
                {/* Date */}
                <div>
                  <label htmlFor="date" className={labelClasses}>
                    Data da Captura {validationErrors.date && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input 
                      type="date" 
                      id="date" 
                      value={selectedDate} 
                      onChange={(e) => { setSelectedDate(e.target.value); clearError('date'); }} 
                      className={getInputClasses(!!validationErrors.date)} 
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className={labelClasses}>Fotografias (até 5)</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {previews.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="aspect-square rounded-lg border border-dashed border-slate-300 bg-slate-50 shadow-sm flex flex-col items-center justify-center text-slate-400 cursor-pointer active:bg-slate-100 transition-colors">
                        <Camera className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold">Add</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Provider */}
                <div>
                  <label htmlFor="provider" className={labelClasses}>
                    Provedor {validationErrors.provider && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <select 
                      id="provider" 
                      value={selectedProvider} 
                      onChange={handleProviderChange} 
                      className={`${getInputClasses(!!validationErrors.provider)} appearance-none`}
                    >
                      <option value="">Selecione...</option>
                      {providers.map((p) => <option key={p.id} value={p.fullName}>{p.fullName}</option>)}
                    </select>
                  </div>
                </div>

                {/* Origin */}
                <div>
                  <label htmlFor="origin" className={labelClasses}>
                    Origem (Praia) {validationErrors.origin && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="origin"
                      value={selectedOrigin}
                      readOnly
                      placeholder="Selecionar Provedor..."
                      className={`${getInputClasses(!!validationErrors.origin)} bg-slate-100 text-slate-500 cursor-not-allowed focus:ring-0 focus:border-slate-200`}
                    />
                  </div>
                </div>

                {/* Species */}
                <div>
                  <label htmlFor="species" className={labelClasses}>
                    Espécie {validationErrors.species && <span className="text-red-500">*</span>}
                  </label>
                  <select 
                    id="species" 
                    value={selectedSpecies} 
                    onChange={handleSpeciesChange} 
                    className={`${getInputClasses(!!validationErrors.species)} appearance-none`}
                  >
                    <option value="">Selecione...</option>
                    {speciesList.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label htmlFor="condition" className={labelClasses}>
                    Estado {validationErrors.condition && <span className="text-red-500">*</span>}
                  </label>
                  <select 
                    id="condition" 
                    value={selectedCondition} 
                    onChange={(e) => { setSelectedCondition(e.target.value); clearError('condition'); }} 
                    className={`${getInputClasses(!!validationErrors.condition)} appearance-none`}
                  >
                    <option value="">Selecione...</option>
                    <option value="Fresco">Fresco</option>
                    <option value="Congelado">Congelado</option>
                  </select>
                </div>

                {/* Quantity & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="quantity" className={labelClasses}>
                      Qtd (Kg) {validationErrors.quantity && <span className="text-red-500">*</span>}
                    </label>
                    <input 
                      type="number" 
                      id="quantity" 
                      inputMode="decimal" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={quantity} 
                      onChange={(e) => { setQuantity(e.target.value); clearError('quantity'); }} 
                      className={getInputClasses(!!validationErrors.quantity)} 
                    />
                  </div>
                  <div>
                    <label htmlFor="unitPrice" className={labelClasses}>
                      Preço Kg {validationErrors.unitPrice && <span className="text-red-500">*</span>}
                    </label>
                    <input 
                      type="number" 
                      id="unitPrice" 
                      placeholder="0.00" 
                      value={unitPrice} 
                      readOnly
                      className={`${getInputClasses(!!validationErrors.unitPrice)} bg-slate-100 text-slate-500 cursor-not-allowed focus:ring-0 focus:border-slate-200`} 
                    />
                  </div>
                </div>
                
                {(quantity || unitPrice) && (
                   <p className="text-xs text-right font-medium text-slate-500 border-t border-slate-50 pt-2">
                     Total Estimado: <span className="font-bold text-slate-900">{calculateTotal()} MZN</span>
                   </p>
                )}

                <Button type="submit" fullWidth disabled={loading || submitStatus === 'submitting'} className="h-12 text-base font-bold shadow-lg shadow-blue-900/10 mt-2">
                  {submitStatus === 'submitting' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A enviar...</> : 'Submeter Pescado'}
                </Button>
            </form>
        </div>
      </main>

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-xl p-5 max-w-xs w-full animate-in zoom-in-95 border border-slate-100">
              <div className="flex flex-col items-center text-center space-y-3">
                 <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                 </div>
                 <div className="space-y-2 w-full">
                    <h3 className="font-bold text-slate-900 text-base">Campos em falta</h3>
                    
                    {missingFieldNames.length > 0 && (
                      <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-left w-full my-1">
                         <ul className="list-disc list-inside text-xs text-red-700 space-y-1 font-medium">
                            {missingFieldNames.map((field, i) => (
                              <li key={i}>{field}</li>
                            ))}
                         </ul>
                      </div>
                    )}
                 </div>
                 <Button onClick={() => setShowValidationModal(false)} fullWidth className="mt-2 h-10 text-sm">
                   Entendido
                 </Button>
              </div>
           </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-base">Confirmação</h3>
              <button onClick={() => setShowConfirmation(false)} className="p-1.5 bg-slate-100 rounded-full text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-500">Espécie</span> <span className="font-bold text-slate-900">{selectedSpecies}</span></div>
                <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-500">Qtd.</span> <span className="font-bold text-slate-900">{quantity} kg</span></div>
                <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-500">Preço</span> <span className="font-bold text-slate-900">{unitPrice} MZN</span></div>
                <div className="flex justify-between py-1 border-b border-slate-50"><span className="text-slate-500">Total</span> <span className="font-bold text-blue-600">{calculateTotal()} MZN</span></div>
                <div className="flex justify-between py-1"><span className="text-slate-500">Origem</span> <span className="font-bold text-slate-900">{selectedOrigin}</span></div>
              </div>
              <div className="bg-amber-50 text-amber-800 text-[10px] p-2.5 rounded-lg leading-relaxed border border-amber-100">
                Ao confirmar, você será redirecionado para o WhatsApp.
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="secondary" onClick={() => setShowConfirmation(false)} className="h-10 text-sm">Cancelar</Button>
                <Button onClick={executeSubmission} className="h-10 text-sm">Confirmar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};