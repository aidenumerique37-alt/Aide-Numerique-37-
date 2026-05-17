import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SERVICES = [
  {
    id: 'depannage',
    label: 'Dépannage informatique',
    emoji: '🔧',
    options: [
      'PC ou Mac lent',
      'Virus / malware',
      'Écran ou clavier cassé',
      'Connexion internet',
      'Imprimante',
      'Récupération de données',
      'Autre',
    ],
  },
  {
    id: 'formation',
    label: 'Formation numérique',
    emoji: '📚',
    options: [
      'Smartphone ou tablette',
      'Ordinateur (débutant)',
      'Réseaux sociaux',
      'Emails et sécurité',
      'Outils bureautique',
      'Autre',
    ],
  },
  {
    id: 'installation',
    label: 'Installation & Configuration',
    emoji: '⚙️',
    options: [
      'WiFi / box internet',
      'Imprimante ou scanner',
      'Nouveau PC ou Mac',
      'Logiciels',
      'Sauvegarde des données',
      'Autre',
    ],
  },
  {
    id: 'siteweb',
    label: 'Création de site web',
    emoji: '🌐',
    options: [
      'Site vitrine',
      'Boutique en ligne',
      'Refonte d\'un site existant',
      'Maintenance',
      'Autre',
    ],
  },
  {
    id: 'autre',
    label: 'Autre demande',
    emoji: '💬',
    options: [],
  },
];

