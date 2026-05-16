import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ExternalLink, ArrowRight, Phone, Code2, Globe, Layers } from 'lucide-react';
import RecentArticles from '../components/RecentArticles';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_URL = 'https://www.aidenumerique37.fr';
const PHONE = '07 61 50 35 85';

/* ─── Browser Mockup Card ─── */
const BrowserCard = ({ project }) => {
  const imageUrl = project.image_url
    ? project.image_url.startsWith('http') ? project.image_url : `${BACKEND_URL}${project.image_url}`
    : null;

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800">
      {/* Browser chrome */}
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 bg-white dark:bg-gray-700 rounded-full px-3 py-1 flex items-center gap-1.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
          <span className="text-[11px] text-gray-400 dark:text-gray-400 truncate">
            {project.url ? project.url.replace(/^https?:\/\//, '') : 'votre-site.fr'}
          </span>
        </div>
      </div>

      {/* Screenshot with hover overlay */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Réalisation web – ${project.title}`}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-french-blue/10 to-blue-200/40 flex items-center justify-center">
            <Globe size={40} className="text-french-blue/30" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-900/40 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-400
                        flex flex-col justify-end p-5">
          <div className="translate-y-3 group-hover:translate-y-0 transition-transform duration-400">
            <p className="text-white/80 text-sm mb-3 line-clamp-2 leading-relaxed">
              {project.description || 'Site professionnel réalisé avec Aide Numérique 37.'}
            </p>
            {project.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.technologies.map(t => (
                  <span key={t} className="text-[11px] bg-white/15 text-white/90 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-gray-900 text-sm font-bold px-5 py-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={13} />
                Voir le site
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-5 py-4 flex items-center justify-between bg-white dark:bg-gray-900">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight truncate">
            {project.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {project.client_type}{project.year ? ` · ${project.year}` : ''}
          </p>
        </div>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 ml-3 w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-french-blue hover:border-french-blue transition-colors"
            title={`Visiter ${project.title}`}
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  );
};

/* ─── Stats strip ─── */
const STATS = [
  { icon: Globe, value: '100%', label: 'Sites responsive mobile' },
  { icon: Code2, value: 'Sur mesure', label: 'Chaque projet est unique' },
  { icon: Layers, value: 'IA + expertise', label: 'Design & développement' },
];

export default function Realisations() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/portfolio`)
      .then(r => setProjects(r.data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <Helmet>
        <title>Nos Réalisations Web | Sites créés avec l'IA – Aide Numérique 37 | Tours</title>
        <meta name="description" content="Découvrez les sites internet réalisés par Aide Numérique 37 pour des particuliers, TPE et associations en Indre-et-Loire. Création de site web avec l'IA à Tours, Joué-lès-Tours, Chambray." />
        <link rel="canonical" href={`${SITE_URL}/realisations`} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta property="og:title" content="Réalisations Web IA – Aide Numérique 37" />
        <meta property="og:description" content="Portfolio de sites internet créés avec l'IA en Indre-et-Loire." />
        <meta property="og:url" content={`${SITE_URL}/realisations`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Réalisations Web – Aide Numérique 37",
          "description": "Portfolio de sites internet créés avec l'IA pour des clients en Indre-et-Loire",
          "url": `${SITE_URL}/realisations`,
          "author": {
            "@type": "LocalBusiness",
            "name": "Aide Numérique 37",
            "url": SITE_URL,
            "telephone": PHONE,
            "address": { "@type": "PostalAddress", "addressLocality": "Joué-lès-Tours", "addressRegion": "Indre-et-Loire" }
          }
        })}</script>
      </Helmet>

      <Header />
      <main className="pt-20">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-12 sm:py-16" style={{ background: '#0D2E5C' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 80% 50%, #EF4135 0%, transparent 50%)' }} />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
            Création de sites web avec l'IA
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Nos <span style={{ color: '#D4AF37' }}>Réalisations</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-6 leading-relaxed">
            Sites internet conçus avec l'intelligence artificielle pour des clients en Indre-et-Loire.
            Chaque projet est livré clé en main, responsive et optimisé pour Google.
          </p>
          <a href={`tel:${PHONE.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-full transition-all text-sm"
            style={{ background: '#D4AF37', color: '#0D2E5C' }}>
            <Phone size={15} />
            Demander un devis gratuit
          </a>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-3 gap-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon size={20} className="mx-auto mb-2 text-french-blue" />
              <p className="font-black text-lg text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Projects grid ── */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow animate-pulse">
                  <div className="h-8 bg-gray-100 dark:bg-gray-800" />
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Globe size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Les réalisations arrivent bientôt…</p>
              <p className="text-sm mt-2">Contactez-moi pour discuter de votre projet de site internet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(p => <BrowserCard key={p.id} project={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
            Vous aussi, créez votre site internet
          </h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Je crée votre site internet clé en main grâce à l'IA, livré en quelques jours.
            Devis gratuit et sans engagement pour les clients en Indre-et-Loire.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`tel:${PHONE.replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all"
              style={{ background: '#0D2E5C' }}>
              <Phone size={15} />
              {PHONE}
            </a>
            <Link to="/pro"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm border-2 transition-all hover:bg-gray-50"
              style={{ borderColor: '#0D2E5C', color: '#0D2E5C' }}>
              En savoir plus
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recent articles ── */}
      <div className="bg-gray-50 dark:bg-gray-950">
        <RecentArticles />
      </div>
      </main>
      <Footer />
    </div>
  );
}
