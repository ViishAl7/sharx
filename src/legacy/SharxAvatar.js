"use client";
// SharxAvatar.js — SHARX hand-painted avatar.
// Same props as the old AvatarSVG (shape, eyes, color, size, flat) so saved
// profile data (avatarShape / avatarEyes / avatarColor) keeps working as-is.
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const INK = "#1B2A41";
const PAPER = "#FFFDF7";
const FLECKS = ["#FFD966", "#FF8B7B", "#7BE5B5", "#2E7FE8", "#C7B4FF"];

/* ─── GLOBAL UNIQUE COUNTER for fleck keys ─── */
let fleckCounter = 0;

/* Per-shape personality: eye placement + how the body idles */
const PERS = {
  circle:  { ey: 48, gap: 15,   k: 1.00, amp: 0.03,  dur: 3.8, ground: 90.0 },
  square:  { ey: 50, gap: 16,   k: 0.95, amp: 0.014, dur: 4.8, ground: 89.0 },
  star:    { ey: 53, gap: 11.5, k: 0.90, amp: 0.022, dur: 2.9, ground: 86.0 },
  hexagon: { ey: 50, gap: 13.5, k: 0.90, amp: 0.012, dur: 5.2, ground: 86.5 },
  heart:   { ey: 57, gap: 14,   k: 0.95, amp: 0.026, dur: 3.4, ground: 83.0 },
};
const EYE_KINDS = ["round", "oval", "sleepy", "wink"];

/* ─── Geometry (100×100 space) ─── */
const N = 72;
const M = 360;

