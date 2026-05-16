import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, CalendarDays, ArrowRight, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

/**
 * SpecialPricing — landing-page preview of the exceptional rate packs.
 * Points to /credit-impot for the complete breakdown.
 */
const SpecialPricing = () => {
  return (
    <section id="tarifs-exceptionnels" className="py-16 sm:py-20 bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" data-testid="special-pricing-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            <Sparkles size={13} />
            Tarifs exceptionnels
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
            Une urgence ? Un dimanche ?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-base">
            Deux forfaits spéciaux pour les situations imprévues — avec le crédit d'impôt appliqué immédiatement, vous ne payez que la moitié.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">

          {/* Pack urgence */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl border-2 border-amber-400 p-6 shadow-md flex flex-col hover:shadow-xl transition-all duration-300" data-testid="pack-urgence-home">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
              Si disponible
            </span>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-400 text-amber-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg text-gray-900 dark:text-white">Pack urgence &lt; 5h</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Intervention en moins de 5 heures</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-amber-500">100 €</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm mb-1.5">forfait après AICI</span>
              </div>
              <p className="text-xs text-gray-400 line-through">200 € tarif réel</p>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 mt-4 space-y-1.5">
              <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Comprend 2 h de prestation</li>
              <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Heure suppl. : <strong>40 €</strong> après AICI</li>
              <li className="flex items-start gap-1.5"><AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" />Sous réserve de disponibilité — RDV programmés prioritaires</li>
            </ul>
          </div>

          {/* Pack dimanche/jours fériés */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-purple-400 p-6 shadow-md flex flex-col hover:shadow-xl transition-all duration-300" data-testid="pack-dimanche-home">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <CalendarDays size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg text-gray-900 dark:text-white">Dimanche & jours fériés</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sur rendez-vous uniquement</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-purple-500">100 €</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm mb-1.5">forfait après AICI</span>
              </div>
              <p className="text-xs text-gray-400 line-through">200 € tarif réel</p>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 mt-4 space-y-1.5">
              <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Comprend 2 h de prestation</li>
              <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Heure suppl. : <strong>40 €</strong> après AICI</li>
              <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />Intervention garantie sur créneau réservé</li>
            </ul>
          </div>
        </div>

        {/* Footnote + CTA */}
        <div className="text-center mt-10">
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-5">
            Tarifs indiqués <strong>après Avance Immédiate de Crédit d'Impôt (AICI)</strong> — vous payez 50 % du tarif réel,
            l'État prend en charge les 50 % restants directement.
          </p>
          <Link
            to="/credit-impot"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-french-blue text-white text-sm font-bold hover:bg-french-blue/90 transition-all shadow-md hover:shadow-lg"
            data-testid="special-pricing-cta"
          >
            Voir tous les tarifs & avantages fiscaux
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SpecialPricing;
