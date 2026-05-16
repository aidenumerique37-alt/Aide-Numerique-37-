import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, ArrowRight, CheckCircle, Zap, Users, Brain, Globe,
  Server, TrendingUp, Shield, Clock, Star, ChevronDown, Menu, X,
  Monitor, Briefcase, BookOpen, Cpu, BarChart2, Wifi
} from 'lucide-react';

const PHONE = '07 61 50 35 85';
const EMAIL = 'aidenumerique37@gmail.com';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_URL = 'https://www.aidenumerique37.fr';

/* ─── Animated counter ─── */
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 50;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 30);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Pro services data ─── */
const PRO_SERVICES = [
  {
    icon: Server,
    title: 'Prestataire Informatique',
    desc: 'Support IT pour TPE, PME et auto-entrepreneurs. Maintenance, dépannage, sécurité réseau, sauvegardes. Un interlocuteur unique pour toute votre informatique.',
    tags: ['Contrat ponctuel', 'Sur devis', 'Déplacement inclus'],
    color: 'from-sky-500 to-blue-600',
  },
  {
    icon: Users,
    title: 'Formation & Montée en Compétences',
    desc: 'Formez vos équipes aux outils numériques professionnels : Microsoft 365, Google Workspace, logiciels métier. Ateliers sur-mesure en présentiel ou à distance.',
    tags: ['Sur-mesure', 'En entreprise', 'Attestation formation'],
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Brain,
    title: 'IA & Automatisation',
    desc: 'Intégrez l\'intelligence artificielle dans vos flux de travail quotidiens. ChatGPT, Copilot, automatisation de tâches répétitives. Gagnez du temps et réduisez les erreurs.',
    tags: ['ChatGPT / Copilot', 'Automatisation', 'Gains mesurables'],
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Wifi,
    title: 'Fracture Numérique en Entreprise',
    desc: 'Certains collaborateurs sont à l\'écart du numérique ? Remise à niveau progressive et bienveillante, adaptée à chaque profil. Zéro jugement, 100% efficacité.',
    tags: ['Tous niveaux', 'Pédagogie adaptée', 'Résultats concrets'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Création de Site Web IA',
    desc: 'Site vitrine ou e-commerce conçu avec l\'IA. Rendu professionnel en 48h, hébergement inclus la première année. Solution clé en main pensée pour les pros.',
    tags: ['48h chrono', 'Hébergement 1 an', 'Clé en main'],
    color: 'from-cyan-500 to-sky-600',
  },
];

const ADVANTAGES = [
  { icon: Clock, label: 'Réactivité', desc: 'Intervention en moins de 7 jours sur site ou à distance' },
  { icon: Shield, label: 'Discrétion', desc: 'Vos données restent confidentielles et hébergées en France' },
  { icon: Star, label: 'Expertise', desc: '8 ans d\'expérience terrain en informatique professionnelle' },
  { icon: BarChart2, label: 'Résultats concrets', desc: 'Objectifs définis ensemble avant chaque intervention' },
];

const STATS = [
  { value: 8, suffix: ' ans', label: 'D\'expertise informatique' },
  { value: 30, suffix: '+', label: 'Entreprises accompagnées' },
  { value: 7, suffix: 'j', label: 'Délai max d\'intervention' },
  { value: 98, suffix: '%', label: 'Taux de satisfaction' },
];

/* ─── Header Pro ─── */
const ProHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#080d1a]/90 backdrop-blur-md border-b border-sky-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Aide Numérique 37"
            className="h-8 w-auto"
          />
          <span className="text-white font-bold text-lg hidden sm:block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Aide Numérique <span className="text-sky-400">Pro</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {['Services', 'Avantages', 'Contact'].map(label => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-gray-300 hover:text-sky-400 transition-colors text-sm font-medium"
            >
              {label}
            </a>
          ))}
          <Link
            to="/"
            className="text-gray-400 hover:text-white text-sm border border-gray-700 rounded-lg px-3 py-1.5 transition-all hover:border-gray-500"
          >
            Version Particulier
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${PHONE.replace(/\s/g, '')}`}
            className="hidden sm:flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            data-testid="pro-header-phone"
          >
            <Phone size={14} />
            {PHONE}
          </a>
          <button
            className="md:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a1120] border-t border-sky-500/20 px-4 py-4 space-y-3">
          {['Services', 'Avantages', 'Contact'].map(label => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="block text-gray-300 hover:text-sky-400 py-2 text-sm"
            >
              {label}
            </a>
          ))}
          <Link to="/" className="block text-gray-400 hover:text-white py-2 text-sm">
            Version Particulier →
          </Link>
          <a
            href={`tel:${PHONE.replace(/\s/g, '')}`}
            className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Phone size={14} /> {PHONE}
          </a>
        </div>
      )}
    </header>
  );
};

/* ─── Main Page ─── */
export default function ProPage() {
  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const [featuredProjects, setFeaturedProjects] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/portfolio`)
      .then(r => r.json())
      .then(data => setFeaturedProjects((data || []).filter(p => p.featured).slice(0, 3)))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormError('Veuillez remplir les champs obligatoires.');
      return;
    }
    setSending(true);
    setFormError('');
    try {
      await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          message: `[PROSPECT PRO — ${formData.company || 'Sans société'}]\n\nSujet : ${formData.subject || 'Contact Pro'}\n\n${formData.message}`,
        }),
      });
      setSent(true);
    } catch {
      setFormError('Erreur lors de l\'envoi. Contactez-nous directement au ' + PHONE);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-[#060b16] text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <Helmet>
        <title>Prestataire Informatique Entreprise — Aide Numérique 37 Pro | Tours (37)</title>
        <meta name="description" content="Prestataire informatique pour TPE/PME à Tours (37). Formation IA, conseil numérique, support IT, 60€/h HT. Devis gratuit sous 24h — 07 61 50 35 85." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_URL}/pro`} />
        <meta property="og:title" content="Prestataire Informatique Entreprise | Aide Numérique 37 Pro" />
        <meta property="og:description" content="Support IT, formation IA et conseil numérique pour TPE/PME en Indre-et-Loire. Devis gratuit sous 24h." />
        <meta property="og:image" content="https://www.aidenumerique37.fr/logo.png" />
        <meta property="og:url" content={`${SITE_URL}/pro`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta property="og:locale" content="fr_FR" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "Aide Numérique 37 — Prestations Professionnelles",
          "description": "Prestataire informatique pour entreprises : support IT, formation IA, conseil numérique, Joué-lès-Tours (37).",
          "telephone": "0761503585",
          "email": EMAIL,
          "address": { "@type": "PostalAddress", "streetAddress": "5 Rue James Pradier", "addressLocality": "Joué-lès-Tours", "postalCode": "37300", "addressCountry": "FR" },
          "priceRange": "60€/h HT",
          "areaServed": "Indre-et-Loire"
        })}</script>
      </Helmet>

      <ProHeader />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'linear-gradient(rgba(14,165,233,1) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-full px-4 py-1.5 text-sm font-medium mb-8" data-testid="pro-hero-badge">
              <Cpu size={14} />
              Prestataire Informatique — Indre-et-Loire
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight" data-testid="pro-hero-title">
              Informatique professionnelle
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                à votre service
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-4 leading-relaxed">
              Support IT, formation IA, remise à niveau numérique en entreprise.
              Un expert de confiance à vos côtés pour toutes vos problématiques informatiques, en Indre-et-Loire.
            </p>
            <p className="text-sky-400 font-bold text-lg mb-10" data-testid="pro-hero-price">
              60 €/h HT · Devis gratuit · Intervention en moins de 7 jours
            </p>

            <div className="flex flex-col sm:flex-row gap-4" data-testid="pro-hero-ctas">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5"
              >
                Demander un devis gratuit
                <ArrowRight size={20} />
              </a>
              <a
                href={`tel:${PHONE.replace(/\s/g, '')}`}
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-sky-500/50 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
              >
                <Phone size={18} />
                {PHONE}
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
            <ChevronDown size={24} className="text-gray-500" />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-sky-500/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, suffix, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-sky-400 mb-1">
                  <Counter target={value} suffix={suffix} />
                </div>
                <div className="text-gray-400 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sky-400 text-sm font-semibold uppercase tracking-widest">Nos prestations</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-4">
              Services dédiés aux professionnels
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Des solutions concrètes pour chaque problématique numérique de votre entreprise.
              Adaptées à votre secteur, votre taille, votre équipe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="pro-services-grid">
            {PRO_SERVICES.map(({ icon: Icon, title, desc, tags, color }) => (
              <div
                key={title}
                className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10"
                data-testid={`pro-service-${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Hover glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 pointer-events-none`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVANTAGES ── */}
      <section id="avantages" className="py-20 bg-white/[0.02] border-y border-sky-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sky-400 text-sm font-semibold uppercase tracking-widest">Pourquoi nous choisir</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-6">
                L'expertise terrain,<br />
                <span className="text-sky-400">au service de votre activité</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Aide Numérique 37, c'est 8 ans d'expérience en informatique professionnelle et personnelle.
                Basé à Joué-lès-Tours, j'interviens dans tout l'Indre-et-Loire pour accompagner votre structure
                dans toutes ses problématiques numériques, avec bienveillance et efficacité.
              </p>
              <div className="space-y-4">
                {[
                  'Aucun engagement long terme — mission ponctuelle ou récurrente',
                  'Tarif transparent : 60€/h HT, devis détaillé avant intervention',
                  'Disponible en semaine, week-end sur accord préalable',
                  'Maîtrise complète : Windows, Mac, Linux, cloud, réseaux, IA',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-sky-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {ADVANTAGES.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-sky-500/30 transition-all group"
                >
                  <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-sky-500/20 transition-colors">
                    <Icon size={18} className="text-sky-400" />
                  </div>
                  <div className="font-bold text-white text-sm mb-1">{label}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── IA FOCUS SECTION ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-900/20 to-[#080d1a] p-8 sm:p-12">
            <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Brain size={14} />
                Intelligence Artificielle en entreprise
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-4">
                Vos équipes ne savent pas encore exploiter l'IA ?
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                ChatGPT, Copilot for Microsoft 365, automatisation de devis, génération de rapports, analyse de données…
                L'IA peut réduire de 30 à 50% le temps passé sur les tâches répétitives.
                Je forme vos collaborateurs avec des cas d'usage concrets issus de votre secteur.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Zap, text: 'Atelier pratique 3h — prise en main immédiate' },
                  { icon: Briefcase, text: 'Cas d\'usage adaptés à votre métier' },
                  { icon: BookOpen, text: 'Support & documentation personnalisés' },
                  { icon: TrendingUp, text: 'Suivi des gains de productivité' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <Icon size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm">{text}</span>
                  </div>
                ))}
              </div>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                Organiser un atelier IA
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── RÉALISATIONS FEATURED ── */}
      {featuredProjects.length > 0 && (
        <section className="py-20 border-t border-sky-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-sky-400 text-sm font-semibold uppercase tracking-widest">Portfolio</span>
                <h2 className="text-3xl font-black mt-2 text-white">Quelques réalisations</h2>
                <p className="text-gray-400 text-sm mt-2">Sites web créés avec l'IA pour des clients en Indre-et-Loire</p>
              </div>
              <a href="/realisations"
                className="inline-flex items-center gap-2 text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors whitespace-nowrap">
                Voir toutes les réalisations
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map(p => {
                const imageUrl = p.image_url
                  ? p.image_url.startsWith('http') ? p.image_url : `${BACKEND_URL}${p.image_url}`
                  : null;
                return (
                  <div key={p.id} className="group bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-sky-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/5">
                    {/* Browser chrome */}
                    <div className="bg-white/5 px-3 py-2 flex items-center gap-1.5 border-b border-white/10">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                      <div className="flex-1 ml-1.5 bg-white/10 rounded-full px-2.5 py-0.5 text-[10px] text-gray-500 truncate">
                        {p.url ? p.url.replace(/^https?:\/\//, '') : 'votre-site.fr'}
                      </div>
                    </div>
                    {/* Screenshot */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={p.title} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20 text-sm">Aperçu à venir</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-bold bg-white text-gray-900 px-4 py-1.5 rounded-full flex items-center gap-1.5">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            Voir le site
                          </a>
                        )}
                      </div>
                    </div>
                    {/* Footer */}
                    <div className="px-4 py-3">
                      <p className="font-bold text-sm text-white">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.client_type}{p.year ? ` · ${p.year}` : ''}</p>
                      {p.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.technologies.slice(0, 3).map(t => (
                            <span key={t} className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT FORM ── */}
      <section id="contact" className="py-24 bg-white/[0.02] border-t border-sky-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left — info */}
            <div>
              <span className="text-sky-400 text-sm font-semibold uppercase tracking-widest">Devis gratuit</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-6">
                Parlons de votre projet
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Décrivez votre besoin et je vous rappelle dans les meilleurs délais avec une proposition adaptée.
                Aucun engagement, aucun frais de déplacement pour l'étude initiale.
              </p>

              <div className="space-y-4 mb-8">
                <a
                  href={`tel:${PHONE.replace(/\s/g, '')}`}
                  className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:border-sky-500/40 transition-all group"
                  data-testid="pro-contact-phone"
                >
                  <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                    <Phone size={18} className="text-sky-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Appel direct</div>
                    <div className="text-white font-bold">{PHONE}</div>
                  </div>
                </a>
                <a
                  href={`mailto:${EMAIL}?subject=Contact Pro — Devis`}
                  className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:border-sky-500/40 transition-all group"
                  data-testid="pro-contact-email"
                >
                  <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center group-hover:bg-sky-500/20 transition-colors">
                    <Mail size={18} className="text-sky-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Email</div>
                    <div className="text-white font-bold text-sm">{EMAIL}</div>
                  </div>
                </a>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                  <Star size={14} />
                  Zone d'intervention
                </div>
                <p className="text-gray-400 text-sm">
                  Tours, Joué-lès-Tours, Chambray-lès-Tours, Saint-Avertin, Ballan-Miré
                  et dans tout l'Indre-et-Loire (rayon 20 km).
                  Accompagnement à distance possible partout en France.
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sm:p-8">
              {sent ? (
                <div className="text-center py-8" data-testid="pro-form-success">
                  <CheckCircle size={48} className="text-sky-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Message envoyé !</h3>
                  <p className="text-gray-400">Je vous réponds dans les 24h ouvrées.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="pro-contact-form">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Nom *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                        placeholder="Jean Dupont"
                        data-testid="pro-form-name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Société</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                        placeholder="Votre société"
                        data-testid="pro-form-company"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                        placeholder="vous@societe.fr"
                        data-testid="pro-form-email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">Téléphone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
                        placeholder="06 00 00 00 00"
                        data-testid="pro-form-phone"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Besoin principal</label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                      className="w-full bg-[#0a1120] border border-white/10 focus:border-sky-500/50 rounded-xl px-4 py-3 text-gray-300 text-sm outline-none transition-colors"
                      data-testid="pro-form-subject"
                    >
                      <option value="">Sélectionner...</option>
                      <option>Prestataire informatique (contrat)</option>
                      <option>Formation équipes (IA / Outils)</option>
                      <option>Fracture numérique en entreprise</option>
                      <option>Conseil stratégie numérique</option>
                      <option>Création de site web</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Décrivez votre besoin *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 focus:border-sky-500/50 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors resize-none"
                      placeholder="Nombre d'employés, problématique actuelle, urgence..."
                      data-testid="pro-form-message"
                    />
                  </div>
                  {formError && (
                    <p className="text-red-400 text-sm" data-testid="pro-form-error">{formError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    data-testid="pro-form-submit"
                  >
                    {sending ? 'Envoi en cours...' : (
                      <>Envoyer ma demande <ArrowRight size={16} /></>
                    )}
                  </button>
                  <p className="text-gray-500 text-xs text-center">
                    Réponse garantie sous 24h ouvrées · Aucun engagement
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Aide Numérique 37"
              className="h-8 w-auto opacity-70"
            />
            <span className="text-gray-400 text-sm">Aide Numérique 37 — Prestations Pro</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-300 transition-colors">Site Particulier</Link>
            <Link to="/mentions-legales" className="hover:text-gray-300 transition-colors">Mentions légales</Link>
            <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="hover:text-gray-300 transition-colors">{PHONE}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
