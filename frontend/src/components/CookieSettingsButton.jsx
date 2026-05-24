import React, { useState, useRef, useEffect } from 'react';
import { Cookie, X, Check, Ban } from 'lucide-react';
import { useCookieConsent } from '../context/CookieConsentContext';

const CookieSettingsButton = () => {
  const { consent, accept, refuse, reset } = useCookieConsent();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleAccept = () => { accept(); setOpen(false); };
  const handleRefuse = () => { refuse(); setOpen(false); };
  const handleReset  = () => { reset();  };

  const accepted = consent === 'accepted';
  const refused  = consent === 'refused';

  return (
    <div className="fixed bottom-5 right-5 z-[9998] flex flex-col items-end gap-2">

      {/* Popup panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Préférences cookies"
          className="w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Cookie size={15} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Cookies</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Fermer"
            >
              <X size={13} />
            </button>
          </div>

          {/* Status */}
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {accepted && 'Google Analytics est activé. Vous pouvez changer votre choix à tout moment.'}
              {refused  && 'Cookies analytiques refusés. Vous pouvez changer votre choix ci-dessous.'}
              {!accepted && !refused && 'Vous n\'avez pas encore défini vos préférences de cookies.'}
            </p>

            {/* Current status pill */}
            {(accepted || refused) && (
              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${accepted ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                {accepted ? <Check size={9} /> : <Ban size={9} />}
                {accepted ? 'Acceptés' : 'Refusés'}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800 mx-4" />

          {/* Actions */}
          <div className="p-3 flex gap-2">
            <button
              onClick={handleRefuse}
              className="flex-1 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Accepter
            </button>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(v => !v)}
        aria-label="Préférences cookies"
        aria-expanded={open}
        className={`
          w-9 h-9 rounded-full flex items-center justify-center shadow-lg
          transition-all duration-200 hover:scale-110 active:scale-95
          ${open
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600'
          }
        `}
      >
        <Cookie size={16} />
      </button>
    </div>
  );
};

export default CookieSettingsButton;
