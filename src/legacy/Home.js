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
/* 14 = two full rows on a 7-column screen */
const TRENDING_LIMIT = 14;

/* Show 48 games first, then +48 on Load More */
const ALL_PAGE_SIZE = 48;

const PAGE_SIZE = 50;
const MAX_PAGES = 60;
const BATCH_SIZE = 5;

/* Only first N cards animate — huge perf win on low-end devices */
const ANIMATED_CARDS = 12;

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

/* ─── Text cleanup ───
   Game titles sometimes arrive as "Destroy &amp; Grow" from the data source.
   This turns HTML entities back into normal characters. It uses plain string
   replacement (no DOM), so the server and the browser always give the same result. */
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
              {/* ✅ ADDED: Copyright link */}
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

export default function Home({
  initialGames = [],
  initialActiveGame = null,
  initialTrendingGames = [],
}) {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { profile, updateProfile } = useProfile();

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

  /* Browser tab title follows the open game (and goes back when closed) */
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

  /* Switch to another game from inside the open modal.
     Uses replaceState (not pushState) so closing the modal still needs only one Back. */
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

  /* LCP FIX: defer fetch to idle — page paints first */
  useEffect(() => {

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => void fetchGames(), {
        timeout: 2000,
      });
      return () => window.cancelIdleCallback(id);
    }

    const t = setTimeout(() => void fetchGames(), 300);
    return () => clearTimeout(t);
  }, [fetchGames, initialGames.length]);

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
    /* the user may have just logged in inside the panel */
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

  /* Search icon (mobile): open + focus, or close + clear */
  const toggleSearch = useCallback(() => {
    if (searchOpen) {
      setSearchOpen(false);
      setSearch("");
    } else {
      setSearchOpen(true);
      window.requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [searchOpen]);

  /* LOAD MORE — add 48 more games */
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

  /* exclude trending IDs from All Games — no duplication */
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

          {/* Search: always visible on desktop, opens from the icon on mobile */}
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