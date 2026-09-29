"use client";

import React, { memo } from "react";

/* ═══════════════════════════════════════════
   ICONS
═══════════════════════════════════════════ */
const GiftIcon = memo(function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 12v9H4v-9" />
      <rect x="2.5" y="8.5" width="19" height="3.5" rx="0.8" />
      <path d="M12 8.5V21" />
      <path d="M12 8.5H7.8A2.3 2.3 0 0 1 5.5 6.2 2.2 2.2 0 0 1 7.7 4C10 4 12 6 12 8.5Z" />
      <path d="M12 8.5h4.2a2.3 2.3 0 0 0 2.3-2.3A2.2 2.2 0 0 0 16.3 4C14 4 12 6 12 8.5Z" />
    </svg>
  );
});

const SparkIcon = memo(function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5 13.9 9l6.6 1.7-6.6 1.7L12 19l-1.9-6.6L3.5 10.7l6.6-1.7L12 2.5Z" />
    </svg>
  );
});

const StarIcon = memo(function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2 14.9 8.4l7 .9-5 4.9 1.2 7-6.1-3.4L5.9 21.2l1.2-7-5-4.9 7-.9L12 2Z" />
    </svg>
  );
});

const BoltIcon = memo(function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 2 4 14h6l-1.5 8L20 10h-6l-.5-8Z" />
    </svg>
  );
});

const CoinIcon = memo(function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M15 9.5c-.6-1-1.6-1.5-3-1.5-1.7 0-2.8.9-2.8 2.2 0 1.6 1.4 2.1 3 2.5 1.9.5 3.1 1 3.1 2.5 0 1.4-1.3 2.3-3.1 2.3-1.6 0-2.7-.6-3.3-1.7" />
    </svg>
  );
});

