"use client";

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import "./Welcome.css";

/* ════════════════════════════════════════════════════════════════
   SHARX WELCOME — light crayon theme
   Act 1  → Fireworks (on warm paper)
   Act 2  → Crayon doodles + welcome card draw themselves in
   Act 3  → Enter SHARX → confetti burst → /home
════════════════════════════════════════════════════════════════ */

const INTRO_MS = 2600;

const COLORS = [
  "#FF4D8D",
  "#FFB000",
  "#00B8D9",
  "#8B5CF6",
  "#10B981",
  "#FF6B35",
  "#0EA5E9",
];

const CONFETTI_COLORS = ["#FFD966", "#FF8B7B", "#7BE5B5", "#C7B4FF", "#FFB4D4", "#7BB8F0"];

const DOODLES = [
  {
    id: "cloud",
    style: { top: "12%", left: "6%", width: 96, height: 58 },
    color: "#7BB8F0",
    delay: "0s",
    duration: "7s",
    path: "M20,40 Q5,40 10,25 Q15,10 30,15 Q40,0 60,10 Q80,5 85,25 Q100,30 90,40 Z",
  },
  {
    id: "star1",
    style: { top: "16%", right: "9%", width: 48, height: 48 },
    color: "#FFD966",
    delay: "1.2s",
    duration: "8s",
    path: "M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z",
  },
  {
    id: "star2",
    style: { top: "46%", left: "10%", width: 28, height: 28 },
    color: "#FF8B7B",
    delay: "2.4s",
    duration: "6.5s",
    path: "M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z",
  },
  {
    id: "smiley",
    style: { bottom: "20%", left: "8%", width: 66, height: 44 },
    color: "#7BE5B5",
    delay: "0.6s",
    duration: "9s",
    path: "M5,20 Q5,35 30,35 Q55,35 55,20",
    extra: (
      <>
        <path d="M15,10 L15,15" />
        <path d="M45,10 L45,15" />
      </>
    ),
  },
  {
    id: "heart",
    style: { bottom: "18%", right: "11%", width: 44, height: 44 },
    color: "#FFB4D4",
    delay: "1.8s",
    duration: "7.5s",
    path: "M25,45 Q5,25 5,15 Q5,5 15,5 Q25,5 25,15 Q25,5 35,5 Q45,5 45,15 Q45,25 25,45 Z",
  },
  {
    id: "squiggle",
    style: { top: "54%", right: "13%", width: 58, height: 26 },
    color: "#C7B4FF",
    delay: "3s",
    duration: "6s",
    path: "M0,10 Q12.5,0 25,10 T50,10",
  },
  {
    id: "spiral",
    style: { top: "72%", left: "24%", width: 40, height: 40 },
    color: "#FFD966",
    delay: "2s",
    duration: "8.5s",
    path: "M50,50 m0,-6 a6,6 0 1,1 -6,6 a14,14 0 1,1 14,-14 a24,24 0 1,1 -24,24",
  },
];

const SPARKLES = [
  { top: "-14px", left: "6%", size: 18, delay: "0s", color: "#FFD966" },
  { top: "8px", right: "-6px", size: 14, delay: "0.7s", color: "#FF8B7B" },
  { bottom: "-4px", left: "-10px", size: 12, delay: "1.4s", color: "#7BE5B5" },
  { bottom: "14px", right: "8%", size: 16, delay: "0.3s", color: "#C7B4FF" },
];

