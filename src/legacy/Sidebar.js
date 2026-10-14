"use client";

// src/legacy/Sidebar.js — SHARX · Crayon Box Edition v3
//
// • NO tiles / circles / frames — every icon is its own colourful 3D
//   wax-crayon object (extruded body, dark outline, gloss, grain, wobble)
// • Original centered logo · no header text · no collapse toggle
// • Mobile drawer: swipe-left, Esc, scroll lock · same props & events
// • All inner classes are "sx-" namespaced so old CSS can't override them

import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import "./Sidebar.css";

/* ═══════════════════════════════════════════
   SVG DEFS — wax filter + 3D gloss gradient
═══════════════════════════════════════════ */
const CrayonDefs = memo(function CrayonDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* hand-drawn wobble + waxy grain */}
        <filter
          id="sharx-crayon"
          filterUnits="userSpaceOnUse"
          x="-4"
          y="-4"
          width="32"
          height="32"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.06"
            numOctaves="2"
            seed="4"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="0.8"
            xChannelSelector="R"
            yChannelSelector="G"
            result="wobbly"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.15"
            numOctaves="2"
            seed="9"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -6 0 0 0 5.15"
            result="grainAlpha"
          />
          <feComposite in="wobbly" in2="grainAlpha" operator="in" />
        </filter>

        {/* light from top-left, shade at the bottom → rounded 3D feel */}
        <linearGradient id="sx-gloss" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.62" stopColor="#8A4F9E" stopOpacity="0" />
          <stop offset="1" stopColor="#8A4F9E" stopOpacity="0.16" />
        </linearGradient>
      </defs>
    </svg>
  );
});

/* ═══════════════════════════════════════════
   COLOUR HELPERS
═══════════════════════════════════════════ */
const INK = "#1B2A41"; // only used by the UI chrome, never inside icons
const LINE = "#8A6A86"; // soft plum for fine detail lines
const EYE = "#5A4670"; // soft aubergine for tiny eyes
const CREAM = "#FFFDF2";

const FIXED = {
  w: CREAM,
  s: "#FFD9B8", // skin
  k: EYE,
  d: "#8C9CC4", // soft periwinkle (replaces navy)
  sky: "#BFE9FF",
  cy: "#7DF9FF",
  pk: "#FF9EC0",
};

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (a, b, t) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `#${A.map((v, i) =>
    Math.round(v + (B[i] - v) * t)
      .toString(16)
      .padStart(2, "0")
  ).join("")}`;
};


/* hue-preserving shade: outlines are a deeper version of each colour,
   so nothing ever turns black */
const rgbToHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  let h = 0, sat = 0;
  if (mx !== mn) {
    const d = mx - mn;
    sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, sat, l];
};

const hslToHex = (h, s2, l) => {
  const f2 = (n) => {
    const k = (n + h * 12) % 12;
    const a = s2 * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255).toString(16).padStart(2, "0");
  };
  return `#${f2(0)}${f2(8)}${f2(4)}`;
};

const shade = (hex, lightness, satBoost = 1) => {
  const rgb = hexToRgb(hex);
  const chroma = (Math.max(...rgb) - Math.min(...rgb)) / 255;
  // whites / creams → soft warm taupe outline (never olive or black)
  if (chroma < 0.16) return hslToHex(0.07, 0.24, Math.min(lightness + 0.26, 0.74));
  let [h, sat, l] = rgbToHsl(rgb);
  let lit = Math.min(lightness, l);
  // yellows darken toward warm orange instead of muddy olive
  if (h > 0.09 && h < 0.2) {
    h -= 0.04;
    lit = Math.min(lit * 1.1, 0.55);
  }
  return hslToHex(h, Math.min(1, sat * satBoost), lit);
};

const rgba = (hex, alpha) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/* ═══════════════════════════════════════════
   SHAPE BUILDERS
═══════════════════════════════════════════ */
const P = (d, c, o = {}) => ({ t: "path", d, c, ...o });
const C = (cx, cy, r, c, o = {}) => ({ t: "circle", cx, cy, r, c, ...o });
const E = (cx, cy, rx, ry, c, o = {}) => ({
  t: "ellipse",
  cx,
  cy,
  rx,
  ry,
  c,
  ...o,
});
const R = (x, y, w, h, rx, c, o = {}) => ({ t: "rect", x, y, w, h, rx, c, ...o });
const L = (d, c) => ({ t: "line", d, c }); // thick coloured stroke
const K = (d) => ({ t: "ink", d }); // thin dark detail line
const H = (d) => ({ t: "hl", d }); // cream highlight stroke

