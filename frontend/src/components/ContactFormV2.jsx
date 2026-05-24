import React, { useState } from 'react';
import { Send, Loader2, ArrowRight, ArrowLeft, Check,
         Monitor, BookOpen, Settings, Globe, MessageSquare } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SERVICES = [
  {
    id: 'depannage',
    label: 'Dépannage informatique',
    description: 'PC lent, virus, panne matérielle',
    Icon: Monitor,
    options: ['PC ou Mac lent','Virus / malware','Écran ou clavier cassé','Connexion internet','Imprimante','Récupération de données','Autre'],
  },
  {
    id: 'formation',
    label: 'Formation numérique',
    description: 'Smartphone, ordinateur, bureautique',
    Icon: BookOpen,
    options: ['Smartphone ou tablette','Ordinateur (débutant)','Réseaux sociaux','Emails et sécurité','Outils bureautique','Autre'],
  },
  {
    id: 'installation',
    label: 'Installation & Configuration',
    description: 'WiFi, imprimante, nouveau matériel',
    Icon: Settings,
    options: ['WiFi / box internet','Imprimante ou scanner','Nouveau PC ou Mac','Logiciels','Sauvegarde des données','Autre'],
  },
  {
    id: 'siteweb',
    label: 'Création de site web',
    description: 'Vitrine, boutique, refonte',
    Icon: Globe,
    options: ['Site vitrine','Boutique en ligne','Refonte d\'un site existant','Maintenance','Autre'],
  },
  {
    id: 'autre',
    label: 'Autre demande',
    description: 'Toute autre question',
    Icon: MessageSquare,
    options: [],
  },
];

