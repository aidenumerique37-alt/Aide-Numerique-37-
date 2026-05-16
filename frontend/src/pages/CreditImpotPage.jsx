import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Phone, Calculator, Clock, Shield, AlertCircle, ChevronDown, ChevronUp, Zap, CalendarDays } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SITE_URL = 'https://www.aidenumerique37.fr';
const PHONE = '07 61 50 35 85';

const FAQ_ITEMS = [
  {
    q: "Qu'est-ce que le crédit d'impôt Service à la Personne ?",
    a: "Le crédit d'impôt pour l'emploi d'un salarié à domicile est un avantage fiscal accordé par l'État. Il représente 50 % des dépenses engagées pour des services à la personne agréés, dont l'assistance informatique à domicile. Il s'applique à tous les particuliers résidant en France, qu'ils soient imposables ou non.",
  },
  {
    q: "Qu'est-ce que l'Avance Immédiate de crédit d'impôt ?",
    a: "L'Avance Immédiate est un dispositif de l'URSSAF (opérationnel depuis 2022) qui vous permet de bénéficier de votre crédit d'impôt au moment même du paiement de la prestation, sans rien avancer. Au lieu de payer 50 € et d'attendre votre déclaration de revenus, vous ne réglez que 25 € directement. C'est automatique, sans aucune démarche de votre part.",
  },
  {
    q: "Dois-je faire des démarches pour en bénéficier ?",
    a: "Non, aucune démarche n'est nécessaire de votre côté. En tant que prestataire agréé Service à la Personne, j'active l'Avance Immédiate pour chaque intervention. Vous recevez simplement une notification de l'URSSAF et vous ne payez que 50 % du montant. Tout le reste est géré automatiquement entre l'URSSAF et moi.",
  },
  {
    q: "Qui peut bénéficier de l'Avance Immédiate ?",
    a: "Tous les particuliers résidant en France dont le foyer fiscal a droit au crédit d'impôt pour services à la personne. Cela inclut les salariés, retraités, demandeurs d'emploi et même les personnes non imposables (qui reçoivent dans ce cas un remboursement direct de l'État). Il n'y a aucune condition de revenus.",
  },
  {
    q: "Y a-t-il un plafond au crédit d'impôt ?",
    a: "Oui. Le crédit d'impôt s'applique sur les dépenses de services à la personne dans la limite de 12 000 € par an (soit 6 000 € de réduction maximale). Ce plafond est largement suffisant pour une utilisation courante d'assistance informatique à domicile. Il peut être majoré à 15 000 € la première année et pour certains publics (parents isolés, personnes handicapées).",
  },
  {
    q: "L'assistance informatique est-elle bien un Service à la Personne éligible ?",
    a: "Oui. L'assistance informatique et internet à domicile est explicitement listée parmi les activités de services à la personne éligibles au crédit d'impôt (Code du travail, article D. 7231-1). Aide Numérique 37 est officiellement agréé par l'État pour exercer cette activité.",
  },
  {
    q: "L'Avance Immédiate fonctionne-t-elle aussi pour les retraités ?",
    a: "Oui, les retraités peuvent bénéficier de l'Avance Immédiate. Les retraités non imposables reçoivent un remboursement direct de l'État (crédit d'impôt remboursable). Le dispositif est donc avantageux pour tous, quelle que soit la situation fiscale.",
  },
  {
    q: "Combien vais-je économiser concrètement ?",
    a: "Le tarif horaire est de 50 €/h. Avec l'Avance Immédiate, vous ne payez que 25 €/h (50 % de réduction). Pour une intervention de 2 heures facturée 100 €, vous ne réglez que 50 €. L'État prend en charge les 50 € restants directement auprès de moi.",
  },
  {
    q: "Existe-t-il un tarif spécial pour une intervention urgente ?",
    a: "Oui, il existe un pack « Urgence sous 5h » à 100 € forfaitaire après AICI (200 € tarif réel, dont 100 € pris en charge par l'État). Ce forfait comprend 2 heures de prestation. Au-delà, chaque heure supplémentaire est facturée 40 € après AICI (80 € réel). Attention : cette formule est proposée sous réserve de disponibilité. Mes rendez-vous programmés restent prioritaires et aucune garantie d'intervention ne peut être donnée.",
  },
  {
    q: "Intervenez-vous le dimanche et les jours fériés ?",
    a: "Oui, il m'est possible d'intervenir le dimanche et les jours fériés sur rendez-vous. Le tarif forfaitaire est de 100 € après AICI (200 € tarif réel) pour 2 heures de prestation. Chaque heure supplémentaire est facturée 40 € après AICI (80 € réel). Ce tarif majoré s'explique par le caractère exceptionnel de ces créneaux.",
  },
];

