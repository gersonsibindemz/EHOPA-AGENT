import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { Button } from './Button';
import { AlertCircle, CheckCircle2, Loader2, Locate, Map as MapIcon, Calendar, Camera, X } from 'lucide-react';

interface RegistrationFormProps {
  onClose: () => void;
}

interface Provider {
  id: string;
  fullName: string;
}

interface LocationData {
  lat: number;
  lng: number;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onClose }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [species, setSpecies] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const SHEET_ID = '1Rl9gd3kD6QnBFg1Iu9vgqsRjBSukGfqrjgQldADIRYQ';
        
        // URLs for sheets
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
        setSpecies(parseSpeciesCSV(speciesText));
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar as listas de dados. Verifique sua conexão.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cleanup previews to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const parseProvidersCSV = (csvText: string): Provider[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    const nomeIdx = headers.findIndex(h => h.toLowerCase() === 'nome');
    const apelidoIdx = headers.findIndex(h => h.toLowerCase() === 'apelido');

    if (nomeIdx === -1) return [];

    return lines.slice(1)
      .map((line, index) => {
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches) return null;
        
        const cleanValues = matches.map(val => val.replace(/^"|"$/g, '').trim());
        const nome = cleanValues[nomeIdx] || '';
        const apelido = apelidoIdx !== -1 ? cleanValues[apelidoIdx] : '';
        
        if (!nome) return null;

        return {
          id: `prov-${index}`,
          fullName: `${nome} ${apelido}`.trim()
        };
      })
      .filter((p): p is Provider => p !== null)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  };

  const parseOriginsCSV = (csvText: string): string[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    const praiaIdx = headers.findIndex(h => h.toLowerCase() === 'praia');

    if (praiaIdx === -1) return [];

    return lines.slice(1)
      .map((line) => {
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches) return null;
        
        const cleanValues = matches.map(val => val.replace(/^"|"$/g, '').trim());
        return cleanValues[praiaIdx] || '';
      })
      .filter((val) => val !== '')
      .sort((a, b) => a.localeCompare(b));
  };

  const parseSpeciesCSV = (csvText: string): string[] => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    // Flexible matching for "Espécies" or "Especies"
    const speciesIdx = headers.findIndex(h => {
      const normalized = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalized === 'especies';
    });

    if (speciesIdx === -1) return [];

    return lines.slice(1)
      .map((line) => {
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!matches) return null;
        
        const cleanValues = matches.map(val => val.replace(/^"|"$/g, '').trim());
        return cleanValues[speciesIdx] || '';
      })
      .filter((val) => val !== '')
      .sort((a, b) => a.localeCompare(b));
  };

  const handleGetLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu dispositivo.');
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
        if (submitStatus === 'error') setSubmitStatus('idle');
      },
      (err) => {
        console.error(err);
        let msg = 'Erro ao obter localização.';
        if (err.code === 1) msg = 'Permissão de localização negada.';
        else if (err.code === 2) msg = 'Sinal de GPS indisponível.';
        else if (err.code === 3) msg = 'O tempo para obter a localização esgotou.';
        setLocationError(msg);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      const totalFiles = images.length + newFiles.length;

      if (totalFiles > 5) {
        alert("Máximo de 5 imagens permitido.");
        // Clear input so selecting the same file again works if needed
        e.target.value = ''; 
        return;
      }

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      
      // Reset input value to allow selecting the same file again if desired in a new batch
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    
    URL.revokeObjectURL(newPreviews[index]); // Cleanup specific URL
    
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
💵 Preço por kg: ${unitPrice} MZN
📦 Total: ${total} MZN
❄️ Condição: ${selectedCondition}
🌊 Origem: ${selectedOrigin}`;

    const phoneNumber = "258856022244";
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp in a new tab
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation
    if (!selectedProvider || !selectedOrigin || !selectedSpecies || !selectedCondition || !quantity || !unitPrice || !location || !selectedDate) {
      setSubmitStatus('error');
      return;
    }
    
    // Validate quantity
    const qtyValue = parseFloat(quantity.replace(',', '.'));
    if (isNaN(qtyValue) || qtyValue <= 0) {
      alert("Por favor, insira uma quantidade válida maior que 0.");
      setSubmitStatus('error');
      return;
    }

    // Validate unit price
    const priceValue = parseFloat(unitPrice.replace(',', '.'));
    if (isNaN(priceValue) || priceValue < 0) {
      alert("Por favor, insira um preço unitário válido.");
      setSubmitStatus('error');
      return;
    }

    const providerExists = providers.some(p => p.fullName === selectedProvider);
    if (!providerExists) {
      alert("Provedor não encontrado. Contacte o administrador para cadastro.");
      return;
    }

    const originExists = origins.includes(selectedOrigin);
    if (!originExists) {
      alert("Origem não encontrada na lista permitida.");
      return;
    }

    const speciesExists = species.includes(selectedSpecies);
    if (!speciesExists) {
      alert("Espécie não encontrada na lista permitida.");
      return;
    }

    setShowConfirmation(true);
  };

  const executeSubmission = async () => {
    setShowConfirmation(false);
    setSubmitStatus('submitting');

    // 2. Data Formatting
    // Format date to DD/MM/YYYY for spreadsheet
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    // 3. ID Generation
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
          const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
          // Find "Origem (Praia)" column
          const originIdx = headers.findIndex(h => {
             const lower = h.toLowerCase();
             return lower.includes('origem') || lower.includes('praia');
          });

          if (originIdx !== -1) {
             count = lines.slice(1).reduce((acc, line) => {
               // Matches standard CSV cells
               const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
               if (matches) {
                 const rowValues = matches.map(val => val.replace(/^"|"$/g, '').trim());
                 // Check if the origin matches (case-insensitive for robustness)
                 if (rowValues[originIdx] && rowValues[originIdx].toLowerCase() === selectedOrigin.toLowerCase()) {
                   return acc + 1;
                 }
               }
               return acc;
             }, 0);
          }
        }
        
        const sequence = count + 1;
        generatedId = `${originSlug}_${sequence.toString().padStart(3, '0')}`;
      } else {
        // Fallback if sheet cannot be read
        generatedId = `${originSlug}_001`;
      }
    } catch (error) {
      console.error("Error fetching GERAL sheet for ID generation:", error);
      const originSlug = selectedOrigin.trim().toLowerCase().replace(/\s+/g, '_');
      generatedId = `${originSlug}_ERROR`;
    }

    // 4. Construct Final Data Object
    // Link da Imagem is ignored as per requirements
    const registrationData = {
      "ID": generatedId,
      "Data de Captura": formattedDate,
      "Link da Imagem": "", // Explicitly empty/ignored
      "Espécie": selectedSpecies,
      "Qtd. (Kg)": quantity.replace('.', ','), // Ensure proper decimal format for PT Sheets
      "Preço Unit. (Kg)": unitPrice.replace('.', ','),
      "Estado": selectedCondition,
      "Provedor": selectedProvider,
      "Origem (Praia)": selectedOrigin,
      "Geo-Localização": `${location?.lat}, ${location?.lng}`
    };

    // 5. Submission (Via SheetDB API)
    try {
      const SHEETDB_API = 'https://sheetdb.io/api/v1/bfoqynbg612ad';
      
      const response = await fetch(`${SHEETDB_API}?sheet=GERAL`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: registrationData
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com o servidor.');
      }

      // Send WhatsApp message after successful submission
      sendWhatsAppNotification();

      setSubmitStatus('success');
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error("Erro na submissão:", err);
      alert("Houve um problema ao salvar o registo. Verifique sua conexão e tente novamente.");
      setSubmitStatus('error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header title="Novo Registo" showBack onBack={onClose} />
      
      <main className="flex-1 flex flex-col md:p-6">
        <div className="w-full md:max-w-md md:mx-auto flex flex-col flex-1">
          <form onSubmit={handlePreSubmit} className="flex flex-col flex-1 bg-white md:rounded-2xl md:shadow-sm md:border md:border-slate-100 md:overflow-hidden">
            <div className="p-6 space-y-6 flex-1">
              
              {/* 1. Field: Data da Captura (Icons kept) */}
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-bold text-slate-700">
                  Data da Captura
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (submitStatus === 'error') setSubmitStatus('idle');
                    }}
                    className="block w-full pl-10 pr-4 py-3 text-base border-slate-200 focus:ring-slate-900 focus:border-slate-900 rounded-xl bg-slate-50 text-slate-900 transition-colors"
                  />
                </div>
              </div>

              {/* 2. Field: Nome do Provedor (Icon removed) */}
              <div className="space-y-2">
                <label htmlFor="provider" className="block text-sm font-bold text-slate-700">
                  Nome do Provedor
                </label>
                
                {loading ? (
                  <div className="h-12 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
                ) : error ? (
                  <div className="flex items-center gap-2 p-3 text-red-500 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Erro ao carregar dados</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      id="provider"
                      value={selectedProvider}
                      onChange={(e) => {
                        setSelectedProvider(e.target.value);
                        if (submitStatus === 'error') setSubmitStatus('idle');
                      }}
                      className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 focus:ring-slate-900 focus:border-slate-900 rounded-xl bg-slate-50 text-slate-900 appearance-none transition-colors"
                    >
                      <option value="">Selecione um provedor...</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.fullName}>
                          {provider.fullName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Field: Origem do Pescado (Icon removed) */}
              <div className="space-y-2">
                <label htmlFor="origin" className="block text-sm font-bold text-slate-700">
                  Origem do Pescado
                </label>
                
                {loading ? (
                  <div className="h-12 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
                ) : error ? (
                  <div className="h-12 bg-red-50 rounded-xl border border-red-100" />
                ) : (
                  <div className="relative">
                    <select
                      id="origin"
                      value={selectedOrigin}
                      onChange={(e) => {
                        setSelectedOrigin(e.target.value);
                        if (submitStatus === 'error') setSubmitStatus('idle');
                      }}
                      className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 focus:ring-slate-900 focus:border-slate-900 rounded-xl bg-slate-50 text-slate-900 appearance-none transition-colors"
                    >
                      <option value="">Selecione a origem...</option>
                      {origins.map((origin, idx) => (
                        <option key={`origin-${idx}`} value={origin}>
                          {origin}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Field: Localização Geográfica */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Localização Geográfica
                </label>
                
                {!location ? (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Locate className="w-6 h-6" />
                    </div>
                    <div className="text-sm text-slate-500 max-w-[200px]">
                      Necessário capturar a localização atual para validar o registo.
                    </div>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                      className="w-full sm:w-auto"
                    >
                      {locationLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Obtendo GPS...
                        </>
                      ) : (
                        'Capturar Localização'
                      )}
                    </Button>
                    {locationError && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {locationError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                          <MapIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-800">Localização Capturada</p>
                          <p className="text-xs text-green-700 font-mono mt-0.5">
                            Lat: {location.lat.toFixed(6)}
                            <br />
                            Lng: {location.lng.toFixed(6)}
                          </p>
                          <a 
                            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:text-green-800 underline mt-1 inline-block"
                          >
                            Ver no Mapa
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={locationLoading}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 bg-white border border-slate-200 rounded-lg transition-colors"
                      >
                        {locationLoading ? '...' : 'Atualizar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Field: Espécie Capturada (Icon removed) */}
              <div className="space-y-2">
                <label htmlFor="species" className="block text-sm font-bold text-slate-700">
                  Espécie Capturada
                </label>
                
                {loading ? (
                  <div className="h-12 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
                ) : error ? (
                  <div className="h-12 bg-red-50 rounded-xl border border-red-100" />
                ) : (
                  <div className="relative">
                    <select
                      id="species"
                      value={selectedSpecies}
                      onChange={(e) => {
                        setSelectedSpecies(e.target.value);
                        if (submitStatus === 'error') setSubmitStatus('idle');
                      }}
                      className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 focus:ring-slate-900 focus:border-slate-900 rounded-xl bg-slate-50 text-slate-900 appearance-none transition-colors"
                    >
                      <option value="">Selecione a espécie...</option>
                      {species.map((s, idx) => (
                        <option key={`species-${idx}`} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Field: Imagem do Pescado */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Imagem do Pescado <span className="text-xs font-normal text-slate-400 ml-1">(Opcional, máx 5)</span>
                </label>
                
                <div className="space-y-3">
                  {/* Grid of previews */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {previews.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                          <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors backdrop-blur-sm"
                            aria-label="Remover imagem"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button Area */}
                  {images.length < 5 && (
                    <div className="relative">
                      <input
                        type="file"
                        id="fish-images"
                        accept="image/png, image/jpeg, image/jpg"
                        multiple
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                      <label
                        htmlFor="fish-images"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors active:bg-slate-200"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500 font-medium">Toque para adicionar fotos</p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG (Máx 5)</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* 7. Field: Quantidade (Icon removed) */}
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-sm font-bold text-slate-700">
                  Quantidade
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="quantity"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      if (submitStatus === 'error') setSubmitStatus('idle');
                    }}
                    className="block w-full pl-4 pr-12 py-3 text-base border-slate-200 focus:ring-slate-900 focus:border-slate-900 rounded-xl bg-slate-50 text-slate-900 transition-colors placeholder:text-slate-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">kg</span>
                  </div>
                </div>
              </div>

              {/* 8. Field: Condições (Icon removed) */}
              <div className="space-y-2">
                <label htmlFor="condition" className="block text-sm font-bold text-slate-700">
                  Condições
                </label>
                <div className="relative">
                  <select
                    id="condition"
                    value={selectedCondition}
                    onChange={(e) => {
                      setSelectedCondition(e.target.value);
                      if (submitStatus === 'error') setSubmitStatus('idle');
                    }}
                    className="block w-full pl-4 pr-10 py-3 text-base border-slate-200 focus:ring-slate-900 focus:border-slate-900 rounded-xl bg-slate-50 text-slate-900 appearance-none transition-colors"
                  >
                    <option value="">Selecione a condição...</option>
                    <option value="Fresco">Fresco</option>
                    <option value="Congelado">Congelado</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 9. Field: Preço Unitário (Icon removed) */}
              <div className="space-y-2">
                <label htmlFor="unitPrice" className="block text-sm font-bold text-slate-700">
                  Preço Unitário (Kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="unitPrice"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={unitPrice}
                    onChange={(e) => {
                      setUnitPrice(e.target.value);
                      if (submitStatus === 'error') setSubmitStatus('idle');
                    }}
                    className="block w-full pl-4 pr-12 py-3 text-base border-slate-200 focus:ring-slate-900 focus:border-slate-900 rounded-xl bg-slate-50 text-slate-900 transition-colors placeholder:text-slate-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">MT</span>
                  </div>
                </div>
                
                {/* Total Calculation Display */}
                {(quantity || unitPrice) && (
                  <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-sm border border-slate-200">
                    <span className="text-slate-600 font-medium">Total Estimado</span>
                    <span className="text-slate-900 font-bold text-base">{calculateTotal()} MT</span>
                  </div>
                )}
              </div>

              {submitStatus === 'error' && (!selectedProvider || !selectedOrigin || !selectedSpecies || !selectedCondition || !quantity || !unitPrice || !location || !selectedDate) && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Por favor, preencha todos os campos obrigatórios e capture a localização.</p>
                </div>
              )}
              
              {loading && (
                <div className="text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sincronizando dados...
                </div>
              )}

            </div>

            <div className="p-6 bg-white md:bg-slate-50 border-t border-slate-100 sticky bottom-0 z-10 md:static shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
              <Button 
                type="submit" 
                fullWidth 
                disabled={loading || !!error || submitStatus === 'submitting' || submitStatus === 'success'}
                className={submitStatus === 'success' ? '!bg-green-600' : ''}
              >
                {submitStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Registado!
                  </>
                ) : (
                  'Submeter Registo'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowConfirmation(false)} 
            aria-hidden="true"
          />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Confirmar Dados</h3>
              <button 
                onClick={() => setShowConfirmation(false)} 
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Data</p>
                    <p className="text-slate-900 font-medium">{selectedDate.split('-').reverse().join('/')}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Espécie</p>
                    <p className="text-slate-900 font-medium">{selectedSpecies}</p>
                 </div>
               </div>

               <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Provedor</p>
                  <p className="text-slate-900 font-medium">{selectedProvider}</p>
               </div>

               <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Origem</p>
                  <p className="text-slate-900 font-medium">{selectedOrigin}</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quantidade</p>
                    <p className="text-slate-900 font-medium">{quantity} kg</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Condição</p>
                    <p className="text-slate-900 font-medium">{selectedCondition}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Preço Unit.</p>
                    <p className="text-slate-900 font-medium">{unitPrice} MT</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</p>
                    <p className="text-green-600 font-bold">{calculateTotal()} MT</p>
                 </div>
               </div>

               <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Localização</p>
                  <p className="text-slate-900 font-mono text-sm">
                    {location?.lat.toFixed(6)}, {location?.lng.toFixed(6)}
                  </p>
               </div>

               {images.length > 0 && (
                 <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Imagens ({images.length})</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {previews.map((url, idx) => (
                        <div key={idx} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                 <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-1">
                   ⚠️ Atenção
                 </h4>
                 <p className="text-xs text-amber-800 leading-relaxed">
                   Após clicar em Confirmar, você será redirecionado para o WhatsApp. É necessário enviar a mensagem para nossa equipe para que o registo seja validado e visto pelos clientes.
                 </p>
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0 gap-3 flex">
               <Button 
                 variant="secondary" 
                 onClick={() => setShowConfirmation(false)} 
                 className="flex-1"
                 type="button"
               >
                 Voltar
               </Button>
               <Button 
                 onClick={executeSubmission} 
                 className="flex-1 !bg-green-600 hover:!bg-green-700"
                 type="button"
               >
                 Confirmar
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};