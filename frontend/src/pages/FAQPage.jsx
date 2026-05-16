import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { HelpCircle, Search, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sanitizeHtml } from '../utils/sanitize';

const FAQ_DATA = [
  {
    cat: 'Général',
    items: [
      {
        q: "Quels types de services proposez-vous ?",
        a: "Je propose l'assistance informatique à domicile, le dépannage (PC, Mac, tablettes, smartphones), la formation numérique personnalisée, l'installation et configuration de matériel, la création de sites web assistée par IA, ainsi que le conseil en sécurité informatique. Découvrez tous mes <a href='/services/assistance-informatique' class='text-french-blue underline'>services d'assistance</a>."
      },
      {
        q: "Êtes-vous un professionnel agréé ?",
        a: "Oui, je suis agréé Service à la Personne (SAP), ce qui vous permet de bénéficier d'un crédit d'impôt de 50% sur chaque intervention. Grâce à l'<a href='/credit-impot' class='text-french-blue underline'>Avance Immédiate</a>, cette réduction s'applique directement sur votre facture."
      },
      {
        q: "Intervenez-vous uniquement à Tours ?",
        a: "J'interviens dans un rayon de 20 km autour de Joué-lès-Tours : <a href='/intervention/tours' class='text-french-blue underline'>Tours</a>, <a href='/intervention/joue-les-tours' class='text-french-blue underline'>Joué-lès-Tours</a>, <a href='/intervention/chambray-les-tours' class='text-french-blue underline'>Chambray-lès-Tours</a>, Saint-Avertin, La Riche, Saint-Pierre-des-Corps, Ballan-Miré, Montbazon et communes environnantes."
      },
      {
        q: "Travaillez-vous avec les particuliers et les professionnels ?",
        a: "Oui, je travaille avec les deux. Les particuliers bénéficient du crédit d'impôt SAP. Pour les professionnels et petites entreprises, je propose des interventions ponctuelles ou un suivi régulier adapté à vos besoins."
      },
    ]
  },
  {
    cat: 'Tarifs & Paiement',
    items: [
      {
        q: "Combien coûte une intervention à domicile ?",
        a: "Le tarif est de 50 € de l'heure. Grâce à l'agrément SAP et à l'Avance Immédiate, vous ne payez que 25 € de l'heure après crédit d'impôt. Le déplacement est inclus dans la zone d'intervention."
      },
      {
        q: "Comment fonctionne l'Avance Immédiate de crédit d'impôt ?",
        a: "L'Avance Immédiate est un dispositif de l'URSSAF qui applique automatiquement votre crédit d'impôt de 50% au moment du paiement. Au lieu d'avancer 50 € et d'attendre le remboursement aux impôts, vous payez directement 25 €. Aucune démarche de votre part. Plus d'infos sur la page <a href='/credit-impot' class='text-french-blue underline'>Crédit d'Impôt & Avance Immédiate</a>."
      },
      {
        q: "Y a-t-il un minimum de facturation ?",
        a: "L'intervention minimale est d'une heure (50 €, soit 25 € après crédit d'impôt). Au-delà, la facturation se fait par tranche de 30 minutes."
      },
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "J'accepte le paiement par virement bancaire, chèque et CESU (Chèque Emploi Service Universel). Le paiement s'effectue après l'intervention."
      },
      {
        q: "Proposez-vous des forfaits ou abonnements ?",
        a: "Oui, pour les clients réguliers, je propose des formules d'accompagnement mensuel à tarif préférentiel. Contactez-moi pour en discuter : <a href='tel:0761503585' class='text-french-blue underline'>07 61 50 35 85</a>."
      },
      {
        q: "Intervenez-vous en urgence ? Quel est le tarif ?",
        a: "Oui, je propose un pack « Urgence sous 5h » à <strong>100 € forfaitaire après AICI</strong> (200 € tarif réel, dont 100 € pris en charge par l'État via le crédit d'impôt). Ce forfait comprend 2 heures de prestation. Chaque heure supplémentaire est à 40 € après AICI. <em>Sous réserve de disponibilité — mes rendez-vous programmés restent prioritaires, aucune garantie d'intervention.</em>"
      },
      {
        q: "Intervenez-vous le dimanche et les jours fériés ?",
        a: "Oui, sur rendez-vous uniquement. Le tarif est un forfait de <strong>100 € après AICI</strong> (200 € tarif réel) incluant 2 heures de prestation. Heure supplémentaire : 40 € après AICI. Ce tarif majoré s'applique en raison du caractère exceptionnel de ces créneaux."
      },
    ]
  },
  {
    cat: 'Déroulement d\'une intervention',
    items: [
      {
        q: "Comment se passe une prise de rendez-vous ?",
        a: "C'est très simple : appelez-moi au <a href='tel:0761503585' class='text-french-blue underline'>07 61 50 35 85</a> ou utilisez le <a href='/#contact' class='text-french-blue underline'>formulaire de contact</a>. Je vous rappelle rapidement pour comprendre votre besoin et planifier un créneau d'intervention à votre domicile."
      },
      {
        q: "Quel est le délai d'intervention ?",
        a: "En général, j'interviens sous 24 à 48 heures. Pour les urgences (panne bloquante, virus actif, perte de données), une intervention le jour même est possible selon les disponibilités."
      },
      {
        q: "Combien de temps dure une intervention type ?",
        a: "La plupart des interventions durent entre 1h et 2h. Un dépannage simple (lenteur, configuration) prend environ 1h. Une installation complète ou une formation peut nécessiter 2h à 3h. Je vous informe du temps estimé avant de commencer."
      },
      {
        q: "Que se passe-t-il si le problème n'est pas résolu en une seule visite ?",
        a: "Si le problème nécessite une intervention supplémentaire (commande de pièce, mise à jour longue), nous planifions un second rendez-vous. Vous n'êtes facturé que pour le temps réellement passé."
      },
      {
        q: "Dois-je préparer quelque chose avant votre venue ?",
        a: "Idéalement, ayez à portée de main vos mots de passe (boîte mail, box Internet) et toute documentation liée à votre problème (messages d'erreur, garantie). Si vous ne les avez pas, pas de panique, je m'adapte."
      },
    ]
  },
  {
    cat: 'Dépannage & Problèmes courants',
    items: [
      {
        q: "Mon ordinateur est très lent, que pouvez-vous faire ?",
        a: "La lenteur a souvent plusieurs causes : disque dur saturé, logiciels inutiles au démarrage, manque de mémoire, malware. Je réalise un diagnostic complet, nettoie votre système, optimise le démarrage et si nécessaire, recommande une mise à niveau matérielle (SSD, RAM)."
      },
      {
        q: "Pouvez-vous supprimer un virus ou un logiciel malveillant ?",
        a: "Oui, c'est l'une de mes interventions les plus fréquentes. Je supprime virus, ransomware, adware et spyware, puis installe une protection adaptée pour éviter les récidives. En savoir plus sur mon <a href='/services/depannage-domicile' class='text-french-blue underline'>service de dépannage</a>."
      },
      {
        q: "Mon imprimante ne fonctionne plus, pouvez-vous m'aider ?",
        a: "Absolument. Les problèmes d'imprimante (connexion WiFi perdue, pilotes obsolètes, file d'attente bloquée) sont courants et généralement rapides à résoudre. J'installe et configure aussi les nouvelles imprimantes."
      },
      {
        q: "Ma connexion Internet ne fonctionne pas ou est instable, que faire ?",
        a: "Je diagnostique les problèmes de connexion : configuration de la box, positionnement WiFi, interférences, câblage. Je peux installer des répéteurs WiFi ou des solutions CPL pour améliorer la couverture de votre domicile."
      },
      {
        q: "Pouvez-vous récupérer des données supprimées ou perdues ?",
        a: "Je peux tenter la récupération de données dans de nombreux cas (suppression accidentelle, disque endommagé). Plus l'intervention est rapide après la perte, meilleures sont les chances de récupération. Contactez-moi dès que possible."
      },
      {
        q: "Intervenez-vous sur Mac et PC ?",
        a: "Oui, j'interviens sur les deux environnements : Windows, macOS, Linux, ainsi que sur tablettes (iPad, Android) et smartphones. Mon expertise couvre l'ensemble des appareils numériques."
      },
    ]
  },
  {
    cat: 'Formation & Accompagnement',
    items: [
      {
        q: "Proposez-vous de la formation numérique pour les seniors ?",
        a: "Oui, c'est l'un de mes services les plus demandés. J'accompagne les seniors à leur rythme : messagerie, visioconférence, achats en ligne, démarches administratives (impôts, Ameli, CAF), réseaux sociaux. Patience et pédagogie sont mes maîtres mots. Plus d'infos sur la <a href='/services/formation-numerique' class='text-french-blue underline'>formation numérique</a>."
      },
      {
        q: "Pouvez-vous m'aider avec les démarches administratives en ligne ?",
        a: "Bien sûr. Je vous guide dans l'utilisation des sites comme impots.gouv.fr, Ameli, CAF, France Connect, et toute démarche dématérialisée. Je vous apprends à être autonome tout en vous accompagnant."
      },
      {
        q: "Comment se déroule une séance de formation ?",
        a: "La formation se fait à votre domicile, sur votre propre matériel. Je m'adapte à votre niveau et vos objectifs. Nous avançons étape par étape, avec des exercices pratiques. Je fournis des fiches récapitulatives pour que vous puissiez revoir à votre rythme."
      },
      {
        q: "Combien de séances faut-il pour devenir autonome ?",
        a: "Cela dépend de votre niveau de départ et de vos objectifs. En général, 3 à 5 séances d'1h30 suffisent pour maîtriser les bases (navigation, mail, visio). Pour des besoins spécifiques, nous adaptons le programme ensemble."
      },
    ]
  },
  {
    cat: 'Installation & Configuration',
    items: [
      {
        q: "Pouvez-vous installer et configurer un nouvel ordinateur ?",
        a: "Oui, je me charge de l'installation complète : mise en route, configuration Windows/macOS, création de comptes, installation des logiciels essentiels, transfert de vos données depuis l'ancien appareil, configuration de l'imprimante et de la messagerie. Voir les détails sur la page <a href='/services/installation-configuration' class='text-french-blue underline'>installation et configuration</a>."
      },
      {
        q: "Pouvez-vous configurer ma box Internet et mon WiFi ?",
        a: "Absolument. Je configure votre box (Free, Orange, SFR, Bouygues), optimise le WiFi, connecte tous vos appareils, et m'assure que tout fonctionne correctement avant de partir."
      },
      {
        q: "Aidez-vous à transférer les données d'un ancien appareil vers un nouveau ?",
        a: "Oui, le transfert de données (photos, documents, mails, contacts, favoris) fait partie de mes services les plus demandés. Je m'assure que rien n'est perdu lors du passage à un nouvel appareil."
      },
      {
        q: "Pouvez-vous installer un logiciel antivirus ?",
        a: "Oui, je conseille et installe la solution antivirus adaptée à votre usage (gratuite ou payante selon vos besoins). Je configure aussi le pare-feu et les mises à jour automatiques pour une protection optimale."
      },
    ]
  },
  {
    cat: 'Sécurité & Confiance',
    items: [
      {
        q: "Comment protéger mes données personnelles ?",
        a: "Je vous conseille sur les bonnes pratiques : mots de passe robustes, sauvegarde régulière, mise à jour des logiciels, prudence face au phishing. Je peux configurer un système de sauvegarde automatique et installer des outils de sécurité."
      },
      {
        q: "Mes données sont-elles en sécurité pendant votre intervention ?",
        a: "Absolument. Je respecte une stricte confidentialité. Je ne copie, consulte ni divulgue aucune donnée personnelle. Mon agrément Service à la Personne garantit mon sérieux et ma fiabilité. Consultez les <a href='/#avis' class='text-french-blue underline'>avis de mes clients</a>."
      },
      {
        q: "Comment éviter les arnaques en ligne ?",
        a: "Ne cliquez jamais sur des liens suspects, vérifiez l'adresse des sites avant d'entrer vos coordonnées, ne communiquez jamais vos mots de passe par téléphone ou email. En cas de doute, contactez-moi avant d'agir. Je propose aussi des sessions de sensibilisation à la cybersécurité."
      },
    ]
  },
];

