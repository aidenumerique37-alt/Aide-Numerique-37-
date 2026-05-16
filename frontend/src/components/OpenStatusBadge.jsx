import React, { useState, useEffect } from 'react';

/**
 * Live "Ouvert / Fermé" badge.
 * Open daily 8h30 – 20h00 (Europe/Paris timezone, independent of user device TZ).
 *
 * Variants:
 *  - "compact" → small pill, ideal for header
 *  - "full"    → larger label with helper text, ideal for footer
 */
const TZ = 'Europe/Paris';
const OPEN_MIN = 8 * 60 + 30;   // 8h30
const CLOSE_MIN = 20 * 60;      // 20h00

const getParisMinutes = () => {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const h = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find(p => p.type === 'minute')?.value ?? 0);
  return h * 60 + m;
};

const formatNextOpening = (minutesNow) => {
  if (minutesNow < OPEN_MIN) return "ouvre à 8h30";
  return "ouvre demain à 8h30";
};

export const OpenStatusBadge = ({ variant = 'compact', className = '' }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // refresh every minute so the badge stays accurate
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // tick is referenced so eslint is happy and re-renders trigger
  const minutes = getParisMinutes() + (tick * 0);
  const isOpen = minutes >= OPEN_MIN && minutes < CLOSE_MIN;

  if (variant === 'full') {
    return (
      <div
        className={`inline-flex items-center gap-2.5 ${className}`}
        data-testid={isOpen ? 'open-badge-full-open' : 'open-badge-full-closed'}
        aria-label={isOpen ? 'Ouvert maintenant' : 'Actuellement fermé'}
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          {isOpen && <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? 'bg-green-500' : 'bg-gray-500'}`} />
        </span>
        <span>
          <span className={`block text-sm font-semibold ${isOpen ? 'text-green-400' : 'text-gray-300'}`}>
            {isOpen ? 'Ouvert maintenant' : 'Fermé'}
          </span>
          <span className="block text-xs text-gray-400">
            {isOpen ? "Jusqu'à 20h00 — 7j/7" : formatNextOpening(minutes)}
          </span>
        </span>
      </div>
    );
  }

  // compact (header)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${
        isOpen
          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
          : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      } ${className}`}
      title={isOpen ? "Aide Numérique 37 — ouvert jusqu'à 20h" : `Aide Numérique 37 — ${formatNextOpening(minutes)}`}
      data-testid={isOpen ? 'open-badge-compact-open' : 'open-badge-compact-closed'}
      aria-label={isOpen ? 'Ouvert maintenant' : 'Actuellement fermé'}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {isOpen && <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
      </span>
      {isOpen ? 'Ouvert' : 'Fermé'}
    </span>
  );
};

export default OpenStatusBadge;
