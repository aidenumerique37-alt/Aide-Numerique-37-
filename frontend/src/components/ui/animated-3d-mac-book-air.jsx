"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ── keyboard key helper ────────────────────────────────────────── */
const Key = ({ flex = 1, h = 7 }) => (
  <div style={{
    flex, height: h,
    background:   "linear-gradient(180deg,#d6d6d6 0%,#c2c2c2 100%)",
    borderRadius: 2,
    boxShadow:    "0 1.5px 0 rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.45)",
  }} />
);

const KeyRow = ({ keys = 12, h = 7 }) => (
  <div style={{ display:"flex", gap:3, marginBottom:3 }}>
    {Array.from({ length: keys }).map((_, i) => <Key key={i} h={h} />)}
  </div>
);

/* ── dimensions ─────────────────────────────────────────────────── */
const W  = 340;
const LH = 218;   /* lid / screen height  */
const BH = 126;   /* base / keyboard height */

export const Macbook = () => {
  const ref  = useRef(null);
  const [open, setOpen] = useState(false);

  /* mouse tilt (only when open) */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness:200, damping:28 });
  const smy = useSpring(my, { stiffness:200, damping:28 });
  const tiltX = useTransform(smy, [-0.5, 0.5], ["5deg",  "-5deg"]);
  const tiltY = useTransform(smx, [-0.5, 0.5], ["-5deg", "5deg"]);

  const onMove  = (e) => {
    if (!ref.current || !open) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width  - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  React.useEffect(() => {
    const t = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: "1300px", display: "inline-block" }}
    >
      {/*
        Inner wrapper — apply mouse tilt here.
        paddingTop makes room for the lid, which is absolutely
        positioned ABOVE the base (top: -LH).
      */}
      <motion.div
        style={{
          rotateX:        open ? tiltX : "0deg",
          rotateY:        open ? tiltY : "0deg",
          transformStyle: "preserve-3d",
          position:       "relative",
          width:          W,
          paddingTop:     LH,   /* reserve space above base for lid */
        }}
      >

        {/* ══════════════════════════════════════════════
            LID — positioned above base, pivot = hinge
        ══════════════════════════════════════════════ */}
        <motion.div
          /*
            Starts at rotateX:90 → lid is horizontal,
            edge-on to viewer (closed / flat state).
            Opens to rotateX:-18 → lid stands up, screen
            visible, slightly leaned back.
            transformOrigin "bottom center" = pivot at the
            bottom of the lid div = top edge of base = hinge.
          */
          initial={{ rotateX: 90 }}
          animate={{ rotateX: open ? -18 : 90 }}
          transition={{ duration: 1.7, ease: [0.34, 1.12, 0.64, 1] }}
          style={{
            width:           W,
            height:          LH,
            position:        "absolute",
            top:             0,           /* sits at the top of paddingTop area */
            left:            0,
            transformOrigin: "bottom center",
            transformStyle:  "preserve-3d",
            borderRadius:    "14px 14px 0 0",
            background:      "linear-gradient(160deg,#e4e4e4 0%,#c8c8c8 100%)",
            boxShadow:       "0 -3px 18px rgba(0,0,0,0.13)",
          }}
        >
          {/* ── screen bezel ── */}
          <div style={{
            position:     "absolute",
            inset:        11,
            background:   "#0e0e0e",
            borderRadius: 7,
            overflow:     "hidden",
            boxShadow:    "inset 0 0 12px rgba(0,0,0,0.95)",
          }}>
            {/* screen content */}
            <div style={{
              width:          "100%",
              height:         "100%",
              background:     "linear-gradient(135deg,#080808 0%,#0f172a 100%)",
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              gap:            10,
            }}>
              <motion.img
                src="/logo.png"
                alt=""
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: open ? 0.95 : 0, scale: open ? 1 : 0.75 }}
                transition={{ delay: 1.1, duration: 0.55 }}
                style={{ width:48, height:48, objectFit:"contain" }}
              />
              <motion.span
                initial={{ opacity:0, y:7 }}
                animate={{ opacity: open ? 1 : 0, y: open ? 0 : 7 }}
                transition={{ delay:1.3, duration:0.45 }}
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
                initial={{ opacity:0 }}
                animate={{ opacity: open ? 0.45 : 0 }}
                transition={{ delay:1.65, duration:0.4 }}
                style={{
                  color:      "#9ca3af",
                  fontSize:   10,
                  fontFamily: "'Montserrat','Segoe UI',sans-serif",
                }}
              >
                Chargement…
              </motion.span>
            </div>
            {/* glare */}
            <div style={{
              position:      "absolute", inset:0, pointerEvents:"none",
              background:    "linear-gradient(135deg,rgba(255,255,255,0.07) 0%,transparent 52%)",
            }} />
          </div>

          {/* webcam dot */}
          <div style={{
            position:     "absolute",
            top:          5,
            left:         "50%",
            transform:    "translateX(-50%)",
            width:        5, height:5,
            borderRadius: "50%",
            background:   "#1c1c1c",
            boxShadow:    "0 0 0 1px #383838",
          }} />

          {/* lid-back Apple-logo hint */}
          <div style={{
            position:        "absolute",
            top:             "50%", left:"50%",
            transform:       "translate(-50%,-50%)",
            width:           26, height:30,
            background:      "rgba(0,0,0,0.055)",
            borderRadius:    "50% 50% 46% 46%",
          }} />
        </motion.div>

        {/* ══════════════════════════════════════════════
            BASE — keyboard body (renders in normal flow
            below paddingTop, so below the lid's pivot)
        ══════════════════════════════════════════════ */}
        <div style={{
          width:        W,
          height:       BH,
          background:   "linear-gradient(170deg,#dedede 0%,#bcbcbc 100%)",
          borderRadius: "0 0 14px 14px",
          position:     "relative",
          boxShadow:    "0 8px 40px rgba(0,0,0,0.2)",
        }}>
          {/* inner surface */}
          <div style={{
            position:   "absolute",
            inset:      "5px 7px 7px 7px",
            background: "linear-gradient(170deg,#e4e4e4 0%,#cccccc 100%)",
            borderRadius: "0 0 10px 10px",
          }}>
            {/* keyboard */}
            <div style={{ position:"absolute", top:8, left:12, right:12 }}>
              {/* fn row */}
              <div style={{ display:"flex", gap:3, marginBottom:5 }}>
                {Array.from({ length:14 }).map((_,i) => <Key key={i} h={4} />)}
              </div>
              <KeyRow keys={13} />
              <KeyRow keys={12} />
              <KeyRow keys={11} />
              {/* spacebar row */}
              <div style={{ display:"flex", gap:3 }}>
                <Key h={7} /><Key h={7} /><Key h={7} />
                <div style={{
                  flex:5, height:7,
                  background:"linear-gradient(180deg,#d6d6d6 0%,#c2c2c2 100%)",
                  borderRadius:2,
                  boxShadow:"0 1.5px 0 rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.45)",
                }} />
                <Key h={7} /><Key h={7} /><Key h={7} /><Key h={7} />
              </div>
            </div>

            {/* trackpad */}
            <div style={{
              position:     "absolute",
              bottom:       8,
              left:         "50%",
              transform:    "translateX(-50%)",
              width:        92, height:58,
              background:   "linear-gradient(160deg,#d8d8d8 0%,#c4c4c4 100%)",
              borderRadius: 6,
              boxShadow:    "inset 0 1px 3px rgba(0,0,0,0.14), 0 1px 0 rgba(255,255,255,0.55)",
            }} />
          </div>

          {/* hinge indent */}
          <div style={{
            position:"absolute", top:0, left:"50%",
            transform:"translateX(-50%)",
            width:68, height:4,
            background:"#b2b2b2",
            borderRadius:"0 0 4px 4px",
          }} />
        </div>

        {/* ── ground shadow ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity:0, scaleX:0.4 }}
          animate={{ opacity: open ? 0.28 : 0, scaleX: open ? 1 : 0.4 }}
          transition={{ duration:1.4, delay:0.6 }}
          style={{
            position:        "absolute",
            bottom:          -48,
            left:            "50%",
            translateX:      "-50%",
            width:           290, height:44,
            background:      "radial-gradient(ellipse,rgba(0,0,0,0.5) 0%,transparent 70%)",
            filter:          "blur(18px)",
            transformOrigin: "center",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Macbook;
