import React, { useEffect, useRef, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { BadgePercent, CreditCard, FileCheck, Sparkles } from 'lucide-react';
import { sanitizeHtml } from '../utils/sanitize';

const useDecrementCounter = (start, end, duration = 1500) => {
  const ref = useRef(null);
  const [count, setCount] = useState(start);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(start - eased * (start - end)));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [start, end, duration]);

  return { ref, count };
};

const urssafInfo = [
  { id: 1, question: "Qu'est-ce que le Service à la Personne ?", answer: "Le Service à la Personne (SAP) regroupe l'ensemble des activités d'aide aux personnes réalisées à domicile. L'assistance informatique à domicile fait partie de ces services agréés qui ouvrent droit à des avantages fiscaux." },
  { id: 2, question: "Qu'est-ce que l'Avance Immédiate ?", answer: "L'Avance Immédiate vous permet de ne payer que 50% du montant de la prestation. L'État finance directement les 50% restants sous forme de crédit d'impôt, sans attendre la déclaration annuelle. Vous bénéficiez ainsi immédiatement de votre réduction fiscale." },
  { id: 3, question: "Comment fonctionne le Crédit d'Impôt ?", answer: "En utilisant un service à la personne agréé comme l'assistance informatique, vous bénéficiez d'un crédit d'impôt de 50% des dépenses engagées (dans la limite de 12 000€ par an). Avec l'Avance Immédiate, ce crédit est appliqué directement au moment du paiement." },
  { id: 4, question: "Quels sont les avantages pour vous ?", answer: "Avec l'Avance Immédiate, vous payez seulement 50% du prix. Par exemple, pour une prestation de 60€, vous ne payez que 30€. C'est simple, rapide et sans démarche administrative complexe. L'État prend en charge immédiatement l'autre moitié." },
  { id: 5, question: "Qui peut bénéficier du Service à la Personne ?", answer: "Tous les particuliers domiciliés fiscalement en France peuvent bénéficier de ce dispositif, sans condition d'âge ou de ressources. Que vous soyez actif, retraité, imposable ou non, vous avez droit à cet avantage fiscal pour vos besoins d'assistance informatique à domicile." },
  { id: 6, question: "Quelles prestations sont concernées ?", answer: "Toutes les interventions d'assistance informatique et numérique à votre domicile sont éligibles : dépannage, installation de matériel (ordinateur, box, imprimante), formation personnalisée, configuration de smartphone ou tablette, aide à la navigation internet, et résolution de problèmes techniques." },
  { id: 7, question: "Comment obtenir l'Avance Immédiate ?", answer: "Aucune démarche de votre part ! En tant que prestataire agréé Service à la Personne, j'applique automatiquement l'Avance Immédiate sur vos factures. Vous réglez simplement 50% du montant. Je m'occupe de toutes les démarches administratives avec l'URSSAF pour vous." },
];

const UrssafInfo = () => {
  const { ref: priceRef, count: priceCount } = useDecrementCounter(50, 25, 2000);

  return (
    <section id="urssaf" className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-french-blue/10 text-french-blue px-4 py-2 rounded-full text-sm font-semibold mb-6 dark:border dark:border-french-blue/30 animate-bounce">
            <Sparkles size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
            Avantage Fiscal
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Payez Uniquement 50% de la Facture
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Gr&acirc;ce au Service &agrave; la Personne et &agrave; l'Avance Imm&eacute;diate, b&eacute;n&eacute;ficiez imm&eacute;diatement de votre cr&eacute;dit d'imp&ocirc;t
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Visual Explanation */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-none p-8 border-2 border-french-blue/10 dark:border-french-blue/20">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <BadgePercent className="text-french-blue" size={28} />
                Comment &ccedil;a fonctionne ?
              </h3>

              <div className="space-y-6">
                {/* Price Example */}
                <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-6 dark:border dark:border-gray-700">
                  <div className="text-center mb-4">
                    <div className="text-gray-600 dark:text-gray-400 font-medium mb-2">Prix de la prestation</div>
                    <div className="font-bold text-5xl line-through text-gray-400 dark:text-gray-500">50&euro;</div>
                  </div>

                  <div className="flex items-center justify-center gap-4 my-6">
                    <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
                    <CreditCard className="text-french-blue" size={24} />
                    <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
                  </div>

                  <div className="text-center" ref={priceRef}>
                    <div className="text-french-blue font-bold mb-2">Vous payez seulement</div>
                    <div className="font-bold text-6xl text-french-blue drop-shadow-[0_0_15px_hsla(188,94%,43%,0.4)]" data-testid="price-counter">{priceCount}&euro;</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Avec l'Avance Imm&eacute;diate</div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-french-blue/20 dark:border-gray-700">
                    <FileCheck className="text-french-blue flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Sans d&eacute;marche administrative</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">La r&eacute;duction est appliqu&eacute;e automatiquement</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-french-blue/20 dark:border-gray-700">
                    <BadgePercent className="text-french-blue flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Cr&eacute;dit d'imp&ocirc;t de 50%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Appliqu&eacute; directement sur le montant &agrave; payer</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-french-blue/20 dark:border-gray-700">
                    <Sparkles className="text-french-blue flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">B&eacute;n&eacute;fice imm&eacute;diat</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Pas besoin d'attendre votre d&eacute;claration fiscale</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - FAQ Accordion */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-none p-8 border-2 border-french-blue/10 dark:border-french-blue/20">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Questions Fr&eacute;quentes
              </h3>

              <Accordion type="single" collapsible className="w-full">
                {urssafInfo.map((item, index) =>
                  <AccordionItem key={item.id} value={`item-${index}`} className="border-b border-gray-200 dark:border-gray-700">
                    <AccordionTrigger className="text-left font-medium text-gray-800 dark:text-gray-100 hover:text-french-blue transition-colors py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300 leading-relaxed pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            {/* Additional Info Card */}
            <div className="bg-gradient-to-r from-french-blue to-sky-blue text-white rounded-2xl shadow-lg dark:shadow-french-blue/10 p-8">
              <h4 className="text-xl font-bold mb-3">
                Service &agrave; la Personne Agr&eacute;&eacute;
              </h4>
              <p className="text-blue-100 leading-relaxed">
                L'assistance informatique &agrave; domicile est reconnue comme un Service &agrave; la Personne.
                Cela vous permet de b&eacute;n&eacute;ficier des avantages fiscaux et de l'Avance Imm&eacute;diate
                pour r&eacute;duire imm&eacute;diatement vos d&eacute;penses.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": urssafInfo.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })
        }}
      />
    </section>
  );
};

export default UrssafInfo;