const f = (n) => Math.round(n * 100) / 100;

const poly = (pts) =>
  `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`;

const ngon = (cx, cy, n, r, rot = -90) =>
  poly(
    Array.from({ length: n }, (_, i) => {
      const a = ((rot + (360 / n) * i) * Math.PI) / 180;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    })
  );

const burst = (cx, cy, spikes, ro, ri, rot = -90) =>
  poly(
    Array.from({ length: spikes * 2 }, (_, i) => {
      const a = ((rot + (180 / spikes) * i) * Math.PI) / 180;
      const r = i % 2 === 0 ? ro : ri;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    })
  );

const ring = (cx, cy, ro, ri, c) =>
  P(
    `M${cx - ro} ${cy}a${ro} ${ro} 0 1 0 ${ro * 2} 0a${ro} ${ro} 0 1 0 ${-ro * 2} 0Z` +
      `M${cx - ri} ${cy}a${ri} ${ri} 0 1 1 ${ri * 2} 0a${ri} ${ri} 0 1 1 ${-ri * 2} 0Z`,
    c,
    { fr: "evenodd" }
  );

const gem = (cx, cy, rw, rh) =>
  poly([
    [cx - rw * 0.55, cy - rh],
    [cx + rw * 0.55, cy - rh],
    [cx + rw, cy - rh * 0.25],
    [cx, cy + rh],
    [cx - rw, cy - rh * 0.25],
  ]);

const seams = (cx, cy, r1, r2) =>
  Array.from({ length: 5 }, (_, i) => {
    const a = ((-90 + 72 * i) * Math.PI) / 180;
    return `M${f(cx + r1 * Math.cos(a))} ${f(cy + r1 * Math.sin(a))}L${f(
      cx + r2 * Math.cos(a)
    )} ${f(cy + r2 * Math.sin(a))}`;
  }).join("");

