"use client";

// src/legacy/RewardEventBanner.js — SHARX · Crayon
//
// This is now the BODY of the merged event card (Home.js → EventStrip).
// • No own frame / border / shadow — the card around it provides that
// • Same red + purple crayon gift as the strip (from the sidebar icon set),
//   big + animated on the right
// • Static display only — event not live yet

import React, { memo } from "react";
import { getCategoryIcon } from "./Sidebar";

/* ═══════════════════════════════════════════
   SMALL ICONS
═══════════════════════════════════════════ */
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M15 9.5c-.6-1-1.6-1.5-3-1.5-1.7 0-2.8.9-2.8 2.2 0 1.6 1.4 2.1 3 2.5 1.9.5 3.1 1 3.1 2.5 0 1.4-1.3 2.3-3.1 2.3-1.6 0-2.7-.6-3.3-1.7" />
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
  --yellow: #FFD966;
  --coral: #FF8B7B;
  --mint: #7BE5B5;
  --mint-deep: #3FCB92;
  --blue: #2E7FE8;
  --lilac-deep: #9B7EF0;
  position: relative;
  width: 100%;
  margin: 0;
  font-family: var(--font-comfortaa), 'Comfortaa', system-ui, sans-serif;
  color: var(--ink);
  isolation: isolate;
}
.shrx-ev *, .shrx-ev *::before, .shrx-ev *::after {
  box-sizing: border-box;
}

