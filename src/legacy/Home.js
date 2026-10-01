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
import GameOfTheDay from "./GameOfTheDay";
import SharxAvatar from "./SharxAvatar";
import "./Home.css";

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
   ICONS
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   MINI AVATAR
───────────────────────────────────────────── */
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
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
      />
    );
  }
  return (
    <SharxAvatar
      shape={profile.avatarShape || "heart"}
      eyes={profile.avatarEyes || "round"}
      color={profile.avatarColor || "#C7B4FF"}
      size={38}
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
          <button type="button" className="infinite-loader-retry" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : (
        <button type="button" className="load-more-btn" onClick={onLoadMore}>
          MORE GAMES
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
      )}
    </div>
  );
});

/* ─────────────────────────────────────────────
   FOOTER — logo · links · copyright
───────────────────────────────────────────── */
const Footer = memo(function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const footerRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
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
        <div className="footer-row">
          <Link href="/" className="footer-logo" aria-label="Go to Sharx home">
            <Image
              src="/sharx-logo.webp"
              alt="Sharx"
              width={46}
              height={46}
              draggable={false}
              loading="lazy"
            />
          </Link>

          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/inside" className="footer-link">About Us</Link>
            <Link href="/hello" className="footer-link">Contact</Link>
            <Link href="/trust" className="footer-link">Privacy Policy</Link>
            <Link href="/terms" className="footer-link">Terms of Service</Link>
            <Link href="/copyright" className="footer-link">Copyright</Link>
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
  const { logout: authLogout } = useAuth();
  const { profile, updateProfile } = useProfile();

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
  const [socialModal, setSocialModal] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pushedOwnHistoryRef = useRef(false);
  const fetchInFlightRef = useRef(false);
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
  const baseTitleRef = useRef(null);

  /* ─── BOOT ─── */
  useEffect(() => {
    let raf = 0;
    let timeout = 0;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setPageReady(true), {
        timeout: 300,
      });
      return () => window.cancelIdleCallback?.(id);
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

  const syncLoginState = useCallback(() => {
    if (typeof window === "undefined") return;
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    const t = window.setTimeout(syncLoginState, 0);
    return () => window.clearTimeout(t);
  }, [syncLoginState]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
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

  const fetchGames = useCallback(async (pageNum, isFirst = false) => {
    if (fetchInFlightRef.current) return false;
    fetchInFlightRef.current = true;
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
          cache: "no-store",
          headers: { Accept: "application/json" },
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
      console.error("Load games failed:", err);
      if (isFirst) {
        setError("Failed to load games. Please refresh.");
      } else {
        setLoadMoreError("Could not load more games. Please try again.");
      }
      return false;
    } finally {
      fetchInFlightRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (initialGames.length > 0) {
      const prepared = prepareGames(initialGames);
      allGamesRef.current = prepared;
      setAllGames(prepared);
      setApiHasMore(initialGames.length >= PAGE_SIZE);
      return;
    }
    void fetchGames(1, true);
  }, [fetchGames, initialGames.length]);

  const loadNextGamesPage = useCallback(async () => {
    if (fetchInFlightRef.current || loadingMore) return;
    const loadedGames = allGamesRef.current.length;
    if (visibleCount < loadedGames) {
      setVisibleCount((count) =>
        Math.min(count + ALL_PAGE_SIZE, loadedGames)
      );
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
    void fetchGames(1, true);
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

  /* ─── POPSTATE + INITIAL /game/ URL ─── */
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

    setActiveGame(found);
    pushedOwnHistoryRef.current = false;

    if (baseTitleRef.current === null) {
      baseTitleRef.current = document.title;
    }

    if (found.title) {
      document.title = `${found.title} - Play Free Online | Sharx`;
    }
  }, [allGames, initialActiveGame]);

  const searchLower = useMemo(() => search.trim().toLowerCase(), [search]);

  const categories = useMemo(() => {
    const u = new Set();
    for (const g of allGames) if (g.category) u.add(g.category);
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

  /* ────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────── */
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
                className="profile-btn profile-btn--premium"
                onClick={handleShowProfile}
                type="button"
                aria-label="Open your profile"
                title="Your profile"
              >
                <span className="profile-btn-ring" aria-hidden="true" />
                <span className="profile-avatar">
                  <MiniAvatar profile={profile} />
                </span>
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

        {/* PAGE CONTENT */}
        <main className="page-content">
          <h1 className="sr-only">Sharx — Play Free Online Games</h1>

          {/* ─── HERO FIRST — LCP element loads at top of page ─── */}
          {!searchResults && category === "All" && (
            <GameOfTheDay games={allGames} onOpen={openGame} />
          )}

          {/* ─── REWARD BANNER AFTER hero — skeleton prevents CLS ─── */}
          <Suspense
            fallback={
              <div className="shrx-ev-skeleton" aria-hidden="true" />
            }
          >
            <RewardEventBanner
              onOpenRewards={() => {
                if (isLoggedIn) {
                  setShowProfile(true);
                } else {
                  setPanelMode("login");
                }
              }}
            />
          </Suspense>

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
                      <span className="home-row-icon star">
                        {CATEGORY_ICON}
                      </span>
                      {category}
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
                <GamesGrid
                  games={trendingRow}
                  onOpen={openGame}
                  variant="trending"
                />
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
                  <GamesGrid
                    games={trendingRow}
                    onOpen={openGame}
                    variant="trending"
                  />
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

        <Footer />
      </div>
    </div>
  );
}