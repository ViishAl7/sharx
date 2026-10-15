"use client";

// src/legacy/Home.js — SHARX · Crayon · Clean · Playful
//
// Homepage shows ONLY: Trending (horizontal) + All Games (grid)
// • Event strip + big banner are ONE merged card (tap strip → stretches down)
// • Mobile drawer: hard scroll-lock (iOS safe) + no blur bleed
// • Topbar / back-to-top / more-games use bare crayon icons (sidebar style)

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
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import Sidebar, { getCategoryIcon } from "./Sidebar";
import { RowCard } from "./Homerows";
import SharxAvatar from "./SharxAvatar";
import OnboardingCard from "./OnboardingCard";
import "./Home.css";
import "./Homeextras.css";

const ProfileSidePanel = lazy(() => import("./ProfileSidePanel"));
const SidePanel = lazy(() => import("./SidePanel"));
const GameModal = lazy(() => import("./GameModal"));
const SocialComingSoonModal = lazy(() => import("./SocialComingSoonModal"));
const RewardEventBanner = lazy(() => import("./RewardEventBanner"));

const HISTORY_KEY = "pv_history";
const MAX_HISTORY = 12;
const TRENDING_LIMIT = 12;
const ALL_PAGE_SIZE = 24;
const PAGE_SIZE = 50;
const ANIMATED_CARDS = 12;

const TO_TOP_AT = 700;

/* event strip */
const EVENT_START_ISO = null;
const HERO_DEFAULT_MIN = true;
const HERO_KEY = "sharx:hero-min";

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
const getHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
};

