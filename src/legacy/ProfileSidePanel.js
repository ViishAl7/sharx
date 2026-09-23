// ProfileSidePanel.js — Crayon · Clean · Playful
import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────── Constants ─────────── */
const SHAPES = ["square", "star", "circle", "hexagon", "heart"];
const EYES   = ["oval", "round", "wink", "sleepy"];
const COLORS = ["#FFD966", "#FF8B7B", "#7BE5B5", "#8FB8FF", "#C7B4FF"];

const COLOR_CONFIG = {
  "#FFD966": { bg1: "#FFF6D6", bg2: "#FFE7A3", blob: "#FFD966", text: "#7A5C00" },
  "#FF8B7B": { bg1: "#FFE8E3", bg2: "#FFC7BC", blob: "#FF8B7B", text: "#8B1A35" },
  "#7BE5B5": { bg1: "#DDF9EE", bg2: "#B8F0D8", blob: "#7BE5B5", text: "#1A5F5A" },
  "#8FB8FF": { bg1: "#E0EBFF", bg2: "#C4D8FF", blob: "#8FB8FF", text: "#1A3A80" },
  "#C7B4FF": { bg1: "#EDE5FF", bg2: "#D9C8FF", blob: "#C7B4FF", text: "#3D1A80" },
};

const STROKE = "#1B2A41";
const ACCENT = "#2E7FE8";
const USERNAME_LOCK_MS = 30 * 24 * 60 * 60 * 1000;

/* ─────────── Avatar SVG ─────────── */
export function AvatarSVG({ shape = "square", eyes = "oval", color = "#FFD966", size = 220 }) {
  const s = size, cx = s / 2, cy = s / 2;
  const sw = Math.max(4.5, s * 0.044);

  const Body = () => {
    if (shape === "square") {
      const r = s * 0.1, w = s * 0.76, x = (s - w) / 2, y = (s - w) / 2;
      return <rect x={x} y={y} width={w} height={w} rx={r} fill={color} stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />;
    }
    if (shape === "circle")
      return <circle cx={cx} cy={cy} r={s * 0.39} fill={color} stroke={STROKE} strokeWidth={sw} />;
    if (shape === "star") {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? s * 0.43 : s * 0.2;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} fill={color} stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />;
    }
    if (shape === "hexagon") {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `${cx + s * 0.41 * Math.cos(a)},${cy + s * 0.41 * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} fill={color} stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />;
    }
    const d = `M ${cx} ${cy + s * 0.31}
               C ${cx - s * 0.54} ${cy + s * 0.04} ${cx - s * 0.44} ${cy - s * 0.29} ${cx} ${cy - s * 0.07}
               C ${cx + s * 0.44} ${cy - s * 0.29} ${cx + s * 0.54} ${cy + s * 0.04} ${cx} ${cy + s * 0.31} Z`;
    return <path d={d} fill={color} stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />;
  };

  const ey = cy - s * 0.02;
  const ex1 = cx - s * 0.155, ex2 = cx + s * 0.155;
  const erx = s * 0.082, ery = s * 0.128;
  const sw2 = sw * 0.86;

  const Eyes = () => {
    if (eyes === "oval") return (
      <g>
        {[ex1, ex2].map((x, i) => (
          <g key={i}>
            <ellipse cx={x} cy={ey} rx={erx} ry={ery} fill="#FFF" stroke={STROKE} strokeWidth={sw2} />
            <path d={`M ${x - erx * 0.82} ${ey} A ${erx} ${ery} 0 0 0 ${x + erx * 0.82} ${ey} Z`} fill={STROKE} />
          </g>
        ))}
      </g>
    );
    if (eyes === "round") return (
      <g>
        {[ex1, ex2].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ey} r={erx * 1.04} fill="#FFF" stroke={STROKE} strokeWidth={sw2} />
            <circle cx={x} cy={ey} r={erx * 0.52} fill={STROKE} />
            <circle cx={x - erx * 0.2} cy={ey - ery * 0.28} r={erx * 0.16} fill="#FFF" />
          </g>
        ))}
      </g>
    );
    if (eyes === "wink") return (
      <g>
        <circle cx={ex1} cy={ey} r={erx * 1.04} fill="#FFF" stroke={STROKE} strokeWidth={sw2} />
        <circle cx={ex1} cy={ey} r={erx * 0.52} fill={STROKE} />
        <path d={`M ${ex2 - erx} ${ey} Q ${ex2} ${ey + ery * 0.85} ${ex2 + erx} ${ey}`}
          stroke={STROKE} strokeWidth={sw2} fill="none" strokeLinecap="round" />
      </g>
    );
    return (
      <g>
        {[ex1, ex2].map((x, i) => (
          <g key={i}>
            <ellipse cx={x} cy={ey + ery * 0.12} rx={erx} ry={ery * 0.52}
              fill="#FFF" stroke={STROKE} strokeWidth={sw2} />
            <path d={`M ${x - erx * 0.82} ${ey} Q ${x} ${ey + ery * 0.48} ${x + erx * 0.82} ${ey}`}
              fill={STROKE} />
          </g>
        ))}
      </g>
    );
  };

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${s} ${s}`}
      style={{ overflow: "visible", filter: `drop-shadow(3px 3px 0 ${STROKE})` }}
    >
      <Body />
      <ellipse
        cx={cx - s * 0.2} cy={cy - s * 0.28} rx={s * 0.075} ry={s * 0.045}
        fill="rgba(255,255,255,0.45)"
        transform={`rotate(-28 ${cx - s * 0.2} ${cy - s * 0.28})`}
      />
      <Eyes />
    </svg>
  );
}

