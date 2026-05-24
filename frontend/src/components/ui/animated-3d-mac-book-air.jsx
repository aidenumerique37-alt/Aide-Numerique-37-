"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ── tiny key rows helper ──────────────────────────────────────── */
const KeyRow = ({ count, wide = false, height = 7 }) => (
  <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          flex:          wide && i === 0 ? 1.6 : 1,
          height,
          background:    "linear-gradient(180deg, #d8d8d8 0%, #c4c4c4 100%)",
          borderRadius:  2,
          boxShadow:     "0 1px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      />
    ))}
  </div>
);

export const Macbook = () => {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  /* ── mouse tilt ─────────────────────────────────────────────── */
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current || !open) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width  - 0.5);
    y.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  /* auto-open */
  React.useEffect(() => {
    const t = setTimeout(() => setOpen(true), 450);
    return () => clearTimeout(t);
  }, []);

  /* ── dimensions ─────────────────────────────────────────────── */
  const W  = 340;   /* width shared by lid + base           */
  const LH = 210;   /* lid height  (screen)                 */
  const BH = 130;   /* base height (keyboard)               */

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {}}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1400px", display: "inline-block", position: "relative" }}
    >
      <motion.div
        style={{
          rotateX:        open ? rotateX : "0deg",
          rotateY:        open ? rotateY : "0deg",
          transformStyle: "preserve-3d",
          position:       "relative",
        }}
      >

        {/* ════════════════════════════════════════════════════════
            BASE — keyboard body
        ════════════════════════════════════════════════════════ */}
        <div
          style={{
            width:          W,
            height:         BH,
            background:     "linear-gradient(160deg, #dadada 0%, #b8b8b8 100%)",
            borderRadius:   "0 0 14px 14px",
            position:       "relative",
            boxShadow:      "0 8px 40px rgba(0,0,0,0.22)",
          }}
        >
          {/* inner surface */}
          <div
            style={{
              position:     "absolute",
              inset:        "6px 8px 8px 8px",
              background:   "linear-gradient(160deg, #e2e2e2 0%, #cacaca 100%)",
              borderRadius: "0 0 10px 10px",
            }}
          >
            {/* ── keyboard ── */}
            <div
              style={{
                position:     "absolute",
                top:          10,
                left:         14,
                right:        14,
              }}
            >
              {/* function-key row */}
              <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 4,
                    background: "linear-gradient(180deg,#d0d0d0 0%,#bcbcbc 100%)",
                    borderRadius: 1,
                    boxShadow: "0 1px 0 rgba(0,0,0,0.2)",
                  }} />
                ))}
              </div>
              <KeyRow count={13} />
              <KeyRow count={12} wide />
              <KeyRow count={11} />
              {/* spacebar row */}
              <div style={{ display: "flex", gap: 3, marginBottom: 3, alignItems: "center" }}>
                {[1,1,1].map((_, i) => (
                  <div key={i} style={{
                    flex:1, height:7,
                    background:"linear-gradient(180deg,#d8d8d8 0%,#c4c4c4 100%)",
                    borderRadius:2,
                    boxShadow:"0 1px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
                  }}/>
                ))}
                {/* spacebar */}
                <div style={{
                  flex:5, height:7,
                  background:"linear-gradient(180deg,#d8d8d8 0%,#c4c4c4 100%)",
                  borderRadius:2,
                  boxShadow:"0 1px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}/>
                {[1,1,1,1].map((_, i) => (
                  <div key={i} style={{
                    flex:1, height:7,
                    background:"linear-gradient(180deg,#d8d8d8 0%,#c4c4c4 100%)",
                    borderRadius:2,
                    boxShadow:"0 1px 0 rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
                  }}/>
                ))}
              </div>
            </div>

            {/* ── trackpad ── */}
            <div
              style={{
                position:     "absolute",
                bottom:       10,
                left:         "50%",
                transform:    "translateX(-50%)",
                width:        88,
                height:       56,
                background:   "linear-gradient(160deg, #d4d4d4 0%, #c0c0c0 100%)",
                borderRadius: 5,
                boxShadow:    "inset 0 1px 3px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.6)",
              }}
            />
          </div>

          {/* hinge notch */}
          <div style={{
            position:     "absolute",
            top:          0,
            left:         "50%",
            transform:    "translateX(-50%)",
            width:        70,
            height:       4,
            background:   "#b0b0b0",
            borderRadius: "0 0 4px 4px",
          }} />
        </div>

        {/* ════════════════════════════════════════════════════════
            LID — animated screen (opens upward)
        ════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ rotateX: 90 }}
          animate={{ rotateX: open ? -108 : 90 }}
          transition={{ duration: 1.6, ease: [0.34, 1.18, 0.64, 1] }}
          style={{
            width:           W,
            height:          LH,
            position:        "absolute",
            top:             0,
            left:            0,
            transformOrigin: "bottom center",
            transformStyle:  "preserve-3d",
          }}
        >
          {/* outer shell (back of lid) */}
          <div
            style={{
              width:              "100%",
              height:             "100%",
              background:         "linear-gradient(145deg, #e2e2e2 0%, #c2c2c2 100%)",
              borderRadius:       "12px 12px 0 0",
              backfaceVisibility: "hidden",
              boxShadow:          "0 -2px 16px rgba(0,0,0,0.12)",
              position:           "relative",
            }}
          >
            {/* Apple logo cutout hint */}
            <div style={{
              position:  "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: 28, height: 34,
              background: "rgba(0,0,0,0.06)",
              borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
              clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
            }} />
          </div>

          {/* inner face — the screen */}
          <div
            style={{
              width:              "100%",
              height:             "100%",
              position:           "absolute",
              top:                0,
              left:               0,
              background:         "linear-gradient(145deg, #d0d0d0 0%, #b8b8b8 100%)",
              borderRadius:       "12px 12px 0 0",
              transform:          "rotateX(180deg)",
              backfaceVisibility: "hidden",
            }}
          >
            {/* screen bezel */}
            <div
              style={{
                position:     "absolute",
                inset:        10,
                background:   "#111",
                borderRadius: 6,
                overflow:     "hidden",
                boxShadow:    "inset 0 0 10px rgba(0,0,0,0.9)",
              }}
            >
              {/* screen content */}
              <div
                style={{
                  width:          "100%",
                  height:         "100%",
                  background:     "linear-gradient(135deg, #090909 0%, #0f172a 100%)",
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            10,
                }}
              >
                <motion.img
                  src="/logo.png"
                  alt=""
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: open ? 0.95 : 0, scale: open ? 1 : 0.8 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  style={{ width: 44, height: 44, objectFit: "contain" }}
                />
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: open ? 1 : 0, y: open ? 0 : 6 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  style={{
                    color:         "#60a5fa",
                    fontSize:      13,
                    fontWeight:    700,
                    letterSpacing: "-0.2px",
                    fontFamily:    "'Montserrat','Segoe UI',sans-serif",
                  }}
                >
                  Aide Numérique 37
                </motion.span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: open ? 0.5 : 0 }}
                  transition={{ delay: 1.5, duration: 0.4 }}
                  style={{
                    color:      "#6b7280",
                    fontSize:   10,
                    fontFamily: "'Montserrat','Segoe UI',sans-serif",
                  }}
                >
                  Chargement…
                </motion.span>
              </div>

              {/* screen glare */}
              <div style={{
                position:      "absolute",
                inset:         0,
                background:    "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%)",
                pointerEvents: "none",
              }} />
            </div>

            {/* webcam */}
            <div style={{
              position:     "absolute",
              top:          4,
              left:         "50%",
              transform:    "translateX(-50%)",
              width:        5,
              height:       5,
              borderRadius: "50%",
              background:   "#1a1a1a",
              boxShadow:    "0 0 0 1px #333",
            }} />
          </div>
        </motion.div>

        {/* ── ground shadow ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: open ? 0.3 : 0, scaleX: open ? 1 : 0.4 }}
          transition={{ duration: 1.4, delay: 0.5 }}
          style={{
            position:        "absolute",
            bottom:          -52,
            left:            "50%",
            translateX:      "-50%",
            width:           280,
            height:          44,
            background:      "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)",
            filter:          "blur(18px)",
            transformOrigin: "center",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Macbook;