const ClockIcon = memo(function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
});

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const STYLES = `
.shrx-ev {
  --ink: #1B2A41;
  --paper: #FFFFFF;
  --cream: #FFFDF7;
  --yellow: #FFD966;
  --yellow-deep: #F4BE33;
  --yellow-soft: #FFF6D9;
  --coral: #FF8B7B;
  --coral-deep: #F0684F;
  --coral-soft: #FFE9E4;
  --mint: #7BE5B5;
  --mint-deep: #3FCB92;
  --mint-soft: #E2F8EF;
  --blue: #2E7FE8;
  --lilac: #C7B4FF;
  --lilac-deep: #9B7EF0;
  --lilac-soft: #F0E9FF;
  --pink: #FFB4D4;
  --pink-soft: #FFECF4;
  font-family: var(--font-comfortaa), 'Comfortaa', system-ui, sans-serif;
  color: var(--ink);
}
.shrx-ev *, .shrx-ev *::before, .shrx-ev *::after {
  box-sizing: border-box;
}

/* ═══ KEYFRAMES ═══ */
@keyframes shrxEvIn {
  from { opacity: 0; transform: translate3d(0, -22px, 0) scale(0.97); }
  to   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes shrxFloaty {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--r, 0deg)); }
  50%      { transform: translate3d(0, -10px, 0) rotate(calc(var(--r, 0deg) + 8deg)); }
}
@keyframes shrxSpin {
  0%, 100% { transform: scale(1) rotate(0); }
  50%      { transform: scale(1.18) rotate(180deg); }
}
@keyframes shrxPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.45); opacity: 0.5; }
}
@keyframes shrxShimmer {
  0%   { transform: translateX(-150%) skewX(-20deg); }
  100% { transform: translateX(250%) skewX(-20deg); }
}
@keyframes shrxGiftBob {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50%      { transform: translateY(-6px) rotate(4deg); }
}
@keyframes shrxGlowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 0.9; transform: scale(1.06); }
}

/* ═══ WRAPPER ═══ */
.shrx-ev {
  position: relative;
  width: 100%;
  margin: 0 0 24px;
  border-radius: 24px;
  isolation: isolate;
  animation: shrxEvIn 0.6s cubic-bezier(0.34, 1.4, 0.4, 1) both;
}

/* ═══ MAIN CARD ═══ */
.shrx-ev-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 22px;
  padding: 28px 30px 26px;
  background:
    radial-gradient(circle at 88% 18%, rgba(255, 180, 212, 0.42), transparent 40%),
    radial-gradient(circle at 4% 100%, rgba(123, 229, 181, 0.38), transparent 46%),
    radial-gradient(circle at 42% 0%, rgba(199, 180, 255, 0.36), transparent 44%),
    linear-gradient(135deg, #FFFDF7 0%, #FFFFFF 55%, #FFF9E8 100%);
  border: 2.5px solid var(--ink);
  border-radius: 24px;
  box-shadow:
    5px 5px 0 var(--ink),
    0 22px 44px -14px rgba(27, 42, 65, 0.22);
  overflow: hidden;
  isolation: isolate;
  align-items: center;
}

.shrx-ev-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(27, 42, 65, 0.055) 1px, transparent 1.3px);
  background-size: 16px 16px;
  opacity: 0.7;
  pointer-events: none;
  z-index: 0;
}

.shrx-ev-card::after {
  content: '';
  position: absolute;
  top: -80px;
  right: -60px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 217, 102, 0.55), transparent 62%);
  pointer-events: none;
  z-index: 0;
}

/* ═══ BODY ═══ */
.shrx-ev-body {
  position: relative;
  z-index: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.shrx-ev-ribbon {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px 5px 6px;
  background: var(--ink);
  color: #fff;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  box-shadow: 3px 3px 0 var(--yellow);
  align-self: flex-start;
  max-width: 100%;
}
.shrx-ev-ribbon-ic {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  background: var(--yellow);
  color: var(--ink);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1.5px var(--ink);
}
.shrx-ev-ribbon-ic svg { width: 11px; height: 11px; }
.shrx-ev-ribbon-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 0 1.5px rgba(255,255,255,0.35);
  animation: shrxPulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
.shrx-ev-ribbon-text { display: inline-block; line-height: 1; padding-top: 1px; }

.shrx-ev-title {
  margin: 16px 0 8px;
  font-family: var(--font-comfortaa), sans-serif;
  font-size: clamp(22px, 2.6vw, 32px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.8px;
  color: var(--ink);
}
.shrx-ev-line2 { display: block; margin-top: 4px; }
.shrx-ev-hl {
  position: relative;
  display: inline-block;
  padding: 0 7px;
  z-index: 0;
}
.shrx-ev-hl::before {
  content: '';
  position: absolute;
  z-index: -1;
  left: -2px; right: -2px;
  bottom: 3px;
  height: 12px;
  background: var(--yellow);
  border-radius: 6px;
  transform: rotate(-1.2deg);
}
.shrx-ev-hl-coral {
  position: relative;
  display: inline-block;
  padding: 2px 9px;
  color: #fff;
  z-index: 0;
}
.shrx-ev-hl-coral::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 4px -2px 2px -2px;
  background: var(--coral);
  border-radius: 8px;
  transform: rotate(1deg);
}

.shrx-ev-sub {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.6;
  font-weight: 600;
  color: #5A6B82;
  max-width: 520px;
}
.shrx-ev-sub b { color: var(--ink); font-weight: 800; }

.shrx-ev-feats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.shrx-ev-feat {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px 6px 6px;
  background: var(--paper);
  border: 2px solid var(--ink);
  border-radius: 999px;
  box-shadow: 2px 2px 0 var(--ink);
  font-size: 11px;
  font-weight: 800;
  color: var(--ink);
}
.shrx-ev-feat:nth-child(1) { transform: rotate(-1.5deg); }
.shrx-ev-feat:nth-child(2) { transform: rotate(1.5deg); }
.shrx-ev-feat-ic {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid var(--ink);
  flex-shrink: 0;
}
.shrx-ev-feat-ic svg { width: 11px; height: 11px; }
.shrx-ev-feat-ic.y { background: var(--yellow); }
.shrx-ev-feat-ic.m { background: var(--mint); }

.shrx-ev-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.shrx-ev-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px 12px 14px;
  background: var(--ink);
  color: #fff;
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  box-shadow: 4px 4px 0 var(--yellow);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 900;
  letter-spacing: 0.03em;
  cursor: not-allowed;
  overflow: hidden;
  isolation: isolate;
  opacity: 0.96;
  pointer-events: none;
  user-select: none;
}
.shrx-ev-cta-ic {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  background: var(--yellow);
  color: var(--ink);
  border-radius: 50%;
  flex-shrink: 0;
}
.shrx-ev-cta-ic svg { width: 13px; height: 13px; }
.shrx-ev-cta-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.shrx-ev-cta-text b {
  font-size: 13.5px;
  font-weight: 900;
  letter-spacing: 0.04em;
}
.shrx-ev-cta::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 70px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.30), transparent);
  animation: shrxShimmer 3s ease-in-out infinite;
  z-index: -1;
}

/* ═══════════════════════════════════════════
   RIGHT VISUAL — CLEAN CUTE CRAYON GIFT
═══════════════════════════════════════════ */
.shrx-ev-visual {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px 0;
}

/* soft pastel glow behind */
.shrx-ev-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  margin: -100px 0 0 -100px;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(255, 217, 102, 0.55) 0%,
    rgba(255, 180, 212, 0.30) 40%,
    transparent 72%);
  animation: shrxGlowPulse 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

/* gift wrapper */
.shrx-ev-gift {
  position: relative;
  width: 160px;
  height: 160px;
  z-index: 2;
  animation: shrxGiftBob 3.8s ease-in-out infinite;
}

/* MAIN BOX — crayon yellow with wobbly corners */
.shrx-ev-gift-box {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 118px;
  background: var(--yellow);
  border: 3px solid var(--ink);
  /* hand-drawn wobbly corners */
  border-radius: 20px 16px 22px 14px / 16px 20px 14px 22px;
  box-shadow: 5px 5px 0 var(--ink);
  overflow: hidden;
}

/* crayon diagonal highlight stripe on box */
.shrx-ev-gift-box::before {
  content: '';
  position: absolute;
  top: 6px;
  left: 8px;
  width: 42%;
  height: 22%;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 50% 40% 55% 45% / 40% 55% 45% 50%;
  transform: rotate(-12deg);
  pointer-events: none;
}

/* soft dotted paper texture inside */
.shrx-ev-gift-box::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(27, 42, 65, 0.10) 1.1px, transparent 1.5px);
  background-size: 11px 11px;
  opacity: 0.45;
  pointer-events: none;
}

/* LID — separate top box with wobbly shape */
.shrx-ev-gift-lid {
  position: absolute;
  left: -6px;
  right: -6px;
  bottom: 106px;
  height: 40px;
  background: var(--yellow);
  border: 3px solid var(--ink);
  border-radius: 18px 20px 16px 22px / 20px 16px 22px 18px;
  box-shadow: 5px 5px 0 var(--ink);
  z-index: 3;
  overflow: hidden;
}

/* lid highlight stripe */
.shrx-ev-gift-lid::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 10px;
  width: 32%;
  height: 40%;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 50% 40% 55% 45% / 40% 55% 45% 50%;
  transform: rotate(-10deg);
  pointer-events: none;
  z-index: 2;
}

/* vertical ribbon on box */
.shrx-ev-gift-ribbon-v {
  position: absolute;
  left: 50%;
  bottom: 0;
  height: 118px;
  width: 26px;
  margin-left: -13px;
  background: var(--coral);
  border-left: 3px solid var(--ink);
  border-right: 3px solid var(--ink);
  z-index: 2;
}

/* vertical ribbon on lid (via ::after on lid) */
.shrx-ev-gift-lid::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 26px;
  margin-left: -13px;
  background: var(--coral);
  border-left: 3px solid var(--ink);
  border-right: 3px solid var(--ink);
  z-index: 3;
}

/* horizontal ribbon on box */
.shrx-ev-gift-ribbon-h {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 48px;
  height: 26px;
  background: var(--coral);
  border-top: 3px solid var(--ink);
  border-bottom: 3px solid var(--ink);
  z-index: 2;
}

/* BOW — 2 simple crayon loops + knot */
.shrx-ev-bow {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 92px;
  height: 44px;
  z-index: 6;
}

/* left loop */
.shrx-ev-bow::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 46px;
  height: 40px;
  background: var(--coral);
  border: 3px solid var(--ink);
  border-radius: 55% 15% 55% 15% / 50% 22% 50% 22%;
  transform: rotate(-18deg);
  box-shadow: 3px 3px 0 var(--ink);
}

/* right loop */
.shrx-ev-bow::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 46px;
  height: 40px;
  background: var(--coral);
  border: 3px solid var(--ink);
  border-radius: 15% 55% 15% 55% / 22% 50% 22% 50%;
  transform: rotate(18deg);
  box-shadow: 3px 3px 0 var(--ink);
}

/* knot in center */
.shrx-ev-bow-knot {
  position: absolute;
  left: 50%;
  top: 12px;
  width: 24px;
  height: 24px;
  margin-left: -12px;
  background: var(--coral);
  border: 3px solid var(--ink);
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 2px 2px 0 var(--ink);
  z-index: 2;
}

/* Sparkle badges — cute circles */
.shrx-ev-spark {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  border: 3px solid var(--ink);
  color: #fff;
  z-index: 7;
}
.shrx-ev-spark.s1 {
  top: -6px;
  right: -8px;
  width: 42px;
  height: 42px;
  background: var(--lilac-deep);
  box-shadow: 3px 3px 0 var(--ink);
  animation: shrxSpin 3s ease-in-out infinite;
}
.shrx-ev-spark.s1 svg { width: 20px; height: 20px; }
.shrx-ev-spark.s2 {
  bottom: 14px;
  left: -20px;
  width: 36px;
  height: 36px;
  background: var(--mint-deep);
  box-shadow: 3px 3px 0 var(--ink);
  animation: shrxSpin 4s ease-in-out infinite reverse;
}
.shrx-ev-spark.s2 svg { width: 16px; height: 16px; }
.shrx-ev-spark.s3 {
  bottom: 76px;
  right: -22px;
  width: 28px;
  height: 28px;
  background: var(--blue);
  box-shadow: 2px 2px 0 var(--ink);
  animation: shrxSpin 3.5s ease-in-out infinite;
}
.shrx-ev-spark.s3 svg { width: 13px; height: 13px; }

/* Floating doodles (desktop) */
.shrx-ev-doodle {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  opacity: 0.9;
  animation: shrxFloaty 5s ease-in-out infinite;
  display: none;
}
.shrx-ev-doodle.st1 { color: var(--coral); --r: 14deg; }
.shrx-ev-doodle.st2 { color: var(--lilac-deep); --r: -10deg; animation-delay: -1.2s; animation-duration: 6s; }
.shrx-ev-doodle.st3 { color: var(--mint-deep); --r: 22deg; animation-delay: -2.4s; animation-duration: 5.6s; }
.shrx-ev-doodle svg { width: 100%; height: 100%; }

@media (min-width: 901px) {
  .shrx-ev-doodle { display: block; }
  .shrx-ev-doodle.st1 { top: 22px; left: 48%; width: 26px; height: 26px; }
  .shrx-ev-doodle.st2 { bottom: 30px; left: 32%; width: 20px; height: 20px; }
  .shrx-ev-doodle.st3 { top: 55%; right: 32%; width: 18px; height: 18px; }
}

/* ═══ RESPONSIVE — TABLET ═══ */
@media (max-width: 900px) {
  .shrx-ev-card {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 22px 22px 22px;
    border-radius: 22px;
  }
  .shrx-ev-visual { order: 0; padding: 16px 0 6px; }
  .shrx-ev-body { order: 1; }
  .shrx-ev-gift { width: 146px; height: 146px; }
  .shrx-ev-gift-box { height: 106px; }
  .shrx-ev-gift-lid { bottom: 96px; height: 38px; }
  .shrx-ev-gift-ribbon-v { height: 106px; }
  .shrx-ev-gift-ribbon-h { bottom: 42px; }
  .shrx-ev-title { font-size: clamp(22px, 5vw, 26px); }
}

/* ═══ RESPONSIVE — MOBILE ═══ */
@media (max-width: 560px) {
  .shrx-ev { margin-bottom: 18px; }
  .shrx-ev-card {
    padding: 18px 16px 18px;
    border-radius: 20px;
    box-shadow: 3px 3px 0 var(--ink), 0 12px 28px -12px rgba(27,42,65,0.20);
    gap: 14px;
  }
  .shrx-ev-ribbon {
    font-size: 9px;
    padding: 4px 11px 4px 5px;
    gap: 6px;
    box-shadow: 2px 2px 0 var(--yellow);
  }
  .shrx-ev-ribbon-ic { width: 16px; height: 16px; }
  .shrx-ev-ribbon-ic svg { width: 9px; height: 9px; }
  .shrx-ev-ribbon-dot { width: 5px; height: 5px; }
  .shrx-ev-title {
    font-size: 20px;
    margin-top: 12px;
    letter-spacing: -0.4px;
  }
  .shrx-ev-hl { padding: 0 6px; }
  .shrx-ev-hl::before { height: 10px; bottom: 2px; }
  .shrx-ev-hl-coral { padding: 2px 8px; }
  .shrx-ev-hl-coral::before { inset: 3px -2px 2px -2px; }
  .shrx-ev-sub { font-size: 12px; line-height: 1.55; }
  .shrx-ev-feats { gap: 6px; margin-top: 14px; }
  .shrx-ev-feat {
    font-size: 10px;
    padding: 5px 10px 5px 5px;
    gap: 6px;
  }
  .shrx-ev-feat-ic { width: 18px; height: 18px; }
  .shrx-ev-feat-ic svg { width: 10px; height: 10px; }
  .shrx-ev-actions { margin-top: 16px; }
  .shrx-ev-cta {
    padding: 10px 18px 10px 11px;
    font-size: 12.5px;
    gap: 8px;
  }
  .shrx-ev-cta-ic { width: 22px; height: 22px; }
  .shrx-ev-cta-ic svg { width: 12px; height: 12px; }
  .shrx-ev-cta-text b { font-size: 12.5px; }

  .shrx-ev-visual { order: 0; padding: 12px 0 4px; }
  .shrx-ev-gift { width: 126px; height: 126px; }
  .shrx-ev-gift-box {
    height: 92px;
    border-width: 2.5px;
    border-radius: 16px 13px 18px 12px / 13px 16px 12px 18px;
    box-shadow: 4px 4px 0 var(--ink);
  }
  .shrx-ev-gift-lid {
    left: -5px;
    right: -5px;
    bottom: 83px;
    height: 32px;
    border-width: 2.5px;
    box-shadow: 4px 4px 0 var(--ink);
  }
  .shrx-ev-gift-ribbon-v,
  .shrx-ev-gift-lid::after {
    width: 22px;
    margin-left: -11px;
    border-left-width: 2.5px;
    border-right-width: 2.5px;
  }
  .shrx-ev-gift-ribbon-v { height: 92px; }
  .shrx-ev-gift-ribbon-h {
    bottom: 36px;
    height: 22px;
    border-top-width: 2.5px;
    border-bottom-width: 2.5px;
  }
  .shrx-ev-bow { width: 74px; height: 36px; top: -2px; }
  .shrx-ev-bow::before,
  .shrx-ev-bow::after {
    width: 38px;
    height: 32px;
    border-width: 2.5px;
    box-shadow: 2px 2px 0 var(--ink);
  }
  .shrx-ev-bow-knot {
    width: 20px;
    height: 20px;
    margin-left: -10px;
    top: 10px;
    border-width: 2.5px;
  }
  .shrx-ev-spark { border-width: 2.5px; }
  .shrx-ev-spark.s1 { width: 32px; height: 32px; top: -3px; right: -5px; }
  .shrx-ev-spark.s1 svg { width: 15px; height: 15px; }
  .shrx-ev-spark.s2 { width: 28px; height: 28px; bottom: 10px; left: -14px; }
  .shrx-ev-spark.s2 svg { width: 13px; height: 13px; }
  .shrx-ev-spark.s3 { display: none; }
  .shrx-ev-glow { width: 150px; height: 150px; margin: -75px 0 0 -75px; }
}

/* ═══ VERY SMALL MOBILE ═══ */
@media (max-width: 380px) {
  .shrx-ev-card { padding: 16px 14px; gap: 12px; }
  .shrx-ev-title { font-size: 18px; }
  .shrx-ev-sub { font-size: 11.5px; }
  .shrx-ev-gift { width: 110px; height: 110px; }
  .shrx-ev-gift-box { height: 80px; }
  .shrx-ev-gift-lid { bottom: 72px; height: 28px; }
  .shrx-ev-gift-ribbon-v { height: 80px; }
  .shrx-ev-gift-ribbon-h { bottom: 30px; }
}

@media (prefers-reduced-motion: reduce) {
  .shrx-ev *, .shrx-ev *::before, .shrx-ev *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function RewardEventBanner() {
  return (
    <>
      <style>{STYLES}</style>

      <section className="shrx-ev" aria-label="SHARX first event — coming soon">
        <div className="shrx-ev-card">
          {/* floating doodles (desktop only) */}
          <span className="shrx-ev-doodle st1" aria-hidden="true"><StarIcon /></span>
          <span className="shrx-ev-doodle st2" aria-hidden="true"><StarIcon /></span>
          <span className="shrx-ev-doodle st3" aria-hidden="true"><SparkIcon /></span>

          {/* ═══ LEFT — COPY ═══ */}
          <div className="shrx-ev-body">
            <span className="shrx-ev-ribbon">
              <span className="shrx-ev-ribbon-ic"><SparkIcon /></span>
              <span className="shrx-ev-ribbon-text">SHARX First Event</span>
              <span className="shrx-ev-ribbon-dot" />
            </span>

            <h2 className="shrx-ev-title">
              Play games.
              <span className="shrx-ev-line2">
                <span className="shrx-ev-hl">Earn</span>{" "}
                <span className="shrx-ev-hl-coral">rewards</span>.
              </span>
            </h2>

            <p className="shrx-ev-sub">
              A brand-new way to earn while you play. The very first SHARX
              play &amp; earn event is <b>landing very soon</b> — stay tuned.
            </p>

            <div className="shrx-ev-feats">
              <span className="shrx-ev-feat">
                <span className="shrx-ev-feat-ic y"><BoltIcon /></span>
                Play &amp; earn
              </span>
              <span className="shrx-ev-feat">
                <span className="shrx-ev-feat-ic m"><CoinIcon /></span>
                Real rewards
              </span>
            </div>

            <div className="shrx-ev-actions">
              <button
                type="button"
                className="shrx-ev-cta"
                disabled
                aria-disabled="true"
              >
                <span className="shrx-ev-cta-ic"><ClockIcon /></span>
                <span className="shrx-ev-cta-text">
                  <b>Coming soon</b>
                </span>
              </button>
            </div>
          </div>

          {/* ═══ RIGHT — CLEAN CUTE CRAYON GIFT ═══ */}
          <div className="shrx-ev-visual">
            <span className="shrx-ev-glow" aria-hidden="true" />

            <div className="shrx-ev-gift">
              <div className="shrx-ev-gift-box">
                <span className="shrx-ev-gift-ribbon-v" />
                <span className="shrx-ev-gift-ribbon-h" />
              </div>

              <div className="shrx-ev-gift-lid" />

              <span className="shrx-ev-bow">
                <span className="shrx-ev-bow-knot" />
              </span>

              <span className="shrx-ev-spark s1" aria-hidden="true"><SparkIcon /></span>
              <span className="shrx-ev-spark s2" aria-hidden="true"><StarIcon /></span>
              <span className="shrx-ev-spark s3" aria-hidden="true"><BoltIcon /></span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}