/* ═══════════════════════════════════════════
   ICON DEFINITIONS — each one a little 3D crayon toy
   a / b / c / g = that icon's own colours
═══════════════════════════════════════════ */
const ICON_DEFS = {
  "all games": {
    a: "#FFC933",
    b: "#FF6B8B",
    c: "#4BA3F5",
    g: "#2ED9A3",
    s: [
      R(3, 3, 7.5, 7.5, 2.4, "a"),
      R(13.5, 3, 7.5, 7.5, 2.4, "b"),
      R(3, 12.5, 7.5, 7.5, 2.4, "c"),
      R(13.5, 12.5, 7.5, 7.5, 2.4, "g"),
    ],
  },

  trending: {
    a: "#FF6B5B",
    b: "#FFE066",
    s: [
      P(
        "M12 2.5C13 6 18 8.5 18 14C18 17.9 15.3 20.5 12 20.5C8.7 20.5 6 17.9 6 14C6 11.4 7.4 9.7 8.7 8.2C9 9.8 9.7 10.8 10.6 11.2C10.3 7.8 10.9 4.8 12 2.5Z",
        "a"
      ),
      P(
        "M12 19.5C10 19.5 8.7 18.2 8.7 16.5C8.7 15 10 13.9 12 12C14 13.9 15.3 15 15.3 16.5C15.3 18.2 14 19.5 12 19.5Z",
        "b"
      ),
    ],
  },

  arcade: {
    a: "#9B7BFF",
    b: "#FFE066",
    c: "#FF6B8B",
    s: [
      P(
        "M7.5 7.5H16.5C19.5 7.5 21.5 9.8 21.8 12.8L22 16C22.2 18 20.6 19.6 18.8 19.2C17.4 18.9 16.8 18 15.8 16.6H8.2C7.2 18 6.6 18.9 5.2 19.2C3.4 19.6 1.8 18 2 16L2.2 12.8C2.5 9.8 4.5 7.5 7.5 7.5Z",
        "a"
      ),
      P(
        "M7 10.5H9V12.3H10.8V14.3H9V16.1H7V14.3H5.2V12.3H7Z",
        "w"
      ),
      C(15.6, 11.8, 1.5, "b"),
      C(18.4, 14.6, 1.5, "c"),
    ],
  },

  hypercasual: {
    a: "#2ED9A3",
    b: "#FFE066",
    s: [P(burst(12, 11.5, 8, 9.8, 6.6), "a"), C(12, 11.5, 3.7, "b")],
  },

  puzzle: {
    a: "#FF7EB6",
    s: [
      P(
        "M9 3.4h3.4a1.5 1.5 0 0 1 1.4 2 1.8 1.8 0 0 0 3 1.8 1.5 1.5 0 0 1 2.5 1v3.4a1.5 1.5 0 0 1-2 1.4 1.8 1.8 0 0 0-1.7 3 1.5 1.5 0 0 1-1 2.5H11a1.5 1.5 0 0 1-1.4-2 1.8 1.8 0 0 0-3-1.8 1.5 1.5 0 0 1-2.5-1v-3.4a1.5 1.5 0 0 1 2-1.4A1.8 1.8 0 0 0 8 5.7 1.5 1.5 0 0 1 9 3.4Z",
        "a"
      ),
    ],
  },

  action: {
    a: "#FFB02E",
    s: [
      P("M13.5 2.5L5 13.2H10.2L8.8 21L19 9.8H13.6Z", "a"),
      H("M12.4 5.4L8.4 10.6"),
    ],
  },

  shooting: {
    a: "#FF5C5C",
    b: "#FFE066",
    s: [
      C(12, 11.5, 9.2, "w"),
      C(12, 11.5, 6, "a", { flat: true }),
      C(12, 11.5, 2.9, "w", { flat: true }),
      L("M12 11.5L19.2 4.3", "d"),
      P("M17.6 6L18.6 2.6L21.8 5.6Z", "b", { flat: true }),
    ],
  },

  sports: {
    a: "#FFC933",
    b: "#FF9E3D",
    s: [
      P(
        "M7 5.2H4.3C3.5 5.2 3 5.8 3.1 6.6C3.4 9.3 5 10.8 7.4 11.2L7.2 9.4C5.9 9.1 5.1 8.2 4.9 6.9H7Z",
        "b"
      ),
      P(
        "M17 5.2H19.7C20.5 5.2 21 5.8 20.9 6.6C20.6 9.3 19 10.8 16.6 11.2L16.8 9.4C18.1 9.1 18.9 8.2 19.1 6.9H17Z",
        "b"
      ),
      R(10.4, 13.2, 3.2, 4.2, 0.8, "b"),
      R(7.2, 17, 9.6, 3.4, 1.4, "b"),
      P(
        "M7 3.5H17V8.5C17 11.6 14.8 13.8 12 13.8C9.2 13.8 7 11.6 7 8.5Z",
        "a"
      ),
      P(burst(12, 8.3, 5, 2.7, 1.2), "w", { bare: true }),
    ],
  },

  girls: {
    a: "#FF8FC7",
    b: "#9B6BFF",
    c: "#FFE066",
    s: [
      P(
        "M6.2 9.6C6 5.4 8.5 3.2 12 3.2C15.5 3.2 18 5.4 17.8 9.6C17.8 12.6 18.2 14.4 19 15.8L5 15.8C5.8 14.4 6.2 12.6 6.2 9.6Z",
        "b"
      ),
      P("M4.6 21.2C5 17.6 7.8 15.8 12 15.8C16.2 15.8 19 17.6 19.4 21.2Z", "a"),
      C(12, 10, 3.9, "s", { flat: true }),
      P(
        "M8.1 9.4C8.4 6.6 9.9 5.6 12 5.6C14.1 5.6 15.6 6.6 15.9 9.4C14.6 8.2 13.3 7.7 12 7.7C10.7 7.7 9.4 8.2 8.1 9.4Z",
        "b",
        { flat: true }
      ),
      C(10.4, 10.5, 0.8, "k", { bare: true }),
      C(13.6, 10.5, 0.8, "k", { bare: true }),
      C(12, 12.1, 0.55, "pk", { bare: true }),
      C(17, 5.2, 2, "c", { flat: true }),
    ],
  },

  clicker: {
    a: "#FFC933",
    b: "#FF6B5B",
    s: [
      P(burst(7, 5.5, 8, 5.4, 3.1), "a"),
      P("M7 5.5V19.5L10.6 16.2L13.1 21.6L15.5 20.5L13.1 15L18 14.8Z", "w"),
    ],
  },

  racing: {
    a: "#3CC4EA",
    b: "#FF6B5B",
    s: [
      R(3.6, 10.3, 6.4, 2.8, 1.3, "b", { flat: true }),
      R(14, 10.3, 6.4, 2.8, 1.3, "b", { flat: true }),
      R(10.6, 13.2, 2.8, 6.4, 1.3, "b", { flat: true }),
      ring(12, 11.5, 9.2, 6.2, "a"),
      C(12, 11.5, 3.1, "c2", { flat: true }),
      C(12, 11.5, 1.2, "w", { bare: true }),
    ],
    c2: "#FFC933",
  },

  multiplayer: {
    a: "#C77DFF",
    b: "#4BA3F5",
    s: [
      P("M12.6 19.8C12.9 16 14.6 14 17 14C19.4 14 21.1 16 21.4 19.8Z", "b"),
      C(17, 8.6, 2.9, "s"),
      P("M2.8 20.6C3.2 16.4 5.6 14.2 9 14.2C12.4 14.2 14.8 16.4 15.2 20.6Z", "a"),
      C(9, 8.2, 3.5, "s"),
    ],
  },

  adventure: {
    a: "#8FD14F",
    b: "#FF5C5C",
    c: "#6B7C93",
    s: [
      C(12, 11.5, 9.2, "a"),
      C(12, 11.5, 6.4, "w", { flat: true }),
      P("M15.9 7.6L13.4 12.9L10.6 10.1Z", "b", { flat: true }),
      P("M8.1 15.4L10.6 10.1L13.4 12.9Z", "c", { flat: true }),
      C(12, 11.5, 0.9, "w", { bare: true }),
    ],
  },

  stickman: {
    a: "#FF8A47",
    b: "#4BA3F5",
    s: [
      L("M5.8 12.6L12 9.8L18.2 12.6", "b"),
      L("M12 9.8V14.8", "b"),
      L("M12 14.8L7.8 21", "b"),
      L("M12 14.8L16.2 21", "b"),
      C(12, 5.4, 3.2, "a"),
    ],
  },

  ai: {
    a: "#A98BFF",
    b: "#FFC933",
    s: [
      L("M12 7V3.9", "b"),
      C(12, 3.2, 1.5, "b"),
      R(2.2, 10.4, 2.6, 4.8, 1.1, "b"),
      R(19.2, 10.4, 2.6, 4.8, 1.1, "b"),
      R(4.4, 6.6, 15.2, 12.6, 4, "a"),
      R(7, 9.2, 10, 7, 2.6, "d"),
      C(10.2, 12.3, 1.25, "cy", { bare: true }),
      C(13.8, 12.3, 1.25, "cy", { bare: true }),
      H("M10.7 14.6Q12 15.4 13.3 14.6"),
    ],
  },

  cooking: {
    a: "#FF9A5C",
    b: "#FFE066",
    s: [
      K("M8.4 4.4Q9.6 3.2 8.4 2M15.6 4.4Q16.8 3.2 15.6 2"),
      R(1.6, 11.4, 3, 2.4, 1.2, "d"),
      R(19.4, 11.4, 3, 2.4, 1.2, "d"),
      C(12, 5.5, 1.5, "a"),
      P(
        "M4.2 9.6H19.8V17.4C19.8 19 18.6 20.2 17 20.2H7C5.4 20.2 4.2 19 4.2 17.4Z",
        "a"
      ),
      P(
        "M3.4 9.8C3.4 7.8 7 6.4 12 6.4C17 6.4 20.6 7.8 20.6 9.8Z",
        "b"
      ),
    ],
  },

  horror: {
    a: "#C9B8FF",
    s: [
      P(
        "M12 3C7.6 3 4.5 6.2 4.5 10.5V19.5L6.5 17.8L9.2 19.8L12 17.8L14.8 19.8L17.5 17.8L19.5 19.5V10.5C19.5 6.2 16.4 3 12 3Z",
        "a"
      ),
      E(9.3, 10.2, 1.2, 1.7, "k", { bare: true }),
      E(14.7, 10.2, 1.2, 1.7, "k", { bare: true }),
      E(12, 14.2, 1.5, 1.9, "k", { bare: true }),
      C(7.3, 13, 1.1, "pk", { bare: true }),
      C(16.7, 13, 1.1, "pk", { bare: true }),
    ],
  },

  football: {
    a: "#32B96B",
    s: [
      C(12, 11.5, 9.2, "w"),
      P(ngon(12, 11.5, 5, 3.3), "a", { flat: true }),
      K(seams(12, 11.5, 3.3, 8.2)),
    ],
  },

  simulator: {
    a: "#5BB7D6",
    b: "#FFC933",
    s: [
      R(10.4, 15.6, 3.2, 3.8, 0.6, "b", { flat: true }),
      R(7, 18.8, 10, 2.4, 1.2, "b"),
      R(2.8, 3.4, 18.4, 13, 2.6, "a"),
      R(5.2, 5.8, 13.6, 8.2, 1.2, "sky", { flat: true }),
      P("M10.5 7.8V12L14.3 9.9Z", "b", { flat: true }),
    ],
  },

  bike: {
    a: "#FF8A47",
    b: "#FFE066",
    c: "#4BA3F5",
    s: [
      ring(6, 16.6, 4.6, 2.7, "c"),
      ring(18, 16.6, 4.6, 2.7, "c"),
      L("M6 16.6L9.6 9H14.6L18 16.6", "a"),
      L("M14.6 9L13.8 5.4H16.8", "b"),
      R(7.2, 6.4, 4.6, 2, 1, "b", { flat: true }),
    ],
  },

  casual: {
    a: "#FFD23F",
    b: "#FF9EC0",
    s: [
      C(12, 11.5, 9, "a"),
      C(6.9, 13.2, 1.4, "pk", { bare: true }),
      C(17.1, 13.2, 1.4, "pk", { bare: true }),
      E(9, 9.6, 1.1, 1.6, "k", { bare: true }),
      E(15, 9.6, 1.1, 1.6, "k", { bare: true }),
      K("M8 13.6C8.9 15.9 10.3 16.8 12 16.8S15.1 15.9 16 13.6"),
    ],
  },

  "2 player": {
    a: "#FF7A9C",
    b: "#4BA3F5",
    c: "#FFC933",
    s: [
      P("M2.2 20.6C2.5 16.4 4.6 14.4 7.3 14.4C10 14.4 12.1 16.4 12.4 20.6Z", "a"),
      C(7.3, 9, 3.1, "s"),
      P("M11.6 20.6C11.9 16.4 14 14.4 16.7 14.4C19.4 14.4 21.5 16.4 21.8 20.6Z", "b"),
      C(16.7, 9, 3.1, "s"),
      P(burst(12, 3.9, 5, 2.8, 1.3), "c"),
    ],
  },

  car: {
    a: "#FF6F7D",
    b: "#FFE066",
    s: [
      P(
        "M2.6 16.2V12.6C2.6 11.6 3.1 10.8 4 10.4L6 6.8C6.5 5.9 7.3 5.4 8.3 5.4H15.7C16.7 5.4 17.5 5.9 18 6.8L20 10.4C20.9 10.8 21.4 11.6 21.4 12.6V16.2C21.4 17 20.8 17.6 20 17.6H4C3.2 17.6 2.6 17 2.6 16.2Z",
        "a"
      ),
      P("M8.3 7.2H11.3V10.2H6.2Z", "sky", { flat: true }),
      P("M12.7 7.2H15.7L17.8 10.2H12.7Z", "sky", { flat: true }),
      C(4.6, 13.4, 1.1, "b", { bare: true }),
      C(19.4, 13.4, 1.1, "b", { bare: true }),
      C(7, 17.8, 2.7, "d"),
      C(17, 17.8, 2.7, "d"),
      C(7, 17.8, 1, "w", { bare: true }),
      C(17, 17.8, 1, "w", { bare: true }),
    ],
  },

  dressup: {
    a: "#FF7EB6",
    b: "#FFE066",
    s: [
      P(
        "M9 3C9 5 10.3 6.2 12 6.2C13.7 6.2 15 5 15 3L16.6 3.8L15.8 9.4L20.2 20C20.4 20.6 20 21 19.4 21H4.6C4 21 3.6 20.6 3.8 20L8.2 9.4L7.4 3.8Z",
        "a"
      ),
      P("M8.2 9.6H15.8L15.4 11.6H8.6Z", "b"),
      C(7.8, 17, 0.9, "w", { bare: true }),
      C(12, 15.4, 0.9, "w", { bare: true }),
      C(16.2, 17.4, 0.9, "w", { bare: true }),
      C(10, 19, 0.8, "w", { bare: true }),
      C(14.4, 19.2, 0.8, "w", { bare: true }),
    ],
  },

  bubble: {
    a: "#5CC8FF",
    b: "#FF8FC7",
    c: "#2ED9A3",
    s: [
      C(9.8, 10.8, 6.8, "a"),
      C(17.6, 17, 3.6, "b"),
      C(18.6, 5.8, 1.9, "c"),
      H("M6 9.6Q6.8 7.4 9.2 6.6"),
      H("M16.5 15.6Q17 15 17.9 14.8"),
    ],
  },

  match3: {
    a: "#FF6BB5",
    b: "#4BA3F5",
    c: "#2ED9A3",
    s: [
      P(gem(7.2, 7.6, 4.4, 4.2), "a"),
      K("M2.8 6.55H11.6"),
      P(gem(16.8, 7.2, 4.2, 4), "b"),
      K("M12.6 6.2H21"),
      P(gem(12, 16, 4.6, 4.4), "c"),
      K("M7.4 14.9H16.6"),
    ],
  },
};

