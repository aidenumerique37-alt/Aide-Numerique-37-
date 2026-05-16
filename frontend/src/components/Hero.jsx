import React, { useState, useEffect } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Helmet } from 'react-helmet-async';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import axios from 'axios';
import { sanitizeHtml } from '../utils/sanitize';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_URL = 'https://www.aidenumerique37.fr';

// Resolve image URL: add BACKEND_URL prefix for relative /api/uploads/ paths
const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
  return url;
};

const AnimatedStat = ({ end, suffix = '', prefix = '', label }) => {
  const { ref, display } = useAnimatedCounter(end, 1200, suffix);
  return (
    <div ref={ref} data-testid={`stat-${label.toLowerCase().replace(/[^a-z]/g, '')}`}>
      <div className="text-2xl lg:text-3xl font-bold text-french-blue">{prefix}{display}</div>
      <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-500">{label}</div>
    </div>
  );
};

const Hero = () => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/admin/content`)
      .then(res => setContent(res.data.hero))
      .catch(() => {});
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const title = content?.title || 'Votre Assistant';
  const highlight = content?.title_highlight || 'Informatique';
  const suffix = content?.title_suffix || 'a Domicile';
  const subtitle = content?.subtitle || "Besoin d'aide avec votre ordinateur, tablette ou smartphone ? Je me deplace chez vous en Indre-et-Loire pour une assistance informatique a domicile personnalisee et bienveillante.";
  const buttonText = content?.button_text || 'Me Contacter';
  const fontFamily = content?.font_family || 'Montserrat';
  const fontSize = content?.font_size || 'normal';
  const fontSizeSuffix = content?.font_size_suffix || 'small';

  const FONT_SIZE_MAP = {
    small: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl',
    normal: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl',
    large: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl',
    xlarge: 'text-5xl sm:text-6xl lg:text-7xl xl:text-8xl',
  };

  const titleSizeClass = FONT_SIZE_MAP[fontSize] || FONT_SIZE_MAP.normal;
  const suffixSizeClass = FONT_SIZE_MAP[fontSizeSuffix] || FONT_SIZE_MAP.small;

  return (
    <section className="relative pt-24 pb-16 md:pb-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <Helmet>
        <html lang="fr" />
        <title>Assistance Informatique à Domicile - Joué-lès-Tours, Tours, Chambray | Aide Numérique 37</title>
        <meta name="description" content="Assistance informatique à domicile à Joué-lès-Tours, Tours et Chambray-lès-Tours (37). Dépannage PC/Mac, formation numérique seniors, installation WiFi, création site web IA. Service à la Personne agréé - 50% crédit d'impôt avec l'Avance Immédiate. Intervention rapide par Pierrick Le Penru." />
        <meta property="og:title" content="Assistance Informatique à Domicile - Indre-et-Loire | Aide Numérique 37" />
        <meta property="og:description" content="Dépannage informatique, formation numérique, installation et création de site web IA à domicile. Joué-lès-Tours, Tours, Chambray-lès-Tours. 50% crédit d'impôt." />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content="https://www.aidenumerique37.fr/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta property="og:locale" content="fr_FR" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="geo.region" content="FR-37" />
        <meta name="geo.placename" content="Joue-les-Tours" />
        <meta name="geo.position" content="47.3374;0.6615" />
        <meta name="ICBM" content="47.3374, 0.6615" />
      </Helmet>
      {/* Schema.org LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Aide Numérique 37",
            "alternateName": "Aide Numérique 37 - Assistance Informatique à Domicile",
            "description": "Assistance informatique à domicile en Indre-et-Loire. Dépannage, formation numérique, installation, création de site web. Service à la Personne agréé avec 50% de crédit d'impôt.",
            "url": SITE_URL,
            "telephone": "+33761503585",
            "email": "aidenumerique37@gmail.com",
            "image": "https://www.aidenumerique37.fr/logo.png",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Joue-les-Tours",
              "postalCode": "37300",
              "addressRegion": "Indre-et-Loire",
              "addressCountry": "FR"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "47.3374",
              "longitude": "0.6615"
            },
            "areaServed": [
              { "@type": "City", "name": "Joue-les-Tours", "sameAs": "https://fr.wikipedia.org/wiki/Jou%C3%A9-l%C3%A8s-Tours" },
              { "@type": "City", "name": "Tours", "sameAs": "https://fr.wikipedia.org/wiki/Tours" },
              { "@type": "City", "name": "Chambray-les-Tours", "sameAs": "https://fr.wikipedia.org/wiki/Chambray-l%C3%A8s-Tours" },
              { "@type": "City", "name": "Saint-Avertin" },
              { "@type": "City", "name": "Saint-Pierre-des-Corps" },
              { "@type": "City", "name": "La Riche" },
              { "@type": "City", "name": "Ballan-Mire" },
              { "@type": "City", "name": "Montbazon" },
              { "@type": "GeoCircle", "geoMidpoint": { "@type": "GeoCoordinates", "latitude": "47.3374", "longitude": "0.6615" }, "geoRadius": "20000" }
            ],
            "openingHours": "Mo-Su 08:30-20:00",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "30",
              "bestRating": "5"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Services d'assistance informatique a domicile",
              "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Assistance informatique a domicile", "description": "Diagnostic et resolution de pannes informatiques a votre domicile" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Formation numerique a domicile", "description": "Apprentissage personnalise des outils numeriques" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Installation et configuration", "description": "Mise en service de vos equipements informatiques" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Depannage informatique a domicile", "description": "Intervention rapide pour resoudre vos problemes techniques" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Creation de site web IA", "description": "Creation de site internet professionnel assiste par IA" } }
              ]
            },
            "sameAs": [
              "https://www.instagram.com/aidenumerique37/",
              "https://www.facebook.com/AideNumerique37"
            ]
          })
        }}
      />
      {/* Schema.org WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Aide Numérique 37",
            "url": SITE_URL,
            "description": "Assistance informatique à domicile en Indre-et-Loire - Dépannage, formation, installation",
            "publisher": {
              "@type": "LocalBusiness",
              "name": "Aide Numérique 37"
            }
          })
        }}
      />
      {/* Light mode subtle accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-french-blue/5 dark:bg-french-blue/10 rounded-full opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-blue/10 dark:bg-sky-blue/5 rounded-full opacity-50"></div>

      {/* Dark mode grid overlay */}
      <div className="absolute inset-0 hidden dark:block opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(188 94% 43%) 1px, transparent 1px), linear-gradient(90deg, hsl(188 94% 43%) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-5 gap-8 lg:gap-12 items-center">
          <div className="md:col-span-3 space-y-6 lg:space-y-8">
            <div className="inline-flex flex-wrap gap-2">
              <span className="bg-french-blue/10 text-french-blue px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold dark:border dark:border-french-blue/30">
                Assistance Informatique a Domicile
              </span>
              <span className="bg-french-red/10 text-french-red px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold dark:border dark:border-french-red/30">
                Service a la Personne Agree
              </span>
            </div>

            <h1 className={`${titleSizeClass} !font-bold text-gray-900 dark:text-white leading-tight`} style={{ fontFamily: `'${fontFamily}', sans-serif` }} data-testid="hero-title">
              {title}
              <span className="block text-french-blue mt-1 lg:mt-2">{highlight}</span>
              {suffix && <span className={`block ${suffixSizeClass} text-gray-700 dark:text-gray-400 mt-1 lg:mt-2`}>{suffix}</span>}
            </h1>

            <p className="text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-lg" data-testid="hero-subtitle">
              {subtitle} {!subtitle.includes('crédit') && (
                <>Profitez de <span className="font-bold text-french-blue">50% de crédit d'impôt</span> avec l'Avance Immédiate.</>
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={scrollToContact}
                size="lg"
                className="bg-french-red hover:bg-french-red/90 text-white px-6 py-5 lg:px-8 lg:py-6 text-base lg:text-lg rounded-lg shadow-lg hover:shadow-xl dark:shadow-french-red/20 transition-all duration-300 group"
                data-testid="hero-cta-btn"
              >
                <Phone className="mr-2 group-hover:rotate-12 transition-transform" size={20} />
                {buttonText}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>

              <a href="tel:0761503585">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-french-blue text-french-blue hover:bg-french-blue hover:text-white px-6 py-5 lg:px-8 lg:py-6 text-base lg:text-lg rounded-lg transition-all duration-300"
                  data-testid="hero-phone-btn"
                >
                  07 61 50 35 85
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 lg:gap-8 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-800">
              <AnimatedStat end={100} suffix="%" label="Satisfaction" />
              <AnimatedStat end={5} suffix="★" label="Note Google" />
              <AnimatedStat end={50} prefix="-" suffix="%" label="Crédit d'Impôt" />
            </div>
          </div>

          <div className="md:col-span-2 relative hidden md:flex items-center justify-center">
            <div className="relative w-full">
              <img
                src={resolveImageUrl(content?.image_url) || '/hero-image.jpeg'}
                alt={content?.image_alt || 'Assistance informatique à domicile en Indre-et-Loire - Aide Numérique 37'}
                className="w-full h-auto object-cover rounded-2xl shadow-2xl dark:shadow-french-blue/10"
                style={{ maxHeight: 'min(420px, 50vh)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 dark:from-gray-900 via-transparent to-transparent opacity-60 pointer-events-none rounded-2xl"></div>
            </div>
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-french-blue/10 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-sky-blue/10 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '700ms' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