function roundPoly(v, r) {
  const out = [];
  const n = v.length;
  const dir = (a, b) => {
    const dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };
  for (let i = 0; i < n; i++) {
    const p0 = v[(i + n - 1) % n], p = v[i], p2 = v[(i + 1) % n];
    const d1 = dir(p0, p), d2 = dir(p2, p);
    const a = [p[0] + d1[0] * r, p[1] + d1[1] * r];
    const b = [p[0] + d2[0] * r, p[1] + d2[1] * r];
    for (let s = 0; s <= 6; s++) {
      const t = s / 6, u = 1 - t;
      out.push([
        u * u * a[0] + 2 * u * t * p[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * p[1] + t * t * b[1],
      ]);
    }
  }
  return out;
}

function uniform(poly, n) {
  const pts = poly.concat([poly[0]]);
  const seg = [0];
  for (let i = 1; i < pts.length; i++)
    seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = seg[seg.length - 1];
  const out = [];
  let k = 0;
  for (let i = 0; i < n; i++) {
    const t = (total * i) / n;
    while (seg[k + 1] < t) k++;
    const f = (t - seg[k]) / (seg[k + 1] - seg[k] || 1);
    out.push([
      pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f,
      pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f,
    ]);
  }
  return out;
}

/* ─── Natural crayon outlines ─── */
function rawOutline(shape) {
  const ring = (k, rOf) =>
    Array.from({ length: k }, (_, i) => {
      const a = (Math.PI * 2 * i) / k - Math.PI / 2;
      const r = rOf(i);
      return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
    });

  if (shape === "circle") {
    return ring(96, () => 39);
  }

  if (shape === "square") {
    return roundPoly(
      [
        [12, 12],
        [88, 12],
        [88, 88],
        [12, 88],
      ],
      10
    );
  }

  if (shape === "star") {
    return roundPoly(
      ring(10, (i) => (i % 2 ? 20 : 43)),
      3
    );
  }

  if (shape === "hexagon") {
    const v = Array.from({ length: 6 }, (_, i) => [
      50 + 41 * Math.cos((Math.PI / 3) * i),
      50 + 41 * Math.sin((Math.PI / 3) * i),
    ]);
    return roundPoly(v, 5);
  }

  if (shape === "heart") {
    const c = (p0, p1, p2, p3) =>
      Array.from({ length: 40 }, (_, i) => {
        const t = i / 40, u = 1 - t;
        return [0, 1].map(
          (k) =>
            u * u * u * p0[k] +
            3 * u * u * t * p1[k] +
            3 * u * t * t * p2[k] +
            t * t * t * p3[k]
        );
      });
    return c([50, 81], [-4, 54], [6, 21], [50, 43]).concat(
      c([50, 43], [94, 21], [104, 54], [50, 81])
    );
  }

  return ring(96, () => 39);
}

const cache = {};
function pointsFor(shape) {
  if (cache[shape]) return cache[shape];
  const dense = uniform(rawOutline(shape), M);
  let best = 0, bd = 1e9;
  dense.forEach((p, i) => {
    if (p[1] < 50) {
      const d = Math.abs(p[0] - 50) + p[1] * 0.02;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
  });
  const rot = dense.slice(best).concat(dense.slice(0, best));
  const pts = rot.filter((_, i) => i % (M / N) === 0).map((p, i) => {
    const w =
      0.42 * (Math.sin(i * 0.55 + 1.3) + 0.6 * Math.sin(i * 1.3 + 0.4));
    const a = (i / N) * Math.PI * 2;
    return [p[0] + w * Math.cos(a), p[1] + w * Math.sin(a)];
  });
  return (cache[shape] = pts);
}

const f2 = (n) => Math.round(n * 100) / 100;
function toPath(p) {
  const n = p.length;
  let d = `M${f2(p[0][0])} ${f2(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i + n - 1) % n],
      p1 = p[i],
      p2 = p[(i + 1) % n],
      p3 = p[(i + 2) % n];
    d += `C${f2(p1[0] + (p2[0] - p0[0]) / 6)} ${f2(
      p1[1] + (p2[1] - p0[1]) / 6
    )} ${f2(p2[0] - (p3[0] - p1[0]) / 6)} ${f2(
      p2[1] - (p3[1] - p1[1]) / 6
    )} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return d + "Z";
}

function mixHex(base, target, amt) {
  const parse = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = parse(base),
    b = parse(target);
  return (
    "#" +
    a
      .map((v, i) =>
        Math.round(v + (b[i] - v) * amt)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

/* ─── Eyes — simple, cute, natural crayon ─── */
function EyeShape({ kind, x, y, k, sw }) {
  if (kind === "oval") {
    const rx = 6.6 * k,
      ry = 12 * k;
    return (
      <>
        <ellipse
          cx={x}
          cy={y}
          rx={rx}
          ry={ry}
          fill={PAPER}
          stroke={INK}
          strokeWidth={sw}
        />
        <g className="sx-look">
          <ellipse
            cx={x}
            cy={y + ry * 0.16}
            rx={rx * 0.66}
            ry={ry * 0.62}
            fill={INK}
          />
          <circle
            cx={x - rx * 0.24}
            cy={y - ry * 0.18}
            r={rx * 0.24}
            fill="#fff"
          />
        </g>
      </>
    );
  }

  if (kind === "sleepy") {
    const rx = 8.4 * k,
      ry = 6.4 * k;
    return (
      <>
        <ellipse
          cx={x}
          cy={y}
          rx={rx}
          ry={ry}
          fill={PAPER}
          stroke={INK}
          strokeWidth={sw}
        />
        <g className="sx-look">
          <circle cx={x} cy={y + ry * 0.25} r={4.3 * k} fill={INK} />
          <circle cx={x - 1.4 * k} cy={y + ry * 0.05} r={1.2 * k} fill="#fff" />
        </g>
        <path
          d={`M${x - rx} ${y}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`}
          style={{ fill: "var(--sx-c)" }}
          stroke={INK}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      </>
    );
  }

  const r = 8.4 * k;
  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={PAPER}
        stroke={INK}
        strokeWidth={sw}
      />
      <g className="sx-look">
        <circle cx={x} cy={y} r={r * 0.54} fill={INK} />
        <circle
          cx={x - r * 0.24}
          cy={y - r * 0.28}
          r={r * 0.2}
          fill="#fff"
        />
      </g>
    </>
  );
}

function ClosedEye({ x, y, k, sw }) {
  return (
    <path
      d={`M${x - 8.2 * k} ${y}Q${x} ${y + 9.5 * k} ${x + 8.2 * k} ${y}`}
      fill="none"
      stroke={INK}
      strokeWidth={sw * 1.15}
      strokeLinecap="round"
    />
  );
}

/* ─── Isomorphic helpers ─── */
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
let uidN = 0;
const useUid = React.useId
  ? () => "sx" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  : () => {
      const r = useRef(null);
      if (!r.current) r.current = "sx" + ++uidN;
      return r.current;
    };

let cssIn = false;
function useAvatarCss() {
  useIso(() => {
    if (cssIn || typeof document === "undefined") return;
    cssIn = true;
    if (document.querySelector("style[data-sx-av]")) return;
    const el = document.createElement("style");
    el.setAttribute("data-sx-av", "");
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const easeBack = (p) =>
  1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);

/* ─── Component ─── */
export function SharxAvatar({
  shape = "circle",
  eyes = "oval",
  color = "#C7B4FF",
  size = 220,
  flat = false,
  animated,
  interactive = false,
  cheer = 0,
  className = "",
  style,
}) {
  const sh = PERS[shape] ? shape : "circle";
  const ek = EYE_KINDS.includes(eyes) ? eyes : "round";
  const col = /^#[0-9a-f]{6}$/i.test(color) ? color : "#C7B4FF";
  const compact = flat || size < 72;
  const anim = animated ?? !compact;
  const P = PERS[sh];
  const sw = Math.max(3.6, 260 / size);
  const sw2 = sw * 0.8;

  const uid = useUid();
  useAvatarCss();
  const h = useMemo(
    () => [...uid].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7) >>> 0,
    [uid]
  );
  const [initialD] = useState(() => toPath(pointsFor(sh)));
  const pathRef = useRef(null);
  const reactRef = useRef(null);
  const curRef = useRef(null);
  const rafRef = useRef(0);
  const prev = useRef({ sh, ek, col });
  const [flecks, setFlecks] = useState([]);
  const [happy, setHappy] = useState(false);
  const timers = useRef([]);

  const play = useCallback((name) => {
    const el = reactRef.current;
    if (!el) return;
    el.classList.remove("sx-r-settle", "sx-r-blip", "sx-r-squash", "sx-r-joy");
    void el.getBoundingClientRect();
    el.classList.add("sx-r-" + name);
  }, []);

  const spawn = useCallback(
    (count, big) => {
      const now = Date.now();
      const list = Array.from({ length: count }, (_, i) => {
        const a = big
          ? Math.random() * Math.PI * 2
          : -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
        const d = size * (0.42 + Math.random() * 0.34);
        const dot = Math.random() > 0.55;
        return {
          id: `sxf-${now}-${++fleckCounter}`,
          dx: Math.cos(a) * d,
          dy: Math.sin(a) * d + (big ? 0 : size * 0.06),
          rt: Math.round(Math.random() * 180),
          w: dot ? 4 + Math.random() * 3 : 7 + Math.random() * 5,
          hh: dot ? 4 + Math.random() * 3 : 2.6,
          dot,
          c: i % 4 === 3 ? col : FLECKS[(i + h) % FLECKS.length],
          dl: Math.random() * 0.08,
        };
      });
      setFlecks((f) => f.concat(list));
      const t = setTimeout(
        () => setFlecks((f) => f.filter((x) => !list.includes(x))),
        1000
      );
      timers.current.push(t);
    },
    [size, col, h]
  );

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      timers.current.forEach(clearTimeout);
    },
    []
  );

  useEffect(() => {
    const path = pathRef.current;
    const target = pointsFor(sh);
    if (!path) return;
    if (!curRef.current) {
      curRef.current = target;
      return;
    }
    cancelAnimationFrame(rafRef.current);
    const from = curRef.current;
    if (!anim || reduced()) {
      curRef.current = target;
      path.setAttribute("d", toPath(target));
      return;
    }
    play("settle");
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 380);
      const e = easeBack(p);
      const pts =
        p >= 1
          ? target
          : from.map((a, i) => [
              a[0] + (target[i][0] - a[0]) * e,
              a[1] + (target[i][1] - a[1]) * e,
            ]);
      curRef.current = pts;
      path.setAttribute("d", toPath(pts));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [sh]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const p = prev.current;
    if (anim && !reduced() && p.sh === sh && (p.ek !== ek || p.col !== col)) {
      play("blip");
      if (p.col !== col) spawn(5);
    }
    prev.current = { sh, ek, col };
  }, [ek, col]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cheer || !anim || Date.now() - cheer > 1500 || reduced()) return;
    play("joy");
    spawn(16, true);
    setHappy(true);
    const t = setTimeout(() => setHappy(false), 1000);
    return () => clearTimeout(t);
  }, [cheer]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPress = () => {
    if (reduced()) return;
    play("squash");
    spawn(8);
  };

  const b = `${uid}b`;
  const lt = mixHex(col, "#FFFFFF", 0.45);
  const dk = mixHex(col, INK, 0.3);
  const ex = [50 - P.gap, 50 + P.gap];
  const eyeY = [P.ey, P.ey - 0.5];
  const eyeK = [P.k, P.k * 0.96];
  const kinds = ek === "wink" ? ["round", "closed"] : [ek, ek];

  const blinkable =
    ek !== "wink" && ek !== "sleepy" && (ek === "round" || ek === "oval");

  return (
    <span
      className={`sx-av${anim ? " sx-anim" : ""}${
        interactive ? " sx-int" : ""
      } ${className}`}
      style={{ width: size, height: size, ...style }}
      onClick={interactive && anim ? onPress : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        style={{
          "--sx-c": col,
          "--sx-lt": lt,
          "--sx-dk": dk,
          "--sx-amp": P.amp,
          "--sx-dur": `${P.dur}s`,
          "--sx-blink": `${6 + (h % 30) / 10}s`,
          "--sx-bd": `-${((h >>> 3) % 60) / 10}s`,
        }}
      >
        <defs>
          <path id={b} ref={pathRef} d={initialD} />
          <clipPath id={`${uid}c`}>
            <use href={`#${b}`} />
          </clipPath>
          <linearGradient
            id={`${uid}l`}
            gradientUnits="userSpaceOnUse"
            x1="25"
            y1="15"
            x2="80"
            y2="90"
          >
            <stop
              offset="0"
              style={{
                stopColor: "var(--sx-lt)",
                stopOpacity: 0.6,
                transition: "stop-color .45s",
              }}
            />
            <stop
              offset="0.5"
              style={{ stopColor: "var(--sx-c)", stopOpacity: 0 }}
            />
            <stop
              offset="1"
              style={{
                stopColor: "var(--sx-dk)",
                stopOpacity: 0.55,
                transition: "stop-color .45s",
              }}
            />
          </linearGradient>
          <radialGradient
            id={`${uid}h`}
            gradientUnits="userSpaceOnUse"
            cx="36"
            cy="31"
            r="22"
          >
            <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}s`}>
            <stop offset="0" stopColor={INK} stopOpacity="0.34" />
            <stop offset="1" stopColor={INK} stopOpacity="0" />
          </radialGradient>
          {!compact && (
            <pattern
              id={`${uid}g`}
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="3" r=".38" fill={INK} opacity=".5" />
              <circle cx="9" cy="2" r=".3" fill="#fff" opacity=".7" />
              <circle cx="6" cy="8" r=".36" fill={INK} opacity=".4" />
              <circle cx="12" cy="10" r=".3" fill="#fff" opacity=".6" />
              <circle cx="3" cy="12" r=".3" fill={INK} opacity=".45" />
            </pattern>
          )}
        </defs>

        <g
          style={{
            transform: `translateY(${P.ground - 90}px)`,
            transition: "transform .38s cubic-bezier(.3,1.4,.5,1)",
          }}
        >
          <g className="sx-shwrap">
            <ellipse
              className="sx-shadow"
              cx="50"
              cy="91.5"
              rx="28"
              ry="5"
              fill={`url(#${uid}s)`}
            />
          </g>
        </g>

        <g className="sx-lift">
          <g
            className="sx-react"
            ref={reactRef}
            onAnimationEnd={(e) => {
              if (e.target === e.currentTarget)
                e.currentTarget.classList.remove(
                  "sx-r-settle",
                  "sx-r-blip",
                  "sx-r-squash",
                  "sx-r-joy"
                );
            }}
          >
            <g className="sx-body">
              <use
                href={`#${b}`}
                style={{
                  fill: "var(--sx-dk)",
                  transition: "fill .45s ease",
                }}
              />
              <g clipPath={`url(#${uid}c)`}>
                <use
                  href={`#${b}`}
                  transform="translate(-3 -3.4)"
                  style={{
                    fill: "var(--sx-c)",
                    transition: "fill .45s ease",
                  }}
                />
                <rect width="100" height="100" fill={`url(#${uid}l)`} />
                {!compact && (
                  <g fill="none" strokeLinecap="round">
                    <path
                      d="M22 34Q30 26 40 24M20 45Q27 37 34 34M28 24Q36 19 46 18"
                      stroke="var(--sx-lt)"
                      strokeWidth="2.6"
                      opacity=".55"
                    />
                    <path
                      d="M60 78Q72 74 80 64M52 84Q66 82 76 74M66 68Q74 64 82 56"
                      stroke="var(--sx-dk)"
                      strokeWidth="2.6"
                      opacity=".32"
                    />
                    <path
                      d="M27 30Q30 27 34 26"
                      stroke="#fff"
                      strokeWidth="1.8"
                      opacity=".85"
                    />
                    <rect
                      width="100"
                      height="100"
                      fill={`url(#${uid}g)`}
                      stroke="none"
                      opacity=".4"
                    />
                  </g>
                )}
                <ellipse
                  cx="36"
                  cy="31"
                  rx="20"
                  ry="13"
                  fill={`url(#${uid}h)`}
                  transform="rotate(-28 36 31)"
                />
              </g>
              <use
                href={`#${b}`}
                fill="none"
                stroke={INK}
                strokeWidth={sw}
                strokeLinejoin="round"
              />
              {!compact && (
                <use
                  href={`#${b}`}
                  fill="none"
                  stroke={INK}
                  strokeWidth={sw * 0.35}
                  opacity=".4"
                  strokeDasharray="16 5 7 4"
                  transform="translate(.7 .5) rotate(.8 50 50)"
                />
              )}

              <g className="sx-face">
                {ex.map((x, i) =>
                  kinds[i] === "closed" ? null : (
                    <ellipse
                      key={"s" + i}
                      cx={x}
                      cy={eyeY[i] + (ek === "oval" ? 11.5 : 8.5) * eyeK[i]}
                      rx={8.6 * eyeK[i]}
                      ry={2.6 * eyeK[i]}
                      fill={INK}
                      opacity=".12"
                    />
                  )
                )}

                <g
                  className={`sx-eye-blink${blinkable && anim ? " on" : ""}`}
                  style={{
                    opacity: happy ? 0 : 1,
                    transition: "opacity .09s",
                  }}
                >
                  {ex.map((x, i) =>
                    kinds[i] === "closed" ? (
                      <ClosedEye
                        key={i}
                        x={x}
                        y={eyeY[i]}
                        k={eyeK[i]}
                        sw={sw2}
                      />
                    ) : (
                      <g key={i} className="sx-eye">
                        <EyeShape
                          kind={kinds[i]}
                          x={x}
                          y={eyeY[i]}
                          k={eyeK[i]}
                          sw={sw2}
                        />
                      </g>
                    )
                  )}
                </g>

                <g
                  style={{
                    opacity: happy ? 1 : 0,
                    transition: "opacity .09s",
                  }}
                  fill="none"
                  stroke={INK}
                  strokeWidth={sw2 * 1.15}
                  strokeLinecap="round"
                >
                  {ex.map((x, i) => (
                    <path
                      key={i}
                      d={`M${x - 7.4} ${eyeY[i] + 3}Q${x} ${
                        eyeY[i] - 7
                      } ${x + 7.4} ${eyeY[i] + 3}`}
                    />
                  ))}
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>

      {flecks.map((p) => (
        <i
          key={p.id}
          className="sx-fleck"
          style={{
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            "--rt": `${p.rt}deg`,
            "--dl": `${p.dl}s`,
            width: p.w,
            height: p.hh,
            background: p.c,
            borderRadius: p.dot ? "52% 46% 55% 45%" : 3,
          }}
        />
      ))}
    </span>
  );
}

const CSS = `
.sx-av{display:inline-block;position:relative;line-height:0;vertical-align:middle;flex:none}
.sx-av svg{display:block;overflow:visible}
.sx-int{cursor:pointer;-webkit-tap-highlight-color:transparent}
.sx-lift,.sx-react,.sx-body,.sx-shwrap,.sx-shadow{transform-box:fill-box;transform-origin:50% 92%}
.sx-shwrap,.sx-shadow{transform-origin:50% 50%}
.sx-eye{transform-box:fill-box;transform-origin:50% 50%}
.sx-lift{transition:transform .35s cubic-bezier(.34,1.5,.5,1)}
.sx-shwrap{transition:transform .35s ease,opacity .35s}
@media (hover:hover) and (pointer:fine){
  .sx-int:hover .sx-lift{transform:translateY(-3px) rotate(-1.2deg)}
  .sx-int:hover .sx-shwrap{transform:scale(.86,.8);opacity:.75}
}
.sx-anim .sx-body{animation:sx-breathe var(--sx-dur,4s) ease-in-out infinite}
.sx-anim .sx-shadow{animation:sx-shade var(--sx-dur,4s) ease-in-out infinite}
.sx-anim .sx-look{animation:sx-look 13s ease-in-out infinite}
.sx-anim .sx-eye-blink.on{
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: sx-blink var(--sx-blink,7s) ease-in-out infinite;
  animation-delay: var(--sx-bd,0s);
}
@keyframes sx-breathe{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(calc(var(--sx-amp)*-38px)) scale(calc(1 - var(--sx-amp)*.45),calc(1 + var(--sx-amp)))}}
@keyframes sx-shade{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.94,.9);opacity:.8}}
@keyframes sx-blink{0%,91%,100%{transform:scaleY(1)}93.5%{transform:scaleY(.08)}96%{transform:scaleY(1)}}
@keyframes sx-look{0%,12%{transform:translate(0,0)}22%,42%{transform:translate(1.1px,-.5px)}52%,70%{transform:translate(-1.2px,.4px)}82%,100%{transform:translate(0,0)}}
.sx-r-settle{animation:sx-settle .6s cubic-bezier(.3,1.4,.5,1)}
.sx-r-blip{animation:sx-blip .42s cubic-bezier(.3,1.4,.5,1)}
.sx-r-squash{animation:sx-squash .5s cubic-bezier(.3,1.4,.5,1)}
.sx-r-joy{animation:sx-joy 1s cubic-bezier(.3,1.2,.5,1)}
@keyframes sx-settle{0%{transform:scale(1,1)}28%{transform:scale(1.07,.9)}62%{transform:scale(.97,1.04)}100%{transform:scale(1,1)}}
@keyframes sx-blip{0%{transform:scale(1,1)}35%{transform:scale(1.04,.96)}70%{transform:scale(.99,1.015)}100%{transform:scale(1,1)}}
@keyframes sx-squash{0%{transform:scale(1,1)}22%{transform:scale(1.09,.86)}55%{transform:translateY(-2px) scale(.95,1.08)}100%{transform:scale(1,1)}}
@keyframes sx-joy{0%{transform:scale(1,1)}15%{transform:scale(1.08,.88)}38%{transform:translateY(-9px) rotate(-4deg) scale(.96,1.06)}58%{transform:scale(1.05,.93)}72%{transform:rotate(2deg) scale(.98,1.03)}100%{transform:scale(1,1)}}
.sx-fleck{position:absolute;left:50%;top:50%;margin:-2px 0 0 -3px;pointer-events:none;opacity:0;animation:sx-fleck .85s cubic-bezier(.15,.8,.3,1) forwards;animation-delay:var(--dl,0s)}
@keyframes sx-fleck{0%{opacity:0;transform:translate(0,0) rotate(var(--rt)) scale(.5)}12%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(calc(var(--rt) + 90deg)) scale(1)}}
@media (prefers-reduced-motion:reduce){
  .sx-av *{animation:none!important;transition:none!important}
  .sx-fleck{display:none}
}
`;

export default SharxAvatar;