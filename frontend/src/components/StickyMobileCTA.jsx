import React, { useState, useEffect } from 'react';
import { Phone, X, BadgePercent } from 'lucide-react';

const StickyMobileCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (dismissed) return;
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" data-testid="sticky-mobile-cta">
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3">
        <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1" aria-label="Fermer" data-testid="sticky-cta-dismiss">
          <X size={16} />
        </button>
        <div className="flex items-center gap-3">
          <a
            href="tel:0761503585"
            className="flex-1 flex items-center justify-center gap-2 bg-french-red hover:bg-french-red/90 text-white font-bold py-3 px-4 rounded-xl shadow-md active:scale-95 transition-all"
            data-testid="sticky-cta-call"
          >
            <Phone size={18} />
            Appeler maintenant
          </a>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
            <BadgePercent size={14} className="text-french-blue" />
            <span className="font-semibold">25&euro;/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyMobileCTA;
