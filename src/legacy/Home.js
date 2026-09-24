"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  lazy,
  Suspense,
  memo,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import Sidebar from "./Sidebar";
import { RowCard } from "./Homerows";
import "./Home.css";

const ProfileSidePanel = lazy(() => import("./ProfileSidePanel"));
const SidePanel = lazy(() => import("./SidePanel"));
const GameModal = lazy(() => import("./GameModal"));
const SocialComingSoonModal = lazy(() => import("./SocialComingSoonModal"));

const HISTORY_KEY = "pv_history";
const MAX_HISTORY = 12;
const TRENDING_LIMIT = 14;
const ALL_PAGE_SIZE = 48;

const PAGE_SIZE = 50;
const MAX_PAGES = 60;
const BATCH_SIZE = 5;

const ANIMATED_CARDS = 12;

/* ═══════════════════════════════════════════════
   WELCOME SCREEN CONFIG
═══════════════════════════════════════════════ */
const INTRO_MS = 3500; // fireworks run 3.5s, then content reveals

const FIREWORK_COLORS = [
  "#FF3D7F",
  "#FFB300",
  "#00B8D9",
  "#7C3AED",
  "#10B981",
  "#FF6B35",
  "#0EA5E9",
  "#F472B6",
];

const CONFETTI_COLORS = [
  "#FFD966",
  "#FF8B7B",
  "#7BE5B5",
  "#C7B4FF",
  "#FFB4D4",
  "#7BB8F0",
];

const WELCOME_DOODLES = [
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
        <path d="M15,10 L15,15" pathLength="1" />
        <path d="M45,10 L45,15" pathLength="1" />
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

const WELCOME_SPARKLES = [
  { top: "-14px", left: "6%", size: 18, delay: "0s", color: "#FFD966" },
  { top: "8px", right: "-6px", size: 14, delay: "0.7s", color: "#FF8B7B" },
  { bottom: "-4px", left: "-10px", size: 12, delay: "1.4s", color: "#7BE5B5" },
  { bottom: "14px", right: "8%", size: 16, delay: "0.3s", color: "#C7B4FF" },
];

const getHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
};

const addToHistory = (game) => {
  if (typeof window === "undefined") return;
  try {
    const prev = getHistory().filter((g) => g.id !== game.id);
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(
        [{ ...game, playedAt: Date.now() }, ...prev].slice(0, MAX_HISTORY)
      )
    );
  } catch {}
};

const NAMED_ENTITIES = {
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&#x27;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};
const decodeEntities = (value) => {
  if (typeof value !== "string" || value.indexOf("&") === -1) return value;
  let out = value;
  for (let i = 0; i < 3; i += 1) {
    const next = out
      .replace(/&(quot|apos|lt|gt|nbsp);|&#39;|&#x27;/g, (m) => NAMED_ENTITIES[m] ?? m)
      .replace(/&#(\d+);/g, (m, n) => {
        const code = Number(n);
        return code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : m;
      })
      .replace(/&amp;/g, "&");
    if (next === out) break;
    out = next;
  }
  return out;
};

const cleanGame = (g) => {
  if (!g || typeof g.title !== "string") return g;
  const title = decodeEntities(g.title).trim();
  return title === g.title ? g : { ...g, title };
};

const prepareGames = (list) => {
  const seen = new Set();
  const out = [];
  for (const raw of list || []) {
    const g = cleanGame(raw);
    if (g?.id == null) {
      out.push(g);
      continue;
    }
    if (!seen.has(g.id)) {
      seen.add(g.id);
      out.push(g);
    }
  }
  return out;
};

const slugify = (title = "") =>
  String(title)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const TRENDING_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2c.6 2.4 2 3.9 3.6 5.2C17.6 8.9 19 11 19 13.8c0 3.9-3.1 7.2-7 7.2s-7-3.3-7-7.2c0-2.2 1-4.2 2.5-5.7.3 1 1.1 1.9 2 1.9 1.4 0 1.9-1.4 2.5-3.1.3-1 .7-2 1-3.1.2-.6.4-1.2.5-1.8.1-.4.4-.4.5 0Z" />
  </svg>
);

const NEW_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.6l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
  </svg>
);

const CATEGORY_ICON = NEW_ICON;

