import React, { useState, useEffect, useRef } from 'react';

/**
 * Full-screen dark splash — MacBook animation video + logo overlay.
 * Fades out after `duration` ms, then calls onComplete.
 */
const SplashScreen = ({ duration = 5500, onComplete }) => {
  const [fading, setFading] = useState(false);
  const [gone,   setGone]   = useState(false);
  const videoRef = useRef(null);

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
        position:      'fixed',
        inset:         0,
        zIndex:        9999,
        background:    '#050505',
        userSelect:    'none',
        transition:    'opacity 0.6s ease',
        opacity:       fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'all',
        overflow:      'hidden',
      }}
    >
      {/* ── Video plein écran ────────────────────────────────── */}
      <video
        ref={videoRef}
        src="/macbook-anim.mov"
        autoPlay
        muted
        playsInline
        style={{
          position:      'absolute',
          inset:         0,
          width:         '100%',
          height:        '100%',
          objectFit:     'contain',
          pointerEvents: 'none',
        }}
      />

      {/* ── Logo + brand name (overlay haut) ────────────────── */}
      <div style={{
        position:      'absolute',
        top:           '7%',
        left:          '50%',
        transform:     'translateX(-50%)',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           10,
        zIndex:        2,
        animation:     'splash-brand-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both',
        whiteSpace:    'nowrap',
      }}>
        <img
          src="/logo.png"
          alt="Aide Numérique 37"
          style={{
            height:  60,
            width:   'auto',
            display: 'block',
            filter:  'drop-shadow(0 0 18px rgba(96,165,250,0.5))',
          }}
          draggable={false}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize:      24,
            fontWeight:    700,
            color:         '#e2e8f0',
            fontFamily:    "'Montserrat','Segoe UI',sans-serif",
            letterSpacing: '-0.3px',
          }}>
            Aide Numérique 37
          </div>
          <div style={{
            fontSize:      11,
            color:         '#475569',
            marginTop:     4,
            fontFamily:    "'Montserrat','Segoe UI',sans-serif",
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Assistance informatique à domicile
          </div>
        </div>
      </div>

      {/* ── Loading dots (overlay bas) ───────────────────────── */}
      <div style={{
        position:  'absolute',
        bottom:    '7%',
        left:      '50%',
        transform: 'translateX(-50%)',
        display:   'flex',
        gap:       8,
        zIndex:    2,
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            display:        'block',
            width:          6,
            height:         6,
            borderRadius:   '50%',
            background:     'rgba(148,163,184,0.4)',
            animation:      'splash-dot 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.22}s`,
          }} />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