/* ─────────── Shape outline (picker) ─────────── */
function ShapeOutline({ shape, size = 36 }) {
  const s = size, cx = s / 2, cy = s / 2, sw = 2.5;
  if (shape === "square")
    return <rect x={s * 0.12} y={s * 0.12} width={s * 0.76} height={s * 0.76} rx={s * 0.12} fill="none" stroke={STROKE} strokeWidth={sw} />;
  if (shape === "circle")
    return <circle cx={cx} cy={cy} r={s * 0.38} fill="none" stroke={STROKE} strokeWidth={sw} />;
  if (shape === "star") {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? s * 0.42 : s * 0.19, a = (Math.PI / 5) * i - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} fill="none" stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />;
  }
  if (shape === "hexagon") {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i;
      return `${cx + s * 0.4 * Math.cos(a)},${cy + s * 0.4 * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} fill="none" stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" />;
  }
  return (
    <path
      d={`M ${cx} ${cy + s * 0.3} C ${cx - s * 0.5} ${cy + s * 0.05} ${cx - s * 0.4} ${cy - s * 0.25} ${cx} ${cy - s * 0.05}
         C ${cx + s * 0.4} ${cy - s * 0.25} ${cx + s * 0.5} ${cy + s * 0.05} ${cx} ${cy + s * 0.3} Z`}
      fill="none" stroke={STROKE} strokeWidth={sw} strokeLinejoin="round"
    />
  );
}

function EyePreview({ kind, size = 28 }) {
  const s = size;
  return (
    <svg width={s * 2.2} height={s} viewBox={`0 0 ${s * 2.2} ${s}`}>
      {["a", "b"].map((k, i) => {
        const x = i === 0 ? s * 0.55 : s * 1.65;
        const y = s / 2, rx = s * 0.34, ry = s * 0.42, sw = 2;
        if (kind === "oval" || (kind === "wink" && i === 0)) return (
          <g key={k}>
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#FFF" stroke={STROKE} strokeWidth={sw} />
            <path d={`M ${x - rx * 0.8} ${y} A ${rx} ${ry} 0 0 0 ${x + rx * 0.8} ${y} Z`} fill={STROKE} />
          </g>
        );
        if (kind === "round") return (
          <g key={k}>
            <circle cx={x} cy={y} r={rx} fill="#FFF" stroke={STROKE} strokeWidth={sw} />
            <circle cx={x} cy={y} r={rx * 0.5} fill={STROKE} />
          </g>
        );
        return <path key={k} d={`M ${x - rx} ${y} Q ${x} ${y + ry * 0.7} ${x + rx} ${y}`} stroke={STROKE} strokeWidth={sw} fill="none" strokeLinecap="round" />;
      })}
    </svg>
  );
}

/* ─────────── Icons ─────────── */
const I = {
  Dots:    () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></svg>,
  Pen:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
  Logout:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  ChevL:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  X:       () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>,
  Check:   () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 12 10 17 19 7"/></svg>,
  Lock:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={STROKE} strokeWidth="2.5"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>,
  Body:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>,
  Palette: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20c1 0 2-1 2-2v-1a2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-11z"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="10.5" r="1.2" fill="currentColor"/></svg>,
  EyeTab:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><ellipse cx="12" cy="12" rx="9" ry="6"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>,
};

/* ─────────── CSS ─────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700;800&display=swap');

.psp-root *, .psp-root *::before, .psp-root *::after { box-sizing: border-box; }
.psp-root {
  font-family: 'Comfortaa', system-ui, sans-serif;
  color: ${STROKE};
  --ink: ${STROKE};
  --paper: #FFFDF7;
  --blue: ${ACCENT};
  --yellow: #FFD966;
  --coral: #FF8B7B;
  --mint: #7BE5B5;
  --lilac: #C7B4FF;
  --border: 1.5px solid var(--ink);
  --shadow-sm: 2px 2px 0 var(--ink);
  --shadow-md: 3px 3px 0 var(--ink);
  --shadow-lg: 4px 4px 0 var(--ink);
}

/* ── Keyframes ── */
@keyframes psp-slideIn  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes psp-slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
@keyframes psp-fade     { from { opacity: 0; } to { opacity: 1; } }

@keyframes psp-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%      { transform: translateY(-6px) rotate(0.5deg); }
}
@keyframes psp-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.15); }
  70%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}
@keyframes psp-bounceIn {
  0%   { transform: translateY(48px) scale(0.88); opacity: 0; }
  55%  { transform: translateY(-8px) scale(1.03); opacity: 1; }
  80%  { transform: translateY(3px) scale(0.99); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes psp-menuDrop {
  from { opacity: 0; transform: translateY(-10px) scale(0.82); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes psp-nameIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes psp-blob1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(18px, -22px) scale(1.05); }
}
@keyframes psp-blob2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-20px, 18px) scale(1.08); }
}
@keyframes psp-ringPop {
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50%      { transform: scale(1.03); opacity: 0.2; }
}

/* ── Backdrop ── */
.psp-backdrop {
  position: fixed; inset: 0;
  background: rgba(27, 42, 65, 0.35);
  z-index: 999;
  animation: psp-fade 0.26s ease;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* ── Panel ── */
.psp-panel {
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 1000;
  width: 480px; max-width: 100vw;
  display: flex; flex-direction: column;
  overflow: hidden;
  animation: psp-slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.psp-panel.closing { animation: psp-slideOut 0.22s ease forwards; }

.psp-panelBg {
  position: absolute; inset: 0; z-index: 0;
  background: var(--psp-grad);
  transition: background 0.45s ease;
}

/* ── Soft blobs ── */
.psp-blob {
  position: absolute; border-radius: 50%;
  pointer-events: none; z-index: 1;
  filter: blur(40px);
}
.psp-blob1 {
  width: 220px; height: 220px;
  top: -60px; right: -60px;
  background: var(--psp-blob-color);
  opacity: 0.3;
  animation: psp-blob1 8s ease-in-out infinite;
}
.psp-blob2 {
  width: 180px; height: 180px;
  bottom: 60px; left: -50px;
  background: var(--psp-blob-color);
  opacity: 0.22;
  animation: psp-blob2 10s ease-in-out infinite 1.5s;
}
.psp-blob3 {
  width: 120px; height: 120px;
  top: 45%; right: 10px;
  background: var(--psp-blob-color);
  opacity: 0.18;
  animation: psp-blob1 7s ease-in-out infinite 3s;
}

/* ── External close (crayon pill) ── */
.psp-extClose {
  position: fixed; top: 50%; left: 480px;
  transform: translate(-50%, -50%);
  width: 50px; height: 50px; border-radius: 50%;
  background: var(--paper);
  border: var(--border);
  cursor: pointer; z-index: 1001;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s, background 0.18s;
  opacity: 1;
  pointer-events: auto;
}
.psp-extClose.hidden {
  opacity: 0;
  pointer-events: none;
}
.psp-extClose:hover {
  transform: translate(-50%, -50%) scale(1.08);
  box-shadow: var(--shadow-lg);
  background: var(--yellow);
}
.psp-extClose:active {
  transform: translate(-50%, -50%) scale(0.96);
  box-shadow: var(--shadow-sm);
}
@media (max-width: 520px) {
  .psp-panel { width: 100vw; }
  .psp-extClose { left: auto; right: 14px; top: 14px; transform: none; }
  .psp-extClose:hover { transform: scale(1.08); }
  .psp-extClose:active { transform: scale(0.96); }
}

/* ── Menu buttons (crayon circle) ── */
.psp-menuCol {
  position: absolute; top: 20px; left: 20px; z-index: 6;
  display: flex; flex-direction: column; gap: 10px;
}
.psp-circleBtn {
  width: 46px; height: 46px; border-radius: 50%;
  background: var(--paper);
  border: var(--border);
  color: var(--ink);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.18s cubic-bezier(.34,1.4,.4,1), box-shadow 0.18s, background 0.18s;
}
.psp-circleBtn:hover {
  background: var(--yellow);
  transform: translate3d(-2px, -2px, 0) rotate(-4deg);
  box-shadow: var(--shadow-md);
}
.psp-circleBtn:active {
  transform: translate3d(0, 0, 0);
  box-shadow: var(--shadow-sm);
}
.psp-menuItem {
  animation: psp-menuDrop 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* ── Hero ── */
.psp-hero {
  position: relative; z-index: 2;
  flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 28px 28px;
  gap: 0;
  text-align: center;
  overflow: hidden;
}

/* Soft rings behind avatar */
.psp-avatarRing {
  position: absolute;
  width: 248px; height: 248px; border-radius: 50%;
  border: 2px dashed rgba(27, 42, 65, 0.18);
  pointer-events: none;
  animation: psp-ringPop 4s ease-in-out infinite;
}
.psp-avatarRing2 {
  position: absolute;
  width: 296px; height: 296px; border-radius: 50%;
  border: 1.5px solid rgba(27, 42, 65, 0.12);
  pointer-events: none;
  animation: psp-ringPop 4s ease-in-out infinite 1.4s;
}

.psp-avatarWrap {
  position: relative; z-index: 3;
  animation: psp-float 4.5s ease-in-out infinite;
}
.psp-avatarWrap.pop {
  animation: psp-pop 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.psp-shadow {
  width: 100px; height: 10px; border-radius: 50%;
  background: rgba(27, 42, 65, 0.14);
  filter: blur(6px);
  margin-top: 2px;
  margin-bottom: 22px;
  flex-shrink: 0;
}

/* ── Name + sub ── */
.psp-nameBlock {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  animation: psp-nameIn 0.45s 0.2s both ease;
}
.psp-title {
  font-size: 30px; font-weight: 800; letter-spacing: -0.5px; margin: 0;
  color: var(--ink);
  text-shadow: 3px 3px 0 var(--yellow);
  transform: rotate(-0.8deg);
}
.psp-sub {
  font-size: 13px; font-weight: 700; opacity: 0.75; margin: 0;
  color: var(--ink);
}

/* ── Editor ── */
.psp-editor {
  position: absolute; inset: 0; z-index: 10;
  display: flex; flex-direction: column;
  animation: psp-fade 0.2s ease;
  overflow: hidden;
}
.psp-editBg {
  position: absolute; inset: 0; z-index: 0;
  background: var(--psp-grad);
  transition: background 0.4s ease;
}
.psp-editTop {
  flex: 1; min-height: 0;
  position: relative; z-index: 2;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 68px 24px 18px;
}

/* ── Editor Actions — crayon buttons ── */
.psp-edActions {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  width: 100%;
}

.psp-edAction {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.18s cubic-bezier(.34,1.4,.4,1), box-shadow 0.18s;
  flex-shrink: 0;
}
.psp-edAction:hover {
  transform: translate3d(-2px, -2px, 0) rotate(-3deg);
}
.psp-edAction:active {
  transform: translate3d(0, 0, 0);
  box-shadow: var(--shadow-sm);
}
.psp-edAction.x {
  background: var(--coral);
  box-shadow: var(--shadow-md);
}
.psp-edAction.x:hover {
  box-shadow: var(--shadow-lg);
}
.psp-edAction.ok {
  background: var(--blue);
  box-shadow: var(--shadow-md);
}
.psp-edAction.ok:hover {
  box-shadow: var(--shadow-lg);
}

.psp-unameLabel {
  font-size: 11px; font-weight: 800; letter-spacing: 3.5px;
  opacity: 0.7; margin-top: 18px; text-transform: uppercase;
  color: var(--ink);
}
.psp-unameField {
  margin-top: 8px; width: min(380px, 90%); height: 48px; border-radius: 24px;
  background: var(--paper);
  border: var(--border);
  display: flex; align-items: center; padding: 0 16px; gap: 10px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;
}
.psp-unameField:focus-within {
  box-shadow: var(--shadow-md);
}
.psp-unameInput {
  flex: 1; border: none; background: transparent; outline: none;
  font: 800 15px/1 'Comfortaa', sans-serif;
  color: var(--ink); text-align: center;
  font-family: 'Comfortaa', sans-serif;
}
.psp-unameInput::placeholder { color: rgba(27, 42, 65, 0.35); }
.psp-unameInput:disabled { opacity: 0.5; cursor: not-allowed; }
.psp-lockNote {
  font-size: 11px; font-weight: 700; opacity: 0.65; margin-top: 6px;
  color: var(--ink);
}

/* ── Bottom sheet — clean paper ── */
.psp-sheet {
  background: var(--paper);
  border-top: var(--border);
  border-radius: 24px 24px 0 0;
  padding: 6px 0 20px;
  box-shadow: 0 -4px 24px rgba(27, 42, 65, 0.08);
  flex-shrink: 0; position: relative; z-index: 2;
}
.psp-tabs {
  display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 0 8px;
  border-bottom: 1.5px dashed rgba(27, 42, 65, 0.15);
}
.psp-tab {
  background: none; border: none; cursor: pointer; padding: 14px 0;
  font: 800 13px 'Comfortaa', sans-serif;
  color: var(--ink-soft, #5A6B82);
  display: flex; align-items: center; justify-content: center;
  gap: 6px; position: relative; transition: color 0.16s;
  font-family: 'Comfortaa', sans-serif;
}
.psp-tab.active { color: var(--blue); }
.psp-tab.active::after {
  content: ''; position: absolute; left: 22%; right: 22%; bottom: -1.5px;
  height: 3px; background: var(--blue); border-radius: 100px;
}

.psp-tabPanel {
  padding: 20px 18px 6px; min-height: 100px;
  display: flex; align-items: center; justify-content: center;
  gap: 14px; flex-wrap: wrap;
}

.psp-pickBtn {
  background: var(--paper);
  border: var(--border);
  cursor: pointer; padding: 10px;
  border-radius: 14px 16px 12px 18px;
  transition: transform 0.18s cubic-bezier(.34,1.4,.4,1), box-shadow 0.18s, background 0.18s;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm);
}
.psp-pickBtn:hover {
  transform: translate3d(-2px, -2px, 0) rotate(-3deg);
  box-shadow: var(--shadow-md);
  background: var(--yellow);
}
.psp-pickBtn:active { transform: translate3d(0,0,0); box-shadow: var(--shadow-sm); }
.psp-pickBtn.active {
  background: var(--blue);
  box-shadow: var(--shadow-md);
  transform: translate3d(-2px, -2px, 0);
}
.psp-pickBtn.active svg,
.psp-pickBtn.active svg * {
  stroke: #fff;
}

.psp-colorDot {
  width: 44px; height: 44px; border-radius: 50%;
  border: 2.5px solid var(--ink);
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(.34,1.4,.4,1), box-shadow 0.18s;
  box-shadow: var(--shadow-sm);
}
.psp-colorDot:hover { transform: translate3d(-2px, -2px, 0) rotate(-6deg); box-shadow: var(--shadow-md); }
.psp-colorDot.active {
  box-shadow: 0 0 0 3px var(--blue), var(--shadow-md);
  transform: translate3d(-2px, -2px, 0) scale(1.1);
}

/* ── Modal ── */
.psp-modalOverlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(27, 42, 65, 0.42);
  display: flex; align-items: center; justify-content: center;
  animation: psp-fade 0.18s ease;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.psp-modal {
  background: var(--paper);
  border: var(--border);
  border-radius: 24px;
  padding: 28px 24px 24px;
  width: 300px; text-align: center;
  animation: psp-bounceIn 0.36s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-lg);
}
.psp-modal h4 {
  margin: 4px 0 8px; font-size: 20px; font-weight: 800;
  color: var(--ink);
  font-family: 'Comfortaa', sans-serif;
}
.psp-modal p {
  margin: 0 0 20px; font-size: 13px;
  color: var(--ink-soft, #5A6B82);
  font-weight: 600; line-height: 1.55;
  font-family: 'Comfortaa', sans-serif;
}
.psp-modalBtns { display: flex; gap: 10px; }
.psp-modalBtn {
  flex: 1; padding: 13px;
  border: var(--border);
  border-radius: 100px;
  font: 800 14px 'Comfortaa', sans-serif;
  cursor: pointer;
  transition: transform 0.16s cubic-bezier(.34,1.4,.4,1), box-shadow 0.16s, background 0.16s;
  font-family: 'Comfortaa', sans-serif;
}
.psp-modalBtn:hover {
  transform: translate3d(-2px, -2px, 0);
  box-shadow: var(--shadow-sm);
}
.psp-modalBtn:active {
  transform: translate3d(0, 0, 0);
  box-shadow: none;
}
.psp-modalBtn.cancel {
  background: var(--paper);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.psp-modalBtn.ok {
  background: var(--coral);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
`;

/* ─────────── Editor ─────────── */
function Editor({ shape, eyes, color, username, locked, onSave, onCancel }) {
  const [s, setS] = useState(shape);
  const [e, setE] = useState(eyes);
  const [c, setC] = useState(color);
  const [n, setN] = useState(username);
  const [tab, setTab] = useState("body");
  const [pop, setPop] = useState(0);

  const bump = (fn, val) => { fn(val); setPop(p => p + 1); };

  const cfg  = COLOR_CONFIG[c] || COLOR_CONFIG["#FFD966"];
  const grad = `linear-gradient(160deg, ${cfg.bg1} 0%, ${cfg.bg2} 100%)`;

  return (
    <div className="psp-editor" style={{ "--psp-grad": grad, "--psp-blob-color": cfg.blob }}>
      <div className="psp-editBg" />
      <div className="psp-blob psp-blob1" />
      <div className="psp-blob psp-blob2" />

      <div className="psp-editTop">
        <div className="psp-edActions">
          <button className="psp-edAction x" onClick={onCancel} aria-label="Cancel">
            <I.X />
          </button>
          <button className="psp-edAction ok" onClick={() => onSave({ shape: s, eyes: e, color: c, name: n })} aria-label="Save">
            <I.Check />
          </button>
        </div>

        <div
          className={`psp-avatarWrap ${pop ? "pop" : ""}`}
          key={`ed-${s}-${e}-${c}-${pop}`}
          onAnimationEnd={() => setPop(0)}
        >
          <AvatarSVG shape={s} eyes={e} color={c} size={200} />
        </div>
        <div className="psp-shadow" />

        <div className="psp-unameLabel">Username</div>
        <div className="psp-unameField">
          <input
            className="psp-unameInput"
            value={n}
            onChange={ev => setN(ev.target.value)}
            disabled={locked}
            maxLength={16}
            placeholder="Your name"
            autoComplete="off"
          />
          {locked && <I.Lock />}
        </div>
        {locked && <div className="psp-lockNote">Can be changed once every 30 days</div>}
      </div>

      <div className="psp-sheet">
        <div className="psp-tabs">
          <button className={`psp-tab ${tab === "body"  ? "active" : ""}`} onClick={() => setTab("body")}><I.Body />    Body</button>
          <button className={`psp-tab ${tab === "eyes"  ? "active" : ""}`} onClick={() => setTab("eyes")}><I.EyeTab /> Eyes</button>
          <button className={`psp-tab ${tab === "color" ? "active" : ""}`} onClick={() => setTab("color")}><I.Palette /> Color</button>
        </div>
        <div className="psp-tabPanel">
          {tab === "body"  && SHAPES.map(sh => (
            <button key={sh} className={`psp-pickBtn ${s === sh ? "active" : ""}`} onClick={() => bump(setS, sh)}>
              <svg width="36" height="36" viewBox="0 0 36 36"><ShapeOutline shape={sh} size={36} /></svg>
            </button>
          ))}
          {tab === "eyes"  && EYES.map(ek => (
            <button key={ek} className={`psp-pickBtn ${e === ek ? "active" : ""}`} onClick={() => bump(setE, ek)}>
              <EyePreview kind={ek} />
            </button>
          ))}
          {tab === "color" && COLORS.map(col => (
            <button
              key={col}
              className={`psp-colorDot ${c === col ? "active" : ""}`}
              style={{ background: col }}
              onClick={() => bump(setC, col)}
              aria-label={col}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Default profile ─────────── */
const DEFAULT_PROFILE = {
  stylishUsername: "Your account",
  avatarShape: "square",
  avatarEyes: "oval",
  avatarColor: "#FFD966",
  loginMethod: "Google",
  usernameChangedAt: null,
};

/* ─────────── Main Panel ─────────── */
export default function ProfileSidePanel({ onClose, profile: propProfile, onUpdateProfile, onLogout }) {
  const [local,      setLocal]      = useState(propProfile || DEFAULT_PROFILE);
  const [closing,    setClosing]    = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [pop,        setPop]        = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    if (propProfile && !showEditor) setLocal(propProfile);
  }, [propProfile, showEditor]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 220);
  }, [onClose]);

  useEffect(() => {
    const h = ev => {
      if (panelRef.current && !panelRef.current.contains(ev.target)) handleClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [handleClose]);

  const locked = !!local.usernameChangedAt &&
    Date.now() - new Date(local.usernameChangedAt).getTime() < USERNAME_LOCK_MS;

  const cfg  = COLOR_CONFIG[local.avatarColor] || COLOR_CONFIG["#FFD966"];
  const grad = `linear-gradient(160deg, ${cfg.bg1} 0%, ${cfg.bg2} 100%)`;

  const handleSave = v => {
    const nameChanged = v.name && v.name !== local.stylishUsername;
    const updated = {
      ...local,
      avatarShape: v.shape,
      avatarEyes:  v.eyes,
      avatarColor: v.color,
      stylishUsername: v.name || local.stylishUsername,
      ...(nameChanged ? { usernameChangedAt: new Date().toISOString() } : {}),
    };
    setLocal(updated);
    onUpdateProfile?.(updated);
    setShowEditor(false);
    setPop(p => p + 1);
  };

  const handleLogout = () => {
    setShowLogout(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");

    handleClose();

    setTimeout(() => {
      if (onLogout) {
        onLogout();
      } else {
        window.location.reload();
      }
    }, 250);
  };

  return (
    <div className="psp-root">
      <style>{STYLES}</style>
      <div className="psp-backdrop" />

      <div
        ref={panelRef}
        className={`psp-panel ${closing ? "closing" : ""}`}
      >
        <div className="psp-panelBg" style={{ "--psp-grad": grad }} />

        <div className="psp-blob psp-blob1" style={{ "--psp-blob-color": cfg.blob }} />
        <div className="psp-blob psp-blob2" style={{ "--psp-blob-color": cfg.blob }} />
        <div className="psp-blob psp-blob3" style={{ "--psp-blob-color": cfg.blob }} />

        {/* Menu */}
        <div className="psp-menuCol">
          <button className="psp-circleBtn" onClick={() => setMenuOpen(m => !m)} aria-label="Menu">
            <I.Dots />
          </button>
          {menuOpen && (
            <>
              <button
                className="psp-circleBtn psp-menuItem"
                style={{ animationDelay: "0ms" }}
                onClick={() => { setMenuOpen(false); setShowEditor(true); }}
                aria-label="Edit profile"
              >
                <I.Pen />
              </button>
              <button
                className="psp-circleBtn psp-menuItem"
                style={{ animationDelay: "50ms" }}
                onClick={() => { setMenuOpen(false); setShowLogout(true); }}
                aria-label="Sign out"
              >
                <I.Logout />
              </button>
            </>
          )}
        </div>

        {/* Hero */}
        <div className="psp-hero">
          <div className="psp-avatarRing"  />
          <div className="psp-avatarRing2" />

          <div
            className={`psp-avatarWrap ${pop ? "pop" : ""}`}
            key={`${local.avatarShape}-${local.avatarEyes}-${local.avatarColor}-${pop}`}
            onAnimationEnd={() => setPop(0)}
          >
            <AvatarSVG
              shape={local.avatarShape}
              eyes={local.avatarEyes}
              color={local.avatarColor}
              size={196}
            />
          </div>
          <div className="psp-shadow" />

          <div className="psp-nameBlock">
            <h2 className="psp-title">{local.stylishUsername}</h2>
            <p className="psp-sub">Logged in with {local.loginMethod || "Google"}</p>
          </div>
        </div>

        {showEditor && (
          <Editor
            shape={local.avatarShape}
            eyes={local.avatarEyes}
            color={local.avatarColor}
            username={local.stylishUsername}
            locked={locked}
            onSave={handleSave}
            onCancel={() => setShowEditor(false)}
          />
        )}
      </div>

      <button
        className={`psp-extClose ${showEditor ? "hidden" : ""}`}
        onClick={handleClose}
        aria-label="Close panel"
        tabIndex={showEditor ? -1 : 0}
      >
        <I.ChevL />
      </button>

      {showLogout && (
        <div className="psp-modalOverlay" onClick={() => setShowLogout(false)}>
          <div className="psp-modal" onClick={ev => ev.stopPropagation()}>
            <h4>Sign out?</h4>
            <p>You'll need to log back in to access your profile.</p>
            <div className="psp-modalBtns">
              <button className="psp-modalBtn cancel" onClick={() => setShowLogout(false)}>
                Stay
              </button>
              <button className="psp-modalBtn ok" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProfileButton({ profile, onClick }) {
  if (!profile) return null;
  const cfg = COLOR_CONFIG[profile.avatarColor] || COLOR_CONFIG["#FFD966"];
  return (
    <button
      onClick={onClick}
      style={{
        width: 46, height: 46, borderRadius: "50%",
        border: `1.5px solid ${STROKE}`, cursor: "pointer",
        background: `linear-gradient(135deg, ${cfg.bg1}, ${cfg.bg2})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `3px 3px 0 ${STROKE}`,
        padding: 0, overflow: "hidden",
        transition: "transform 0.18s cubic-bezier(.34,1.4,.4,1), box-shadow 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translate(-2px, -2px) rotate(-4deg)";
        e.currentTarget.style.boxShadow = `4px 4px 0 ${STROKE}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translate(0, 0)";
        e.currentTarget.style.boxShadow = `3px 3px 0 ${STROKE}`;
      }}
      aria-label="Open profile"
    >
      <AvatarSVG
        shape={profile.avatarShape}
        eyes={profile.avatarEyes}
        color={profile.avatarColor}
        size={38}
      />
    </button>
  );
}