const MiniAvatar = memo(function MiniAvatar({ profile }) {
  if (!profile) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1B2A41"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (profile.avatarType === "google" && profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt="avatar"
        loading="lazy"
        decoding="async"
        width="40"
        height="40"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  const shape = profile.avatarShape || "heart";
  const color = profile.avatarColor || "#c084fc";
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {shape === "circle" && <circle cx="14" cy="14" r="12" fill={color} />}
      {shape === "square" && (
        <rect x="2" y="2" width="24" height="24" rx="5" fill={color} />
      )}
      {shape === "star" && (
        <polygon
          points="14,2 17,10 26,10 19,15 22,23 14,18 6,23 9,15 2,10 11,10"
          fill={color}
        />
      )}
      {shape === "hexagon" && (
        <polygon points="14,2 24,8 24,20 14,26 4,20 4,8" fill={color} />
      )}
      {shape === "heart" && (
        <path
          d="M14 23 C14 23 3 16 3 9 C3 5.7 5.7 3 9 3 C11 3 12.7 4 14 5.5 C15.3 4 17 3 19 3 C22.3 3 25 5.7 25 9 C25 16 14 23 14 23Z"
          fill={color}
        />
      )}
    </svg>
  );
});

const GamesGrid = memo(function GamesGrid({ games, onOpen }) {
  return (
    <div className="games-grid">
      {games.map((game, i) => (
        <RowCard
          key={game.id ?? game.title ?? i}
          game={game}
          index={i}
          animate={i < ANIMATED_CARDS}
          onNavigate={() => onOpen(game)}
        />
      ))}
    </div>
  );
});

const LoadMore = memo(function LoadMore({ onClick }) {
  return (
    <div className="load-more-wrap">
      <button type="button" className="load-more-btn" onClick={onClick}>
        More Games
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>
    </div>
  );
});

const Footer = memo(function Footer({ onSocialClick }) {
  const year = useMemo(() => new Date().getFullYear(), []);
  const footerRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`site-footer${inView ? " footer-in" : ""}`}
    >
      <div className="footer-body">
        <div className="footer-grid">
          <div className="footer-left">
            <Link href="/" className="footer-logo" aria-label="Go to Sharx home">
              <Image
                src="/sharx-logo.webp"
                alt="Sharx"
                width={44}
                height={44}
                draggable={false}
                loading="lazy"
              />
            </Link>

            <div className="footer-socials">
              <a
                className="social-icon instagram"
                href="https://www.instagram.com/sharx__games?igsh=NWU3Zm9udDR3NHd4"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Sharx on Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              <button
                type="button"
                className="social-icon youtube"
                onClick={() => onSocialClick("youtube")}
                title="YouTube"
                aria-label="Sharx on YouTube"
              >
                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </button>
            </div>
          </div>

          <nav className="footer-center" aria-label="Company">
            <div className="footer-center-title">Company</div>
            <div className="footer-center-links">
              <Link href="/about" className="footer-link">
                About Us
              </Link>
              <Link href="/contact" className="footer-link">
                Contact
              </Link>
              <Link href="/privacy" className="footer-link">
                Privacy Policy
              </Link>
              <Link href="/terms" className="footer-link">
                Terms of Service
              </Link>
              <Link href="/copyright" className="footer-link">
                Copyright
              </Link>
            </div>
          </nav>

          <div className="footer-right">
            <span className="footer-copyright">
              © {year} Sharx. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
});