const FaqItem = ({ q, a, isOpen, onToggle }) => (
  <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-left font-medium text-gray-800 dark:text-gray-100 hover:text-french-blue transition-colors"
      aria-expanded={isOpen}
    >
      <span className="pr-4">{q}</span>
      {isOpen ? <ChevronUp size={18} className="flex-shrink-0 text-french-blue" /> : <ChevronDown size={18} className="flex-shrink-0 text-gray-400" />}
    </button>
    {isOpen && (
      <div className="pb-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
        {a}
      </div>
    )}
  </div>
);

export default function CreditImpotPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/credit-impot`,
        "url": `${SITE_URL}/credit-impot`,
        "name": "Crédit d'Impôt 50% et Avance Immédiate — Aide Numérique 37",
        "description": "Comment bénéficier du crédit d'impôt 50% sur l'assistance informatique à domicile à Tours. Avance Immédiate URSSAF : ne payez que 25€/h au lieu de 50€/h.",
        "inLanguage": "fr-FR",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <Helmet>
        <title>Crédit d'Impôt 50% — Avance Immédiate URSSAF | Aide Numérique 37 Tours</title>
        <meta name="description" content="Bénéficiez du crédit d'impôt de 50% sur l'assistance informatique à domicile à Tours. Avec l'Avance Immédiate URSSAF, payez seulement 25€/h au lieu de 50€/h. Aucune démarche." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_URL}/credit-impot`} />
        <meta property="og:title" content="Crédit d'Impôt 50% — Avance Immédiate | Aide Numérique 37" />
        <meta property="og:description" content="Payez seulement 25€/h d'assistance informatique à domicile grâce au crédit d'impôt Service à la Personne. Avance Immédiate URSSAF sans démarche." />
        <meta property="og:image" content="https://www.aidenumerique37.fr/logo.png" />
        <meta property="og:url" content={`${SITE_URL}/credit-impot`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta property="og:locale" content="fr_FR" />
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      </Helmet>

      <Header />

      <main className="pt-20">
        {/* ── HERO ── */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8" aria-label="Fil d'Ariane">
              <Link to="/" className="hover:text-french-blue transition-colors">Accueil</Link>
              <span>/</span>
              <span className="text-gray-700 dark:text-gray-300">Crédit d'Impôt</span>
            </nav>

            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <Shield size={14} />
              Agréé Service à la Personne — officiel
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
              Payez <span className="text-french-blue">50% moins cher</span><br />
              grâce au crédit d'impôt
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              L'assistance informatique à domicile est un Service à la Personne agréé.
              Avec l'<strong>Avance Immédiate de l'URSSAF</strong>, votre crédit d'impôt de 50 %
              est appliqué directement — sans aucune démarche de votre part.
            </p>

            {/* Calculateur visuel */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 max-w-sm mx-auto mb-10">
              <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
                <Calculator size={16} />
                <span className="text-sm font-medium">Tarif horaire</span>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-gray-400 dark:text-gray-500 line-through mb-1">50 €/h</div>
                <div className="text-sm text-gray-500 mb-3">Prix affiché</div>
                <div className="w-8 h-0.5 bg-french-blue mx-auto mb-3" />
                <div className="text-5xl font-black text-french-blue mb-1">25 €/h</div>
                <div className="text-sm text-green-600 dark:text-green-400 font-semibold">Vous payez réellement</div>
                <div className="text-xs text-gray-400 mt-1">après Avance Immédiate</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`tel:${PHONE.replace(/\s/g,'')}`}
                className="inline-flex items-center gap-2 bg-french-blue hover:bg-french-blue/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-french-blue/30"
                data-testid="credit-hero-phone"
              >
                <Phone size={18} />
                {PHONE}
              </a>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:border-french-blue hover:text-french-blue"
                data-testid="credit-hero-contact"
              >
                Demander une intervention
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ── */}
        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black mb-4">Comment fonctionne l'Avance Immédiate ?</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Un dispositif simple et automatique mis en place par l'URSSAF pour que vous profitiez
                immédiatement de votre crédit d'impôt.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  num: '1',
                  title: 'Intervention à domicile',
                  desc: 'Je me déplace chez vous à Tours ou dans un rayon de 20 km. Dépannage, formation, installation — selon vos besoins.',
                  color: 'bg-blue-500',
                },
                {
                  num: '2',
                  title: 'Facturation réduite de 50%',
                  desc: "À la fin de l'intervention, je génère une facture via le portail URSSAF. Vous recevez une notification et ne payez que 50% du montant.",
                  color: 'bg-emerald-500',
                },
                {
                  num: '3',
                  title: 'L\'État paye le reste',
                  desc: "L'URSSAF rembourse directement les 50% restants sur mon compte. Vous n'avancez rien, vous n'attendez rien.",
                  color: 'bg-french-blue',
                },
              ].map(({ num, title, desc, color }) => (
                <div key={num} className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
                  <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center font-black text-lg mb-4`}>
                    {num}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AVANTAGES ── */}
        <section className="py-12 bg-blue-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Aucune démarche administrative de votre côté",
                "Valable pour tous les particuliers en France (imposables ou non)",
                "Applicable dès la première intervention",
                "Aucun avance de trésorerie nécessaire",
                "Crédit d'impôt de 50% dans la limite de 12 000 €/an",
                "Agrément officiel Service à la Personne n° SAP920170568",
              ].map(avantage => (
                <div key={avantage} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{avantage}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Important :</strong> L'Avance Immédiate nécessite une inscription préalable sur le portail URSSAF lors de la première intervention.
                Je vous guide dans cette démarche simple (5 minutes) lors de notre premier contact.
              </p>
            </div>
          </div>
        </section>

        {/* ── TARIFS SPÉCIAUX ── */}
        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black mb-4">Tarifs standard & packs spéciaux</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Tous les tarifs indiqués sont <strong>après Avance Immédiate de Crédit d'Impôt (AICI)</strong> — vous ne payez que 50% du montant réel.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Standard */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col">
                <div className="w-10 h-10 bg-french-blue text-white rounded-xl flex items-center justify-center mb-4">
                  <Clock size={20} />
                </div>
                <h3 className="font-black text-lg mb-1">Tarif horaire</h3>
                <p className="text-xs text-gray-400 mb-4">Intervention standard</p>
                <div className="mt-auto">
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-3xl font-black text-french-blue">25 €</span>
                    <span className="text-gray-400 text-sm mb-1">/h après AICI</span>
                  </div>
                  <p className="text-xs text-gray-400 line-through">50 €/h tarif réel</p>
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">Assistance, dépannage, formation — en semaine et samedi.</p>
                </div>
              </div>

              {/* Pack urgence */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-amber-400 p-6 shadow-md flex flex-col relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                  Si disponible
                </span>
                <div className="w-10 h-10 bg-amber-400 text-amber-900 rounded-xl flex items-center justify-center mb-4">
                  <Zap size={20} />
                </div>
                <h3 className="font-black text-lg mb-1">Pack urgence &lt; 5h</h3>
                <p className="text-xs text-gray-400 mb-4">Intervention en moins de 5 heures</p>
                <div className="mt-auto">
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-3xl font-black text-amber-500">100 €</span>
                    <span className="text-gray-400 text-sm mb-1">forfait après AICI</span>
                  </div>
                  <p className="text-xs text-gray-400 line-through">200 € tarif réel</p>
                  <ul className="text-xs text-gray-500 mt-3 space-y-1.5">
                    <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Comprend 2h de prestation</li>
                    <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Heure suppl. : <strong>40 €/h</strong> après AICI</li>
                    <li className="flex items-start gap-1.5"><AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" />Sous réserve de disponibilité — mes RDV programmés restent prioritaires, aucune garantie d'intervention</li>
                  </ul>
                </div>
              </div>

              {/* Pack dimanche / jours fériés */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-purple-400 p-6 shadow-md flex flex-col">
                <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center mb-4">
                  <CalendarDays size={20} />
                </div>
                <h3 className="font-black text-lg mb-1">Dimanche & jours fériés</h3>
                <p className="text-xs text-gray-400 mb-4">Intervention le dimanche ou un jour férié</p>
                <div className="mt-auto">
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-3xl font-black text-purple-500">100 €</span>
                    <span className="text-gray-400 text-sm mb-1">forfait après AICI</span>
                  </div>
                  <p className="text-xs text-gray-400 line-through">200 € tarif réel</p>
                  <ul className="text-xs text-gray-500 mt-3 space-y-1.5">
                    <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Comprend 2h de prestation</li>
                    <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Heure suppl. : <strong>40 €/h</strong> après AICI</li>
                    <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Disponible sur rendez-vous uniquement</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              Tous les tarifs s'entendent <strong>après application de l'Avance Immédiate de Crédit d'Impôt (AICI)</strong>.
              Le tarif réel facturé est le double ; l'État prend en charge les 50% restants directement.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black mb-2 text-center">Questions fréquentes</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-10">Tout ce que vous devez savoir sur le crédit d'impôt et l'Avance Immédiate</p>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800 px-6" data-testid="credit-faq">
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem
                  key={i}
                  q={item.q}
                  a={item.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-16 bg-gradient-to-br from-french-blue to-sky-600 text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-black mb-4">Prêt à bénéficier du crédit d'impôt ?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Appelez-moi directement ou envoyez-moi un message.
              Je vous explique tout et planifie une intervention à votre convenance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`tel:${PHONE.replace(/\s/g,'')}`}
                className="inline-flex items-center gap-2 bg-white text-french-blue px-8 py-4 rounded-xl font-bold text-lg transition-all hover:bg-blue-50 shadow-lg"
                data-testid="credit-cta-phone"
              >
                <Phone size={18} />
                {PHONE}
              </a>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
                data-testid="credit-cta-contact"
              >
                Formulaire de contact
                <ArrowRight size={18} />
              </Link>
            </div>
            <p className="text-blue-100 text-sm mt-6">
              Intervention à Tours, Joué-lès-Tours, Chambray-lès-Tours et dans tout l'Indre-et-Loire (37)
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
