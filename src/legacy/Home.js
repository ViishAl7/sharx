"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { GAMES_BASE, API_BASE } from "../config";
import "./Home.css";

const SidePanel = lazy(() => import("../legacy/SidePanel"));
const ProfileSidePanel = lazy(() => import("../legacy/ProfileSidePanel"));
const GameModal = lazy(() => import("../legacy/GameModal"));
const EasterEggModal = lazy(() => import("../legacy/EasterEggModal"));
const SocialComingSoonModal = lazy(() => import("../legacy/SocialComingSoonModal"));

const HISTORY_KEY = "pv_history";
const MAX_HISTORY = 12;

const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
};
const addToHistory = (game) => {
  const prev = getHistory().filter((g) => g.id !== game.id);
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify([{ ...game, playedAt: Date.now() }, ...prev].slice(0, MAX_HISTORY)),
  );
};

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
function slugify(title = "") {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FEATURED_INDICES = new Set([0, 7, 16]);
const isFeaturedFast = (i) => FEATURED_INDICES.has(i);

export default function Home({ initialGames = [], initialActiveGame = null }) {
  const router = useRouter();
  const { logout: authLogout } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [allGames, setAllGames] = useState(() => dedupeById(initialGames));
  const [page, setPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(20);
  const [hasMore, setHasMore] = useState(initialGames.length === 50);
  const [loading, setLoading] = useState(initialGames.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeGame, setActiveGame] = useState(initialActiveGame);
  const [error, setError] = useState(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [panelMode, setPanelMode] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [socialModal, setSocialModal] = useState(null);

  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef(null);
  // Tracks whether the CURRENT open modal was reached via our own
  // pushState() call (a click from inside this already-mounted Home) as
  // opposed to a hard page-load on /game/:id. Drives whether "close"
  // should walk back through browser history or do a real navigation.
  const pushedOwnHistoryRef = useRef(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  // FIX: the announcement bar is `position: fixed; z-index: 1000`, above
  // the game modal (`z-index: 999`), so it covered the modal's own
  // close/back button and there was no way to leave a game. Toggling a
  // `modal-open` class on <body> while a game is active lets Home.css
  // slide the announcement bar out of view for that duration (see
  // `body.modal-open .announcement-bar` in Home.css).
  useEffect(() => {
    if (activeGame) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [activeGame]);

  // CHANGED: still sets activeGame synchronously (instant modal, zero
  // network wait, identical to before). Additionally syncs the URL bar
  // via raw history.pushState — NOT router.push — so this never triggers
  // a Next.js route change / remount of this component. The real
  // /game/[id] Next route exists for direct loads, shares, and crawlers;
  // this internal click just needs the address bar to reflect it.
  const openGame = useCallback((game) => {
    addToHistory(game);
    setActiveGame(game);
    if (typeof window !== "undefined" && game?.id != null) {
      window.history.pushState(
        { sharxGameId: game.id },
        "",
`/game/${game.id}-${slugify(game.title)}`
      );
      pushedOwnHistoryRef.current = true;
    }
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
  // CHANGED: if a game modal is open (reached via a hard load OR an
  // internal click), route the logo click through the SAME close logic
  // as the X button/Escape instead of blindly calling router.push("/").
  // Prevents a state mismatch between Next's internal router (which
  // still thinks we're on "/" after an internal pushState-driven open)
  // and the real browser URL.
  const handleCloseModal = useCallback(() => {
  if (pushedOwnHistoryRef.current) {
    pushedOwnHistoryRef.current = false;
    window.history.back();
  } else {
    setActiveGame(null);

    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/game/")
    ) {
      router.push("/");
    }
  }
}, [router]);

  const handleNavLogoClickWithNavigate = useCallback(() => {
    handleNavLogoClick();
    if (activeGame) {
      handleCloseModal();
    } else {
      router.push("/");
    }
  }, [handleNavLogoClick, activeGame, handleCloseModal, router]);
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
  // CHANGED: if this modal was opened via our own pushState (internal
  // click), walk back through browser history — the popstate listener
  // below picks up the resulting URL change and clears activeGame,
  // giving a completely native "back button" feel. If it wasn't (a hard
  // load of /game/:id, nothing of ours to go "back" to), clear the modal
  // and take a real, but soft, Next.js navigation home.

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
  const handleSocialClick = useCallback((platform) => {
    setSocialModal(platform);
  }, []);
  const handleCloseSocialModal = useCallback(() => {
    setSocialModal(null);
  }, []);

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
        setAllGames((prev) => {
          const combined = isFirst ? data : [...prev, ...data];
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

  useEffect(() => {
    if (initialGames.length === 0) {
      fetchGames(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchGames]);

  const loadMore = useCallback(() => {
    if (loadingMore) return;
    if (visibleCount < allGames.length) {
      setVisibleCount((v) => Math.min(v + 20, allGames.length));
      return;
    }
    const next = page + 1;
    setPage(next);
    fetchGames(next, false);
  }, [loadingMore, page, fetchGames, visibleCount, allGames.length]);

  // CHANGED: routes through handleCloseModal instead of setActiveGame(null)
  // directly, so Escape stays in sync with the URL/history bookkeeping
  // that openGame/handleCloseModal now manage. Without this, pressing
  // Escape would close the modal but leave the URL bar (and the pushed
  // history entry) stuck on /game/:id.
  const handleEscapeKey = useCallback(
    (e) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    },
    [handleCloseModal],
  );
  useEffect(() => {
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [handleEscapeKey]);

  // NEW: keeps activeGame in sync with the browser's actual back/forward
  // navigation. When the URL lands on /game/:id (via back OR forward),
  // look the game up in already-loaded state and reopen it instantly —
  // no network round-trip needed since the grid data is already here.
  // When the URL lands anywhere else, close the modal.
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/game\/([^/]+)/);
      if (match) {
        const raw = decodeURIComponent(match[1]);
        const id = raw.match(/^gm_\d+/)?.[0] || raw;
        const found =
          allGames.find((g) => String(g.id) === id) ||
          (initialActiveGame && String(initialActiveGame.id) === id ? initialActiveGame : null);
        if (found) {
          setActiveGame(found);
          pushedOwnHistoryRef.current = true;
        }
      } else {
        setActiveGame(null);
        pushedOwnHistoryRef.current = false;
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [allGames, initialActiveGame]);

  const searchLower = useMemo(() => search.toLowerCase(), [search]);
  const categoryFilter = useMemo(() => (category === "All" ? null : category), [category]);
  const displayedGames = useMemo(() => {
    if (!categoryFilter && !searchLower) {
      return allGames.slice(0, visibleCount);
    }
    return allGames
      .filter((g) => {
        if (categoryFilter && g.category !== categoryFilter) return false;
        if (searchLower) {
          const title = g.title?.toLowerCase() || "";
          if (!title.includes(searchLower)) return false;
        }
        return true;
      })
      .slice(0, visibleCount);
  }, [allGames, categoryFilter, searchLower, visibleCount]);

  const categories = useMemo(() => {
    const unique = new Set(allGames.map((g) => g.category).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [allGames]);

  const gameClickHandlers = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < displayedGames.length; i++) {
      const game = displayedGames[i];
      const key = game.id || game.title || i;
      map.set(key, () => openGame(game));
    }
    return map;
  }, [displayedGames, openGame]);

  const skeletonArray = useMemo(() => Array.from({ length: 18 }), []);

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
        {shape === "star" && (
          <polygon points="14,2 17,10 26,10 19,15 22,23 14,18 6,23 9,15 2,10 11,10" fill={color} />
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
  }, [profile]);
  const avatarElement = useMemo(() => renderMiniAvatar(), [renderMiniAvatar]);

  const handleSharkNavigate = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <>
      {/* Ambient full-page teal backdrop with real pointed 3D crystals
          (see .bg-crystals in Home.css for the teal gradient). Each
          crystal below is a genuine inline SVG built from several
          triangular facets — some catch a light gradient, some sit in
          shadow — so they read as real photographed rough gemstones,
          not flat shapes. A couple are rendered soft/blurred for
          atmospheric depth, and small accent gems + hazy glow blobs
          are scattered for extra depth. Purely decorative. */}
      <div className="bg-crystals" aria-hidden="true">
        <div className="crystal-cluster gem crystal-1">
          <PointedCrystalSVG variant="a" />
        </div>
        <div className="crystal-cluster gem crystal-2">
          <PointedCrystalSVG variant="b" />
        </div>
        <div className="crystal-cluster soft crystal-3">
          <PointedCrystalSVG variant="c" />
        </div>
        <div className="crystal-cluster gem crystal-4">
          <PointedCrystalSVG variant="b" flip />
        </div>
        <div className="crystal-cluster soft crystal-5">
          <PointedCrystalSVG variant="a" flip />
        </div>
        <div className="crystal-cluster gem crystal-accent a1">
          <PointedCrystalSVG variant="c" />
        </div>
        <div className="crystal-cluster gem crystal-accent a2">
          <PointedCrystalSVG variant="a" />
        </div>
        <div className="crystal-cluster glow crystal-accent a3" />
        <div className="crystal-cluster glow crystal-accent a4" />
      </div>
      {showEasterEgg && (
        <Suspense fallback={null}>
          <EasterEggModal gameCount={displayedGames.length} onClose={handleCloseEasterEgg} />
        </Suspense>
      )}
      <div className="announcement-bar" role="region" aria-label="Website update">
        <div className="announcement-bar__track">
          <div className="announcement-bar__message">
            <span className="announcement-bar__badge">
              <span className="announcement-bar__dot" />
              NEW WEBSITE
            </span>

            <span className="announcement-bar__text">
              You’re among the first to explore Sharx. As we continue refining our newly launched experience, you may occasionally come across a small issue. Thank you for your patience, feedback, and support—we’re listening, improving, and working to make every visit better.
            </span>
          </div>

          <div className="announcement-bar__message" aria-hidden="true">
            <span className="announcement-bar__badge">
              <span className="announcement-bar__dot" />
              NEW WEBSITE
            </span>

            <span className="announcement-bar__text">
              You’re among the first to explore Sharx. As we continue refining our newly launched experience, you may occasionally come across a small issue. Thank you for your patience, feedback, and support—we’re listening, improving, and working to make every visit better.
            </span>
          </div>
        </div>
      </div>

      <div className="nav-outer">
        <div className="nav-wrap">
          <nav className="nav">
            <div className="nav-logo" onClick={handleNavLogoClickWithNavigate}>
              <Image src="/sharx.png" alt="Sharx Logo" width={80} height={80} draggable={false} priority />
            </div>

            <div className="nav-search">
              <div className="nav-si-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
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
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {!loading && !error && categories.length > 1 && (
        <div className="cats-outer">
          <div className="cats-wrap">
            <div className="cats-row">
              {categories.map((c) => (
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

      <main className={`page-content${loading || error || categories.length <= 1 ? " page-content-top" : ""}`}>
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
              {displayedGames.map((game, i) => {
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
              })}
            </div>
            {hasMore && (
              <div className="load-more-wrap">
                <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <span className="spinner" />
                      Loading...
                    </>
                  ) : (
                    "Load More Games"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {activeGame && (
        <Suspense fallback={null}>
          <GameModal game={activeGame} onClose={handleCloseModal} />
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
            onLogout={authLogout}
          />
        </Suspense>
      )}

      {socialModal && (
        <Suspense fallback={null}>
          <SocialComingSoonModal platform={socialModal} onClose={handleCloseSocialModal} />
        </Suspense>
      )}

      <footer className="site-footer">
        <div className="footer-body">
          <div className="footer-content">
            <div className="footer-main">
              <div className="shark-tank" onClick={handleSharkNavigate}>
                <div className="footer-logo">
                  <Image src="/sharx.png" alt="Sharx" width={76} height={76} draggable={false} />
                </div>
                <div className="water-wrap">
                  <svg className="wave-svg" viewBox="0 0 800 50" preserveAspectRatio="none">
                    <path className="wave-back" d="M0,25 C200,0 400,50 800,25 L800,50 L0,50 Z" />
                    <path className="wave-front" d="M0,30 C150,10 350,45 800,20 L800,50 L0,50 Z" />
                  </svg>
                  <div className="foam-line" />
                </div>
                <div className="splash-rings">
                  <div className="ring r1" />
                  <div className="ring r2" />
                  <div className="ring r3" />
                </div>
                <div className="droplets">
                  <div className="drop d1" />
                  <div className="drop d2" />
                  <div className="drop d3" />
                  <div className="drop d4" />
                </div>
                <span className="bubble b1" />
                <span className="bubble b2" />
                <span className="bubble b3" />
                <span className="bubble b4" />
                <div className="shark-reflection">
                  <Image src="/sharx.png" alt="" width={76} height={76} draggable={false} />
                </div>
              </div>

              <div className="footer-socials">
               <div
  className="social-icon"
  onClick={() =>
    window.open(
      "https://www.instagram.com/sharx__games?igsh=NWU3Zm9udDR3NHd4",
      "_blank",
      "noopener,noreferrer"
    )
  }
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
                  <Link href="/about" className="footer-link">
                    About Us
                  </Link>
                  <Link href="/contact" className="footer-link">
                    Contact
                  </Link>
                  <Link href="/privacy" className="footer-link">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <span className="footer-copyright">© {new Date().getFullYear()} Sharx. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─── DECORATIVE POINTED CRYSTAL SVG ───
   Renders a tall, pointed rough-gem shape out of several triangular
   facets, each filled with its own linear gradient so some faces
   read as catching light and others as falling into shadow — the
   same way a real photographed crystal reads. Three hand-built
   variants (a/b/c) give visual variety across the scattered clusters,
   and `flip` mirrors a variant horizontally for further variety
   without needing more markup. Purely decorative (aria-hidden by the
   parent wrapper). */
const CRYSTAL_VARIANTS = {
  // Tall single spike, narrow point, 5 facets
  a: {
    viewBox: "0 0 100 140",
    facets: [
      { d: "M50 2 L78 46 L50 60 L38 46 Z", tone: "light" },
      { d: "M50 2 L38 46 L18 40 Z", tone: "mid" },
      { d: "M50 2 L78 46 L96 42 Z", tone: "highlight" },
      { d: "M18 40 L38 46 L50 60 L26 100 L10 70 Z", tone: "mid" },
      { d: "M78 46 L96 42 L84 78 L50 60 Z", tone: "shadow" },
      { d: "M26 100 L50 60 L84 78 L60 138 L34 132 Z", tone: "deep" },
    ],
  },
  // Squat double-point cluster, 6 facets
  b: {
    viewBox: "0 0 110 130",
    facets: [
      { d: "M34 4 L52 40 L30 52 L14 34 Z", tone: "highlight" },
      { d: "M34 4 L14 34 L4 24 Z", tone: "mid" },
      { d: "M52 40 L30 52 L38 96 L64 84 Z", tone: "mid" },
      { d: "M14 34 L4 24 L2 60 L30 52 Z", tone: "shadow" },
      { d: "M78 18 L96 46 L74 62 L58 42 Z", tone: "light" },
      { d: "M96 46 L108 40 L86 76 L74 62 Z", tone: "shadow" },
      { d: "M58 42 L74 62 L64 84 L52 40 Z", tone: "mid" },
      { d: "M2 60 L30 52 L38 96 L20 118 L8 92 Z", tone: "deep" },
      { d: "M74 62 L86 76 L64 118 L38 96 L64 84 Z", tone: "deep" },
    ],
  },
  // Small crisp accent point, 4 facets
  c: {
    viewBox: "0 0 80 110",
    facets: [
      { d: "M40 2 L62 38 L40 48 L26 36 Z", tone: "highlight" },
      { d: "M40 2 L26 36 L10 30 Z", tone: "mid" },
      { d: "M62 38 L40 48 L52 100 L74 70 Z", tone: "shadow" },
      { d: "M26 36 L10 30 L6 58 L40 48 Z", tone: "mid" },
      { d: "M6 58 L40 48 L52 100 L28 108 L14 84 Z", tone: "deep" },
    ],
  },
};

const CRYSTAL_TONES = {
  highlight: ["#F2FBFF", "#BFE6FA"],
  light: ["#D3EFFC", "#84C8ED"],
  mid: ["#4FA3E0", "#2472C4"],
  shadow: ["#1A5AA0", "#123F76"],
  deep: ["#0D3868", "#082646"],
};

const PointedCrystalSVG = React.memo(function PointedCrystalSVG({ variant = "a", flip = false }) {
  const data = CRYSTAL_VARIANTS[variant];
  const uid = variant;
  return (
    <svg
      viewBox={data.viewBox}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {Object.entries(CRYSTAL_TONES).map(([tone, [c1, c2]]) => (
          <linearGradient
            key={tone}
            id={`crystal-${uid}-${tone}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        ))}
      </defs>
      {data.facets.map((f, i) => (
        <path
          key={i}
          d={f.d}
          fill={`url(#crystal-${uid}-${f.tone})`}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
});

/* ─── GAME CARD ─── */
const GameCard = React.memo(function GameCard({ game, index, featured, onClick }) {
  const cardStyle = useMemo(() => ({ animationDelay: `${Math.min(index, 20) * 22}ms` }), [index]);

  const handleImageError = useCallback(
    (e) => {
      const title = game.title || "Game";
      e.target.srcset = "";
      e.target.src = `https://placehold.co/400x400/D8DDE6/475569?text=${encodeURIComponent(title)}`;
    },
    [game.title],
  );

  // NEW: only intercepts a plain, unmodified left-click. Ctrl/Cmd/Shift/
  // middle-click all fall through untouched, so "open in new tab",
  // "open in new window", and "copy link" keep working natively via the
  // <Link>'s real href below — this mirrors exactly how Next's own Link
  // decides whether to run its own client-side navigation.
  const handleCardClick = useCallback(
    (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      e.preventDefault();
      onClick?.();
    },
    [onClick],
  );

  const imgSrc =
    game.thumb || `https://placehold.co/400x400/D8DDE6/475569?text=${encodeURIComponent(game.title || "Game")}`;

  const cardBody = (
    <div
      className={`gc${featured ? " featured" : ""}`}
      style={cardStyle}
      onClick={game.id == null ? onClick : undefined}
    >
      {featured && game.category && <span className="gc-cat-chip">{game.category}</span>}
      <div className="gc-img-wrap">
     <Image
  className="gc-img"
  src={imgSrc}
  alt={game.title}
  fill
  unoptimized
  sizes="(max-width:768px) 50vw, (max-width:1200px) 33vw, 20vw"
  priority={index < 4}
  fetchPriority={index === 0 ? "high" : undefined}
  quality={65}
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

  // No id, no valid /game/:id URL to build — fall back to the exact
  // original click-only behavior rather than generating a broken link.
  if (game.id == null) {
    return cardBody;
  }

  // NEW: wraps the untouched card in a real, crawlable <a href="/game/:id">.
  // display: contents means the Link introduces ZERO box/layout of its
  // own — the div inside renders exactly as if this wrapper didn't
  // exist, so Home.css and every existing animation apply unchanged.
  // Googlebot (and anyone middle-clicking) sees a real link; a normal
  // left-click still goes through the instant in-app modal.
  return (
    <Link
href={`/game/${encodeURIComponent(game.id)}-${slugify(game.title)}`}
      prefetch={false}
      style={{ display: "contents" }}
      onClick={handleCardClick}
    >
      {cardBody}
    </Link>
  );
});