import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Phone, MapPin, CheckCircle2, Users, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { sanitizeHtml } from '../utils/sanitize';
import RecentArticles from '../components/RecentArticles';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SITE_URL = 'https://www.aidenumerique37.fr';

const CityPage = () => {
  const { slug } = useParams();
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCity = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/cities/pages/${slug}`);
        setCity(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCity();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <div className="animate-pulse text-gray-500">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page non trouvee</h1>
          <Link to="/" className="text-french-blue hover:underline">Retour a l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Helmet>
        <html lang="fr" />
        <title>{`Assistance Informatique à Domicile à ${city.name} (${city.code_postal}) | Aide Numérique 37`}</title>
        <meta name="description" content={`Assistance informatique à domicile à ${city.name} (${city.code_postal}). Dépannage PC/Mac, formation numérique, installation WiFi, création site web. Service à la Personne agréé, 50% crédit d'impôt avec l'Avance Immédiate. Intervention rapide par Pierrick Le Penru.`} />
        <link rel="canonical" href={`${SITE_URL}/intervention/${slug}`} />
        <meta property="og:title" content={`Assistance Informatique à ${city.name} (${city.code_postal}) | Aide Numérique 37`} />
        <meta property="og:description" content={`Dépannage informatique, formation, installation à domicile à ${city.name}. 50% crédit d'impôt.`} />
        <meta property="og:image" content="https://www.aidenumerique37.fr/logo.png" />
        <meta property="og:url" content={`${SITE_URL}/intervention/${slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="geo.region" content="FR-37" />
        <meta name="geo.placename" content={city.name} />
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
              { "@type": "ListItem", "position": 2, "name": `Assistance Informatique a ${city.name}`, "item": `${SITE_URL}/intervention/${slug}` }
            ]
          })
        }}
      />
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" data-testid="city-breadcrumb">
          <Link to="/" className="hover:text-french-blue transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Assistance Informatique {city.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gradient-to-r from-french-blue to-sky-blue rounded-2xl p-8 md:p-12 text-white">
          <div className="flex items-center gap-2 mb-4 text-blue-200 text-sm font-semibold uppercase tracking-wide">
            <MapPin size={16} />
            {city.code_postal} - Indre-et-Loire
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="city-page-title">
            Assistance Informatique a Domicile a {city.name}
          </h1>
          <p className="text-blue-100 text-lg max-w-3xl mb-6">
            {city.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="tel:0761503585">
              <Button className="bg-french-red hover:bg-french-red/90 text-white" data-testid="city-cta-phone">
                <Phone className="mr-2" size={18} />
                07 61 50 35 85
              </Button>
            </a>
            <a href="/#contact">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Demander un devis gratuit
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Problematiques */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Problemes informatiques frequents a {city.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                En tant qu'assistant informatique a domicile, j'interviens regulierement a {city.name} pour resoudre ces problematiques courantes :
              </p>
              <ul className="space-y-3" data-testid="city-problems-list">
                {city.problematiques.map((prob, i) => (
                  <li key={`feature-${i}`} className="flex items-start gap-3">
                    <CheckCircle2 className="text-french-blue flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">{prob}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Services disponibles */}
            {city.services && city.services.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Mes services a {city.name}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4" data-testid="city-services-grid">
                  {city.services.map((svc, i) => (
                    <Link
                      key={i}
                      to={svc.slug ? `/services/${svc.slug}` : '#'}
                      className="block p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-french-blue/40 hover:shadow-md transition-all group"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-french-blue transition-colors mb-1">
                        {svc.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{svc.description}</p>
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-french-blue">
                        En savoir plus <ArrowRight size={12} />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Quartiers */}
            {city.quartiers && city.quartiers.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Quartiers desservis a {city.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  J'interviens dans tous les quartiers de {city.name}, notamment :
                </p>
                <div className="flex flex-wrap gap-2" data-testid="city-quartiers">
                  {city.quartiers.map((q, i) => (
                    <span key={`keyword-${i}`} className="px-3 py-1.5 bg-french-blue/10 text-french-blue text-sm font-medium rounded-full dark:bg-french-blue/20">
                      {q}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Map */}
            {city.map_embed && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Localisation - {city.name}
                </h2>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                  <iframe
                    src={city.map_embed}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Carte ${city.name}`}
                    data-testid="city-map"
                  ></iframe>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-gray-900 rounded-xl p-6 border border-blue-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Shield className="text-french-blue" size={20} />
                Credit d'impot -50%
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                En tant que Service a la Personne agree, toutes mes prestations a {city.name} ouvrent droit a un credit d'impot de 50%.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Grace a l'Avance Immediate, vous ne payez que la moitie du montant.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Users className="text-french-blue" size={20} />
                A propos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pierrick Le Penru, votre assistant informatique a domicile. Plus de 10 ans d'experience dans le multimedia et les telecommunications.
              </p>
              <Link to="/a-propos" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-french-blue hover:underline">
                En savoir plus <ArrowRight size={14} />
              </Link>
            </div>

            <div className="bg-french-red/5 dark:bg-french-red/10 rounded-xl p-6 border border-french-red/20">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Besoin d'aide ?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Intervention rapide a {city.name} et alentours.
              </p>
              <a href="tel:0761503585" className="block">
                <Button className="w-full bg-french-red hover:bg-french-red/90 text-white">
                  <Phone className="mr-2" size={18} />
                  Appeler maintenant
                </Button>
              </a>
            </div>

            <Link to="/" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-french-blue transition-colors text-sm">
              <ArrowLeft size={16} />
              Retour a l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Schema.org LocalBusiness JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Aide Numérique 37",
            "description": `Assistance informatique à domicile à ${city.name}`,
            "telephone": "+33761503585",
            "email": "aidenumerique37@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": city.name,
              "postalCode": city.code_postal.split(' / ')[0],
              "addressRegion": "Indre-et-Loire",
              "addressCountry": "FR"
            },
            "areaServed": {
              "@type": "City",
              "name": city.name
            },
            "url": `${SITE_URL}/intervention/${city.slug}`,
            "priceRange": "$$",
            "openingHours": "Mo-Su 08:30-20:00"
          })
        }}
      />
      {/* Maillage interne — articles locaux */}
      <RecentArticles limit={3} title={`Conseils informatiques pour ${city?.name || 'votre ville'}`} />
    </div>
  );
};

export default CityPage;