/* ═══════════════════════════════════════════════
   FIREWORKS CANVAS — slow, smooth, mobile-tuned
═══════════════════════════════════════════════ */
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
    let isMobile = false;
    const timers = [];
    const rockets = [];
    const sparks = [];

    const rand = (a, b) => Math.random() * (b - a) + a;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const resize = () => {
      const vw = window.innerWidth || document.documentElement.clientWidth || 360;
      const vh = window.innerHeight || document.documentElement.clientHeight || 640;
      isMobile = vw < 600;
      const dprCap = isMobile ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      w = Math.max(1, vw);
      h = Math.max(1, vh);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const burst = (x, y, color = pick(FIREWORK_COLORS), scale = 1) => {
      const shape = pick(["round", "round", "ring", "heart"]);
      const density = isMobile ? 0.55 : 1;
      const count = Math.floor(rand(55, 90) * scale * density);

      for (let i = 0; i < count; i += 1) {
        const t = (Math.PI * 2 * i) / count;
        let vx;
        let vy;
        // slower initial speeds => calmer, more graceful bursts
        let speed = rand(1.6, 3.8) * scale;

        if (shape === "ring") {
          speed = 3 * scale;
          vx = Math.cos(t) * speed;
          vy = Math.sin(t) * speed;
        } else if (shape === "heart") {
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)
          );
          vx = hx * 0.18 * scale;
          vy = hy * 0.18 * scale;
        } else {
          vx = Math.cos(t + rand(-0.05, 0.05)) * speed;
          vy = Math.sin(t + rand(-0.05, 0.05)) * speed;
        }

        sparks.push({
          x,
          y,
          px: x,
          py: y,
          vx,
          vy,
          g: rand(0.014, 0.032), // slower gravity
          drag: rand(0.978, 0.99), // more air resistance -> smoother arc
          life: 1,
          decay: rand(0.003, 0.006), // longer living particles
          size: rand(1.8, 3.4),
          color: shape === "heart" ? "#FF3D7F" : color,
          twinkle: Math.random() > 0.7,
        });
      }

      const coreCount = isMobile ? 8 : 14;
      for (let i = 0; i < coreCount; i += 1) {
        sparks.push({
          x,
          y,
          px: x,
          py: y,
          vx: rand(-1.2, 1.2),
          vy: rand(-1.2, 1.2),
          g: 0.006,
          drag: 0.97,
          life: 1,
          decay: rand(0.008, 0.016),
          size: rand(2.2, 3.8),
          color: "#FFFFFF",
          twinkle: true,
        });
      }
    };

    const launch = (sx = rand(w * 0.12, w * 0.88)) => {
      rockets.push({
        x: sx,
        y: h + 20,
        px: sx,
        py: h + 20,
        targetY: rand(h * 0.15, h * 0.52),
        vx: rand(-0.3, 0.3),
        vy: rand(-9, -11.5), // slower rockets
        color: pick(FIREWORK_COLORS),
      });
    };

    const glow = (x, y, s, color, a) => {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowBlur = isMobile ? s * 3 : s * 6;
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
      ctx.fillStyle = finaleRef.current ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.10)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      if (!reduced && now >= nextLaunch) {
        launch();
        if (Math.random() > 0.65) {
          timers.push(window.setTimeout(() => launch(), rand(180, 420)));
        }
        nextLaunch =
          now + (finaleRef.current ? rand(1100, 1800) : rand(550, 950));
      }

      ctx.save();
      ctx.globalCompositeOperation = "source-over";

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        r.px = r.x;
        r.py = r.y;
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vy += 0.11 * dt; // gentler gravity

        ctx.beginPath();
        ctx.moveTo(r.px, r.py);
        ctx.lineTo(r.x, r.y);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2.2;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
        glow(r.x, r.y, 2.2, r.color, 0.9);

        if (r.y <= r.targetY || r.vy >= -1) {
          burst(r.x, r.y, r.color, 1);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i];
        s.px = s.x;
        s.py = s.y;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= Math.pow(s.drag, dt);
        s.vy = s.vy * Math.pow(s.drag, dt) + s.g * dt;
        s.life -= s.decay * dt;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.globalAlpha =
          s.life * (s.twinkle ? 0.7 + Math.random() * 0.3 : 0.9);
        ctx.stroke();
        if (!isMobile) {
          glow(s.x, s.y, s.size, s.color, s.life * 0.45);
        }
      }

      ctx.restore();
      raf = window.requestAnimationFrame(tick);
    };

    resize();
    timers.push(
      window.setTimeout(() => {
        resize();
        if (!reduced) {
          launch(w * 0.25);
          launch(w * 0.75);
          timers.push(window.setTimeout(() => launch(w * 0.5), 280));
          timers.push(window.setTimeout(() => launch(w * 0.15), 600));
          timers.push(window.setTimeout(() => launch(w * 0.85), 900));
          raf = window.requestAnimationFrame(tick);
        }
      }, 60)
    );

    let ro;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    }
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resize);
    }

    const onPointer = (e) => {
      if (reduced) return;
      const rect = canvas.getBoundingClientRect();
      const point = e.touches?.[0] || e;
      burst(
        point.clientX - rect.left,
        point.clientY - rect.top,
        pick(FIREWORK_COLORS),
        0.85
      );
    };
    canvas.addEventListener("pointerdown", onPointer);

    return () => {
      window.cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", resize);
      }
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-fireworks" aria-hidden="true" />;
});