/* ═══ KEYFRAMES ═══ */
@keyframes shrxFloaty {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--r, 0deg)); }
  50%      { transform: translate3d(0, -10px, 0) rotate(calc(var(--r, 0deg) + 8deg)); }
}
@keyframes shrxSpin {
  0%, 100% { transform: scale(1) rotate(0); }
  50%      { transform: scale(1.18) rotate(180deg); }
}
@keyframes shrxGiftBob {
  0%, 100% { transform: translateY(0) rotate(-4deg) scale(1); }
  30%      { transform: translateY(-14px) rotate(4deg) scale(1.05); }
  55%      { transform: translateY(0) rotate(-2deg) scale(0.97, 1.03); }
  70%      { transform: translateY(-4px) rotate(2deg) scale(1.01); }
}
@keyframes shrxGround {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.22; }
  30%      { transform: translateX(-50%) scale(0.78); opacity: 0.12; }
  55%      { transform: translateX(-50%) scale(1.04); opacity: 0.26; }
}
@keyframes shrxGlowPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 0.95; transform: scale(1.08); }
}
@keyframes shrxTwinkle {
  0%, 100% { opacity: 0; transform: scale(0.3) rotate(0deg); }
  50%      { opacity: 1; transform: scale(1) rotate(45deg); }
}
@keyframes shrxRise {
  from { opacity: 0; transform: translate3d(0, 10px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}

/* ═══ LAYOUT (no frame — the merged card draws it) ═══ */
.shrx-ev-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 18px;
  padding: 22px 26px 24px 22px;
  align-items: center;
  contain: layout paint;
}

/* ═══ COPY ═══ */
.shrx-ev-body {
  position: relative;
  z-index: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.shrx-ev-title {
  margin: 0 0 8px;
  font-family: var(--font-comfortaa), sans-serif;
  font-size: clamp(22px, 2.6vw, 32px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.8px;
  color: var(--ink);
  animation: shrxRise 0.5s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both;
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
  animation: shrxRise 0.5s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.shrx-ev-sub b { color: var(--ink); font-weight: 800; }

.shrx-ev-feats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  animation: shrxRise 0.5s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
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

/* ═══════════════════════════════════════════
   RIGHT VISUAL — the red + purple crayon gift
═══════════════════════════════════════════ */
.shrx-ev-visual {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 190px;
}

.shrx-ev-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 210px;
  height: 210px;
  margin: -105px 0 0 -105px;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(255, 217, 102, 0.55) 0%,
    rgba(255, 180, 212, 0.32) 40%,
    transparent 72%);
  will-change: transform, opacity;
  animation: shrxGlowPulse 4s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

.shrx-ev-gift {
  position: relative;
  z-index: 2;
  display: block;
  width: 170px;
  height: 170px;
  transform-origin: 50% 88%;
  will-change: transform;
  animation: shrxGiftBob 3.6s ease-in-out infinite;
}
.shrx-ev-gift svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.shrx-ev-ground {
  position: absolute;
  left: 50%;
  bottom: 6px;
  width: 120px;
  height: 14px;
  border-radius: 50%;
  background: var(--ink);
  transform: translateX(-50%);
  animation: shrxGround 3.6s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

.shrx-ev-spark {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  border: 3px solid var(--ink);
  color: #fff;
  z-index: 3;
}
.shrx-ev-spark.s1 {
  top: 8px;
  right: 14px;
  width: 38px;
  height: 38px;
  background: var(--lilac-deep);
  box-shadow: 3px 3px 0 var(--ink);
  animation: shrxSpin 3s ease-in-out infinite;
}
.shrx-ev-spark.s1 svg { width: 18px; height: 18px; }
.shrx-ev-spark.s2 {
  bottom: 22px;
  left: 8px;
  width: 32px;
  height: 32px;
  background: var(--mint-deep);
  box-shadow: 3px 3px 0 var(--ink);
  animation: shrxSpin 4s ease-in-out infinite reverse;
}
.shrx-ev-spark.s2 svg { width: 14px; height: 14px; }
.shrx-ev-spark.s3 {
  top: 62px;
  left: 2px;
  width: 26px;
  height: 26px;
  background: var(--blue);
  box-shadow: 2px 2px 0 var(--ink);
  animation: shrxSpin 3.5s ease-in-out infinite;
}
.shrx-ev-spark.s3 svg { width: 12px; height: 12px; }

/* tiny twinkles */
.shrx-ev-twinkle {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid var(--ink);
  border-radius: 3px;
  z-index: 3;
  animation: shrxTwinkle 2.4s ease-in-out infinite;
  pointer-events: none;
}
.shrx-ev-twinkle.t1 { top: 30px; left: 34px; background: var(--yellow); }
.shrx-ev-twinkle.t2 { bottom: 52px; right: 20px; background: #C7B4FF; animation-delay: 0.8s; }
.shrx-ev-twinkle.t3 { top: 90px; right: 6px; background: #FFB4D4; animation-delay: 1.5s; }

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
  .shrx-ev-doodle.st1 { top: 18px; left: 48%; width: 24px; height: 24px; }
  .shrx-ev-doodle.st2 { bottom: 20px; left: 32%; width: 18px; height: 18px; }
  .shrx-ev-doodle.st3 { top: 55%; right: 32%; width: 16px; height: 16px; }
}

/* ═══ TABLET ═══ */
@media (max-width: 900px) {
  .shrx-ev-card {
    grid-template-columns: minmax(0, 1fr) 170px;
    gap: 12px;
    padding: 18px 18px 20px 18px;
  }
  .shrx-ev-gift { width: 136px; height: 136px; }
  .shrx-ev-glow { width: 170px; height: 170px; margin: -85px 0 0 -85px; }
  .shrx-ev-visual { min-height: 160px; }
  .shrx-ev-ground { width: 96px; }
  .shrx-ev-title { font-size: clamp(20px, 4.4vw, 26px); }
}

/* ═══ MOBILE — gift on top, copy below ═══ */
@media (max-width: 560px) {
  .shrx-ev-card {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 14px 14px 18px;
  }
  .shrx-ev-visual { order: 0; min-height: 138px; }
  .shrx-ev-body { order: 1; }
  .shrx-ev-gift { width: 116px; height: 116px; }
  .shrx-ev-glow { width: 150px; height: 150px; margin: -75px 0 0 -75px; }
  .shrx-ev-ground { width: 80px; height: 11px; bottom: 6px; }
  .shrx-ev-title { font-size: 20px; letter-spacing: -0.4px; }
  .shrx-ev-hl { padding: 0 6px; }
  .shrx-ev-hl::before { height: 10px; bottom: 2px; }
  .shrx-ev-hl-coral { padding: 2px 8px; }
  .shrx-ev-hl-coral::before { inset: 3px -2px 2px -2px; }
  .shrx-ev-sub { font-size: 12px; line-height: 1.55; }
  .shrx-ev-feats { gap: 6px; margin-top: 12px; }
  .shrx-ev-feat { font-size: 10px; padding: 5px 10px 5px 5px; gap: 6px; }
  .shrx-ev-feat-ic { width: 18px; height: 18px; }
  .shrx-ev-feat-ic svg { width: 10px; height: 10px; }
  .shrx-ev-spark { border-width: 2.5px; }
  .shrx-ev-spark.s1 { width: 30px; height: 30px; top: 6px; right: calc(50% - 86px); }
  .shrx-ev-spark.s1 svg { width: 14px; height: 14px; }
  .shrx-ev-spark.s2 { width: 26px; height: 26px; bottom: 18px; left: calc(50% - 92px); }
  .shrx-ev-spark.s2 svg { width: 12px; height: 12px; }
  .shrx-ev-spark.s3 { display: none; }
  .shrx-ev-twinkle.t1 { left: calc(50% - 60px); }
  .shrx-ev-twinkle.t2 { right: calc(50% - 70px); }
  .shrx-ev-twinkle.t3 { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .shrx-ev *, .shrx-ev *::before, .shrx-ev *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

/* ═══════════════════════════════════════════
   MAIN COMPONENT — STATIC DISPLAY
   Event not live: no props, no handlers.
═══════════════════════════════════════════ */
export default function RewardEventBanner() {
  return (
    <>
      <style>{STYLES}</style>

      <section
        className="shrx-ev"
        aria-label="SHARX first event — coming soon"
      >
        <div className="shrx-ev-card">
          {/* floating doodles (desktop only) */}
          <span className="shrx-ev-doodle st1" aria-hidden="true">
            <StarIcon />
          </span>
          <span className="shrx-ev-doodle st2" aria-hidden="true">
            <StarIcon />
          </span>
          <span className="shrx-ev-doodle st3" aria-hidden="true">
            <SparkIcon />
          </span>

          {/* ═══ LEFT — COPY ═══ */}
          <div className="shrx-ev-body">
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
                <span className="shrx-ev-feat-ic y">
                  <BoltIcon />
                </span>
                Play &amp; earn
              </span>
              <span className="shrx-ev-feat">
                <span className="shrx-ev-feat-ic m">
                  <CoinIcon />
                </span>
                Real rewards
              </span>
            </div>
          </div>

          {/* ═══ RIGHT — red + purple crayon gift (same as the strip) ═══ */}
          <div className="shrx-ev-visual" aria-hidden="true">
            <span className="shrx-ev-glow" />
            <span className="shrx-ev-ground" />

            <span className="shrx-ev-gift">{getCategoryIcon("gift")}</span>

            <span className="shrx-ev-spark s1">
              <SparkIcon />
            </span>
            <span className="shrx-ev-spark s2">
              <StarIcon />
            </span>
            <span className="shrx-ev-spark s3">
              <BoltIcon />
            </span>

            <span className="shrx-ev-twinkle t1" />
            <span className="shrx-ev-twinkle t2" />
            <span className="shrx-ev-twinkle t3" />
          </div>
        </div>
      </section>
    </>
  );
}