const DEFAULT_DEF = {
  a: "#9AA9BF",
  s: [
    C(12, 11.5, 9, "a"),
    L("M9.4 9.2a2.6 2.6 0 0 1 5.1.8c0 1.8-2.5 2.2-2.5 3.9", "w"),
    C(12, 17.4, 1, "w", { bare: true }),
  ],
};

/* ═══════════════════════════════════════════
   ICON RENDERER — extrusion + outline + gloss
═══════════════════════════════════════════ */
const SW = 1.25; // outline width
const SWF = 1.05; // flat (inner detail) outline width
const LW = 2.5; // coloured line width
const LO = 4; // line outline width
const DEPTH = 1.1; // 3D thickness

const resolve = (role, def) => FIXED[role] || def[role] || role;

const geo = (s, props) => {
  switch (s.t) {
    case "circle":
      return <circle cx={s.cx} cy={s.cy} r={s.r} {...props} />;
    case "ellipse":
      return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...props} />;
    case "rect":
      return (
        <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} {...props} />
      );
    default:
      return <path d={s.d} fillRule={s.fr} {...props} />;
  }
};

const buildIcon = (def) => {
  const base = def.a;
  const glow = shade(base, 0.62); // tinted soft shadow colour
  const solid = def.s.filter(
    (s) => s.t !== "ink" && s.t !== "hl" && !s.bare && !s.flat
  );

  /* soft coloured ground shadow (no black) */
  const shadow = solid.map((s, i) =>
    s.t === "line" ? (
      <path
        key={`sh${i}`}
        d={s.d}
        stroke={glow}
        strokeWidth={LO}
        fill="none"
      />
    ) : (
      geo(s, { key: `sh${i}`, fill: glow, stroke: glow, strokeWidth: SW })
    )
  );

  const layers = def.s.map((s, i) => {
    if (s.t === "ink") {
      return (
        <path
          key={i}
          d={s.d}
          stroke={LINE}
          strokeOpacity="0.8"
          strokeWidth="1.3"
          fill="none"
        />
      );
    }
    if (s.t === "hl") {
      return (
        <path
          key={i}
          d={s.d}
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeOpacity="0.95"
          fill="none"
        />
      );
    }

    const raw = resolve(s.c, def);
    const face = mix(raw, "#ffffff", 0.1);
    const edge = shade(raw, 0.4, 1.05); // hue-matched outline
    const deep = shade(raw, 0.52, 1.02); // extrusion side

    if (s.t === "line") {
      return (
        <g key={i} fill="none">
          <g transform={`translate(0 ${DEPTH})`}>
            <path d={s.d} stroke={edge} strokeWidth={LO} />
            <path d={s.d} stroke={deep} strokeWidth={LW} />
          </g>
          <path d={s.d} stroke={edge} strokeWidth={LO} />
          <path d={s.d} stroke={face} strokeWidth={LW} />
          <path d={s.d} stroke="url(#sx-gloss)" strokeWidth={LW} />
        </g>
      );
    }

    if (s.bare) {
      return geo(s, { key: i, fill: face, stroke: "none" });
    }

    const eyeish = s.c === "k";

    if (s.flat) {
      return (
        <g key={i}>
          {geo(s, { fill: face, stroke: edge, strokeWidth: SWF })}
          {!eyeish &&
            geo(s, {
              fill: "url(#sx-gloss)",
              stroke: "none",
              pointerEvents: "none",
            })}
        </g>
      );
    }

    return (
      <g key={i}>
        <g transform={`translate(0 ${DEPTH})`}>
          {geo(s, { fill: deep, stroke: edge, strokeWidth: SW })}
        </g>
        {geo(s, { fill: face, stroke: edge, strokeWidth: SW })}
        {!eyeish &&
          geo(s, {
            fill: "url(#sx-gloss)",
            stroke: "none",
            pointerEvents: "none",
          })}
      </g>
    );
  });

  return (
    <svg
      viewBox="-1 -1 26 26"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      <g filter="url(#sharx-crayon)">
        <g opacity="0.3" transform="translate(0.6 2.3)">
          {shadow}
        </g>
        {layers}
      </g>
    </svg>
  );
};