/* ════════════════════════════════════════════════════════
   FIREWORKS CANVAS — tuned for a light paper background
════════════════════════════════════════════════════════ */
const FireworksCanvas = memo(function FireworksCanvas({ finale }) {
  const canvasRef = useRef(null);
  const finaleRef = useRef(finale);

  useEffect(() => {
    finaleRef.current = finale;
  }, [finale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();
    let nextLaunch = 0;
    const timers = [];
    const rockets = [];
    const sparks = [];

    const rand = (a, b) => Math.random() * (b - a) + a;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const burst = (x, y, color = pick(COLORS), scale = 1) => {
      const shape = pick(["round", "round", "ring", "heart"]);
      const count = Math.floor(rand(70, 110) * scale);

      for (let i = 0; i < count; i += 1) {
        const t = (Math.PI * 2 * i) / count;
        let vx;
        let vy;
        let speed = rand(2.1, 5.2) * scale;

        if (shape === "ring") {
          speed = 4.2 * scale;
          vx = Math.cos(t) * speed;
          vy = Math.sin(t) * speed;
        } else if (shape === "heart") {
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy =
            -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          vx = hx * 0.24 * scale;
          vy = hy * 0.24 * scale;
        } else {
          vx = Math.cos(t + rand(-0.05, 0.05)) * speed;
          vy = Math.sin(t + rand(-0.05, 0.05)) * speed;
        }

        sparks.push({
          x, y, px: x, py: y,
          vx, vy,
          g: rand(0.022, 0.05),
          drag: rand(0.972, 0.985),
          life: 1,
          decay: rand(0.007, 0.014),
          size: rand(1.1, 2.4),
          color: shape === "heart" ? "#FF4D8D" : color,
          twinkle: Math.random() > 0.7,
        });
      }

      for (let i = 0; i < 14; i += 1) {
        sparks.push({
          x, y, px: x, py: y,
          vx: rand(-1.8, 1.8),
          vy: rand(-1.8, 1.8),
          g: 0.01,
          drag: 0.96,
          life: 1,
          decay: rand(0.018, 0.03),
          size: rand(1.6, 3.2),
          color: "#FFFFFF",
          twinkle: true,
        });
      }
    };

    const launch = (sx = rand(w * 0.12, w * 0.88)) => {
      rockets.push({
        x: sx, y: h + 18, px: sx, py: h + 18,
        targetY: rand(h * 0.12, h * 0.5),
        vx: rand(-0.35, 0.35),
        vy: rand(-11.8, -14.8),
        color: pick(COLORS),
      });
    };

    const glow = (x, y, s, color, a) => {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowBlur = s * 5;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const tick = (now) => {
      const dt = Math.min(2, Math.max(0.5, (now - last) / 16.67));
      last = now;

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = finaleRef.current ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      if (!reduced && now >= nextLaunch) {
        launch();
        if (Math.random() > 0.55) timers.push(window.setTimeout(() => launch(), rand(90, 230)));
        nextLaunch = now + (finaleRef.current ? rand(900, 1450) : rand(260, 560));
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        r.px = r.x; r.py = r.y;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy += 0.16 * dt;

        ctx.beginPath();
        ctx.moveTo(r.px, r.py);
        ctx.lineTo(r.x, r.y);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
        glow(r.x, r.y, 1.9, r.color, 0.95);

        if (r.y <= r.targetY || r.vy >= -1.5) {
          burst(r.x, r.y, r.color, 1);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i];
        s.px = s.x; s.py = s.y;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= Math.pow(s.drag, dt);
        s.vy = s.vy * Math.pow(s.drag, dt) + s.g * dt;
        s.life -= s.decay * dt;

        if (s.life <= 0) { sparks.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.globalAlpha = s.life * (s.twinkle ? 0.7 + Math.random() * 0.3 : 0.9);
        ctx.stroke();
        glow(s.x, s.y, s.size, s.color, s.life * 0.4);
      }

      ctx.restore();
      raf = window.requestAnimationFrame(tick);
    };

    resize();
    let ro;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    if (!reduced) {
      launch(w * 0.3);
      timers.push(window.setTimeout(() => launch(w * 0.7), 240));
      timers.push(window.setTimeout(() => launch(w * 0.5), 520));
      raf = window.requestAnimationFrame(tick);
    }

    const onPointer = (e) => {
      if (reduced) return;
      const r = canvas.getBoundingClientRect();
      burst(e.clientX - r.left, e.clientY - r.top, pick(COLORS), 0.8);
    };
    canvas.addEventListener("pointerdown", onPointer);

    return () => {
      window.cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-fireworks" aria-hidden="true" />;
});

/* ════════════════════════════════════════════════════════
   CONFETTI
════════════════════════════════════════════════════════ */
const ConfettiBurst = memo(function ConfettiBurst({ active }) {
  if (!active) return null;
  return (
    <div className="w-confetti" aria-hidden="true">
      {Array.from({ length: 34 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 34 + (i % 3) * 0.12;
        const dist = 140 + ((i * 37) % 170);
        return (
          <span
            key={i}
            className="w-confetti-bit"
            style={{
              "--dx": `${Math.cos(angle) * dist}px`,
              "--dy": `${Math.sin(angle) * dist - 60}px`,
              "--rot": `${(i * 47) % 360}deg`,
              "--c": CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              "--d": `${(i % 6) * 0.02}s`,
              borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
            }}
          />
        );
      })}
    </div>
  );
});

/* ════════════════════════════════════════════════════════
   WELCOME SCREEN
════════════════════════════════════════════════════════ */
function WelcomeScreen({ onEnter }) {
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [entering, setEntering] = useState(false);
  const enterTimer = useRef(null);

  useEffect(() => {
    const a = setTimeout(() => setMounted(true), 40);
    const b = setTimeout(() => setRevealed(true), INTRO_MS);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(enterTimer.current);
    };
  }, []);

  const handleEnter = useCallback(() => {
    if (entering) return;
    setEntering(true);
    enterTimer.current = setTimeout(() => onEnter(), 650);
  }, [entering, onEnter]);

  useEffect(() => {
    if (!revealed) return undefined;
    const onKey = (e) => {
      if (e.key === "Enter") handleEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, handleEnter]);

  const cls = [
    "sharx-welcome",
    mounted ? "is-in" : "",
    revealed ? "is-revealed" : "is-fireworks",
    entering ? "is-entering" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={cls}>
      <FireworksCanvas finale={revealed} />
      <div className="w-vignette" aria-hidden="true" />

      <div className="w-orb w-orb-1" aria-hidden="true" />
      <div className="w-orb w-orb-2" aria-hidden="true" />
      <div className="w-orb w-orb-3" aria-hidden="true" />
      <div className="w-orb w-orb-4" aria-hidden="true" />

      <div className="w-dot w-dot-1" aria-hidden="true" />
      <div className="w-dot w-dot-2" aria-hidden="true" />
      <div className="w-dot w-dot-3" aria-hidden="true" />
      <div className="w-dot w-dot-4" aria-hidden="true" />
      <div className="w-dot w-dot-5" aria-hidden="true" />
      <div className="w-dot w-dot-6" aria-hidden="true" />

      {DOODLES.map((d) => (
        <div key={d.id} className="w-doodle" style={d.style} aria-hidden="true">
          <div
            className="w-doodle-inner"
            style={{ "--dur": d.duration, "--dly": d.delay }}
          >
            <svg viewBox="0 0 100 100" style={{ stroke: d.color }}>
              <path d={d.path} pathLength="1" />
              {d.extra}
            </svg>
          </div>
        </div>
      ))}

      <div className="w-stack">
        <div className="w-logo">
          <img
            src="/sharx-logo.webp"
            alt="SHARX"
            width={132}
            height={132}
            draggable={false}
          />
        </div>

        <span className="w-eyebrow">
          <Sparkles size={13} strokeWidth={2.8} />
          The party just got sharper
        </span>

        <h1 className="w-title">
          <span className="w-title-line">Welcome to the</span>
          <span className="w-title-line w-title-big">
            <span className="w-hl">
              New SHARX
              {SPARKLES.map((s, i) => (
                <svg
                  key={i}
                  className="w-sparkle"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{
                    top: s.top,
                    left: s.left,
                    right: s.right,
                    bottom: s.bottom,
                    width: s.size,
                    height: s.size,
                    animationDelay: s.delay,
                    fill: s.color,
                  }}
                >
                  <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
                </svg>
              ))}
            </span>
          </span>
        </h1>

        <p className="w-sub">
          Same love. Sharper play.
          <br />
          <span className="w-sub-em">Now in crayon.</span>
        </p>

        <div className="w-cta-wrap">
          <button
            type="button"
            className="w-cta"
            onClick={handleEnter}
            disabled={entering}
            aria-label="Enter SHARX"
          >
            <span>{entering ? "Opening the magic..." : "Enter SHARX"}</span>
            <span className="w-cta-icon" aria-hidden="true">
              <ArrowRight size={16} strokeWidth={2.8} />
            </span>
          </button>
          <ConfettiBurst active={entering} />
        </div>

        <span className="w-hint">press Enter ↵</span>
        <span className="w-brandmark">SHARX</span>
      </div>

      <div className="w-curtain" aria-hidden="true" />
    </main>
  );
}

export default memo(WelcomeScreen);