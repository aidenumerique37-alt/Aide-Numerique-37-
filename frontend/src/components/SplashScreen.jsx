import React, { useState, useEffect } from 'react';
import { Macbook } from './Macbook';

/**
 * Full-screen dark splash shown on first page-load.
 * Logo above, CSS isometric MacBook animation below.
 * Fades out after `duration` ms, then calls onComplete.
 */
const SplashScreen = ({ duration = 5500, onComplete }) => {
  const [fading, setFading] = useState(false);
  const [gone,   setGone]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true),                   duration);
    const t2 = setTimeout(() => { setGone(true); onComplete?.(); }, duration + 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [duration, onComplete]);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        background:     '#050505',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        userSelect:     'none',
        transition:     'opacity 0.6s ease',
        opacity:        fading ? 0 : 1,
        pointerEvents:  fading ? 'none' : 'all',
        overflow:       'hidden',
      }}
    >
      {/* ── Subtle radial glow behind MacBook ──────────────────── */}
      <div style={{
        position:   'absolute',
        top:        '50%',
        left:       '50%',
        transform:  'translate(-50%, -50%)',
        width:      600,
        height:     400,
        background: 'radial-gradient(ellipse, rgba(96,165,250,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Logo + brand name ───────────────────────────────────── */}
      <div style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           10,
        marginBottom:  48,
        animation:     'splash-brand-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both',
        position:      'relative',
        zIndex:        2,
      }}>
        <img
          src="/logo.png"
          alt="Aide Numérique 37"
          style={{ height: 52, width: 'auto', display: 'block', filter: 'drop-shadow(0 0 16px rgba(96,165,250,0.35))' }}
          draggable={false}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize:      22,
            fontWeight:    700,
            color:         '#e2e8f0',
            fontFamily:    "'Montserrat','Segoe UI',sans-serif",
            letterSpacing: '-0.3px',
          }}>
            Aide Numérique 37
          </div>
          <div style={{
            fontSize:      12,
            color:         '#475569',
            marginTop:     4,
            fontFamily:    "'Montserrat','Segoe UI',sans-serif",
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Assistance informatique à domicile
          </div>
        </div>
      </div>

      {/* ── MacBook CSS animation ────────────────────────────────── */}
      {/*
        The Macbook component uses:
          absolute left-1/2 top-1/2 mt-[-85px] ml-[-78px]
        so container must be at least 260×280.
        We scale up 2.4× for visual impact.
      */}
      <div style={{
        transform:       'scale(1.85)',
        transformOrigin: 'center center',
        position:        'relative',
        zIndex:          2,
      }}>
        <div style={{ position: 'relative', width: 260, height: 280 }}>
          <Macbook />
        </div>
      </div>

      {/* ── Loading dots ─────────────────────────────────────────── */}
      <div style={{
        display:   'flex',
        gap:       8,
        marginTop: 80,
        position:  'relative',
        zIndex:    2,
      }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              display:        'block',
              width:          6,
              height:         6,
              borderRadius:   '50%',
              background:     'rgba(148,163,184,0.4)',
              animation:      'splash-dot 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.22}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
