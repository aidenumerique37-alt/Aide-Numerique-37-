import React, { useState, useEffect } from 'react';
import { Macbook } from './Macbook';

/**
 * Full-screen splash / loading screen shown on first visit.
 * - MacBook 3D animation (lid opens, rocks gently)
 * - Logo + brand name
 * - Auto-dismisses after `duration` ms with a smooth fade-out
 *
 * Props:
 *   duration   {number}  ms before starting the fade (default 2600)
 *   onComplete {func}    called when fully hidden
 */
const SplashScreen = ({ duration = 2600, onComplete }) => {
  const [phase, setPhase] = useState('visible'); // 'visible' | 'fading' | 'gone'

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase('fading'), duration);
    const goneTimer = setTimeout(() => {
      setPhase('gone');
      onComplete?.();
    }, duration + 520);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, [duration, onComplete]);

  if (phase === 'gone') return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center
                  bg-white select-none
                  transition-opacity duration-500
                  ${phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Subtle radial background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(0,85,164,0.06),transparent)]" />

      {/* ── Brand block ── */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 mb-20 splash-brand-in"
        style={{ animationFillMode: 'both' }}
      >
        {/* Double-bezel logo container */}
        <div className="p-2 rounded-[1.4rem] bg-gradient-to-br from-[#f0f6ff] to-[#e8f0fb]
                        ring-1 ring-[#0055A4]/10 shadow-[0_4px_24px_rgba(0,85,164,0.08)]">
          <div className="w-16 h-16 rounded-[1rem] bg-white
                          shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]
                          flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Aide Numérique 37"
              className="w-12 h-12 object-contain"
              draggable={false}
            />
          </div>
        </div>

        {/* Company name */}
        <div className="text-center">
          <h1
            className="text-2xl font-bold tracking-tight text-[#0055A4]"
            style={{ fontFamily: "'Montserrat', 'Segoe UI', sans-serif" }}
          >
            Aide Numérique&nbsp;37
          </h1>
          <p
            className="text-[13px] text-gray-400 mt-1 tracking-wide"
            style={{ fontFamily: "'Montserrat', 'Segoe UI', sans-serif" }}
          >
            Assistance informatique à domicile
          </p>
        </div>
      </div>

      {/* ── MacBook animation ── */}
      {/* The Macbook uses absolute positioning relative to its own container.
          We give it a relative wrapper with enough room and scale it up 2.2× */}
      <div
        className="relative"
        style={{
          width: 330,        /* 150 × 2.2 */
          height: 280,       /* accommodates lid + shadow at 2.2× */
          transform: 'scale(2.2)',
          transformOrigin: 'center center',
        }}
      >
        <Macbook />
      </div>

      {/* ── Loading indicator ── */}
      <div className="relative z-10 flex items-center gap-2 mt-28">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="block w-[6px] h-[6px] rounded-full bg-[#0055A4]/50"
            style={{
              animation: 'splash-dot-bounce 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