/* ═══════════════════════════════════════════
   KEY MAPPING / ALIASES
═══════════════════════════════════════════ */
const normalizeKey = (label = "") => String(label).trim().toLowerCase();

const ALIASES = {
  all: "all games",
  "all games": "all games",
  trending: "trending",

  hyper: "hypercasual",
  "hyper casual": "hypercasual",
  "hyper-casual": "hypercasual",
  hypercasual: "hypercasual",

  girl: "girls",
  girls: "girls",
  dressup: "dressup",
  "dress up": "dressup",
  "dress-up": "dressup",
  fashion: "dressup",

  shooting: "shooting",
  shooter: "shooting",
  shoot: "shooting",
  gun: "shooting",

  sport: "sports",
  sports: "sports",
  football: "football",
  soccer: "football",
  "soccer ball": "football",

  multiplayer: "multiplayer",
  multi: "multiplayer",
  multi_player: "multiplayer",
  "multi player": "multiplayer",
  "two player": "2 player",
  "2 player": "2 player",
  "2player": "2 player",
  "2-player": "2 player",
  duo: "2 player",
  co_op: "multiplayer",
  "co-op": "multiplayer",
  coop: "multiplayer",

  bike: "bike",
  moto: "bike",
  motorcycle: "bike",
  car: "car",
  cars: "car",
  driving: "car",

  racing: "racing",
  race: "racing",

  clicker: "clicker",
  click: "clicker",
  idle: "clicker",
  "idle game": "clicker",

  horror: "horror",
  scary: "horror",
  zombie: "horror",

  simulator: "simulator",
  sim: "simulator",
  simulation: "simulator",

  cooking: "cooking",
  food: "cooking",
  restaurant: "cooking",

  casual: "casual",

  ai: "ai",
  "artificial intelligence": "ai",
  "a.i.": "ai",

  action: "action",
  adventure: "adventure",
  arcade: "arcade",
  puzzle: "puzzle",
  stickman: "stickman",

  bubble: "bubble",
  "bubble shooter": "bubble",
  bubbles: "bubble",
  match3: "match3",
  "match 3": "match3",
  "match-3": "match3",
  match: "match3",
  gems: "match3",
};