const addToHistory = (game) => {
  if (typeof window === "undefined" || !game) return;
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

const readHeroMin = () => {
  if (typeof window === "undefined") return HERO_DEFAULT_MIN;
  try {
    const v = window.localStorage.getItem(HERO_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {}
  return HERO_DEFAULT_MIN;
};

const writeHeroMin = (value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HERO_KEY, value ? "1" : "0");
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
      .replace(
        /&(quot|apos|lt|gt|nbsp);|&#39;|&#x27;/g,
        (m) => NAMED_ENTITIES[m] ?? m
      )
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
  const title = String(decodeEntities(g.title) ?? "").trim();
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

/* ─────────────────────────────────────────────
   SHARED CRAYON ICON HELPER
───────────────────────────────────────────── */
const CI = memo(function CI({ name, className = "" }) {
  return (
    <span className={`crayon-ico ${className}`} aria-hidden="true">
      {getCategoryIcon(name)}
    </span>
  );
});

/* ─────────────────────────────────────────────
   INK ICONS — plain black, hand-drawn crayon strokes
   (slightly wobbly paths, round caps, no filters = fast)
───────────────────────────────────────────── */
const INK_ICONS = {
  menu: "M100,36H56A20,20,0,0,0,36,56v44a20,20,0,0,0,20,20h44a20,20,0,0,0,20-20V56A20,20,0,0,0,100,36ZM96,96H60V60H96ZM200,36H156a20,20,0,0,0-20,20v44a20,20,0,0,0,20,20h44a20,20,0,0,0,20-20V56A20,20,0,0,0,200,36Zm-4,60H160V60h36Zm-96,40H56a20,20,0,0,0-20,20v44a20,20,0,0,0,20,20h44a20,20,0,0,0,20-20V156A20,20,0,0,0,100,136Zm-4,60H60V160H96Zm104-60H156a20,20,0,0,0-20,20v44a20,20,0,0,0,20,20h44a20,20,0,0,0,20-20V156A20,20,0,0,0,200,136Zm-4,60H160V160h36Z",
  search: "M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z",
  profile: "M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77-12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z",
  close: "M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z",
  up: "M128 28c3.2 0 6.2 1.3 8.5 3.5l68 68a12 12 0 0 1-17 17L140 69v147a12 12 0 0 1-24 0V69l-47.5 47.5a12 12 0 0 1-17-17l68-68A12 12 0 0 1 128 28Z",
  down: "M208.49,152.49l-72,72a12,12,0,0,1-17,0l-72-72a12,12,0,0,1,17-17L116,187V40a12,12,0,0,1,24,0V187l51.51-51.52a12,12,0,0,1,17,17Z",
};

/* Phosphor Icons (MIT) — simple black bold glyphs */
const InkIcon = memo(function InkIcon({ name, className = "" }) {
  const d = INK_ICONS[name];
  if (!d) return null;
  return (
    <svg
      className={`ink-ico ${className}`}
      viewBox="0 0 256 256"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
});

/* ─────────────────────────────────────────────
   SHARX GAME ICONS — custom drawn
   Search  = magnifier whose lens shows a gamepad, handle = arcade joystick
   Profile = gamer with a headset + mic
   Badge   = circle face (lifts on hover) over a fixed hard crayon shadow
───────────────────────────────────────────── */
const INK = "#1B2A41";

const SearchArt = memo(function SearchArt() {
  return (
    <svg className="sx-art" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      {/* joystick handle */}
      <path d="M19.6 19.6 24.2 24.2" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M19.6 19.6 24.2 24.2" stroke="#C7B4FF" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="26.1" cy="26.1" r="3.3" fill="#FF5B4D" stroke={INK} strokeWidth="2" />
      <circle cx="25.2" cy="25.2" r="0.9" fill="#fff" />
      {/* lens */}
      <circle cx="13" cy="13" r="9.6" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <path d="M6.9 9.6a7.3 7.3 0 0 1 3.3-3" stroke="#7FC4FF" strokeWidth="1.5" strokeLinecap="round" />
      {/* gamepad in the lens */}
      <rect x="7.4" y="10" width="11.2" height="6.6" rx="3.3" fill="#FF8B7B" stroke={INK} strokeWidth="1.5" />
      <path d="M10.5 11.9v2.8M9.1 13.3h2.8" stroke={INK} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="15.5" cy="12.7" r="0.95" fill={INK} />
      <circle cx="17" cy="14.2" r="0.95" fill={INK} />
    </svg>
  );
});

const ProfileArt = memo(function ProfileArt() {
  return (
    <svg className="sx-art" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      {/* shoulders */}
      <path d="M5.2 32c.5-5.2 4.7-7.6 10.8-7.6S26.3 26.8 26.8 32Z" fill="#7BE5B5" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      {/* head */}
      <circle cx="16" cy="14.2" r="7.4" fill="#FFE3C2" stroke={INK} strokeWidth="2" />
      <circle cx="13.1" cy="14.8" r="1" fill={INK} />
      <circle cx="18.9" cy="14.8" r="1" fill={INK} />
      <path d="M13.6 17.6q2.4 1.9 4.8 0" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
      {/* headset band */}
      <path d="M7.9 14.2a8.1 8.1 0 0 1 16.2 0" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M7.9 14.2a8.1 8.1 0 0 1 16.2 0" stroke="#FF8B7B" strokeWidth="1.5" strokeLinecap="round" />
      {/* ear cups */}
      <rect x="4.9" y="11.6" width="3.8" height="6.4" rx="1.6" fill="#FF8B7B" stroke={INK} strokeWidth="1.6" />
      <rect x="23.3" y="11.6" width="3.8" height="6.4" rx="1.6" fill="#FF8B7B" stroke={INK} strokeWidth="1.6" />
      {/* mic */}
      <path d="M25.2 18c0 3.3-2.9 4.7-6.1 3.7" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18.8" cy="21.7" r="1.3" fill={INK} />
    </svg>
  );
});

const CloseArt = memo(function CloseArt() {
  return (
    <svg className="sx-art" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <path d="M10.5 10.5l11 11M21.5 10.5l-11 11" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
});

const Badge = memo(function Badge({ children }) {
  return (
    <span className="sx-badge" aria-hidden="true">
      <span className="sx-badge-shadow" />
      <span className="sx-badge-face">{children}</span>
    </span>
  );
});

const HeadingIcon = memo(function HeadingIcon({ name }) {
  return (
    <span className="home-row-crayon crayon-ico" aria-hidden="true">
      {getCategoryIcon(name)}
    </span>
  );
});

/* ─────────────────────────────────────────────
   MINI AVATAR
───────────────────────────────────────────── */
const MiniAvatar = memo(function MiniAvatar({ profile }) {
  if (!profile) return <ProfileArt />;
  if (profile.avatarType === "google" && profile.avatarUrl) {
    return (
      <Image
        src={profile.avatarUrl}
        alt="avatar"
        loading="lazy"
        width={40}
        height={40}
        unoptimized
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "50%",
        }}
      />
    );
  }
  return (
    <SharxAvatar
      shape={profile.avatarShape || "heart"}
      eyes={profile.avatarEyes || "round"}
      color={profile.avatarColor || "#C7B4FF"}
      size={42}
      flat
    />
  );
});

/* ─────────────────────────────────────────────
   GAMES GRID
───────────────────────────────────────────── */
const GamesGrid = memo(function GamesGrid({ games, onOpen, variant }) {
  return (
    <div className={`games-grid${variant ? ` games-grid-${variant}` : ""}`}>
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

/* ─────────────────────────────────────────────
   HORIZONTAL ROW — clean, no See-all, no arrows
───────────────────────────────────────────── */
const HRow = memo(function HRow({
  title,
  iconKey,
  games,
  onOpen,
  animate = false,
}) {
  if (!games || games.length === 0) return null;

  return (
    <section className="home-row hrow">
      <div className="home-row-header">
        <h2 className="home-row-heading">
          <HeadingIcon name={iconKey} />
          <span className="home-row-title">{title}</span>
        </h2>
      </div>

      <div className="hrow-track">
        {games.map((game, i) => (
          <RowCard
            key={game.id ?? game.title ?? i}
            game={game}
            index={i}
            animate={animate && i < ANIMATED_CARDS}
            onNavigate={() => onOpen(game)}
          />
        ))}
      </div>
    </section>
  );
});

/* ─────────────────────────────────────────────
   COUNTDOWN
───────────────────────────────────────────── */
const useCountdown = (iso) => {
  const target = useMemo(() => (iso ? Date.parse(iso) : NaN), [iso]);
  const [now, setNow] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(target)) return undefined;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!Number.isFinite(target) || now == null) return null;
  const diff = Math.max(0, target - now);
  if (diff === 0) return { live: true };

  const s = Math.floor(diff / 1000);
  return {
    live: false,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
};

/* ─────────────────────────────────────────────
   EVENT CARD — ONE merged card
   strip (always visible) + body (stretches down)
   Same red/purple crayon gift lives in the strip AND,
   big and animated, in RewardEventBanner (the body).
───────────────────────────────────────────── */
const EventStrip = memo(function EventStrip({
  expanded,
  onToggle,
  children,
}) {
  const cd = useCountdown(EVENT_START_ISO);

  const handleBtn = useCallback(
    (e) => {
      e.stopPropagation();
      onToggle();
    },
    [onToggle]
  );

  return (
    <div className={`event-card${expanded ? " is-open" : ""}`}>
      {/* STRIP — tap anywhere on it to open / close */}
      <div className="event-strip" onClick={onToggle}>
        <span className="event-strip-ico crayon-ico" aria-hidden="true">
          {getCategoryIcon("gift")}
        </span>

        <div className="event-strip-text">
          <span className="event-strip-title">SHARX First Event</span>
          <span className="event-strip-sub">Play &amp; earn real rewards</span>
        </div>

        {cd && !cd.live ? (
          <div className="event-cd" role="timer" aria-label="Time until event">
            {[
              ["d", cd.d],
              ["h", cd.h],
              ["m", cd.m],
              ["s", cd.s],
            ].map(([unit, value]) => (
              <span key={unit} className="event-cd-cell">
                <b>{String(value).padStart(2, "0")}</b>
                <i>{unit}</i>
              </span>
            ))}
          </div>
        ) : (
          <span className={`event-strip-pill${cd?.live ? " is-live" : ""}`}>
            <span className="event-strip-pill-ico" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="8" />
                <path d="M12 7.6V12l3 2" />
              </svg>
            </span>
            <span className="event-strip-pill-label">
              {cd?.live ? "Live now" : "Starting soon"}
            </span>
          </span>
        )}

        <button
          type="button"
          className="event-strip-btn"
          onClick={handleBtn}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide event details" : "Show event details"}
        >
          <span className="event-strip-btn-label">
            {expanded ? "Hide" : "Details"}
          </span>
          <span className="event-strip-chev" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
      </div>

      {/* BODY — pure CSS grid-rows open/close, no JS measuring */}
      <div className="event-body" aria-hidden={!expanded}>
        <div className="event-body-inner">{children}</div>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────
   INFINITE LOADER
───────────────────────────────────────────── */
const InfiniteLoader = memo(function InfiniteLoader({
  loading = false,
  error = null,
  canLoadMore = false,
  onLoadMore,
  onRetry,
}) {
  if (!loading && !error && !canLoadMore) return null;
  return (
    <div className="infinite-loader-wrap" aria-live="polite">
      {loading ? (
        <div className="infinite-loader infinite-loader-active">
          <span className="crayon-loader" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Loading more games</span>
        </div>
      ) : error ? (
        <div className="infinite-loader infinite-loader-error-state">
          <span className="infinite-loader-error">{error}</span>
          <button
            type="button"
            className="infinite-loader-retry"
            onClick={onRetry}
          >
            Try again
          </button>
        </div>
      ) : (
        <button type="button" className="load-more-btn" onClick={onLoadMore}>
          <span className="load-more-label">More games</span>
          <span className="more-circle" aria-hidden="true">
            <InkIcon name="down" />
          </span>
        </button>
      )}
    </div>
  );
});

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
const Footer = memo(function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="site-footer footer-in">
      <div className="footer-body">
        <div className="footer-row">
          <Link href="/" className="footer-logo" aria-label="Go to Sharx home">
            <Image
              src="/sharx-logo.webp"
              alt="Sharx"
              width={46}
              height={46}
              draggable={false}
              loading="lazy"
              style={{ width: "auto", height: "46px", objectFit: "contain" }}
            />
          </Link>

          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/inside" className="footer-link">
              About Us
            </Link>
            <Link href="/hello" className="footer-link">
              Contact
            </Link>
            <Link href="/trust" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link">
              Terms of Service
            </Link>
            <Link href="/copyright" className="footer-link">
              Copyright
            </Link>
          </nav>

          <span className="footer-copyright">
            © {year} Sharx. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
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
  const { user, authLoading, logout: authLogout } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [pageReady, setPageReady] = useState(false);
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
  const [heroMin, setHeroMin] = useState(HERO_DEFAULT_MIN);
  const [showTop, setShowTop] = useState(false);

  const [founderNoteOpen, setFounderNoteOpen] = useState(false);
  const handleOpenFounderNote = useCallback(() => setFounderNoteOpen(true), []);
  const handleCloseFounderNote = useCallback(
    () => setFounderNoteOpen(false),
    []
  );

  useEffect(() => {
    if (authLoading || !user) return undefined;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get("profile") !== "1") return;
        setShowProfile(true);
        url.searchParams.delete("profile");
        window.history.replaceState(
          window.history.state,
          "",
          `${url.pathname}${url.search}${url.hash}`
        );
      } catch {}
    });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const [socialModal, setSocialModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pushedOwnHistoryRef = useRef(false);
  const fetchInFlightRef = useRef(false);
  const fetchAbortRef = useRef(null);
  const allGamesRef = useRef(prepareGames(initialGames));
  const currentPageRef = useRef(
    Math.max(1, Math.ceil(initialGames.length / PAGE_SIZE))
  );
  const [apiHasMore, setApiHasMore] = useState(
    initialGames.length === 0 || initialGames.length >= PAGE_SIZE
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const searchInputRef = useRef(null);
  const chipsRef = useRef(null);
  const baseTitleRef = useRef(null);
  const scrollLockRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let timeout = 0;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setPageReady(true), {
        timeout: 300,
      });
      return () => {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(id);
        }
      };
    }
    raf = window.requestAnimationFrame(() => {
      timeout = window.setTimeout(() => setPageReady(true), 0);
    });
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.body.classList.toggle("modal-open", !!activeGame);
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [activeGame]);

  /* ── DRAWER SCROLL LOCK ──────────────────────────
     overflow:hidden alone doesn't stop iOS / Android
     background scroll. Pinning the body with
     position:fixed does. Scroll position is restored
     on close. Also adds body.drawer-open so CSS can
     kill any backdrop-filter blur bleed. */
  useEffect(() => {
    if (!sidebarOpen || typeof document === "undefined") return undefined;

    const body = document.body;
    const html = document.documentElement;
    const y = window.scrollY || window.pageYOffset || 0;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overscroll: html.style.overscrollBehavior,
    };

    scrollLockRef.current = { y };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    html.style.overscrollBehavior = "none";
    body.classList.add("drawer-open");

    return () => {
      const restoreY = scrollLockRef.current?.y ?? y;
      scrollLockRef.current = null;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      html.style.overscrollBehavior = prev.overscroll;
      body.classList.remove("drawer-open");
      // Restore the exact previous position without starting another animation.
      window.scrollTo(0, restoreY);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const h = (e) => {
      if (e.matches) setSidebarOpen(false);
    };
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", h);
      return () => mq.removeEventListener("change", h);
    }
    // Safari versions that only support the legacy MediaQueryList API.
    mq.addListener(h);
    return () => mq.removeListener(h);
  }, []);

  useEffect(() => {
    setHeroMin(readHeroMin());
  }, []);

  /* back-to-top visibility */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        if (document.body.classList.contains("drawer-open")) return;
        const shouldShow = window.scrollY > TO_TOP_AT;
        // Avoid React renders on every scroll frame when visibility is unchanged.
        setShowTop((current) => (current === shouldShow ? current : shouldShow));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
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
      if (game?.title)
        document.title = `${game.title} - Play Free Online | Sharx`;
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
      if (game?.title)
        document.title = `${game.title} - Play Free Online | Sharx`;
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

  const fetchGames = useCallback(async (pageNum, isFirst = false) => {
    if (fetchInFlightRef.current) return false;
    fetchInFlightRef.current = true;
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    if (isFirst) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
      setLoadMoreError(null);
    }

    try {
      const response = await fetch(
        `/api/games?page=${pageNum}&limit=${PAGE_SIZE}`,
        {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        }
      );

      let data = null;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid API response.");
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server error: ${response.status}`);
      }

      const gamesArray = Array.isArray(data?.games) ? data.games : [];

      if (gamesArray.length === 0) {
        setApiHasMore(false);
        return false;
      }

      const previousGames = isFirst ? [] : allGamesRef.current;
      const combinedGames = prepareGames([...previousGames, ...gamesArray]);

      if (!isFirst && combinedGames.length === previousGames.length) {
        setApiHasMore(false);
        return false;
      }

      allGamesRef.current = combinedGames;
      setAllGames(combinedGames);
      currentPageRef.current = pageNum;

      const mightHaveMore =
        gamesArray.length >= PAGE_SIZE || data?.hasMore === true;

      setApiHasMore(mightHaveMore);
      return true;
    } catch (err) {
      if (err?.name === "AbortError") return false;
      console.error("Load games failed:", err);
      if (isFirst) {
        setError("Failed to load games. Please refresh.");
      } else {
        setLoadMoreError("Could not load more games. Please try again.");
      }
      return false;
    } finally {
      if (fetchAbortRef.current === controller) {
        fetchAbortRef.current = null;
      }
      fetchInFlightRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (initialGames.length !== 0) return undefined;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void fetchGames(1, true);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchGames, initialGames.length]);

  useEffect(
    () => () => {
      fetchAbortRef.current?.abort();
      fetchAbortRef.current = null;
      fetchInFlightRef.current = false;
    },
    []
  );

  const loadNextGamesPage = useCallback(async () => {
    if (fetchInFlightRef.current || loadingMore) return;
    const loadedGames = allGamesRef.current.length;

    if (visibleCount < loadedGames) {
      setVisibleCount((count) => Math.min(count + ALL_PAGE_SIZE, loadedGames));
      return;
    }

    if (!apiHasMore) return;

    const nextPage = currentPageRef.current + 1;
    const loaded = await fetchGames(nextPage, false);

    if (loaded) {
      setVisibleCount((count) =>
        Math.min(count + ALL_PAGE_SIZE, allGamesRef.current.length)
      );
    }
  }, [visibleCount, loadingMore, apiHasMore, fetchGames]);

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
      if (scrollLockRef.current) {
        /* drawer is open → unlock will jump straight to top */
        scrollLockRef.current.y = 0;
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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
  }, []);
  const handleShowProfile = useCallback(() => setShowProfile(true), []);
  const handleSocialClick = useCallback((p) => setSocialModal(p), []);
  const handleCloseSocialModal = useCallback(() => setSocialModal(null), []);
  const handleRetry = useCallback(() => {
    void fetchGames(1, true);
  }, [fetchGames]);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleLogout = useCallback(async () => {
    try {
      await authLogout();
    } finally {
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

  const toggleHero = useCallback(() => {
    setHeroMin((prev) => {
      const next = !prev;
      writeHeroMin(next);
      return next;
    });
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (sidebarOpen) setSidebarOpen(false);
        else if (searchOpen || search) {
          setSearchOpen(false);
          setSearch("");
        } else if (activeGame) handleCloseModal();
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const t = e.target;
        const tag = t?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable)
          return;
        if (activeGame) return;
        e.preventDefault();
        setSearchOpen(true);
        window.requestAnimationFrame(() => searchInputRef.current?.focus());
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    const match = path.match(/^\/game\/([^/]+)/);

    if (!match) return;

    const raw = decodeURIComponent(match[1]);
    const id = raw.match(/^gm_\d+/)?.[0] || raw;

    const found =
      allGames.find((g) => String(g.id) === id) ||
      (initialActiveGame && String(initialActiveGame.id) === id
        ? cleanGame(initialActiveGame)
        : null);

    if (!found) return;

    const frame = window.requestAnimationFrame(() => {
      setActiveGame(found);
      pushedOwnHistoryRef.current = false;
    });

    if (baseTitleRef.current === null) {
      baseTitleRef.current = document.title;
    }

    if (found.title) {
      document.title = `${found.title} - Play Free Online | Sharx`;
    }

    return () => window.cancelAnimationFrame(frame);
  }, [allGames, initialActiveGame]);

  const searchLower = useMemo(() => search.trim().toLowerCase(), [search]);

  const categories = useMemo(() => {
    const u = new Set();
    for (const g of allGames) if (g.category) u.add(g.category);
    return ["All", ...Array.from(u)];
  }, [allGames]);

  useEffect(() => {
    const bar = chipsRef.current;
    if (!bar) return;
    const el = bar.querySelector(".chip-on");
    if (!el) return;
    bar.scrollTo({
      left: Math.max(0, el.offsetLeft - (bar.clientWidth - el.clientWidth) / 2),
      behavior: "smooth",
    });
  }, [category, categories.length]);

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

  const trendingIds = useMemo(() => {
    const s = new Set();
    for (const g of trendingRow) if (g?.id != null) s.add(g.id);
    return s;
  }, [trendingRow]);

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

  const canLoadMore = visibleCount < allGamesFiltered.length || apiHasMore;

  const handleOpenProfileFromOnboarding = useCallback(() => {
    setShowProfile(true);
  }, []);

  const handlePlayFirstGame = useCallback(() => {
    if (allGamesRef.current.length > 0) {
      const first = allGamesRef.current[0];
      openGame(first);
    }
  }, [openGame]);

  const topVisible = showTop && !activeGame;

  return (
    <div className={`app-shell${pageReady ? " page-ready" : ""}`}>
      <div className="bg-scene" aria-hidden="true" />

      <Sidebar
        categories={categories}
        activeCategory={category}
        onSelectCategory={handleCategorySelect}
        open={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      <div className="main-col">
        {/* TOPBAR */}
        <div className="topbar">
          <button
            type="button"
            className="hamburger-btn"
            onClick={handleOpenSidebar}
            aria-label="Open menu"
          >
            <InkIcon name="menu" className="ink-btn-ico" />
          </button>

          <div className="topbar-spacer" />

          <div className="topbar-r">
            <button
              type="button"
              className={`sx-btn is-search${searchOpen ? " is-on" : ""}`}
              onClick={toggleSearch}
              aria-label={searchOpen ? "Close search" : "Search games"}
              aria-expanded={searchOpen}
            >
              <Badge>{searchOpen ? <CloseArt /> : <SearchArt />}</Badge>
            </button>

            {!mounted || authLoading ? (
              <span
                className="sx-btn"
                aria-hidden="true"
                style={{ visibility: "hidden" }}
              />
            ) : user ? (
              <button
                className="sx-btn is-profile is-user"
                onClick={handleShowProfile}
                type="button"
                aria-label="Open your profile"
                title="Your profile"
              >
                <Badge>
                  <MiniAvatar profile={profile} />
                </Badge>
              </button>
            ) : (
              <button
                className="sx-btn is-profile"
                onClick={handlePanelLogin}
                type="button"
                aria-label="Login"
                title="Login"
              >
                <Badge>
                  <ProfileArt />
                </Badge>
              </button>
            )}
          </div>

          {searchOpen && (
            <div className="topbar-search-drop" role="search">
              <InkIcon name="search" className="ink-search-sm" />
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
                  <InkIcon name="close" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* MOBILE CATEGORY CHIPS */}
        <nav className="chips-bar" ref={chipsRef} aria-label="Categories">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${c === category ? " chip-on" : ""}`}
              onClick={() => handleCategorySelect(c)}
              aria-current={c === category ? "true" : undefined}
            >
              <span className="chip-ico crayon-ico" aria-hidden="true">
                {getCategoryIcon(c)}
              </span>
              <span className="chip-label">
                {c === "All" ? "All Games" : c}
              </span>
            </button>
          ))}
        </nav>

        {/* PAGE CONTENT */}
        <main className="page-content">
          <h1 className="sr-only">Sharx — Play Free Online Games</h1>

          <OnboardingCard
            onOpenProfile={handleOpenProfileFromOnboarding}
            onPlayFirstGame={handlePlayFirstGame}
          />

          {/* EVENT — one merged card */}
          <div className="hero-wrap">
            <EventStrip expanded={!heroMin} onToggle={toggleHero}>
              <Suspense
                fallback={<div className="shrx-ev-skeleton" aria-hidden="true" />}
              >
                <RewardEventBanner />
              </Suspense>
            </EventStrip>
          </div>

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
                      <HeadingIcon name="search" />
                      <span className="home-row-title">
                        Results for &ldquo;{search.trim()}&rdquo;
                      </span>
                    </h2>
                    <span className="home-row-count">
                      {searchResults.length}{" "}
                      {searchResults.length === 1 ? "game" : "games"}
                    </span>
                  </div>
                  <GamesGrid games={visibleSearch} onOpen={openGame} />
                </section>
                {(visibleCount < searchResults.length || apiHasMore) && (
                  <InfiniteLoader
                    loading={loadingMore}
                    error={loadMoreError}
                    canLoadMore={true}
                    onLoadMore={() => void loadNextGamesPage()}
                    onRetry={() => void loadNextGamesPage()}
                  />
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
                      <HeadingIcon name={category} />
                      <span className="home-row-title">{category}</span>
                    </h2>
                    <span className="home-row-count">
                      {categoryResults.length}{" "}
                      {categoryResults.length === 1 ? "game" : "games"}
                    </span>
                  </div>
                  <GamesGrid games={visibleCategory} onOpen={openGame} />
                </section>
                {(visibleCount < categoryResults.length || apiHasMore) && (
                  <InfiniteLoader
                    loading={loadingMore}
                    error={loadMoreError}
                    canLoadMore={true}
                    onLoadMore={() => void loadNextGamesPage()}
                    onRetry={() => void loadNextGamesPage()}
                  />
                )}
              </div>
            )
          ) : category === "Trending" ? (
            <div className="section-panel">
              <section className="home-row">
                <div className="home-row-header">
                  <h2 className="home-row-heading">
                    <HeadingIcon name="trending" />
                    <span className="home-row-title">Trending</span>
                  </h2>
                  <span className="home-row-count">
                    {trendingRow.length}{" "}
                    {trendingRow.length === 1 ? "game" : "games"}
                  </span>
                </div>
                <GamesGrid
                  games={trendingRow}
                  onOpen={openGame}
                  variant="trending"
                />
              </section>
            </div>
          ) : (
            <>
              {/* Trending — clean, no buttons */}
              <div className="section-panel">
                <HRow
                  title="Trending"
                  iconKey="trending"
                  games={trendingRow}
                  onOpen={openGame}
                  animate
                />
              </div>

              {/* All Games — grid */}
              <div className="section-panel">
                <section className="home-row">
                  <div className="home-row-header">
                    <h2 className="home-row-heading">
                      <HeadingIcon name="all" />
                      <span className="home-row-title">All Games</span>
                    </h2>
                    <span className="home-row-count">
                      {allGamesFiltered.length}{" "}
                      {allGamesFiltered.length === 1 ? "game" : "games"}
                    </span>
                  </div>
                  <GamesGrid games={visibleGames} onOpen={openGame} />
                </section>

                {canLoadMore && (
                  <InfiniteLoader
                    loading={loadingMore}
                    error={loadMoreError}
                    canLoadMore={true}
                    onLoadMore={() => void loadNextGamesPage()}
                    onRetry={() => void loadNextGamesPage()}
                  />
                )}
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

        {showProfile && user && (
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

        {founderNoteOpen && (
          <Suspense fallback={null}>
            <FounderNoteModal
              open={founderNoteOpen}
              onClose={handleCloseFounderNote}
            />
          </Suspense>
        )}

        <Footer />
      </div>

      {/* BACK TO TOP — bare crayon arrow */}
      <button
        type="button"
        className={`to-top${topVisible ? " is-visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        tabIndex={topVisible ? 0 : -1}
      >
        <InkIcon name="up" className="ink-btn-ico" />
      </button>
    </div>
  );
}