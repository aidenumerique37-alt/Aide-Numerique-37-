import React, { useState, useEffect } from 'react';
import { Monitor, GraduationCap, Settings, Wrench, Globe, Smartphone, Shield, Mail, ChevronDown, ChevronUp, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_URL}${url}`;
};

const iconMap = {
  'monitor': Monitor,
  'graduation-cap': GraduationCap,
  'settings': Settings,
  'wrench': Wrench,
  'globe': Globe,
  'smartphone': Smartphone,
  'shield': Shield,
  'mail': Mail
};

const CITY_POSTCODES = {
  "Joué-lès-Tours": "37300",
  "Tours": "37000",
  "Saint-Avertin": "37550",
  "Chambray-lès-Tours": "37170",
  "Saint-Pierre-des-Corps": "37700",
  "La Riche": "37520",
  "Ballan-Miré": "37510",
  "Saint-Cyr-sur-Loire": "37540",
  "Fondettes": "37230",
  "Montlouis-sur-Loire": "37270",
  "Savonnières": "37510",
  "Larçay": "37270",
  "Veigné": "37250",
  "Monts": "37260",
  "Artannes-sur-Indre": "37260",
};

// SEO alt text fallbacks with rich keywords per service slug
const SEO_ALT_KEYWORDS = {
  'assistance-informatique': {
    card: 'Assistance informatique à domicile Tours - dépannage PC Mac - Aide Numérique 37',
    hero: 'Assistance informatique personnalisée Joué-lès-Tours - sécurité informatique domicile',
    context: 'Aide informatique senior à domicile Indre-et-Loire - dépannage ordinateur Tours',
  },
  'formation-numerique': {
    card: 'Formation numérique seniors à domicile Tours - initiation informatique tablette',
    hero: 'Formation informatique personnalisée Joué-lès-Tours - apprentissage internet email',
    context: 'Cours informatique débutant à domicile Indre-et-Loire - formation tablette smartphone',
  },
  'installation-configuration': {
    card: 'Installation configuration informatique domicile Tours - box internet WiFi imprimante',
    hero: 'Configuration PC Mac tablette Joué-lès-Tours - installation matériel informatique',
    context: 'Mise en service équipement informatique domicile Indre-et-Loire - Smart TV objet connecté',
  },
  'depannage-domicile': {
    card: 'Dépannage informatique à domicile Tours - réparation PC virus suppression malware',
    hero: 'Dépannage ordinateur urgent Joué-lès-Tours - sécurité informatique antivirus protection',
    context: 'Réparation informatique domicile Indre-et-Loire - récupération données WiFi instable',
  },
  'creation-site-web-ia': {
    card: 'Création site web intelligence artificielle Tours - site vitrine artisan PME',
    hero: 'Création site internet professionnel IA Joué-lès-Tours - design responsive SEO',
    context: 'Site web abordable artisans commerçants Indre-et-Loire - présence en ligne locale',
  },
};

const SERVICE_IMAGES = {
  'assistance-informatique': {
    url: 'https://images.unsplash.com/photo-1674471361339-2e1e1dbd3e73?w=400&h=200&fit=crop',
    alt: 'Assistance informatique a domicile - depannage ordinateur PC Mac',
  },
  'formation-numerique': {
    url: 'https://images.pexels.com/photos/5759803/pexels-photo-5759803.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    alt: 'Formation numerique seniors - apprentissage tablette smartphone',
  },
  'installation-configuration': {
    url: 'https://images.pexels.com/photos/7014413/pexels-photo-7014413.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop',
    alt: 'Installation imprimante HP Canon - configuration PC portable Asus Lenovo',
  },
  'depannage-domicile': {
    url: 'https://images.unsplash.com/photo-1635686736751-b5fc50365655?w=400&h=200&fit=crop',
    alt: 'Depannage informatique a domicile - reparation ordinateur WiFi',
  },
  'creation-site-web-ia': {
    url: 'https://images.unsplash.com/photo-1706700392626-5279fb90ae73?w=400&h=200&fit=crop',
    alt: 'Creation de site web professionnel - design moderne responsive',
  },
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [cities, setCities] = useState([]);
  const [content, setContent] = useState({ title: '', subtitle: '' });
  const [zoneContent, setZoneContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [showSecondary, setShowSecondary] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, citiesRes, contentRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/services`),
        axios.get(`${BACKEND_URL}/api/admin/cities`),
        axios.get(`${BACKEND_URL}/api/admin/content`)
      ]);
      setServices(servicesRes.data);
      setCities(citiesRes.data);
      setContent(contentRes.data.services || { title: "Assistance Informatique a Domicile - Mes Services", subtitle: '' });
      setZoneContent(contentRes.data.zone_intervention || {});
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const primaryCities = cities.filter(c => c.is_primary);
  const secondaryCities = cities.filter(c => !c.is_primary).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  if (loading) {
    return (
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse">Chargement...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {content.title || "Assistance Informatique a Domicile - Mes Services"}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {content.subtitle || 'Un accompagnement personnalisé pour tous vos besoins informatiques et numériques à domicile'}
          </p>
        </div>

        {/* Services Grid */}
        <div className={`grid md:grid-cols-2 ${services.length >= 5 ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-4'} gap-6`}>
          {services.map((service) => {
            const IconComponent = iconMap[service.icon] || Monitor;
            const fallbackImage = SERVICE_IMAGES[service.slug];
            const seoAlt = SEO_ALT_KEYWORDS[service.slug];
            const cardImageUrl = resolveImageUrl(service.image_card) || (fallbackImage && fallbackImage.url);
            const cardImageAlt = service.image_alt_card || seoAlt?.card || fallbackImage?.alt || service.title;
            return (
              <Card
                key={service.id}
                className={`group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-french-blue/20 bg-white dark:bg-gray-900/50 dark:border-gray-800 dark:hover:border-french-blue/30 overflow-hidden ${service.is_new ? 'ring-2 ring-french-blue ring-offset-2 dark:ring-offset-gray-950' : ''}`}
                data-testid={`service-card-${service.id}`}
              >
                {cardImageUrl && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={cardImageUrl}
                      alt={cardImageAlt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="w-14 h-14 bg-french-blue/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-french-blue group-hover:scale-110 transition-all duration-300">
                    <IconComponent className="text-french-blue group-hover:text-white transition-colors" size={28} />
                  </div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white group-hover:text-french-blue transition-colors">
                    {service.title}
                  </CardTitle>
                  {service.is_new && (
                    <span className="inline-block bg-french-red text-white text-xs font-semibold px-2 py-1 rounded-full mt-1">
                      Nouveau
                    </span>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    {service.description}
                  </CardDescription>
                  {service.slug && (
                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-french-blue hover:text-french-blue/80 transition-colors group/link"
                      data-testid={`service-link-${service.id}`}
                    >
                      En savoir plus
                      <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Zone d'intervention */}
        {cities.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-blue-50 to-white dark:from-gray-900/50 dark:to-gray-950 rounded-2xl p-8 border border-blue-100 dark:border-gray-800" data-testid="zone-intervention">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {zoneContent.title || "Zone d'Intervention - Assistance Informatique à Domicile"}
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {zoneContent.subtitle || "Je me déplace à votre domicile dans un rayon de 20 km autour de Joué-lès-Tours"}
            </p>

            {/* Primary cities */}
            <div className="flex flex-wrap justify-center gap-2" data-testid="primary-cities">
              {primaryCities.map((city) => (
                <span
                  key={city.name}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-french-blue text-white"
                >
                  {city.name}{CITY_POSTCODES[city.name] ? ` (${CITY_POSTCODES[city.name]})` : ''}
                </span>
              ))}
            </div>

            {/* Secondary cities expandable */}
            {secondaryCities.length > 0 && (
              <div className="mt-6" data-testid="secondary-cities-section">
                <button
                  onClick={() => setShowSecondary(!showSecondary)}
                  className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-french-blue/30 text-french-blue font-medium hover:bg-french-blue/5 dark:hover:bg-french-blue/10 transition-all"
                  data-testid="toggle-secondary-cities"
                >
                  <MapPin size={16} />
                  Mais aussi... ({secondaryCities.length} communes)
                  {showSecondary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showSecondary && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-center text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-4 py-2 mb-4 max-w-xl mx-auto font-medium">
                      Frais de d&eacute;placement non inclus dans les villes suivantes
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {secondaryCities.map((city) => (
                        <span
                          key={city.name}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-french-blue hover:text-french-blue transition-colors"
                        >
                          {city.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
              {zoneContent.footer || "Indre-et-Loire (37) - Service à la Personne agréé - 50% de crédit d'impôt"}
            </p>

            {/* City page links for SEO */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Nos zones d'intervention :</p>
              <div className="flex flex-wrap justify-center gap-3" data-testid="city-page-links">
                <Link to="/intervention/joue-les-tours" className="text-sm text-french-blue hover:underline font-medium">Joue-les-Tours (37300)</Link>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <Link to="/intervention/chambray-les-tours" className="text-sm text-french-blue hover:underline font-medium">Chambray-les-Tours (37170)</Link>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <Link to="/intervention/tours" className="text-sm text-french-blue hover:underline font-medium">Tours (37000)</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