const FALLBACK_COLORS = [
  "#FFC933",
  "#FF7A59",
  "#2ED9A3",
  "#9B7BFF",
  "#4BA3F5",
  "#FF7EB6",
  "#7ED348",
  "#FF9A5C",
];

const ICON_CACHE = new Map();

/* returns { icon (svg element), base (main colour) } */
const getIconFor = (category) => {
  const key = normalizeKey(category);
  const mapped = ALIASES[key] || key;
  let def = ICON_DEFS[mapped];

  if (!def) {
    let sum = 0;
    for (let i = 0; i < key.length; i += 1) sum += key.charCodeAt(i);
    def = { ...DEFAULT_DEF, a: FALLBACK_COLORS[sum % FALLBACK_COLORS.length] };
  }

  const cacheKey = `${mapped}|${def.a}`;
  if (!ICON_CACHE.has(cacheKey)) {
    ICON_CACHE.set(cacheKey, { icon: buildIcon(def), base: def.a });
  }
  return ICON_CACHE.get(cacheKey);
};

const getDataCat = (category) => {
  const key = normalizeKey(category);
  return key === "all" ? "all" : key.replace(/[^a-z0-9]+/g, "-");
};

/* ═══════════════════════════════════════════
   SMALL ICONS
═══════════════════════════════════════════ */
const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 4l16 16M20 4 4 20" />
  </svg>
);