/* ═══════════════════════════════════════════════
   CONFETTI
═══════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════
   WELCOME SCREEN — no dots, content delayed
═══════════════════════════════════════════════ */
const WelcomeScreen = memo(function WelcomeScreen({ onEnter }) {
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [entering, setEntering] = useState(false);
  const enterTimer = useRef(null);

  useEffect(() => {
    const a = window.setTimeout(() => setMounted(true), 30);
    const b = window.setTimeout(() => setRevealed(true), INTRO_MS);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
      window.clearTimeout(enterTimer.current);
    };
  }, []);

  const handleEnter = useCallback(() => {
    if (entering) return;
    setEntering(true);
    enterTimer.current = setTimeout(() => onEnter(), 700);
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
      <FireworksCanvas finale={false} />
      <div className="w-vignette" aria-hidden="true" />

      <div className="w-orb w-orb-1" aria-hidden="true" />
      <div className="w-orb w-orb-2" aria-hidden="true" />
      <div className="w-orb w-orb-3" aria-hidden="true" />
      <div className="w-orb w-orb-4" aria-hidden="true" />

      {WELCOME_DOODLES.map((d) => (
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
              {WELCOME_SPARKLES.map((s, i) => (
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
      </div>

      <div className="w-curtain" aria-hidden="true" />
    </main>
  );
});

/* ═══════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════ */
export default function Home({
  initialGames = [],
  initialActiveGame = null,
  initialTrendingGames = [],
}) {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [showWelcome, setShowWelcome] = useState(true);

  const [allGames, setAllGames] = useState(() => prepareGames(initialGames));
  const [trendingGames] = useState(() => prepareGames(initialTrendingGames));
  const [loading, setLoading] = useState(initialGames.length === 0);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(ALL_PAGE_SIZE);
  const [activeGame, setActiveGame] = useState(() =>
    initialActiveGame ? cleanGame(initialActiveGame) : null
  );
  const [error, setError] = useState(null);
  const [panelMode, setPanelMode] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [socialModal, setSocialModal] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pushedOwnHistoryRef = useRef(false);
  const fetchInFlightRef = useRef(false);
  const searchInputRef = useRef(null);
  const baseTitleRef = useRef(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (showWelcome) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [showWelcome]);

  const handleEnterSharx = useCallback(() => {
    setShowWelcome(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, []);

  const syncLoginState = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    const t = window.setTimeout(syncLoginState, 0);
    return () => window.clearTimeout(t);
  }, [syncLoginState]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("modal-open", !!activeGame);
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [activeGame]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const h = (e) => {
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const restoreTitle = useCallback(() => {
    if (typeof document !== "undefined" && baseTitleRef.current) {
      document.title = baseTitleRef.current;
    }
  }, []);

  const openGame = useCallback((game) => {
    addToHistory(game);
    setActiveGame(game);
    if (typeof window !== "undefined") {
      if (baseTitleRef.current === null) baseTitleRef.current = document.title;
      if (game?.title) document.title = `${game.title} - Play Free Online | Sharx`;
      if (game?.id != null) {
        window.history.pushState(
          { sharxGameId: game.id },
          "",
          `/game/${game.id}-${slugify(game.title)}`
        );
        pushedOwnHistoryRef.current = true;
      }
    }
  }, []);

  const switchGame = useCallback((game) => {
    addToHistory(game);
    setActiveGame(game);
    if (typeof window !== "undefined") {
      if (game?.title) document.title = `${game.title} - Play Free Online | Sharx`;
      if (game?.id != null) {
        window.history.replaceState(
          { sharxGameId: game.id },
          "",
          `/game/${game.id}-${slugify(game.title)}`
        );
      }
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    if (pushedOwnHistoryRef.current) {
      pushedOwnHistoryRef.current = false;
      window.history.back();
    } else {
      setActiveGame(null);
      restoreTitle();
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/game/")
      )
        router.push("/");
    }
  }, [router, restoreTitle]);

  const fetchGames = useCallback(async () => {
    if (fetchInFlightRef.current) return false;
    fetchInFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const all = [];
      const seen = new Set();

      for (let start = 1; start <= MAX_PAGES; start += BATCH_SIZE) {
        const batchPages = [];
        for (let p = start; p < start + BATCH_SIZE && p <= MAX_PAGES; p++) {
          batchPages.push(p);
        }

        const results = await Promise.allSettled(
          batchPages.map((p) =>
            fetch(`/api/games?page=${p}&limit=${PAGE_SIZE}`, {
              cache: "no-store",
              headers: { Accept: "application/json" },
            }).then((r) => {
              if (!r.ok) throw new Error(`HTTP ${r.status}`);
              return r.json();
            })
          )
        );

        let addedThisRound = 0;

        for (const r of results) {
          if (r.status !== "fulfilled") continue;
          const games = Array.isArray(r.value?.games) ? r.value.games : [];
          for (const g of games) {
            if (g?.id == null) {
              all.push(g);
              addedThisRound += 1;
              continue;
            }
            if (!seen.has(g.id)) {
              seen.add(g.id);
              all.push(g);
              addedThisRound += 1;
            }
          }
        }

        if (addedThisRound === 0) break;
      }

      if (all.length === 0) throw new Error("No games returned");

      setAllGames(prepareGames(all));
      return true;
    } catch (e) {
      console.error("Load games failed:", e);
      setError("Failed to load games. Please refresh.");
      return false;
    } finally {
      fetchInFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showWelcome) return;
    if (initialGames.length > 0 && allGames.length > 0 && !loading) return;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => void fetchGames(), {
        timeout: 2000,
      });
      return () => window.cancelIdleCallback(id);
    }

    const t = setTimeout(() => void fetchGames(), 300);
    return () => clearTimeout(t);
  }, [showWelcome, fetchGames, initialGames.length, allGames.length, loading]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setVisibleCount(ALL_PAGE_SIZE);
  }, []);

  const handleCategorySelect = useCallback((c) => {
    setCategory(c);
    setSearch("");
    setSearchOpen(false);
    setSidebarOpen(false);
    setVisibleCount(ALL_PAGE_SIZE);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const clearCategoryAndSearch = useCallback(() => {
    setCategory("All");
    setSearch("");
    setSearchOpen(false);
    setVisibleCount(ALL_PAGE_SIZE);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
    setVisibleCount(ALL_PAGE_SIZE);
    searchInputRef.current?.focus();
  }, []);

  const handleCloseProfile = useCallback(() => setShowProfile(false), []);
  const handlePanelLogin = useCallback(() => setPanelMode("login"), []);
  const handleClosePanel = useCallback(() => {
    setPanelMode(null);
    syncLoginState();
  }, [syncLoginState]);
  const handleShowProfile = useCallback(() => setShowProfile(true), []);
  const handleSocialClick = useCallback((p) => setSocialModal(p), []);
  const handleCloseSocialModal = useCallback(() => setSocialModal(null), []);
  const handleRetry = useCallback(() => {
    void fetchGames();
  }, [fetchGames]);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleLogout = useCallback(async () => {
    try {
      await authLogout();
    } finally {
      setIsLoggedIn(false);
      setShowProfile(false);
    }
  }, [authLogout]);

  const toggleSearch = useCallback(() => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearch("");
    } else {
      setSearchOpen(true);
      window.requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((c) => c + ALL_PAGE_SIZE);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (sidebarOpen) setSidebarOpen(false);
        else if (searchOpen || search) {
          setSearchOpen(false);
          setSearch("");
        } else if (activeGame) handleCloseModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleCloseModal, sidebarOpen, searchOpen, search, activeGame]);

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      const m = path.match(/^\/game\/([^/]+)/);
      if (m) {
        const raw = decodeURIComponent(m[1]);
        const id = raw.match(/^gm_\d+/)?.[0] || raw;
        const found =
          allGames.find((g) => String(g.id) === id) ||
          (initialActiveGame && String(initialActiveGame.id) === id
            ? cleanGame(initialActiveGame)
            : null);
        if (found) {
          setActiveGame(found);
          pushedOwnHistoryRef.current = true;
        }
      } else {
        setActiveGame(null);
        pushedOwnHistoryRef.current = false;
        restoreTitle();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [allGames, initialActiveGame, restoreTitle]);

  const searchLower = useMemo(() => search.trim().toLowerCase(), [search]);

  const categories = useMemo(() => {
    const u = new Set(allGames.map((g) => g.category).filter(Boolean));
    return ["All", ...Array.from(u)];
  }, [allGames]);

  const searchResults = useMemo(() => {
    if (!searchLower) return null;
    return allGames.filter((g) =>
      g.title?.toLowerCase().includes(searchLower)
    );
  }, [allGames, searchLower]);

  const categoryResults = useMemo(() => {
    if (category === "All" || category === "Trending") return null;
    return allGames.filter((g) => g.category === category);
  }, [allGames, category]);

  const trendingRow = useMemo(
    () =>
      trendingGames.length > 0
        ? trendingGames.slice(0, TRENDING_LIMIT)
        : allGames.slice(0, TRENDING_LIMIT),
    [trendingGames, allGames]
  );

  const trendingIds = useMemo(
    () => new Set(trendingRow.map((g) => g?.id).filter((id) => id != null)),
    [trendingRow]
  );

  const allGamesFiltered = useMemo(() => {
    if (trendingIds.size === 0) return allGames;
    return allGames.filter((g) => g?.id == null || !trendingIds.has(g.id));
  }, [allGames, trendingIds]);

  const visibleGames = useMemo(
    () => allGamesFiltered.slice(0, visibleCount),
    [allGamesFiltered, visibleCount]
  );

  const visibleSearch = useMemo(
    () => (searchResults ? searchResults.slice(0, visibleCount) : null),
    [searchResults, visibleCount]
  );

  const visibleCategory = useMemo(
    () => (categoryResults ? categoryResults.slice(0, visibleCount) : null),
    [categoryResults, visibleCount]
  );

  const hasMore = visibleCount < allGamesFiltered.length;

  if (showWelcome) {
    return <WelcomeScreen onEnter={handleEnterSharx} />;
  }

  return (
    <div className="app-shell">
      <div className="bg-scene" aria-hidden="true" />

      <Sidebar
        categories={categories}
        activeCategory={category}
        onSelectCategory={handleCategorySelect}
        open={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      <div className="main-col">
        <div className="topbar">
          <button
            type="button"
            className="hamburger-btn"
            onClick={handleOpenSidebar}
            aria-label="Open menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div
            className={`topbar-search-wrap${searchOpen ? " is-open" : ""}`}
            role="search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7.5" />
              <path d="m20.5 20.5-4-4" />
            </svg>
            <input
              ref={searchInputRef}
              className="topbar-search-input"
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={handleSearchChange}
              autoComplete="off"
              enterKeyHint="search"
              aria-label="Search games"
            />
            {search && (
              <button
                type="button"
                className="topbar-search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>

          <div className="topbar-spacer" />

          <div className="topbar-r">
            <button
              type="button"
              className="topbar-icon-btn topbar-search-btn"
              onClick={toggleSearch}
              aria-label={searchOpen ? "Close search" : "Search"}
              aria-expanded={searchOpen}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7.5" />
                <path d="m20.5 20.5-4-4" />
              </svg>
            </button>

            {isLoggedIn ? (
              <button
                className="profile-btn"
                onClick={handleShowProfile}
                type="button"
                aria-label="Profile"
              >
                <div className="profile-avatar">
                  <MiniAvatar profile={profile} />
                </div>
              </button>
            ) : (
              <button
                className="topbar-icon-btn"
                onClick={handlePanelLogin}
                type="button"
                aria-label="Login"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <main className="page-content">
          <h1 className="sr-only">Sharx — Play Free Online Games</h1>

          {loading ? (
            <div className="rows-skel">
              <div className="row-skel-heading" />
              <div className="row-skel-strip">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="row-skel-card"
                    style={{ animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="empty" role="alert">
              <div className="empty-t">{error}</div>
              <button className="empty-b" type="button" onClick={handleRetry}>
                Retry
              </button>
            </div>
          ) : searchResults !== null ? (
            searchResults.length === 0 ? (
              <div className="empty">
                <div className="empty-t">No games found</div>
                <button
                  className="empty-b"
                  type="button"
                  onClick={clearCategoryAndSearch}
                >
                  View All Games
                </button>
              </div>
            ) : (
              <div className="section-panel">
                <section className="home-row">
                  <div className="home-row-header">
                    <h2 className="home-row-heading">
                      <span className="home-row-icon star">{NEW_ICON}</span>
                      Results for &ldquo;{search.trim()}&rdquo;
                    </h2>
                    <span className="home-row-count">
                      {searchResults.length}{" "}
                      {searchResults.length === 1 ? "game" : "games"}
                    </span>
                  </div>
                  <GamesGrid games={visibleSearch} onOpen={openGame} />
                </section>
                {visibleCount < searchResults.length && (
                  <LoadMore onClick={handleLoadMore} />
                )}
              </div>
            )
          ) : categoryResults !== null ? (
            categoryResults.length === 0 ? (
              <div className="empty">
                <div className="empty-t">No games in this category yet</div>
                <button
                  className="empty-b"
                  type="button"
                  onClick={clearCategoryAndSearch}
                >
                  View All Games
                </button>
              </div>
            ) : (
              <div className="section-panel">
                <section className="home-row">
                  <div className="home-row-header">
                    <h2 className="home-row-heading">
                      <span className="home-row-icon star">{CATEGORY_ICON}</span>
                      {category}
                    </h2>
                    <span className="home-row-count">
                      {categoryResults.length}{" "}
                      {categoryResults.length === 1 ? "game" : "games"}
                    </span>
                  </div>
                  <GamesGrid games={visibleCategory} onOpen={openGame} />
                </section>
                {visibleCount < categoryResults.length && (
                  <LoadMore onClick={handleLoadMore} />
                )}
              </div>
            )
          ) : category === "Trending" ? (
            <div className="section-panel">
              <section className="home-row">
                <div className="home-row-header">
                  <h2 className="home-row-heading">
                    <span className="home-row-icon flame">
                      {TRENDING_ICON}
                    </span>
                    Trending
                  </h2>
                  <span className="home-row-count">
                    {trendingRow.length}{" "}
                    {trendingRow.length === 1 ? "game" : "games"}
                  </span>
                </div>
                <GamesGrid games={trendingRow} onOpen={openGame} />
              </section>
            </div>
          ) : (
            <>
              <div className="section-panel">
                <section className="home-row">
                  <div className="home-row-header">
                    <h2 className="home-row-heading">
                      <span className="home-row-icon flame">
                        {TRENDING_ICON}
                      </span>
                      Trending
                    </h2>
                    <span className="home-row-count">
                      {trendingRow.length}{" "}
                      {trendingRow.length === 1 ? "game" : "games"}
                    </span>
                  </div>
                  <GamesGrid games={trendingRow} onOpen={openGame} />
                </section>
              </div>

              <div className="section-panel">
                <section className="home-row">
                  <div className="home-row-header">
                    <h2 className="home-row-heading">
                      <span className="home-row-icon star">{NEW_ICON}</span>
                      All Games
                    </h2>
                    <span className="home-row-count">
                      {allGamesFiltered.length}{" "}
                      {allGamesFiltered.length === 1 ? "game" : "games"}
                    </span>
                  </div>
                  <GamesGrid games={visibleGames} onOpen={openGame} />
                </section>

                {hasMore && <LoadMore onClick={handleLoadMore} />}
              </div>
            </>
          )}
        </main>

        {activeGame && (
          <Suspense fallback={null}>
            <GameModal
              game={activeGame}
              games={allGames}
              onClose={handleCloseModal}
              onSwitchGame={switchGame}
            />
          </Suspense>
        )}
        {panelMode && (
          <Suspense fallback={null}>
            <SidePanel mode={panelMode} onClose={handleClosePanel} />
          </Suspense>
        )}
        {showProfile && (
          <Suspense fallback={null}>
            <ProfileSidePanel
              profile={profile}
              onUpdateProfile={updateProfile}
              onClose={handleCloseProfile}
              onLogout={handleLogout}
            />
          </Suspense>
        )}
        {socialModal && (
          <Suspense fallback={null}>
            <SocialComingSoonModal
              platform={socialModal}
              onClose={handleCloseSocialModal}
            />
          </Suspense>
        )}

        <Footer onSocialClick={handleSocialClick} />
      </div>
    </div>
  );
}