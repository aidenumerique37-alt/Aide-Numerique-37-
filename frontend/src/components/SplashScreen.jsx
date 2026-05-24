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
      {/* ── Logo + brand name ───────────────────────────────── */}
      <div style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:           10,
        position:      'relative',
        zIndex:        2,
        animation:     'splash-brand-in 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both',
        marginBottom:  20,
      }}>
        <img
          src="/logo.png"
          alt="Aide Numérique 37"
          style={{
            height:  52,
            width:   'auto',
            display: 'block',
            filter:  'drop-shadow(0 0 14px rgba(96,165,250,0.4))',
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
            fontSize:      11,
            color:         '#475569',
            marginTop:     3,
            fontFamily:    "'Montserrat','Segoe UI',sans-serif",
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Assistance informatique à domicile
          </div>
        </div>
      </div>

      {/* ── MacBook animation video ──────────────────────────── */}
      <div style={{
        position: 'relative',
        zIndex:   1,
        width:    '100%',
        maxWidth: 520,
        /* video is 1344×810 but MacBook occupies the center ~40%,
           we crop vertically by capping height to avoid excess black */
        overflow: 'hidden',
        height:   200,
        display:  'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <video
          ref={videoRef}
          src="/macbook-anim.mov"
          autoPlay
          muted
          playsInline
          style={{
            width:     '100%',
            maxWidth:  520,
            /* shift up slightly to center the MacBook in the crop window */
            marginTop: -60,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Loading dots ─────────────────────────────────────── */}
      <div style={{
        display:   'flex',
        gap:       8,
        marginTop: 16,
        position:  'relative',
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
