import React, { useState, useEffect } from 'react';
import { Macbook } from '@/components/ui/animated-3d-mac-book-air';

/**
 * Full-screen splash shown on first page-load.
 * Fades out after `duration` ms, then calls onComplete.
 */
const SplashScreen = ({ duration = 2800, onComplete }) => {
  const [fading, setFading] = useState(false);
  const [gone,   setGone]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true),         duration);
    const t2 = setTimeout(() => { setGone(true); onComplete?.(); }, duration + 550);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [duration, onComplete]);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     9999,
        background: '#ffffff',
        display:    'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        transition: 'opacity 0.55s ease',
        opacity:    fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'all',
      }}
    >
      {/* ── Brand block ─────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            12,
        marginBottom:   56,
        animation:      'splash-brand-in 0.6s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <img
          src="/logo.png"
          alt="Aide Numérique 37"
          style={{ height: 56, width: 'auto', display: 'block' }}
          draggable={false}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize:   22,
            fontWeight: 700,
            color:      '#0055A4',
            fontFamily: "'Montserrat', 'Segoe UI', sans-serif",
            letterSpacing: '-0.3px',
          }}>
            Aide Numérique 37
          </div>
          <div style={{
            fontSize:    13,
            color:       '#9ca3af',
            marginTop:   4,
            fontFamily:  "'Montserrat', 'Segoe UI', sans-serif",
            letterSpacing: '0.02em',
          }}>
            Assistance informatique à domicile
          </div>
        </div>
      </div>

      {/* ── MacBook animation ────────────────────────────────── */}
      {/*
        The Macbook component uses `absolute left-1/2 top-1/2 mt-[-85px] ml-[-78px]`
        so we give it a relative container that is large enough to contain the
        full animation (body + screen + shadow at top:[160px]).

        Container: 260 × 280 px
          center-x = 130  →  macbook left = 130-78 = 52   right = 202  ✓
          center-y = 140  →  macbook top  = 140-85 = 55   bottom= 151  ✓
          shadow           →  140+75 = 215 (within 280)    ✓

        Then we scale the whole thing up.
      */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Macbook />
      </div>

      {/* ── Loading dots ─────────────────────────────────────── */}
      <div style={{
        display:      'flex',
        gap:          8,
        marginTop:    72,
      }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              display:         'block',
              width:           7,
              height:          7,
              borderRadius:    '50%',
              background:      'rgba(0,85,164,0.45)',
              animation:       'splash-dot 1.3s ease-in-out infinite',
              animationDelay:  `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
