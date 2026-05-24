"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export const Macbook = ({ src }) => {
  const ref = useRef(null);
  const [open, setOpen]         = useState(false);
  const [hovered, setHovered]   = useState(false);

  /* ── mouse-tracking for lid tilt ─────────────────────────── */
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current || !open) return;
    const rect = ref.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const xPct = (e.clientX - rect.left) / w - 0.5;
    const yPct = (e.clientY - rect.top)  / h - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  /* ── open on click / hover ────────────────────────────────── */
  React.useEffect(() => {
    const t = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1200px",
        display: "inline-block",
        position: "relative",
      }}
    >
      <motion.div
        style={{
          rotateX: open ? rotateX : "0deg",
          rotateY: open ? rotateY : "0deg",
          transformStyle: "preserve-3d",
          position: "relative",
        }}
      >
        {/* ── Base ───────────────────────────────────────────── */}
        <div
          style={{
            width:        340,
            height:       220,
            background:   "linear-gradient(145deg, #d2d2d2 0%, #b8b8b8 100%)",
            borderRadius: "12px 12px 0 0",
            position:     "relative",
            boxShadow:    "0 4px 40px rgba(0,0,0,0.18)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Screen frame */}
          <div
            style={{
              position:   "absolute",
              inset:      12,
              background: "#1a1a1a",
              borderRadius: 6,
              overflow:   "hidden",
              boxShadow:  "inset 0 0 8px rgba(0,0,0,0.8)",
            }}
          >
            {/* Screen content — logo + brand */}
            <div
              style={{
                width:          "100%",
                height:         "100%",
                background:     "linear-gradient(135deg, #0a0a0a 0%, #111827 100%)",
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                gap:            10,
              }}
            >
              <img
                src="/logo.png"
                alt=""
                style={{ width: 40, height: 40, objectFit: "contain", opacity: 0.9 }}
              />
              <span
                style={{
                  color:       "#60a5fa",
                  fontSize:    13,
                  fontWeight:  700,
                  letterSpacing: "-0.2px",
                  fontFamily:  "'Montserrat','Segoe UI',sans-serif",
                }}
              >
                Aide Numérique 37
              </span>
              <span style={{ color: "#6b7280", fontSize: 10, fontFamily: "'Montserrat','Segoe UI',sans-serif" }}>
                Chargement…
              </span>
            </div>
            {/* Screen glare */}
            <div
              style={{
                position:   "absolute",
                inset:      0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />
          </div>
          {/* Webcam */}
          <div
            style={{
              position:     "absolute",
              top:          4,
              left:         "50%",
              transform:    "translateX(-50%)",
              width:        6,
              height:       6,
              borderRadius: "50%",
              background:   "#222",
              boxShadow:    "0 0 0 1px #444",
            }}
          />
          {/* Apple logo */}
          <div
            style={{
              position:   "absolute",
              bottom:     -18,
              left:       "50%",
              transform:  "translateX(-50%)",
              fontSize:   14,
              color:      "#888",
              lineHeight: 1,
            }}
          >
          </div>
        </div>

        {/* ── Keyboard deck ──────────────────────────────────── */}
        <div
          style={{
            width:        340,
            height:       16,
            background:   "linear-gradient(180deg, #c8c8c8 0%, #b0b0b0 100%)",
            borderRadius: "0 0 10px 10px",
            boxShadow:    "0 6px 20px rgba(0,0,0,0.22)",
            position:     "relative",
          }}
        >
          {/* Notch for lid indent */}
          <div
            style={{
              position:     "absolute",
              top:          0,
              left:         "50%",
              transform:    "translateX(-50%)",
              width:        60,
              height:       4,
              background:   "#a8a8a8",
              borderRadius: "0 0 4px 4px",
            }}
          />
          {/* Feet */}
          {[20, 300].map((l) => (
            <div
              key={l}
              style={{
                position:     "absolute",
                bottom:       2,
                left:         l,
                width:        20,
                height:       4,
                background:   "#999",
                borderRadius: 2,
              }}
            />
          ))}
        </div>

        {/* ── Lid ────────────────────────────────────────────── */}
        <motion.div
          initial={{ rotateX: 90 }}
          animate={{ rotateX: open ? -105 : 90 }}
          transition={{ duration: 1.4, ease: [0.34, 1.26, 0.64, 1] }}
          style={{
            width:           340,
            height:          220,
            position:        "absolute",
            top:             0,
            left:            0,
            transformOrigin: "bottom center",
            transformStyle:  "preserve-3d",
          }}
        >
          {/* Outer lid shell */}
          <div
            style={{
              width:        "100%",
              height:       "100%",
              background:   "linear-gradient(145deg, #e0e0e0 0%, #c0c0c0 100%)",
              borderRadius: "12px 12px 0 0",
              backfaceVisibility: "hidden",
              boxShadow:    "0 -2px 12px rgba(0,0,0,0.1)",
            }}
          >
            {/* Apple logo on lid back */}
            <div
              style={{
                position:   "absolute",
                top:        "50%",
                left:       "50%",
                transform:  "translate(-50%,-50%)",
                fontSize:   28,
                color:      "rgba(0,0,0,0.12)",
              }}
            >

            </div>
          </div>

          {/* Inner lid face (the screen side) */}
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
            <div
              style={{
                position:     "absolute",
                inset:        12,
                background:   "#1a1a1a",
                borderRadius: 6,
                overflow:     "hidden",
              }}
            >
              <div
                style={{
                  width:          "100%",
                  height:         "100%",
                  background:     "linear-gradient(135deg, #0a0a0a 0%, #111827 100%)",
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            10,
                }}
              >
                <img
                  src="/logo.png"
                  alt=""
                  style={{ width: 40, height: 40, objectFit: "contain", opacity: 0.9 }}
                />
                <span
                  style={{
                    color:       "#60a5fa",
                    fontSize:    13,
                    fontWeight:  700,
                    letterSpacing: "-0.2px",
                    fontFamily:  "'Montserrat','Segoe UI',sans-serif",
                  }}
                >
                  Aide Numérique 37
                </span>
              </div>
            </div>
            {/* Webcam */}
            <div
              style={{
                position:     "absolute",
                top:          4,
                left:         "50%",
                transform:    "translateX(-50%)",
                width:        6,
                height:       6,
                borderRadius: "50%",
                background:   "#222",
              }}
            />
          </div>
        </motion.div>

        {/* ── Shadow on ground ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: open ? 0.35 : 0, scaleX: open ? 1 : 0.5 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          style={{
            position:         "absolute",
            bottom:           -50,
            left:             "50%",
            translateX:       "-50%",
            width:            260,
            height:           40,
            background:       "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
            filter:           "blur(16px)",
            transformOrigin:  "center",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Macbook;