/* tiny crayon that pops in next to the active item */
const MiniCrayon = () => (
  <svg
    className="sx-pencil"
    viewBox="0 0 30 12"
    aria-hidden="true"
    focusable="false"
  >
    <path
      className="sx-pencil-body"
      d="M2.2 6 6.6 1.9h20.2c.9 0 1.6.7 1.6 1.6v5c0 .9-.7 1.6-1.6 1.6H6.6Z"
    />
    <rect className="sx-pencil-band" x="14" y="2.7" width="5" height="6.6" />
    <path className="sx-pencil-tip" d="M2.2 6 4.5 3.86v4.28Z" />
  </svg>
);

/* ═══════════════════════════════════════════
   SIDEBAR ITEM
═══════════════════════════════════════════ */
const SidebarItem = memo(function SidebarItem({ cat, index, isOn, onPick }) {
  const label = cat === "All" ? "All Games" : cat;
  const { icon, base } = getIconFor(cat);
  const vars = {
    "--tile": base,
    "--tile-soft": mix(base, "#ffffff", 0.7),
    "--tile-wash": rgba(base, 0.24),
    "--i": index,
  };

  return (
    <button
      type="button"
      data-cat={getDataCat(cat)}
      className={`sx-item ${isOn ? "sx-item-on" : ""}`}
      style={vars}
      onClick={() => onPick(cat)}
      aria-current={isOn ? "true" : undefined}
    >
      <span className="sx-ico">{icon}</span>
      <span className="sx-label">{label}</span>
      {isOn && <MiniCrayon />}
    </button>
  );
});

