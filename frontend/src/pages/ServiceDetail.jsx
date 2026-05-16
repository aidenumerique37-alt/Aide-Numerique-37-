import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, ArrowRight, CheckCircle2, ExternalLink, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { sanitizeHtml } from '../utils/sanitize';
import RecentArticles from '../components/RecentArticles';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/* ── Mini browser mockup card for the portfolio strip ── */
const MiniMockup = ({ p }) => {
  const imgUrl = p.image_url
    ? p.image_url.startsWith('http') ? p.image_url : `${BACKEND_URL}${p.image_url}`
    : null;
  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-french-blue/30 transition-all duration-300">
      {/* Chrome bar */}
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <div className="flex-1 ml-1.5 bg-white dark:bg-gray-700 rounded-full px-2 py-0.5 text-[10px] text-gray-400 truncate">
          {p.url ? p.url.replace(/^https?:\/\//, '') : 'exemple.fr'}
        </div>
      </div>
      {/* Screenshot */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={`Réalisation – ${p.title}`}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
            <Globe size={28} className="text-gray-200" />
          </div>
        )}
        {p.url && (
          <a href={p.url} target="_blank" rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity duration-300">
            <span className="inline-flex items-center gap-1.5 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">
              <ExternalLink size={11} />Voir le site
            </span>
          </a>
        )}
      </div>
      {/* Footer */}
      <div className="px-3 py-2.5">
        <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">{p.title}</p>
        <p className="text-[10px] text-gray-400">{p.client_type}{p.year ? ` · ${p.year}` : ''}</p>
      </div>
    </div>
  );
};

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_URL}${url}`;
};

// SEO alt text fallbacks with rich keywords per service slug
const SEO_ALT_KEYWORDS = {
  'assistance-informatique': {
    hero: 'Assistance informatique à domicile Tours - dépannage sécurité informatique Indre-et-Loire',
    context: 'Aide informatique senior domicile Joué-lès-Tours - dépannage ordinateur PC Mac',
  },
  'formation-numerique': {
    hero: 'Formation numérique seniors Tours - apprentissage informatique tablette smartphone',
    context: 'Cours informatique débutant domicile Indre-et-Loire - internet email réseaux sociaux',
  },
  'installation-configuration': {
    hero: 'Installation configuration informatique domicile Tours - box WiFi imprimante Smart TV',
    context: 'Configuration équipement informatique Joué-lès-Tours - PC Mac tablette objet connecté',
  },
  'depannage-domicile': {
    hero: 'Dépannage informatique urgent domicile Tours - sécurité antivirus protection malware',
    context: 'Réparation ordinateur récupération données domicile Indre-et-Loire - WiFi virus',
  },
  'creation-site-web-ia': {
    hero: 'Création site web intelligence artificielle Tours - site vitrine artisan PME responsive',
    context: 'Site internet professionnel abordable Indre-et-Loire - SEO local présence en ligne',
  },
};

const SERVICE_IMAGES = {
  'assistance-informatique': {
    hero: 'https://images.unsplash.com/photo-1581056771370-4814aa6dd705?w=800&h=400&fit=crop',
    context: 'https://images.unsplash.com/photo-1758691031455-9ce2e45f11f4?w=600&h=350&fit=crop',
    heroAlt: 'Assistance informatique a domicile - aide personnalisee',
    contextAlt: 'Senior accompagne sur son ordinateur a domicile',
  },
  'formation-numerique': {
    hero: 'https://images.unsplash.com/photo-1661961111247-e218f67d1cd2?w=800&h=400&fit=crop',
    context: 'https://images.unsplash.com/photo-1758686254525-2c5e9698e478?w=600&h=350&fit=crop',
    heroAlt: 'Formation numerique - apprentissage tablette et smartphone',
    contextAlt: 'Couple de seniors apprenant a utiliser un ordinateur portable',
  },
  'installation-configuration': {
    hero: 'https://images.unsplash.com/photo-1701318134822-fcc7630206ed?w=800&h=400&fit=crop',
    context: 'https://images.unsplash.com/photo-1689236673934-66f8e9d9279b?w=600&h=350&fit=crop',
    heroAlt: 'Installation et configuration de materiel informatique',
    contextAlt: 'Poste de travail informatique installe et configure',
  },
  'depannage-domicile': {
    hero: 'https://images.unsplash.com/photo-1635686736751-b5fc50365655?w=800&h=400&fit=crop',
    context: 'https://images.unsplash.com/photo-1596328364619-c401184d877a?w=600&h=350&fit=crop',
    heroAlt: 'Depannage informatique a domicile - diagnostic et reparation',
    contextAlt: 'Reparation et diagnostic de materiel informatique',
  },
  'creation-site-web-ia': {
    hero: 'https://images.unsplash.com/photo-1706700392626-5279fb90ae73?w=800&h=400&fit=crop',
    context: 'https://images.unsplash.com/photo-1664748512003-8820b08d8161?w=600&h=350&fit=crop',
    heroAlt: 'Creation de site web professionnel assiste par IA',
    contextAlt: 'Design de site web moderne sur ordinateur portable',
  },
};

const iconMap = {
  'monitor': 'Assistance Informatique',
  'graduation-cap': 'Formation Numerique',
  'settings': 'Installation & Configuration',
  'wrench': 'Depannage a Domicile',
  'globe': 'Creation de Site Web IA',
};

const SITE_URL = 'https://www.aidenumerique37.fr';

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioProjects, setPortfolioProjects] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [serviceRes, allRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/services/${slug}`),
          axios.get(`${BACKEND_URL}/api/services`)
        ]);
        setService(serviceRes.data);
        setAllServices(allRes.data.filter(s => s.slug !== slug));
        // Load portfolio only for the creation-site-web-ia page
        if (slug === 'creation-site-web-ia') {
          axios.get(`${BACKEND_URL}/api/portfolio`)
            .then(r => setPortfolioProjects(r.data || []))
            .catch(() => {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [slug]);

  // Resolve images: DB field > hardcoded fallback
  const fallback = service ? SERVICE_IMAGES[service.slug] : null;
  const seoAlt = service ? SEO_ALT_KEYWORDS[service.slug] : null;
  const heroImage = resolveImageUrl(service?.image_hero) || (fallback && fallback.hero);
  const heroAlt = service?.image_alt_hero || seoAlt?.hero || fallback?.heroAlt || service?.title || '';
  const contextImage = resolveImageUrl(service?.image_context) || (fallback && fallback.context);
  const contextAlt = service?.image_alt_context || seoAlt?.context || fallback?.contextAlt || service?.title || '';

  const scrollToContact = () => {
    window.location.href = '/#contact';
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <div className="animate-pulse text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Service non trouve</h1>
          <Link to="/" className="text-french-blue hover:underline">Retour a l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Helmet>
        <html lang="fr" />
        <title>{`${service.title} à Joué-lès-Tours et Tours (37) | Aide Numérique 37`}</title>
        <meta name="description" content={`${service.title} à domicile à Joué-lès-Tours, Tours et Chambray-lès-Tours. ${service.description} Service à la Personne agréé, 50% crédit d'impôt. Intervention rapide en Indre-et-Loire.`} />
        <link rel="canonical" href={`${SITE_URL}/services/${service.slug}`} />
        <meta property="og:title" content={`${service.title} à Domicile en Indre-et-Loire | Aide Numérique 37`} />
        <meta property="og:description" content={`${service.description} Joué-lès-Tours, Tours, Chambray-lès-Tours. 50% crédit d'impôt.`} />
        <meta property="og:image" content={service.image_hero_url || service.image_card_url || 'https://www.aidenumerique37.fr/logo.png'} />
        <meta property="og:url" content={`${SITE_URL}/services/${service.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="geo.region" content="FR-37" />
      </Helmet>
      {/* BreadcrumbList Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Accueil", "item": `${SITE_URL}/` },
              { "@type": "ListItem", "position": 2, "name": "Services", "item": `${SITE_URL}/#services` },
              { "@type": "ListItem", "position": 3, "name": service.title, "item": `${SITE_URL}/services/${service.slug}` }
            ]
          })
        }}
      />
      {/* FAQ Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `Combien coûte le service ${service.title} à domicile ?`,
                "acceptedAnswer": { "@type": "Answer", "text": `Le tarif est de 50€ de l'heure. Grâce à l'Avance Immédiate de crédit d'impôt, vous ne payez que 25€ de l'heure. Aide Numérique 37 est agréé Service à la Personne.` }
              },
              {
                "@type": "Question",
                "name": `Intervenez-vous à Joué-lès-Tours, Tours et Chambray-lès-Tours ?`,
                "acceptedAnswer": { "@type": "Answer", "text": `Oui, j'interviens à domicile dans toute l'agglomération de Tours : Joué-lès-Tours (37300), Tours (37000), Chambray-lès-Tours (37170), Saint-Avertin (37550) et dans un rayon de 20km.` }
              },
              {
                "@type": "Question",
                "name": `Quels sont les délais d'intervention pour ${service.title} ?`,
                "acceptedAnswer": { "@type": "Answer", "text": "Je m'efforce d'intervenir dans les 24 à 48h suivant votre appel. Les interventions urgentes peuvent être traitées le jour même selon les disponibilités." }
              }
            ]
          })
        }}
      />
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" data-testid="service-breadcrumb">
          <Link to="/" className="hover:text-french-blue transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{service.title}</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gradient-to-r from-french-blue to-sky-blue rounded-2xl overflow-hidden text-white">
          <div className="grid md:grid-cols-5 gap-0">
            <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
              {service.is_new && (
                <span className="inline-block bg-french-red text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
                  Nouveau
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="service-detail-title">
                {service.title}
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                {service.description}
              </p>
            </div>
            {heroImage && (
              <div className="md:col-span-2 relative min-h-[180px] md:min-h-0">
                <img
                  src={heroImage}
                  alt={heroAlt}
                  className="w-full h-full object-cover"
                  loading="eager"
                  data-testid="service-hero-image"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-french-blue/40 to-transparent md:from-french-blue/60" />
              </div>
            )}
          </div>
        </div>
        {/* Schema.org Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": service.title,
              "description": service.detailed_description || service.description,
              "provider": {
                "@type": "LocalBusiness",
                "name": "Aide Numérique 37",
                "telephone": "+33761503585",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Joué-lès-Tours",
                  "addressRegion": "Indre-et-Loire",
                  "addressCountry": "FR"
                }
              },
              "areaServed": {
                "@type": "AdministrativeArea",
                "name": "Indre-et-Loire"
              },
              "url": `${SITE_URL}/services/${service.slug}`
            })
          }}
        />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                En quoi consiste ce service ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base" data-testid="service-detail-description">
                {service.detailed_description || service.description}
              </p>
            </div>

            {/* Contextual image */}
            {contextImage && (
              <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-800">
                <img
                  src={contextImage}
                  alt={contextAlt}
                  className="w-full h-auto object-cover max-h-[300px]"
                  loading="lazy"
                  data-testid="service-context-image"
                />
              </div>
            )}

            {service.features && service.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ce que je propose
                </h2>
                <ul className="space-y-3" data-testid="service-features-list">
                  {service.features.map((feature, i) => (
                    <li key={`feature-${i}`} className="flex items-start gap-3">
                      <CheckCircle2 className="text-french-blue flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Portfolio strip — uniquement sur création site web IA */}
            {slug === 'creation-site-web-ia' && (
              <div>
                <div className="flex items-end justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Quelques réalisations
                  </h2>
                  <Link
                    to="/realisations"
                    className="flex items-center gap-1.5 text-sm font-semibold text-french-blue hover:underline"
                    data-testid="see-all-realisations-link"
                  >
                    Tout voir
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {portfolioProjects.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {portfolioProjects.slice(0, 3).map(p => (
                      <MiniMockup key={p.id} p={p} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-8 text-center">
                    <Globe size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Réalisations à venir</p>
                    <p className="text-xs text-gray-400 mt-1">Les exemples de sites réalisés seront affichés ici.</p>
                  </div>
                )}

                <div className="mt-5 text-center">
                  <Link
                    to="/realisations"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-french-blue text-french-blue text-sm font-bold hover:bg-french-blue hover:text-white transition-all"
                    data-testid="realisations-cta-btn"
                  >
                    <Globe size={15} />
                    Voir toutes nos réalisations
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-blue-50 dark:bg-gray-900 rounded-xl p-6 border border-blue-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Besoin de ce service ?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Contactez-moi pour un devis gratuit. Je me deplace a votre domicile en Indre-et-Loire.
                Beneficiez de 50% de credit d'impot grace au Service a la Personne.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={scrollToContact}
                  className="bg-french-red hover:bg-french-red/90 text-white"
                  data-testid="service-cta-contact"
                >
                  <Phone className="mr-2" size={18} />
                  Me Contacter
                  <ArrowRight className="ml-2" size={18} />
                </Button>
                <a href="tel:0761503585">
                  <Button variant="outline" className="border-french-blue text-french-blue hover:bg-french-blue hover:text-white w-full">
                    07 61 50 35 85
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Credit d'impot</h3>
              <div className="text-3xl font-bold text-french-blue mb-1">-50%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ce service est eligible au credit d'impot de 50% via l'Avance Immediate.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Autres services</h3>
              <ul className="space-y-2" data-testid="other-services-list">
                {allServices.map(s => (
                  <li key={s.id}>
                    <Link
                      to={`/services/${s.slug}`}
                      className="text-french-blue hover:underline text-sm font-medium"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-french-blue transition-colors text-sm">
              <ArrowLeft size={16} />
              Retour a l'accueil
            </Link>
          </div>
        </div>
      </div>
      {/* Maillage interne — articles liés au service */}
      <RecentArticles limit={3} title="Articles en rapport avec ce service" />
    </div>
  );
};

export default ServiceDetail;
