import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';

const CookieBanner = () => {
  const { hasConsented, accept, refuse } = useCookieConsent();
  const [expanded, setExpanded] = useState(false);

  if (hasConsented) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 pointer-events-none"
    >
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
        {/* Top bar */}
        <div className="flex items-start gap-3 p-5 pb-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Ce site utilise des cookies
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Nous utilisons Google Analytics pour mesurer l'audience du site. Aucune donnée publicitaire n'est collectée.{' '}
              <Link
                to="/politique-de-confidentialite"
                className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                En savoir plus
              </Link>
            </p>

            {/* Details toggle */}
            <button
              onClick={() => setExpanded(v => !v)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-expanded={expanded}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Masquer les détails' : 'Voir les détails'}
            </button>
          </div>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 w-2 h-2 rounded-full bg-green-400 shrink-0" />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Cookies essentiels</span>
                <p className="text-gray-500 dark:text-gray-500">Toujours actifs — nécessaires au fonctionnement du site (thème, préférences).</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Google Analytics</span>
                <p className="text-gray-500 dark:text-gray-500">Mesure d'audience anonymisée (pages visitées, durée de session). Activé uniquement avec votre accord.</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 p-4 pt-3">
          {/* Refuse — same visual weight as Accept (CNIL requirement) */}
          <button
            onClick={refuse}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
