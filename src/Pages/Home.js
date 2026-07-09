"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../Context/AuthContext";
import { useProfile } from "../Context/ProfileContext";
import { GAMES_BASE, API_BASE } from "../config";
import "./Home.css";

// PERFORMANCE: These panels only render after a user interaction (login
// click / profile click), so they're code-split out of the initial Home
// bundle instead of being imported eagerly.
const SidePanel = lazy(() => import("../Pages/SidePanel"));
const ProfileSidePanel = lazy(() => import("../Pages/ProfileSidePanel"));

const HISTORY_KEY = "pv_history";
const MAX_HISTORY = 12;

// Optimized history functions
const getHistory = () => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
};

const addToHistory = (game) => {
  const prev = getHistory().filter(g => g.id !== game.id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([
    { ...game, playedAt: Date.now() },
    ...prev
  ].slice(0, MAX_HISTORY)));
};

// Dedupe games by id, keeping the first occurrence. Games without an id
// are kept as-is since we can't safely tell if they're duplicates.
const dedupeById = (list) => {
  const seen = new Set();
  const result = [];
  for (const g of list) {
    if (g?.id == null) {
      result.push(g);
      continue;
    }
    if (!seen.has(g.id)) {
      seen.add(g.id);
      result.push(g);
    }
  }
  return result;
};

// Memoized featured check for performance
const FEATURED_INDICES = new Set([0, 7, 16]);
const isFeaturedFast = (i) => FEATURED_INDICES.has(i);