const TOTAL_STEPS = 3;

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {[1, 2, 3].map((s) => (
      <React.Fragment key={s}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
          s < current ? 'bg-french-blue text-white' :
          s === current ? 'bg-french-blue text-white ring-4 ring-french-blue/20' :
          'bg-gray-200 text-gray-400'
        }`}>
          {s < current ? '✓' : s}
        </div>
        {s < 3 && <div className={`h-0.5 w-8 transition-all duration-300 ${s < current ? 'bg-french-blue' : 'bg-gray-200'}`} />}
      </React.Fragment>
    ))}
  </div>
);

const ContactForm = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [contact, setContact] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const service = SERVICES.find(s => s.id === selectedService);

  const toggleOption = (opt) => {
    setSelectedOptions(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const goNext = () => {
    if (step === 1 && selectedService) {
      // If "autre" or no sub-options, skip step 2
      if (!service?.options?.length) {
        setStep(3);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  const goBack = () => {
    if (step === 3 && (!service?.options?.length)) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      const payload = {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        service: service?.label || '',
        service_options: selectedOptions,
        subject: service?.label || 'Demande de contact',
        message: contact.message,
      };
      const res = await axios.post(`${BACKEND_URL}/api/contact/send`, payload);
      if (res.data?.success) {
        setStatus('success');
      } else {
        throw new Error('Réponse inattendue');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'Une erreur est survenue. Réessayez ou appelez le 07 61 50 35 85.');
    }
  };

  // SUCCESS
  if (status === 'success') {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900/80 dark:border-gray-800 shadow-xl dark:shadow-none">
        <CardContent className="py-14 text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-green-600" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Demande envoyée !</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
            Je vous recontacte dans les plus brefs délais, généralement sous 24h.
          </p>
          <Button
            onClick={() => { setStep(1); setSelectedService(null); setSelectedOptions([]); setContact({ name:'', phone:'', email:'', message:'' }); setStatus('idle'); }}
            className="bg-french-blue hover:bg-french-blue/90 text-white px-8 py-3"
          >
            Nouvelle demande
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900/80 dark:border-gray-800 shadow-xl dark:shadow-none">
      <CardContent className="pt-8 pb-8 px-6 sm:px-8">
        <StepIndicator current={step} />

        {/* ── STEP 1 : Choix du service ── */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
              De quoi avez-vous besoin ?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">Choisissez le service qui correspond à votre situation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedService(s.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedService === s.id
                      ? 'border-french-blue bg-french-blue/5 dark:bg-french-blue/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-french-blue/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className={`font-medium text-sm ${selectedService === s.id ? 'text-french-blue' : 'text-gray-700 dark:text-gray-200'}`}>
                    {s.label}
                  </span>
                  {selectedService === s.id && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-french-blue flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-white"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
            <Button
              onClick={goNext}
              disabled={!selectedService}
              className="w-full mt-6 bg-french-blue hover:bg-french-blue/90 text-white py-5 text-base disabled:opacity-40"
            >
              Continuer <ChevronRight className="ml-1" size={18} />
            </Button>
          </div>
        )}

        {/* ── STEP 2 : Options du service ── */}
        {step === 2 && service && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
              {service.emoji} {service.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Précisez votre besoin <span className="text-gray-400">(plusieurs choix possibles)</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {service.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                    selectedOptions.includes(opt)
                      ? 'border-french-blue bg-french-blue text-white'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-french-blue/60'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={goBack} className="flex-1 py-5 border-gray-200 dark:border-gray-700">
                <ChevronLeft className="mr-1" size={18} /> Retour
              </Button>
              <Button
                onClick={goNext}
                className="flex-[2] bg-french-blue hover:bg-french-blue/90 text-white py-5"
              >
                Continuer <ChevronRight className="ml-1" size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3 : Coordonnées ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">Vos coordonnées</h3>
            {service && (
              <p className="text-sm text-center mb-5">
                <span className="inline-flex items-center gap-1.5 bg-french-blue/10 text-french-blue px-3 py-1 rounded-full text-xs font-medium">
                  {service.emoji} {service.label}
                  {selectedOptions.length > 0 && <> · {selectedOptions.join(', ')}</>}
                </span>
              </p>
            )}

            {status === 'error' && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 text-sm font-medium">Nom complet *</Label>
                  <Input
                    id="name" required minLength={2}
                    value={contact.name}
                    onChange={e => setContact(p => ({ ...p, name: e.target.value }))}
                    placeholder="Jean Dupont"
                    disabled={status === 'loading'}
                    className="border-gray-300 focus:border-french-blue"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 text-sm font-medium">Téléphone *</Label>
                  <Input
                    id="phone" required type="tel"
                    value={contact.phone}
                    onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                    placeholder="07 61 50 35 85"
                    pattern="[0-9\s.+\-()·]{10,16}"
                    title="Numéro de téléphone valide (ex: 07 61 50 35 85)"
                    disabled={status === 'loading'}
                    className="border-gray-300 focus:border-french-blue"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 text-sm font-medium">Email *</Label>
                <Input
                  id="email" type="email" required
                  value={contact.email}
                  onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                  placeholder="jean.dupont@example.com"
                  disabled={status === 'loading'}
                  className="border-gray-300 focus:border-french-blue"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-gray-700 dark:text-gray-300 text-sm font-medium">Décrivez votre situation</Label>
                <Textarea
                  id="message"
                  value={contact.message}
                  onChange={e => setContact(p => ({ ...p, message: e.target.value }))}
                  placeholder="Donnez-moi plus de détails sur votre besoin..."
                  rows={4}
                  disabled={status === 'loading'}
                  className="border-gray-300 focus:border-french-blue resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="outline" onClick={goBack} className="flex-1 py-5 border-gray-200 dark:border-gray-700" disabled={status === 'loading'}>
                <ChevronLeft className="mr-1" size={18} /> Retour
              </Button>
              <Button
                type="submit"
                disabled={status === 'loading'}
                className="flex-[2] bg-french-red hover:bg-french-red/90 text-white py-5 text-base shadow-lg"
              >
                {status === 'loading' ? (
                  <><Loader2 className="mr-2 animate-spin" size={18} />Envoi...</>
                ) : (
                  <><Send className="mr-2" size={18} />Envoyer ma demande</>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">* Champs obligatoires</p>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactForm;