/* ── Progress bar ─────────────────────────────────────────────────── */
const ProgressBar = ({ step, total }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2">
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#0D2E5C' }}>
        ÉTAPE {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      <span style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.05em' }}>
        {step === 1 ? 'VOTRE BESOIN' : step === 2 ? 'PRÉCISER' : 'VOS COORDONNÉES'}
      </span>
    </div>
    <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${(step / total) * 100}%`,
          background: '#0D2E5C',
          borderRadius: 2,
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </div>
  </div>
);

/* ── Field ────────────────────────────────────────────────────────── */
const Field = ({ label, required, children }) => (
  <div>
    <label style={{
      display: 'block',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.08em',
      color: '#64748b',
      marginBottom: 6,
      textTransform: 'uppercase',
    }}>
      {label}{required && <span style={{ color: '#0D2E5C', marginLeft: 3 }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%',
  border: '1.5px solid #cbd5e1',
  borderRadius: 4,
  padding: '10px 12px',
  fontSize: 15,
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

/* ── Boutons nav ──────────────────────────────────────────────────── */
const BtnPrimary = ({ onClick, type = 'button', disabled, children }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={{
      flex: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '13px 20px',
      background: disabled ? '#cbd5e1' : '#0D2E5C',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: '0.04em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.15s',
    }}
  >
    {children}
  </button>
);

const BtnSecondary = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '13px 16px',
      background: 'transparent',
      color: '#64748b',
      border: '1.5px solid #cbd5e1',
      borderRadius: 4,
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
    }}
  >
    <ArrowLeft size={15} /> Retour
  </button>
);

/* ── Composant principal ──────────────────────────────────────────── */
const ContactFormV2 = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [contact, setContact] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const service = SERVICES.find(s => s.id === selectedService);
  const hasOptions = service?.options?.length > 0;

  const goNext = () => {
    if (step === 1 && selectedService) setStep(hasOptions ? 2 : 3);
    else if (step === 2) setStep(3);
  };

  const goBack = () => {
    if (step === 3) setStep(hasOptions ? 2 : 1);
    else setStep(step - 1);
  };

  const toggleOption = (opt) =>
    setSelectedOptions(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await axios.post(`${BACKEND_URL}/api/contact/send`, {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        service: service?.label || '',
        service_options: selectedOptions,
        subject: service?.label || 'Demande de contact',
        message: contact.message,
      });
      if (res.data?.success) setStatus('success');
      else throw new Error();
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'Une erreur est survenue. Appelez le 07 61 50 35 85.');
    }
  };

  /* SUCCESS */
  if (status === 'success') {
    return (
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 6, padding: '48px 40px', textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#0D2E5C', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Check size={22} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#0D2E5C', marginBottom: 10, textTransform: 'uppercase' }}>
          Demande enregistrée
        </div>
        <p style={{ color: '#475569', fontSize: 15, maxWidth: 320, margin: '0 auto 28px', lineHeight: 1.6 }}>
          Je vous recontacte dans les plus brefs délais, généralement sous 24h.
        </p>
        <button
          onClick={() => { setStep(1); setSelectedService(null); setSelectedOptions([]); setContact({ name:'', phone:'', email:'', message:'' }); setStatus('idle'); }}
          style={{
            padding: '10px 24px', background: 'transparent', border: '1.5px solid #0D2E5C',
            borderRadius: 4, color: '#0D2E5C', fontSize: 13, fontWeight: 700,
            letterSpacing: '0.06em', cursor: 'pointer',
          }}
        >
          Nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 6, padding: '32px 32px 28px' }}>
      <ProgressBar step={step} total={3} />

      {/* ── ÉTAPE 1 ── */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            Quel est votre besoin ?
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>
            Sélectionnez une catégorie pour continuer.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SERVICES.map(s => {
              const active = selectedService === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedService(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    background: active ? '#f0f4fa' : '#fafafa',
                    border: `1.5px solid ${active ? '#0D2E5C' : '#e2e8f0'}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 4, flexShrink: 0,
                    background: active ? '#0D2E5C' : '#e8edf5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}>
                    <s.Icon size={17} color={active ? '#fff' : '#0D2E5C'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: active ? '#0D2E5C' : '#1e293b' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                      {s.description}
                    </div>
                  </div>
                  {active && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: '#0D2E5C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 20 }}>
            <BtnPrimary onClick={goNext} disabled={!selectedService}>
              Continuer <ArrowRight size={15} />
            </BtnPrimary>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 2 ── */}
      {step === 2 && service && (
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            {service.label}
          </h3>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>
            Précisez votre situation — plusieurs choix possibles.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {service.options.map(opt => {
              const checked = selectedOptions.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    background: checked ? '#f0f4fa' : '#fafafa',
                    border: `1.5px solid ${checked ? '#0D2E5C' : '#e2e8f0'}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 3, flexShrink: 0,
                    background: checked ? '#0D2E5C' : '#fff',
                    border: `1.5px solid ${checked ? '#0D2E5C' : '#cbd5e1'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.12s',
                  }}>
                    {checked && <Check size={11} color="#fff" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 14, color: checked ? '#0D2E5C' : '#334155', fontWeight: checked ? 600 : 400 }}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <BtnSecondary onClick={goBack} />
            <BtnPrimary onClick={goNext}>
              Continuer <ArrowRight size={15} />
            </BtnPrimary>
          </div>
        </div>
      )}

      {/* ── ÉTAPE 3 ── */}
      {step === 3 && (
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            Vos coordonnées
          </h3>

          {/* Récap */}
          {service && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#f0f4fa', borderRadius: 3, padding: '4px 10px',
              marginBottom: 20, fontSize: 12, fontWeight: 600, color: '#0D2E5C',
            }}>
              <service.Icon size={12} />
              {service.label}
              {selectedOptions.length > 0 && (
                <span style={{ color: '#64748b', fontWeight: 400 }}>
                  · {selectedOptions.join(', ')}
                </span>
              )}
            </div>
          )}

          {status === 'error' && (
            <div style={{
              marginBottom: 16, padding: '10px 14px',
              background: '#fff1f2', border: '1.5px solid #fecdd3',
              borderRadius: 4, fontSize: 13, color: '#be123c',
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nom complet" required>
                <input
                  required minLength={2}
                  value={contact.name}
                  onChange={e => setContact(p => ({ ...p, name: e.target.value }))}
                  placeholder="Jean Dupont"
                  disabled={status === 'loading'}
                  style={inputStyle}
                />
              </Field>
              <Field label="Téléphone" required>
                <input
                  required type="tel"
                  value={contact.phone}
                  onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                  placeholder="07 61 50 35 85"
                  pattern="[0-9\s.+\-()·]{10,16}"
                  disabled={status === 'loading'}
                  style={inputStyle}
                />
              </Field>
            </div>

            <Field label="Adresse email" required>
              <input
                required type="email"
                value={contact.email}
                onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                placeholder="jean.dupont@exemple.com"
                disabled={status === 'loading'}
                style={inputStyle}
              />
            </Field>

            <Field label="Décrivez votre situation">
              <textarea
                value={contact.message}
                onChange={e => setContact(p => ({ ...p, message: e.target.value }))}
                placeholder="Informations complémentaires utiles à votre demande..."
                rows={4}
                disabled={status === 'loading'}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
              />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <BtnSecondary onClick={goBack} />
            <BtnPrimary type="submit" disabled={status === 'loading'}>
              {status === 'loading'
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Envoi en cours...</>
                : <><Send size={15} /> Envoyer la demande</>
              }
            </BtnPrimary>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 8 }}>
            * Champs obligatoires
          </p>
        </form>
      )}
    </div>
  );
};

export default ContactFormV2;