/* ═══════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════ */
function Sidebar({
  categories = [],
  activeCategory,
  onSelectCategory,
  open,
  onClose,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  const navRef = useRef(null);
  const touchStartX = useRef(null);

  /* enable transitions only after first paint */
  useEffect(() => {
    let r2 = 0;
    const r1 = window.requestAnimationFrame(() => {
      r2 = window.requestAnimationFrame(() => setReady(true));
    });
    return () => {
      window.cancelAnimationFrame(r1);
      if (r2) window.cancelAnimationFrame(r2);
    };
  }, []);

  /* sidebar is always expanded now — tell Home */
  useEffect(() => {
    try {
      window.dispatchEvent(
        new CustomEvent("sharx:sidebar-changed", {
          detail: { collapsed: false },
        })
      );
    } catch {}
  }, []);

  /* Track mobile media query */
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(max-width: 900px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const handlePick = useCallback(
    (cat) => {
      onSelectCategory?.(cat);
      onClose?.();
    },
    [onSelectCategory, onClose]
  );

  /* Escape closes mobile drawer */
  useEffect(() => {
    if (!isMobile || !open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, open, onClose]);

  /* Lock page scroll while the mobile drawer is open */
  useEffect(() => {
    if (!isMobile || !open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, open]);

  /* Keep the active item visible inside the scrolling nav */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const el = nav.querySelector('[aria-current="true"]');
    if (!el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < nav.scrollTop + 12) {
      nav.scrollTo({ top: Math.max(top - 12, 0), behavior: "smooth" });
    } else if (bottom > nav.scrollTop + nav.clientHeight - 30) {
      nav.scrollTo({
        top: bottom - nav.clientHeight + 30,
        behavior: "smooth",
      });
    }
  }, [activeCategory, categories.length]);

  /* Swipe left to close (mobile) */
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  }, []);
  const onTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current == null) return;
      const endX = e.changedTouches?.[0]?.clientX ?? touchStartX.current;
      const dx = endX - touchStartX.current;
      touchStartX.current = null;
      if (isMobile && open && dx < -60) onClose?.();
    },
    [isMobile, open, onClose]
  );

  const classes = ["sidebar", "sidebar-expanded", "sx-aside"];
  if (ready) classes.push("sx-ready");
  if (isMobile && open) classes.push("sidebar-open", "sx-open");

  return (
    <>
      <CrayonDefs />

      {open && (
        <div
          className="sx-scrim"
          role="button"
          aria-label="Close menu"
          tabIndex={0}
          onClick={onClose}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onClose?.();
          }}
        />
      )}

      <aside
        className={classes.join(" ")}
        aria-label="Game categories"
        data-collapsed="false"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="sx-brand">
          <div className="sx-logo">
            <Image
              src="/sharx-logo.webp"
              alt="Sharx"
              width={72}
              height={72}
              priority
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          <button
            type="button"
            className="sx-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav
          id="sharx-sidebar-nav"
          ref={navRef}
          className="sx-nav"
          aria-label="Categories"
        >
          {categories.map((cat, index) => (
            <SidebarItem
              key={cat}
              cat={cat}
              index={index}
              isOn={cat === activeCategory}
              onPick={handlePick}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

export default memo(Sidebar);