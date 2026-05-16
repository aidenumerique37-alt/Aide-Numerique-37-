import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { MapPin, HelpCircle } from 'lucide-react';

const localFaq = [
  {
    q: "Intervenez-vous à Joué-lès-Tours, Tours et Chambray-lès-Tours ?",
    a: "Oui, j'interviens à domicile dans toute l'agglomération de Tours : Joué-lès-Tours (37300), Tours (37000), Chambray-lès-Tours (37170), Saint-Avertin (37550), La Riche, Saint-Pierre-des-Corps, Ballan-Miré, Montbazon et dans un rayon de 20 km autour de Joué-lès-Tours."
  },
  {
    q: "Combien coûte une intervention d'assistance informatique à domicile ?",
    a: "Le tarif est de 50€ de l'heure. Grâce à l'agrément Service à la Personne et à l'Avance Immédiate de crédit d'impôt, vous ne payez que 25€ de l'heure. Aucune démarche de votre part, la réduction est appliquée automatiquement."
  },
  {
    q: "Quels sont les délais d'intervention en Indre-et-Loire ?",
    a: "Je m'efforce d'intervenir dans les 24 à 48h suivant votre appel. Pour les urgences (panne bloquante, virus), une intervention le jour même est possible selon les disponibilités. Contactez-moi au 07 61 50 35 85."
  },
  {
    q: "Quels types de dépannage informatique proposez-vous à domicile ?",
    a: "Je propose le dépannage PC et Mac (lenteur, virus, écran bleu), l'installation et configuration de box Internet/WiFi, la mise en service d'ordinateurs, tablettes et smartphones, la formation personnalisée au numérique pour seniors, et la création de sites web professionnels assistée par IA."
  },
  {
    q: "Comment bénéficier du crédit d'impôt de 50% ?",
    a: "En tant que prestataire agréé Service à la Personne, le crédit d'impôt est appliqué automatiquement grâce à l'Avance Immédiate. Vous réglez uniquement 25€/h au lieu de 50€/h. Aucun formulaire, aucune démarche. Tous les particuliers résidant en France y ont droit."
  },
  {
    q: "Proposez-vous de la formation numérique pour les seniors ?",
    a: "Oui, c'est l'un de mes services les plus demandés. J'accompagne les seniors à leur rythme pour l'utilisation de leur ordinateur, tablette, smartphone, messagerie, visioconférence, achats en ligne, démarches administratives numériques, etc. Patience et pédagogie sont mes maîtres mots."
  },
];

const LocalFAQ = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-950 transition-colors duration-300" id="faq" data-testid="local-faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-french-blue/10 text-french-blue px-4 py-2 rounded-full text-sm font-semibold mb-4 dark:border dark:border-french-blue/30">
            <HelpCircle size={16} />
            Questions Fréquentes
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Vos Questions sur l'Assistance Informatique à Domicile
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <MapPin size={18} className="text-french-red flex-shrink-0" />
            Joué-lès-Tours, Tours, Chambray-lès-Tours et toute l'Indre-et-Loire
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800">
          <Accordion type="single" collapsible className="w-full">
            {localFaq.map((item, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                <AccordionTrigger className="text-left font-semibold text-gray-800 dark:text-gray-100 hover:text-french-blue transition-colors py-4" data-testid={`faq-q-${index}`}>
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-300 leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": localFaq.map(item => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": { "@type": "Answer", "text": item.a }
          }))
        })
      }} />
    </section>
  );
};

export default LocalFAQ;
