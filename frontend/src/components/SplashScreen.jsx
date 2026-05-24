import React, { useState, useEffect } from 'react';
import Macbook from './Macbook';

const SplashScreen = ({ duration = 5500, onComplete }) => {
  const [fading, setFading] = useState(false);
  const [gone,   setGone]   = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true),                    duration);
    const t2 = setTimeout(() => { setGone(true); onComplete?.(); }, duration + 800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [duration, onComplete]);

  if (gone) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        9999,
        background:    '#060810',
        transition:    'opacity 0.8s ease',
        opacity:       fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'all',
        overflow:      'hidden',
        userSelect:    'none',
      }}
    >
      {/* ── Ambient glow blob ───────────────────────────────────── */}
      <div style={{
        position:     'absolute',
        top:          '50%',
        left:         '50%',
        width:        700,
        height:       700,
        marginLeft:   -350,
        marginTop:    -420,
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(59,130,246,0.07) 0%, rgba(99,102,241,0.03) 45%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Logo + brand (top center) ────────────────────────────── */}
      <div style={{
        position:       'absolute',
        top:            '7%',
        left:           '50%',
        transform:      'translateX(-50%)',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            8,
        whiteSpace:     'nowrap',
        animation:      'splash-brand-in 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both',
        zIndex:         2,
      }}>
        <img
          src="/logo.png"
          alt="Aide Numérique 37"
          style={{
            height: 54,
            width:  'auto',
            filter: 'drop-shadow(0 0 18px rgba(96,165,250,0.45))',
          }}
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
            fontSize:      10,
            color:         '#3d4f6b',
            marginTop:     4,
            fontFamily:    "'Montserrat','Segoe UI',sans-serif",
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}>
            Assistance informatique à domicile
          </div>
        </div>
      </div>

      {/* ── MacBook (absolute center) ────────────────────────────── */}
      {/*
        The Macbook component positions itself with:
          absolute left-1/2 top-1/2 mt-[-85px] ml-[-78px]
        inside a 160×200 relative box.
        We center that box then scale 2.6× around its center.
      */}
      <div style={{
        position:  'absolute',
        top:       '50%',
        left:      '50%',
        marginTop: -100,
        marginLeft: -80,
        animation: 'splash-macbook-in 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s both',
        zIndex:    1,
      }}>
        <div style={{ transform: 'scale(2.6)', transformOrigin: 'center center' }}>
          <div style={{ position: 'relative', width: 160, height: 200 }}>
            <Macbook />
          </div>
        </div>
      </div>

      {/* ── Progress bar + dots (bottom) ────────────────────────── */}
      <div style={{
        position:       'absolute',
        bottom:         '7%',
        left:           '50%',
        transform:      'translateX(-50%)',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            10,
        zIndex:         2,
        animation:      'splash-brand-in 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s both',
      }}>
        {/* Thin progress bar */}
        <div style={{
          width:        120,
          height:       2,
          borderRadius: 2,
          background:   'rgba(255,255,255,0.06)',
          overflow:     'hidden',
        }}>
          <div style={{
            height:     '100%',
            borderRadius: 2,
            background: 'linear-gradient(90deg, #3b82f6 0%, #818cf8 100%)',
            animation:  `splash-fill ${duration}ms linear 0.5s both`,
          }} />
        </div>

        {/* Animated dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display:        'block',
              width:          5,
              height:         5,
              borderRadius:   '50%',
              background:     'rgba(148,163,184,0.35)',
              animation:      'splash-dot 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.22}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