const allQuestions = FAQ_DATA.flatMap(cat => cat.items);

const FAQPage = () => {
  const SITE_URL = 'https://www.aidenumerique37.fr';
  const [search, setSearch] = useState('');
  const [openCat, setOpenCat] = useState(null);

  const filtered = search.trim()
    ? FAQ_DATA.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : FAQ_DATA;

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allQuestions.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a.replace(/<[^>]*>/g, '')
      }
    }))
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      <Helmet>
        <title>FAQ - Questions Fréquentes | Aide Numérique 37</title>
        <meta name="description" content="Retrouvez les réponses à toutes vos questions sur l'assistance informatique à domicile à Tours, Joué-lès-Tours et en Indre-et-Loire. Tarifs, déroulement, services, crédit d'impôt." />
        <link rel="canonical" href={`${SITE_URL}/faq`} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta property="og:title" content="FAQ - Assistance Informatique à Domicile | Aide Numérique 37" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Aide Numérique 37" />
        <meta property="og:url" content={`${SITE_URL}/faq`} />
        <meta property="og:description" content="Retrouvez les réponses à toutes vos questions sur l'assistance informatique à domicile en Indre-et-Loire." />
        <meta property="og:image" content="https://www.aidenumerique37.fr/logo.png" />
        <meta property="og:locale" content="fr_FR" />
      </Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-b from-french-blue/5 to-transparent dark:from-french-blue/10 pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-french-blue/10 text-french-blue px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <HelpCircle size={16} />
            {allQuestions.length} questions
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" data-testid="faq-title">
            Questions Fréquentes
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Tout ce que vous devez savoir sur l'assistance informatique à domicile en Indre-et-Loire
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une question..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-french-blue/30 focus:border-french-blue outline-none transition-all"
              data-testid="faq-search"
            />
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-6">
          {filtered.map((cat, catIdx) => (
            <div key={cat.cat} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden" data-testid={`faq-category-${catIdx}`}>
              <button
                onClick={() => setOpenCat(openCat === catIdx ? null : catIdx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-french-blue/10 flex items-center justify-center">
                    <HelpCircle size={16} className="text-french-blue" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cat.cat}</h2>
                  <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{cat.items.length}</span>
                </div>
                <span className={`text-gray-400 transition-transform duration-200 ${(openCat === catIdx || search.trim()) ? 'rotate-180' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </button>

              {(openCat === catIdx || search.trim()) && (
                <div className="px-5 pb-5">
                  <Accordion type="single" collapsible className="w-full">
                    {cat.items.map((item, idx) => (
                      <AccordionItem key={idx} value={`${catIdx}-${idx}`} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <AccordionTrigger className="text-left font-semibold text-gray-800 dark:text-gray-100 hover:text-french-blue transition-colors py-4 text-sm" data-testid={`faq-q-${catIdx}-${idx}`}>
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 dark:text-gray-300 leading-relaxed pb-4 text-sm">
                          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.a) }} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucune question ne correspond à votre recherche.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center bg-french-blue/5 dark:bg-french-blue/10 rounded-2xl p-8 border border-french-blue/10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">N'hésitez pas à me contacter directement</p>
          <a href="tel:0761503585" className="inline-flex items-center gap-2 bg-french-blue hover:bg-french-blue/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg" data-testid="faq-cta-phone">
            <Phone size={16} /> 07 61 50 35 85
          </a>
        </div>
      </div>

      {/* Schema.org FAQPage */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />
    </div>
  );
};

export default FAQPage;
