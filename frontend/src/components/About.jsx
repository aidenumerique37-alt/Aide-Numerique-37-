import React, { useState, useEffect } from 'react';
import { Heart, Award, Users, Phone, ArrowRight, Newspaper, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_URL = 'https://www.aidenumerique37.fr';

const ARTICLE_FULL_TEXT = `Pierrick Le Penru, 29 ans, a décidé de franchir le pas. Après son BTS management, il a travaillé une dizaine d'années dans de grandes enseignes multimédias et chez divers opérateurs téléphoniques. Il a remarqué que bon nombre d'utilisateurs se retrouvaient perdus après un achat de matériel.

« J'ai pu constater au fil des années que de nombreuses personnes, notamment les seniors, avaient du mal à utiliser leurs équipements numériques au quotidien. L'idée de créer Aide Numérique 37 est née de ce constat », explique Pierrick.

Basé à Joué-lès-Tours, il intervient dans un rayon de 20 km autour de sa commune. Il propose de l'assistance informatique à domicile : dépannage, formation, installation et configuration de matériel informatique. Son entreprise est agréée Service à la Personne, ce qui permet à ses clients de bénéficier de 50% de crédit d'impôt sur les prestations.

« Mon objectif est d'apporter une aide personnalisée, avec patience et pédagogie. Je m'adapte au rythme de chacun pour que mes clients deviennent autonomes avec leurs outils numériques », poursuit-il.

Aide Numérique 37 s'adresse à tous les publics : seniors souhaitant apprendre à utiliser une tablette ou un smartphone, familles ayant besoin d'installer un réseau Wi-Fi, professionnels nécessitant une assistance technique. Pierrick propose également la création de sites web assistée par intelligence artificielle.`;

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const About = () => {
  const [pressExpanded, setPressExpanded] = useState(false);
  const [aboutContent, setAboutContent] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    axios.get(`${BACKEND_URL}/api/admin/content`)
      .then(res => setAboutContent(res.data?.about || null))
      .catch(() => {});
  }, []);

  const photoUrl = resolveUrl(aboutContent?.photo_url);
  const photoAlt = aboutContent?.photo_alt || 'Pierrick Le Penru — Aide Numérique 37';

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <Helmet>
        <html lang="fr" />
        <title>À Propos - Pierrick Le Penru, Technicien Informatique à Joué-lès-Tours | Aide Numérique 37</title>
        <meta name="description" content="Découvrez Pierrick Le Penru, fondateur d'Aide Numérique 37. Technicien en assistance informatique à domicile à Joué-lès-Tours, Tours et Chambray-lès-Tours. Service à la Personne agréé, 50% crédit d'impôt." />
        <link rel="canonical" href={`${SITE_URL}/a-propos`} />
        <meta property="og:title" content="À Propos - Pierrick Le Penru | Aide Numérique 37" />
        <meta property="og:description" content="Technicien en assistance informatique à domicile en Indre-et-Loire. Plus de 10 ans d'expérience dans le secteur multimédia." />
        <meta property="og:url" content={`${SITE_URL}/a-propos`} />
        {photoUrl && <meta property="og:image" content={photoUrl} />}
        {!photoUrl && <meta property="og:image" content="https://www.aidenumerique37.fr/logo.png" />}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta name="robots" content="index, follow" />
        <meta name="geo.region" content="FR-37" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8" data-testid="about-breadcrumb">
          <Link to="/" className="hover:text-french-blue transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">A Propos</span>
        </nav>

        {/* ── Photo + Titre ── */}
        <div className="text-center mb-10">
          {photoUrl && (
            <div className="mb-6 flex justify-center" data-testid="about-photo">
              <img
                src={photoUrl}
                alt={photoAlt}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover shadow-xl border-4 border-white dark:border-gray-800 ring-4 ring-french-blue/20"
              />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{"À Propos de Moi"}</h1>
          <p className="text-xl text-french-blue font-semibold">{"Votre Médiateur Numérique en Indre-et-Loire"}</p>
        </div>

        {/* ── Main Presentation Card ── */}
        <Card className="bg-white dark:bg-gray-900 dark:border-gray-800 shadow-xl dark:shadow-none mb-12">
          <CardContent className="p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {"Passionné par le numérique et l'accompagnement des particuliers depuis que je suis en âge d'utiliser un ordinateur et un téléphone, je suis devenu un informaticien né, j'ai rejoins le métier de "}
                <strong className="text-french-blue">{"Médiateur Numérique"}</strong>
                {" et donc j'ai créé "}
                <strong className="text-french-blue">{"Aide Numérique 37"}</strong>
                {" pour rendre l'informatique et les nouvelles technologies accessibles à tous."}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {"Au fil des années, j'ai constaté que de nombreuses personnes, notamment les seniors et les utilisateurs particuliers, se sentent parfois dépassées par les outils numériques : ordinateurs, smartphones, tablette, box Internet, messageries, imprimantes…"}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {"C'est pour répondre à ce besoin concret que j'ai fondé "}
                <strong className="text-french-blue">{"Aide Numérique 37"}</strong>
                {", un service d'"}
                <strong className="dark:text-white">{"assistance informatique à domicile"}</strong>
                {" basé à "}
                <strong className="dark:text-white">{"Joué-lès-Tours"}</strong>
                {", intervenant dans tout le département d'"}
                <strong className="dark:text-white">{"Indre-et-Loire (37)"}</strong>
                {"."}
              </p>
              <div className="bg-blue-50 dark:bg-gray-800 border-l-4 border-french-blue p-6 my-8 rounded-r-lg">
                <p className="text-gray-800 dark:text-gray-200 font-medium mb-4">
                  {"Aujourd'hui, j'accompagne mes clients avec "}
                  <strong className="text-french-blue">{"patience, écoute et clarté"}</strong>
                  {", que ce soit pour :"}
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2"><span className="text-french-blue mt-1">•</span><span>{"le "}<strong className="dark:text-white">{"dépannage informatique à domicile"}</strong>{","}</span></li>
                  <li className="flex items-start gap-2"><span className="text-french-blue mt-1">•</span><span>{"la "}<strong className="dark:text-white">{"configuration d'une box Internet ou d'un Wi-Fi"}</strong>{","}</span></li>
                  <li className="flex items-start gap-2"><span className="text-french-blue mt-1">•</span><span>{"l'"}<strong className="dark:text-white">{"installation d'un nouvel ordinateur, d'un smartphone, tablette, tv ou d'une imprimante"}</strong>{"."}</span></li>
                  <li className="flex items-start gap-2"><span className="text-french-blue mt-1">•</span><span>{"ou encore la "}<strong className="dark:text-white">{"formation personnalisée au numérique"}</strong>{"."}</span></li>
                </ul>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {"Mon objectif est simple : "}
                <strong className="text-french-blue">{"vous aider à utiliser vos outils numériques en toute confiance"}</strong>
                {", à votre rythme, et avec des explications claires et adaptées."}
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {"En choisissant "}
                <strong className="text-french-blue">{"Aide Numérique 37"}</strong>
                {", vous bénéficiez d'un service de "}
                <strong className="text-french-blue">{"proximité, humain et professionnel"}</strong>
                {", avec la possibilité de réduction ou crédit d'impôt de "}
                <strong className="text-french-blue text-2xl">{"50%"}</strong>
                {" grâce à l'agrément "}
                <strong className="text-french-blue">{'"Service à la personne"'}</strong>
                {"."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Article de Presse — sous la description ── */}
        <div className="mb-12" data-testid="about-press-section">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Newspaper size={22} className="text-french-blue" />
            On parle de moi
          </h2>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="grid md:grid-cols-5 gap-0">
              <div className="md:col-span-2 relative overflow-hidden">
                <img
                  src="https://images.lanouvellerepublique.fr/image/upload/t_1020w/f_auto/6915f90a6a8fba38418b4576.jpg"
                  alt="Pierrick Le Penru - Aide Numérique 37 - La Nouvelle République"
                  className="w-full h-full object-cover min-h-[200px] md:min-h-[260px]"
                  loading="lazy"
                  data-testid="about-press-image"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Newspaper size={14} className="text-french-blue" />
                    La Nouvelle République
                  </span>
                </div>
              </div>
              <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center">
                <div className="text-sm text-french-blue font-semibold mb-2 uppercase tracking-wide">Presse locale - Indre-et-Loire</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                  {"Joué-lès-Tours : Pierrick Le Penru vient de lancer Aide Numérique 37"}
                </h3>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {pressExpanded ? (
                    <div className="space-y-3">
                      {ARTICLE_FULL_TEXT.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p>{"Pierrick Le Penru, 29 ans, a décidé de franchir le pas. Après son BTS management, il a travaillé une dizaine d'années dans de grandes enseignes multimédias et chez divers opérateurs téléphoniques..."}</p>
                  )}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button onClick={() => setPressExpanded(!pressExpanded)} className="flex items-center gap-2 text-french-blue font-semibold hover:text-french-blue/80 transition-colors" data-testid="about-press-toggle">
                    <span>{pressExpanded ? 'Réduire' : 'Afficher plus'}</span>
                    {pressExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <a href="https://www.lanouvellerepublique.fr/indre-et-loire/commune/joue-les-tours/joue-les-tours-pierrick-le-penru-vient-de-lancer-son-entreprise-aide-numerique-37-1763047692" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-french-blue font-medium transition-colors text-sm" data-testid="about-press-link">
                    <span>{"Lire l'article complet sur le site de la Nouvelle République"}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 value cards ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Heart, title: 'Passion & Engagement', desc: "Passionné par l'informatique depuis l'enfance, j'apporte un soin particulier à chaque intervention, avec patience et bienveillance.", color: 'text-red-500' },
            { icon: Award, title: 'Expertise Reconnue', desc: "Fort d'une expérience de plus de 10 ans dans le secteur multimédia et télécom, je maîtrise tous les aspects de l'assistance informatique.", color: 'text-french-blue' },
            { icon: Users, title: 'Proximité Humaine', desc: "Je m'adapte au niveau et au rythme de chaque client. Mon objectif : vous rendre autonome, pas créer une dépendance.", color: 'text-green-500' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <Card key={title} className="bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <Icon className={`${color} mb-4`} size={32} />
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="text-center bg-gradient-to-r from-french-blue to-sky-500 rounded-2xl p-10 mb-12 text-white shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{"Prêt à simplifier votre quotidien numérique ?"}</h2>
          <p className="text-blue-100 mb-8 text-lg">{"Contactez-moi pour une intervention à votre domicile en Indre-et-Loire."}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:0761503585" className="inline-flex items-center gap-2 bg-white text-french-blue hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg" data-testid="about-cta-phone">
              <Phone size={20} />
              07 61 50 35 85
            </a>
            <Link to="/#contact" className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-all" data-testid="about-cta-contact">
              <ArrowRight size={20} />
              {"Formulaire de contact"}
            </Link>
          </div>
        </div>

        {/* ── Internal SEO Links ── */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{"Découvrir aussi"}</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Link to="/" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2"><ArrowRight size={14} /> Accueil</Link>
            <Link to="/articles" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2"><ArrowRight size={14} /> {"Articles & Actualités"}</Link>
            <Link to="/services/assistance-informatique" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2"><ArrowRight size={14} /> Assistance Informatique</Link>
            <Link to="/services/formation-numerique" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2"><ArrowRight size={14} /> {"Formation Numérique"}</Link>
            <Link to="/intervention/joue-les-tours" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2"><ArrowRight size={14} /> {"Intervention Joué-lès-Tours"}</Link>
            <Link to="/mentions-legales" className="flex items-center gap-2 text-french-blue hover:underline font-medium text-sm py-2"><ArrowRight size={14} /> {"Mentions Légales"}</Link>
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": `${SITE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "A Propos", "item": `${SITE_URL}/a-propos` }
          ]
        })
      }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "Person",
          "name": "Pierrick Le Penru", "jobTitle": "Médiateur Numérique",
          "worksFor": { "@type": "LocalBusiness", "name": "Aide Numérique 37", "url": SITE_URL },
          "address": { "@type": "PostalAddress", "addressLocality": "Joué-lès-Tours", "postalCode": "37300", "addressRegion": "Indre-et-Loire", "addressCountry": "FR" },
          "knowsAbout": ["Assistance informatique", "Dépannage informatique", "Formation numérique", "Installation matériel"]
        })
      }} />
    </div>
  );
};

export default About;