/* ════════════════════════════════════════════════════════════
   SOCIAL "COMING SOON" MODAL
   Shown when the footer Instagram / YouTube icons are clicked,
   since neither channel exists yet.
════════════════════════════════════════════════════════════ */
const SOCIAL_INFO = {
  instagram: {
    label: "Instagram",
    tagline: "Sneak peeks, behind-the-scenes & more 📸",
    message: "We're getting things ready! Our Instagram page will be launching soon. Stay tuned for exciting updates and be among the first to follow us!",
    gradient: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  youtube: {
    label: "YouTube",
    tagline: "Tutorials, gameplay & fun videos 🎬",
    message: "Our channel is in the works! We're gearing up to bring you awesome videos soon. Subscribe as soon as we're live and never miss an upload!",
    gradient: "linear-gradient(135deg, #ff0000, #cc0000)",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
};

const SocialComingSoonModal = React.memo(({ platform, onClose }) => {
  const info = SOCIAL_INFO[platform];

  const handleBgClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!info) return null;

  return (
    <div className="scs-bg" onClick={handleBgClick}>
      <style>{`
        @keyframes scsIn { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes scsFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scsPulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
        .scs-bg {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: scsFade .2s ease;
        }
        .scs-card {
          width: 100%; max-width: 360px;
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
          animation: scsIn .25s cubic-bezier(.2,.9,.3,1.2);
        }
        .scs-head { padding: 28px 20px 22px; text-align: center; position: relative; }
        .scs-close {
          position: absolute; top: 10px; right: 12px;
          background: rgba(255,255,255,0.25);
          border: none; color: #fff;
          width: 28px; height: 28px; border-radius: 50%;
          cursor: pointer; font-size: 15px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
        }
        .scs-close:hover { background: rgba(255,255,255,0.4); }
        .scs-icon-wrap {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }
        .scs-title { color: #fff; font-size: 17px; font-weight: 700; margin: 0; }
        .scs-body { padding: 20px 22px 24px; text-align: center; }
        .scs-text { color: #475569; font-size: 14px; line-height: 1.6; margin: 0; }
        .scs-tagline { color: #0f172a; font-size: 14px; font-weight: 700; margin: 0 0 8px; }
        .scs-tag {
          margin-top: 14px; display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; color: #94a3b8; font-weight: 600;
          letter-spacing: .3px; text-transform: uppercase;
        }
        .scs-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: scsPulse 1.4s ease infinite; }
        .scs-btn {
          margin-top: 18px; width: 100%; border: none; border-radius: 10px;
          background: #0f172a; color: #fff; font-size: 14px; font-weight: 600;
          padding: 11px 0; cursor: pointer;
        }
        .scs-btn:hover { background: #1e293b; }
      `}</style>
      <div className="scs-card">
        <div className="scs-head" style={{ background: info.gradient }}>
          <button className="scs-close" onClick={onClose} aria-label="Close">✕</button>
          <div className="scs-icon-wrap">{info.icon}</div>
          <p className="scs-title">{info.label}</p>
        </div>
        <div className="scs-body">
          {info.tagline && <p className="scs-tagline">{info.tagline}</p>}
          <p className="scs-text">{info.message}</p>
          <div className="scs-tag">
            <span className="scs-dot" />
            Launching soon
          </div>
          <button className="scs-btn" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
});

/* ─── HOME ─── */
export default function Home() {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { profile, updateProfile } = useProfile();

  // State declarations - optimized with proper initial values
  const [allGames, setAllGames] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeGame, setActiveGame] = useState(null);
  const [error, setError] = useState(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [panelMode, setPanelMode] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [socialModal, setSocialModal] = useState(null); // "instagram" | "youtube" | null

  // Refs for logo click tracking
  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef(null);

  // Memoize login status to prevent recalculation
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // PERFORMANCE: precompute origins for the games/API hosts so we can
  // preconnect to them as early as possible, shaving DNS/TCP/TLS time
  // off the fetch that gates the first paint of the game grid (LCP).
  const gamesOrigin = useMemo(() => {
    try { return new URL(GAMES_BASE).origin; } catch { return null; }
  }, []);
  const apiOrigin = useMemo(() => {
    try { return new URL(API_BASE).origin; } catch { return null; }
  }, []);

  // ─── STABLE CALLBACKS ───
  const openGame = useCallback((game) => {
    addToHistory(game);
    setActiveGame(game);
  }, []);

  const handleNavLogoClick = useCallback(() => {
    logoClickCountRef.current += 1;
    if (logoClickTimerRef.current) {
      clearTimeout(logoClickTimerRef.current);
    }
    logoClickTimerRef.current = setTimeout(() => {
      logoClickCountRef.current = 0;
    }, 800);

    if (logoClickCountRef.current === 5) {
      setShowEasterEgg(true);
      logoClickCountRef.current = 0;
      setTimeout(() => setShowEasterEgg(false), 3000);
    }
  }, []);

  const handleNavLogoClickWithNavigate = useCallback(() => {
    handleNavLogoClick();
    router.push("/");
  }, [handleNavLogoClick, router]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const handleCategoryClick = useCallback((c) => {
    setCategory(c);
    setSearch("");
  }, []);

  const clearCategoryAndSearch = useCallback(() => {
    setCategory("All");
    setSearch("");
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveGame(null);
  }, []);

  const handleCloseEasterEgg = useCallback(() => {
    setShowEasterEgg(false);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setShowProfile(false);
  }, []);

  const handlePanelLogin = useCallback(() => {
    setPanelMode("login");
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelMode(null);
  }, []);

  const handleShowProfile = useCallback(() => {
    setShowProfile(true);
  }, []);

  // Instagram / YouTube icons don't link anywhere yet — show "coming soon" instead
  const handleSocialClick = useCallback((platform) => {
    setSocialModal(platform);
  }, []);

  const handleCloseSocialModal = useCallback(() => {
    setSocialModal(null);
  }, []);

  // ─── FETCH GAMES ───
  const fetchGames = useCallback(async (pageNum, isFirst) => {
    if (isFirst) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const res = await fetch(`${GAMES_BASE}/games?page=${pageNum}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setAllGames(prev => {
          const combined = isFirst ? data : [...prev, ...data];
          // Dedupe by id — some pages overlap and send the same game
          // twice, which is what was causing the duplicate React key
          // warnings in the console.
          return dedupeById(combined);
        });
        setHasMore(data.length === 50);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      if (isFirst) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchGames(1, true);
  }, [fetchGames]);

  // ─── LOAD MORE ───
  const loadMore = useCallback(() => {
    if (loadingMore) return;
    const next = page + 1;
    setPage(next);
    fetchGames(next, false);
  }, [loadingMore, page, fetchGames]);

  const loadMoreClick = useCallback(() => {
    loadMore();
  }, [loadMore]);

  // ─── KEYBOARD HANDLER ───
  const handleEscapeKey = useCallback((e) => {
    if (e.key === "Escape") {
      setActiveGame(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [handleEscapeKey]);

  // ─── OPTIMIZED SEARCH & FILTERING ───
  const searchLower = useMemo(() => search.toLowerCase(), [search]);
  const categoryFilter = useMemo(() =>
    category === "All" ? null : category,
    [category]
  );

  const displayedGames = useMemo(() => {
    // Fast path - no filters
    if (!categoryFilter && !searchLower) {
      return allGames;
    }

    return allGames.filter(g => {
      // Category filter - O(1) comparison
      if (categoryFilter && g.category !== categoryFilter) {
        return false;
      }

      // Search filter - only if search exists
      if (searchLower) {
        const title = g.title?.toLowerCase() || '';
        if (!title.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [allGames, categoryFilter, searchLower]);

  // —— CATEGORY CHIPS ——
  // No `categories` list was in the file you pasted, so this builds the
  // chips dynamically from whatever categories exist in the fetched games.
  // If you already have a fixed list in config.js, import that instead.
  const categories = useMemo(() => {
    const unique = new Set(allGames.map(g => g.category).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [allGames]);

  // —— GAME CARD CLICK HANDLERS ——
  const gameClickHandlers = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < displayedGames.length; i++) {
      const game = displayedGames[i];
      const key = game.id || game.title || i;
      map.set(key, () => openGame(game));
    }
    return map;
  }, [displayedGames, openGame]);

  // —— GAME CARDS MEMOIZATION ——
  const gameCards = useMemo(() => {
    return displayedGames.map((game, i) => {
      const key = game.id || game.title || i;
      return (
        <GameCard
          key={key}
          game={game}
          index={i}
          featured={isFeaturedFast(i)}
          onClick={gameClickHandlers.get(key)}
        />
      );
    });
  }, [displayedGames, gameClickHandlers]);

  // ─── SKELETON LOADER ───
  const skeletonArray = useMemo(() => Array.from({ length: 18 }), []);

  // ─── AVATAR RENDER ───
  const renderMiniAvatar = useCallback(() => {
    if (!profile) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round">
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
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }

    const shape = profile.avatarShape || "heart";
    const color = profile.avatarColor || "#c084fc";

    return (
      <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        {shape === "circle" && <circle cx="14" cy="14" r="12" fill={color} />}
        {shape === "square" && <rect x="2" y="2" width="24" height="24" rx="5" fill={color} />}
        {shape === "star" && <polygon points="14,2 17,10 26,10 19,15 22,23 14,18 6,23 9,15 2,10 11,10" fill={color} />}
        {shape === "hexagon" && <polygon points="14,2 24,8 24,20 14,26 4,20 4,8" fill={color} />}
        {shape === "heart" && <path d="M14 23 C14 23 3 16 3 9 C3 5.7 5.7 3 9 3 C11 3 12.7 4 14 5.5 C15.3 4 17 3 19 3 C22.3 3 25 5.7 25 9 C25 16 14 23 14 23Z" fill={color} />}
      </svg>
    );
  }, [profile]);

  const avatarElement = useMemo(() => renderMiniAvatar(), [renderMiniAvatar]);

  // ─── NAVIGATION HANDLERS ───
  const handleFooterNavigate = useCallback((path) => {
    return () => router.push(path);
  }, [router]);

  const handleSharkNavigate = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <>
      {/* ─── RESOURCE HINTS ─── */}
      <link rel="preconnect" href="https://placehold.co" />
      {gamesOrigin && <link rel="preconnect" href={gamesOrigin} />}
      {apiOrigin && apiOrigin !== gamesOrigin && <link rel="preconnect" href={apiOrigin} />}

      {showEasterEgg && (
        <EasterEggModal
          gameCount={displayedGames.length}
          onClose={handleCloseEasterEgg}
        />
      )}

      {/* ── NAV (its own fixed glass pill) ── */}
      <div className="nav-outer">
        <div className="nav-wrap">
          <nav className="nav">
            <div className="nav-logo" onClick={handleNavLogoClickWithNavigate}>
              <img src="/sharx.png" alt="Sharx Logo" />
            </div>
            <div className="nav-search">
              <div className="nav-si-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  className="nav-si"
                  type="text"
                  placeholder="Search games..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="nav-r">
              {isLoggedIn ? (
                <div className="user-logged">
                  <button className="profile-btn" onClick={handleShowProfile}>
                    <div className="profile-avatar">{avatarElement}</div>
                    {profile?.stylishUsername || "Profile"}
                  </button>
                </div>
              ) : (
                <div className="login-icon-container" onClick={handlePanelLogin} title="Login">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* ── CATEGORIES (separate row, sits below the fixed nav) ── */}
      {!loading && !error && categories.length > 1 && (
        <div className="cats-outer">
          <div className="cats-wrap">
            <div className="cats-row">
              {categories.map(c => (
                <button
                  key={c}
                  className={`cat${category === c ? " on" : ""}`}
                  onClick={() => handleCategoryClick(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE CONTENT (game grid) ── */}
      <div className={`page-content${loading || error || categories.length <= 1 ? " page-content-top" : ""}`}>
        {/* ── GRID ── */}
        {loading ? (
          <div className="skels">
            {skeletonArray.map((_, i) => (
              <div
                key={i}
                className={`skel${isFeaturedFast(i) ? " featured" : ""}`}
                style={{ animationDelay: `${i * 15}ms` }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="empty">
            <div className="empty-t">Server Error</div>
            <button className="empty-b" onClick={() => fetchGames(1, true)}>
              Retry
            </button>
          </div>
        ) : displayedGames.length === 0 ? (
          <div className="empty">
            <div className="empty-t">No games found</div>
            <button className="empty-b" onClick={clearCategoryAndSearch}>
              All Games
            </button>
          </div>
        ) : (
          <>
            <div className="grid" id="games-grid">
              {gameCards}
            </div>
            {hasMore && (
              <div className="load-more-wrap">
                <button
                  className="load-more-btn"
                  onClick={loadMoreClick}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <><span className="spinner" />Loading...</>
                  ) : (
                    "Load More Games"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {activeGame && (
        <GameModal
          game={activeGame}
          onClose={handleCloseModal}
        />
      )}

      {panelMode && (
        <Suspense fallback={null}>
          <SidePanel
            mode={panelMode}
            onClose={handleClosePanel}
          />
        </Suspense>
      )}

      {showProfile && (
        <Suspense fallback={null}>
          <ProfileSidePanel
            profile={profile}
            onUpdateProfile={updateProfile}
            onClose={handleCloseProfile}
            onLogout={authLogout}
          />
        </Suspense>
      )}

      {socialModal && (
        <SocialComingSoonModal
          platform={socialModal}
          onClose={handleCloseSocialModal}
        />
      )}

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="footer-body">
          <div className="footer-content">
            <div className="footer-main">
              <div className="shark-tank" onClick={handleSharkNavigate}>
                <div className="footer-logo">
                  <img src="/sharx.png" alt="Sharx" draggable={false} />
                </div>
                <div className="water-wrap">
                  <svg className="wave-svg" viewBox="0 0 800 50" preserveAspectRatio="none">
                    <path className="wave-back" d="M0,25 C200,0 400,50 800,25 L800,50 L0,50 Z" />
                    <path className="wave-front" d="M0,30 C150,10 350,45 800,20 L800,50 L0,50 Z" />
                  </svg>
                  <div className="foam-line" />
                </div>
                <div className="splash-rings">
                  <div className="ring r1" /><div className="ring r2" /><div className="ring r3" />
                </div>
                <div className="droplets">
                  <div className="drop d1" /><div className="drop d2" /><div className="drop d3" /><div className="drop d4" />
                </div>
                <span className="bubble b1" /><span className="bubble b2" />
                <span className="bubble b3" /><span className="bubble b4" />
                <div className="shark-reflection">
                  <img src="/sharx.png" alt="" draggable={false} />
                </div>
              </div>
              <div className="footer-socials">
                <div
                  className="social-icon"
                  onClick={() => handleSocialClick("instagram")}
                  title="Instagram"
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </div>
                <div
                  className="social-icon"
                  onClick={() => handleSocialClick("youtube")}
                  title="YouTube"
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <p className="footer-col-title">Company</p>
                <div className="footer-col-links">
                  <a className="footer-link" onClick={handleFooterNavigate("/about")}>About Us</a>
                  <a className="footer-link" onClick={handleFooterNavigate("/contact")}>Contact</a>
                  <a className="footer-link" onClick={handleFooterNavigate("/privacy")}>Privacy Policy</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <span className="footer-copyright">
                © {new Date().getFullYear()} Sharx. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─── EASTER EGG ─── */
const EasterEggModal = React.memo(({ gameCount, onClose }) => {
  const confettiColors = useMemo(() =>
    ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
    []
  );

  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random(),
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    }));
    setConfetti(pieces);

    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose, confettiColors]);

  return (
    <div className="easter-egg-modal">
      {confetti.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            animation: `confetti ${p.duration}s linear forwards`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
      <div className="easter-egg-content">
        <div className="easter-egg-emoji">🎮</div>
        <div className="easter-egg-title">Sharx UNLOCKED!</div>
        <div className="easter-egg-text">You've discovered the secret! True gaming enthusiast!</div>
        <div className="easter-egg-stats">
          <div className="easter-egg-stat">
            <div className="easter-egg-stat-num">∞</div>
            <div className="easter-egg-stat-label">Fun Awaits</div>
          </div>
          <div className="easter-egg-stat">
            <div className="easter-egg-stat-num">{gameCount}+</div>
            <div className="easter-egg-stat-label">Games</div>
          </div>
          <div className="easter-egg-stat">
            <div className="easter-egg-stat-num">Free</div>
            <div className="easter-egg-stat-label">Always</div>
          </div>
        </div>
        <button className="easter-egg-button" onClick={onClose}>
          Continue Playing
        </button>
      </div>
    </div>
  );
});

/* ─── GAME CARD ─── */
const GameCard = React.memo(({ game, index, featured, onClick }) => {
  // Memoize styles to prevent recreation
  const cardStyle = useMemo(() => ({
    animationDelay: `${Math.min(index, 20) * 22}ms`
  }), [index]);

  // Memoize image error handler
  const handleImageError = useCallback((e) => {
    const title = game.title || "Game";
    e.target.src = `https://placehold.co/400x400/D8DDE6/475569?text=${encodeURIComponent(title)}`;
  }, [game.title]);

  return (
    <div
      className={`gc${featured ? " featured" : ""}`}
      style={cardStyle}
      onClick={onClick}
    >
      {featured && game.category && (
        <span className="gc-cat-chip">{game.category}</span>
      )}
      <div className="gc-img-wrap">
        <Image
          className="gc-img"
          src={game.thumb}
          alt={game.title}
          fill
          sizes="(max-width:768px) 50vw, (max-width:1200px) 33vw, 20vw"
          priority={index < 4}
          onError={handleImageError}
        />
      </div>
      <div className="gc-overlay" />
      <div className="gc-play-btn">
        <svg viewBox="0 0 20 22">
          <path d="M2 1.5L19 11L2 20.5V1.5Z" fill="#1E293B" />
        </svg>
      </div>
      <div className="gc-label">
        <div className="gc-label-text">{game.title}</div>
      </div>
    </div>
  );
});

/* ─── GAME MODAL ─── */
const GameModal = React.memo(({ game, onClose }) => {
  const [source, setSource] = useState("proxy");
  const [status, setStatus] = useState("loading");

  const frameRef = useRef(null);
  const timeoutRef = useRef(null);

  // Memoize URLs
  const proxyUrl = useMemo(() =>
    `${API_BASE}/proxy/game?url=${encodeURIComponent(game.url)}`,
    [game.url]
  );
  const iframeSrc = useMemo(() =>
    source === "direct" ? game.url : proxyUrl,
    [source, game.url, proxyUrl]
  );

  // Memoize styles
  const modalStyle = useMemo(() => ({
    opacity: status === "loaded" ? 1 : 0,
    transition: "opacity .25s ease"
  }), [status]);

  // Memoize event handlers
  const handleFullscreen = useCallback(() => {
    frameRef.current?.requestFullscreen?.();
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleRetry = useCallback(() => {
    setSource("proxy");
  }, []);

  const handleOpenNewTab = useCallback(() => {
    window.open(game.url, "_blank", "noopener,noreferrer");
  }, [game.url]);

  // Body overflow effect
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Timeout and source management
  useEffect(() => {
    setStatus("loading");
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setSource(prev => {
        if (prev === "proxy") {
          return "direct";
        }
        setStatus("error");
        return prev;
      });
    }, 8000);

    return () => clearTimeout(timeoutRef.current);
  }, [source]);

  // Ad blocker injection
  // PERFORMANCE: the ad-block script is dynamically imported here rather
  // than passed in as a prop from an eagerly-created constant, so it's
  // only ever fetched once a game is actually opened.
  const injectAdBlocker = useCallback(() => {
    import("../lib/adblock").then(({ default: adblock }) => {
      try {
        const iframe = frameRef.current;
        const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
        if (doc) {
          const script = doc.createElement("script");
          script.textContent = adblock;
          doc.head.appendChild(script);
        }
      } catch (e) {
        // Cross-origin expected
      }
    });
  }, []);

  const handleLoad = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setStatus("loaded");
    injectAdBlocker();
  }, [injectAdBlocker]);

  const handleError = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (source === "proxy") {
      setSource("direct");
    } else {
      setStatus("error");
    }
  }, [source]);

  // Memoize modal background click handler
  const handleModalClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div className="modal-bg" onClick={handleModalClick}>
      <div className="modal-top">
        <div className="modal-l">
          <img className="modal-thumb" src={game.thumb} alt={game.title} />
          <div>
            <div className="modal-gt">{game.title}</div>
            <div className="modal-gc">{game.category}</div>
          </div>
        </div>
        <div className="modal-acts">
          <button className="modal-btn" onClick={handleFullscreen}>
            ⛶ Fullscreen
          </button>
          <button className="modal-x" onClick={handleClose} title="Close">
            ✕
          </button>
        </div>
      </div>
      <div className="modal-game">
        {status === "loading" && (
          <div className="modal-loader">
            <div className="modal-spin" />
            <div className="modal-lt">Loading game...</div>
          </div>
        )}

        {status === "error" && (
          <div className="modal-loader">
            <div className="modal-lt">This game couldn't be loaded.</div>
            <div className="modal-error-actions">
              <button className="modal-btn" onClick={handleRetry}>
                Retry
              </button>
              <button className="modal-btn" onClick={handleOpenNewTab}>
                Open in new tab
              </button>
            </div>
          </div>
        )}

        <iframe
          key={iframeSrc}
          ref={frameRef}
          className="modal-iframe"
          src={iframeSrc}
          title={game.title}
          allowFullScreen
          allow="autoplay; fullscreen; gamepad"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox allow-pointer-lock"
          onLoad={handleLoad}
          onError={handleError}
          style={modalStyle}
        />
      </div>
    </div>
  );
});