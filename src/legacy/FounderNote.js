"use client";

import React, { memo, useId } from "react";
import "./FounderNote.css";

/* ─────────────────────────────────────────────
   Deterministic Star Field
   (fixed positions → no hydration mismatch)
───────────────────────────────────────────── */
const STARS = Array.from({ length: 42 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  s: 1 + ((i * 7) % 3) * 0.6,
  d: ((i * 13) % 10) * 0.4,
  o: 0.2 + ((i * 17) % 6) * 0.12,
}));

/* ─────────────────────────────────────────────
   Realistic Monochrome Rocket
   - brushed-metal cylinder shading
   - dark nose cone, panel seams, rivets
   - glass porthole with reflection
   - swept fins, engine bell, layered flame
   - unique gradient IDs (safe to render twice)
───────────────────────────────────────────── */
function Rocket({ className = "", flame = true }) {
  const uid = useId().replace(/:/g, "");
  const id = (n) => `${uid}-${n}`;

  const BODY =
    "M60 6 C74 26 82 54 82 90 L82 158 Q82 164 76 164 L44 164 Q38 164 38 158 L38 90 C38 54 46 26 60 6 Z";

  return (
    <svg
      className={`shx-bia-rocket-svg ${className}`.trim()}
      viewBox="0 0 120 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Cylinder metal */}
        <linearGradient id={id("metal")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a1a1a" />
          <stop offset="0.16" stopColor="#8c8c8c" />
          <stop offset="0.34" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#d4d4d4" />
          <stop offset="0.72" stopColor="#5a5a5a" />
          <stop offset="1" stopColor="#0c0c0c" />
        </linearGradient>

        {/* Dark nose cone */}
        <linearGradient id={id("nose")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#050505" />
          <stop offset="0.3" stopColor="#555555" />
          <stop offset="0.42" stopColor="#9a9a9a" />
          <stop offset="0.6" stopColor="#2a2a2a" />
          <stop offset="1" stopColor="#030303" />
        </linearGradient>

        {/* Fins */}
        <linearGradient id={id("finL")} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6e6e6" />
          <stop offset="0.5" stopColor="#7d7d7d" />
          <stop offset="1" stopColor="#1c1c1c" />
        </linearGradient>
        <linearGradient id={id("finR")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9a9a9a" />
          <stop offset="0.5" stopColor="#3d3d3d" />
          <stop offset="1" stopColor="#0d0d0d" />
        </linearGradient>

        {/* Engine bell */}
        <linearGradient id={id("bell")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0a0a0a" />
          <stop offset="0.35" stopColor="#7a7a7a" />
          <stop offset="0.55" stopColor="#2b2b2b" />
          <stop offset="1" stopColor="#050505" />
        </linearGradient>

        {/* Porthole */}
        <linearGradient id={id("ring")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#8a8a8a" />
          <stop offset="1" stopColor="#262626" />
        </linearGradient>
        <radialGradient id={id("glass")} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#4a4a4a" />
          <stop offset="0.55" stopColor="#0d0d0d" />
          <stop offset="1" stopColor="#000000" />
        </radialGradient>

        {/* Soft ambient occlusion on body */}
        <linearGradient id={id("ao")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>

        {/* Flame */}
        <linearGradient id={id("flameOuter")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("flameCore")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={id("blur")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>

        <clipPath id={id("clip")}>
          <path d={BODY} />
        </clipPath>
      </defs>

      {/* ───────── Exhaust ───────── */}
      {flame && (
        <g className="shx-bia-flame">
          <ellipse
            className="shx-bia-flame-glow"
            cx="60"
            cy="205"
            rx="26"
            ry="40"
            fill="#ffffff"
            opacity="0.35"
            filter={`url(#${id("blur")})`}
          />
          <path
            className="shx-bia-flame-outer"
            d="M47 184 C38 204 48 224 60 246 C72 224 82 204 73 184 Z"
            fill={`url(#${id("flameOuter")})`}
          />
          <path
            className="shx-bia-flame-mid"
            d="M51 184 C45 200 53 214 60 230 C67 214 75 200 69 184 Z"
            fill={`url(#${id("flameCore")})`}
            opacity="0.85"
            filter={`url(#${id("soft")})`}
          />
          <path
            className="shx-bia-flame-inner"
            d="M55 184 C52 194 56 202 60 212 C64 202 68 194 65 184 Z"
            fill="#ffffff"
          />
          {/* sparks */}
          <circle className="shx-bia-spark shx-bia-spark-1" cx="52" cy="214" r="1.3" fill="#fff" />
          <circle className="shx-bia-spark shx-bia-spark-2" cx="68" cy="220" r="1" fill="#fff" />
          <circle className="shx-bia-spark shx-bia-spark-3" cx="60" cy="228" r="1.5" fill="#fff" />
        </g>
      )}

      {/* ───────── Fins ───────── */}
      {/* Center rear fin (depth) */}
      <path
        d="M56 130 L60 172 L64 130 Z"
        fill="#161616"
        stroke="#6b6b6b"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Left */}
      <path
        d="M38 112 C28 126 18 146 12 176 L12 186 L38 164 Z"
        fill={`url(#${id("finL")})`}
        stroke="#ffffff"
        strokeOpacity="0.85"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M38 126 L18 168" stroke="#000" strokeOpacity="0.35" strokeWidth="1" />
      {/* Right */}
      <path
        d="M82 112 C92 126 102 146 108 176 L108 186 L82 164 Z"
        fill={`url(#${id("finR")})`}
        stroke="#ffffff"
        strokeOpacity="0.6"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M82 126 L102 168" stroke="#fff" strokeOpacity="0.18" strokeWidth="1" />

      {/* ───────── Engine bell ───────── */}
      <path
        d="M46 162 L41 184 Q60 191 79 184 L74 162 Z"
        fill={`url(#${id("bell")})`}
        stroke="#bdbdbd"
        strokeOpacity="0.7"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <ellipse cx="60" cy="184.5" rx="19" ry="4.2" fill="#000" stroke="#d6d6d6" strokeOpacity="0.8" strokeWidth="1" />
      <ellipse cx="60" cy="184.5" rx="11" ry="2.4" fill="#fff" opacity="0.35" />

      {/* ───────── Body ───────── */}
      <path d={BODY} fill={`url(#${id("metal")})`} />

      <g clipPath={`url(#${id("clip")})`}>
        {/* Nose cone */}
        <rect x="30" y="0" width="60" height="48" fill={`url(#${id("nose")})`} />
        <rect x="30" y="47" width="60" height="1.6" fill="#000" opacity="0.8" />
        <rect x="30" y="48.6" width="60" height="0.8" fill="#fff" opacity="0.45" />

        {/* Panel seams */}
        <rect x="30" y="104" width="60" height="0.9" fill="#000" opacity="0.5" />
        <rect x="30" y="105" width="60" height="0.6" fill="#fff" opacity="0.35" />
        <rect x="30" y="140" width="60" height="0.9" fill="#000" opacity="0.5" />
        <rect x="30" y="141" width="60" height="0.6" fill="#fff" opacity="0.35" />

        {/* Black band */}
        <rect x="30" y="118" width="60" height="14" fill="#050505" opacity="0.92" />
        <rect x="30" y="118" width="60" height="0.8" fill="#fff" opacity="0.5" />
        <rect x="30" y="131.2" width="60" height="0.8" fill="#fff" opacity="0.5" />
        <rect x="46" y="123" width="28" height="1.4" rx="0.7" fill="#fff" opacity="0.85" />
        <rect x="52" y="126.4" width="16" height="1.4" rx="0.7" fill="#fff" opacity="0.45" />

        {/* Vertical seam */}
        <rect x="59.5" y="52" width="1" height="50" fill="#000" opacity="0.18" />

        {/* Specular streak */}
        <path
          d="M48 34 C44 58 43 84 43 108"
          stroke="#fff"
          strokeOpacity="0.55"
          strokeWidth="2.4"
          strokeLinecap="round"
          filter={`url(#${id("soft")})`}
        />

        {/* Heat-shield tile lines on nose */}
        <path d="M46 36 Q60 41 74 36" stroke="#fff" strokeOpacity="0.14" strokeWidth="0.7" />
        <path d="M43.5 27 Q60 32 76.5 27" stroke="#fff" strokeOpacity="0.12" strokeWidth="0.7" />
        <path d="M50 17 Q60 21 70 17" stroke="#fff" strokeOpacity="0.1" strokeWidth="0.7" />
        <path d="M60 8 L60 47" stroke="#fff" strokeOpacity="0.08" strokeWidth="0.7" />

        {/* Rim light on right edge */}
        <rect x="77" y="50" width="1.6" height="112" fill="#fff" opacity="0.16" />

        {/* Fin shadows cast on body */}
        <path d="M38 112 L50 124 L50 160 L38 164 Z" fill="#000" opacity="0.22" />
        <path d="M82 112 L70 124 L70 160 L82 164 Z" fill="#000" opacity="0.3" />

        {/* Stage-2 seam highlight */}
        <rect x="30" y="86" width="60" height="0.7" fill="#000" opacity="0.35" />
        <rect x="30" y="86.7" width="60" height="0.5" fill="#fff" opacity="0.25" />

        {/* Bottom shadow */}
        <rect x="30" y="100" width="60" height="70" fill={`url(#${id("ao")})`} />
      </g>

      {/* Body outline */}
      <path
        d={BODY}
        stroke="#ffffff"
        strokeOpacity="0.9"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Rivets */}
      {[44, 54, 66, 76].map((cx) => (
        <React.Fragment key={cx}>
          <circle cx={cx} cy="110" r="0.9" fill="#fff" opacity="0.65" />
          <circle cx={cx} cy="147" r="0.9" fill="#fff" opacity="0.65" />
        </React.Fragment>
      ))}

      {/* ───────── Porthole ───────── */}
      <circle cx="60" cy="82" r="14" fill="#000" opacity="0.5" />
      <circle cx="60" cy="82" r="12.5" fill={`url(#${id("ring")})`} />
      <circle cx="60" cy="82" r="9.4" fill={`url(#${id("glass")})`} stroke="#000" strokeWidth="1" />
      <circle className="shx-bia-window-core" cx="60" cy="82" r="4" fill="#ffffff" opacity="0.18" />
      <path
        d="M53.6 78 A8 8 0 0 1 62 74.2"
        stroke="#fff"
        strokeOpacity="0.85"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="64.2" cy="86.2" r="1.1" fill="#fff" opacity="0.5" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle
          key={a}
          cx={60 + 11.1 * Math.cos((a * Math.PI) / 180)}
          cy={82 + 11.1 * Math.sin((a * Math.PI) / 180)}
          r="0.7"
          fill="#111"
        />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const BackInActionUI = memo(function BackInActionUI() {
  return (
    <section className="shx-bia" aria-labelledby="shx-bia-title">
      {/* Background layers */}
      <span className="shx-bia-grid" aria-hidden="true" />
      <span className="shx-bia-grain" aria-hidden="true" />
      <span className="shx-bia-glow shx-bia-glow-a" aria-hidden="true" />
      <span className="shx-bia-glow shx-bia-glow-b" aria-hidden="true" />

      {/* Stars */}
      <span className="shx-bia-stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="shx-bia-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.s}px`,
              height: `${s.s}px`,
              "--o": String(s.o),
              "--d": `${s.d}s`,
            }}
          />
        ))}
      </span>

      {/* Rocket visual */}
      <div className="shx-bia-visual" aria-hidden="true">
        <div className="shx-bia-rocket">
          <Rocket />
        </div>
      </div>

      {/* Copy */}
      <div className="shx-bia-copy">
        <h2 id="shx-bia-title" className="shx-bia-title">
          <span className="shx-bia-line shx-bia-line-1">BACK IN ACTION.</span>
          <span className="shx-bia-line shx-bia-line-2">
            BUILT TO GO <span className="shx-bia-em">BEYOND.</span>
          </span>
        </h2>

        <p className="shx-bia-sub">
          Back to work. Every day, from now on.
        </p>
      </div>
    </section>
  );
});

/* ═══════════════════════════════════════════
   EXPORTS (unchanged → Home.js safe)
═══════════════════════════════════════════ */
export const FounderNoteCard = memo(function FounderNoteCard() {
  return <BackInActionUI />;
});

export const FounderNoteModal = memo(function FounderNoteModal() {
  return null;
});

export default FounderNoteCard;