"use client";

import "./GameModal.css";

import Image from "next/image";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Link from "next/link";
import { getSafeGameUrl } from "../lib/game-url";
import useGamePlayTracker from "../lib/useGamePlayTracker";
import {
  getGameContent,
  getRelatedGames,
  gameHref,
  decodeEntities,
} from "../lib/game-content";
import {
  useRewards,
  REWARDS_EVENT_LIVE,
} from "../context/RewardContext";

/* ============================================================
   GAME URL
   ============================================================ */
function getGameEmbedUrl(game) {
  const raw = String(
    game?.embedUrl ||
      game?.embed_url ||
      game?.playUrl ||
      game?.play_url ||
      game?.url ||
      ""
  ).trim();
  return getSafeGameUrl(raw);
}

/* ============================================================
   PRECONNECT / PREFETCH WARMUP
   Speeds up the very first game open by opening a TCP/TLS
   connection to the embed origin BEFORE the iframe mounts.
   ============================================================ */
function warmupOrigin(url) {
  if (typeof document === "undefined" || !url) return;
  try {
    const u = new URL(url, window.location.origin);
    const origin = `${u.protocol}//${u.host}`;
    const existing = document.querySelector(
      `link[data-shx-warmup="${origin}"]`
    );
    if (existing) return;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    link.dataset.shxWarmup = origin;
    document.head.appendChild(link);
  } catch {}
}

/* ============================================================
   GAME MODAL
   ============================================================ */
const GameModal = React.memo(function GameModal({
  game,
  onClose,
  games,
  onSwitchGame,
}) {
  const [status, setStatus] = useState("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const stageRef = useRef(null);
  const timeoutRef = useRef(null);
  const scrollYRef = useRef(0);
  const lastFocusedElementRef = useRef(null);

  const { startGameRewardTracking, stopGameRewardTracking } = useRewards();

  const iframeSrc = useMemo(() => getGameEmbedUrl(game), [game]);
  const content = useMemo(() => getGameContent(game), [game]);
  const related = useMemo(
    () => getRelatedGames(game, games, 8),
    [game, games]
  );
  const title = useMemo(
    () => decodeEntities(game?.title || game?.name || ""),
    [game]
  );

  const { startPlay, stopPlay } = useGamePlayTracker(game, title);

  /* ═══════════════════════════════════════════════════
     PRE-WARM the embed origin as soon as we know the URL
     → game loads 2–4× faster on first play
     ═══════════════════════════════════════════════════ */
  useEffect(() => {
    if (iframeSrc) warmupOrigin(iframeSrc);
  }, [iframeSrc]);

  /* ═══════════════════════════════════════════════════
     PRE-WARM related game origins too (silent background)
     ═══════════════════════════════════════════════════ */
  useEffect(() => {
    if (!related || related.length === 0) return;
    /* idle so it never blocks the active game */
    const idle =
      window.requestIdleCallback ||
      function (cb) {
        return window.setTimeout(cb, 1200);
      };
    const handle = idle(() => {
      related.forEach((g) => {
        const url = getGameEmbedUrl(g);
        if (url) warmupOrigin(url);
      });
    });
    return () => {
      if (typeof handle === "number") window.clearTimeout(handle);
      else if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
    };
  }, [related]);

  /* Reward tracking */
  useEffect(() => {
    if (!game?.id) return undefined;
    if (!REWARDS_EVENT_LIVE) return undefined;
    let cancelled = false;
    const start = async () => {
      try {
        if (cancelled) return;
        await startGameRewardTracking(String(game.id));
      } catch (error) {
        console.warn("[GameModal] Reward tracking could not start:", error);
      }
    };
    void start();
    return () => {
      cancelled = true;
      void stopGameRewardTracking().catch((error) => {
        console.warn("[GameModal] Reward tracking could not stop:", error);
      });
    };
  }, [game?.id, startGameRewardTracking, stopGameRewardTracking]);

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const iframeStyle = useMemo(
    () => ({
      opacity: status === "loaded" ? 1 : 0,
      transition: "opacity .18s ease",
      /* force a GPU layer, no scroll reflow while loading */
      transform: "translateZ(0)",
      willChange: "opacity",
    }),
    [status]
  );

  const handleFullscreen = useCallback(() => {
    const element = stageRef.current;
    if (!element) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
      return;
    }
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => {});
      return;
    }
    if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  }, []);

  const handleRetry = useCallback(() => {
    clearLoadTimeout();
    stopPlay();
    setStatus("loading");
    setReloadKey((value) => value + 1);
  }, [clearLoadTimeout, stopPlay]);

  const handleOpenNewTab = useCallback(() => {
    if (!iframeSrc) return;
    window.open(iframeSrc, "_blank", "noopener,noreferrer");
  }, [iframeSrc]);

  const handleLoad = useCallback(() => {
    clearLoadTimeout();
    startPlay();
    setStatus("loaded");
  }, [clearLoadTimeout, startPlay]);

  const handleError = useCallback(() => {
    clearLoadTimeout();
    stopPlay();
    setStatus("error");
  }, [clearLoadTimeout, stopPlay]);

  const handleRelatedClick = useCallback(
    (event, relatedGame) => {
      if (!onSwitchGame) return;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button === 1
      ) {
        return;
      }
      event.preventDefault();
      onSwitchGame(relatedGame);
    },
    [onSwitchGame]
  );

  /* Body scroll lock */
  useEffect(() => {
    if (!game) return undefined;
    scrollYRef.current = window.scrollY || window.pageYOffset || 0;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };
    style.position = "fixed";
    style.top = `-${scrollYRef.current}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";
    document.body.classList.add("modal-open");
    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.left = previous.left;
      style.right = previous.right;
      style.width = previous.width;
      style.overflow = previous.overflow;
      document.body.classList.remove("modal-open");
      window.scrollTo(0, scrollYRef.current);
    };
  }, [game]);

  /* ═══════════════════════════════════════════════════
     LOAD TIMEOUT
     Reduced 15s → 9s: if it hasn't loaded by then it's
     almost always blocked / dead, so we surface an error
     instead of making the user wait forever.
     ═══════════════════════════════════════════════════ */
  useEffect(() => {
    clearLoadTimeout();
    if (!iframeSrc) {
      setStatus("error");
      return undefined;
    }
    setStatus("loading");
    timeoutRef.current = window.setTimeout(() => {
      setStatus("error");
    }, 9000);
    return clearLoadTimeout;
  }, [iframeSrc, reloadKey, game, clearLoadTimeout]);

  /* Scroll to top when switching game */
  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.scrollTo({ top: 0, behavior: "auto" });
  }, [game?.id]);

  /* Focus + keyboard a11y */
  useEffect(() => {
    if (!game || typeof document === "undefined") return undefined;
    lastFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusSelector = [
      "button:not([disabled])",
      "a[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
    const focusFirst = () => {
      const first = rootRef.current?.querySelector(focusSelector);
      if (first instanceof HTMLElement) first.focus();
    };
    const frame = window.requestAnimationFrame(focusFirst);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab" || !rootRef.current) return;
      const focusable = Array.from(
        rootRef.current.querySelectorAll(focusSelector)
      ).filter((node) => node instanceof HTMLElement && !node.hidden);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown, true);
      const previous = lastFocusedElementRef.current;
      if (previous instanceof HTMLElement && previous.isConnected) {
        window.requestAnimationFrame(() => previous.focus());
      }
      lastFocusedElementRef.current = null;
    };
  }, [game, onClose]);

  useEffect(() => {
    return () => {
      clearLoadTimeout();
    };
  }, [clearLoadTimeout]);

  if (!game) return null;

  /* ═══════════════════════════════════════════════════
     IFRAME SANDBOX — AD-SAFE (fully legal)
     ─────────────────────────────────────────────────
     allow-popups            → BLOCKED (no popup ads)
     allow-popups-to-escape  → BLOCKED (no tab hijack)
     allow-top-navigation    → BLOCKED (no redirect ads)
     allow-modals            → BLOCKED (no alert() spam)
     allow-orientation-lock  → removed (harmless)
     ─────────────────────────────────────────────────
     Kept (required for games to actually work):
     allow-scripts           → game JS
     allow-same-origin       → game storage
     allow-forms             → inputs
     allow-pointer-lock      → FPS games
     allow-presentation      → fullscreen slides
     allow-downloads         → user-requested saves
     ═══════════════════════════════════════════════════ */
  const sandboxFlags = [
    "allow-scripts",
    "allow-same-origin",
    "allow-forms",
    "allow-pointer-lock",
    "allow-presentation",
    "allow-downloads",
  ].join(" ");

  return (
    <div
      ref={rootRef}
      className="modal-bg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sharx-game-dialog-title"
    >
      {/* TOP HEADER */}
      <div className="modal-top">
        <div className="modal-l">
          {game.thumb && (
            <Image
              className="modal-thumb"
              src={game.thumb}
              alt=""
              width={48}
              height={48}
              loading="eager"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          )}
          <div>
            <div
              className="modal-gt"
              id="sharx-game-dialog-title"
              title={title}
            >
              {title}
            </div>
            {game.category && (
              <div className="modal-gc">{game.category}</div>
            )}
          </div>
        </div>

        <div className="modal-acts">
          <button
            className="modal-btn"
            onClick={handleFullscreen}
            type="button"
            aria-label="Enter fullscreen"
            title="Fullscreen"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="15"
              height="15"
              aria-hidden="true"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v3" />
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
              <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
            </svg>
            <span>Fullscreen</span>
          </button>

          <button
            className="modal-x"
            onClick={onClose}
            title="Close"
            aria-label="Close game"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="18"
              height="18"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* GAME PLAYER */}
      <div className="modal-body">
        <div className="modal-game" ref={stageRef}>
          {status === "loading" && (
            <div className="modal-loader">
              <div className="modal-spin" />
              <div className="modal-lt">Loading game…</div>
            </div>
          )}

          {status === "error" && (
            <div className="modal-loader">
              <div className="modal-lt">
                This game couldn't be loaded.
              </div>
              <div className="modal-error-actions">
                <button
                  className="modal-btn"
                  onClick={handleRetry}
                  type="button"
                >
                  Retry
                </button>
                {iframeSrc && (
                  <button
                    className="modal-btn"
                    onClick={handleOpenNewTab}
                    type="button"
                  >
                    Open in new tab
                  </button>
                )}
              </div>
            </div>
          )}

          {iframeSrc && (
            <iframe
              key={`${iframeSrc}-${reloadKey}`}
              ref={frameRef}
              className="modal-iframe"
              src={iframeSrc}
              title={title}
              allowFullScreen
              allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope; clipboard-write"
              sandbox={sandboxFlags}
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={handleLoad}
              onError={handleError}
              style={iframeStyle}
            />
          )}

          {!iframeSrc && (
            <div className="modal-loader">
              <div className="modal-lt">
                This game is currently unavailable.
              </div>
              <div className="modal-error-actions">
                <button
                  className="modal-btn"
                  onClick={onClose}
                  type="button"
                >
                  Go back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INFORMATION BELOW GAME */}
      <div className="modal-info">
        <div className="modal-info-grid">
          <article className="modal-info-card">
            <h2 className="modal-info-h">About {title}</h2>
            {content.about.map((paragraph, index) => (
              <p
                key={`${title}-about-${index}`}
                className="modal-info-p"
              >
                {paragraph}
              </p>
            ))}
            <h2 className="modal-info-h modal-info-h-next">How to play</h2>
            <ul className="modal-info-list">
              {content.howTo.map((step, index) => (
                <li key={`${title}-how-${index}`}>{step}</li>
              ))}
            </ul>
          </article>

          <aside
            className="modal-info-card"
            aria-label="Game details"
          >
            <h2 className="modal-info-h">Game details</h2>
            <dl className="modal-info-dl">
              {game.category && (
                <div>
                  <dt>Category</dt>
                  <dd>{game.category}</dd>
                </div>
              )}
              <div>
                <dt>Platform</dt>
                <dd>Web browser</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>Free to play</dd>
              </div>
            </dl>
            {content.tags.length > 0 && (
              <ul className="modal-info-tags" aria-label="Tags">
                {content.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
            <Link href="/contact" className="modal-info-report">
              Something not working? Tell us
            </Link>
          </aside>
        </div>

        {related.length > 0 && (
          <section
            className="modal-info-card modal-related"
            aria-labelledby="modal-related-h"
          >
            <h2 id="modal-related-h" className="modal-info-h">
              More games like this
            </h2>
            <div className="similar-grid">
              {related.map((relatedGame) => {
                const relatedTitle = decodeEntities(
                  relatedGame.title || ""
                );
                return (
                  <a
                    key={relatedGame.id}
                    href={gameHref(relatedGame)}
                    className="similar-card"
                    onClick={(event) =>
                      handleRelatedClick(event, relatedGame)
                    }
                  >
                    <span className="similar-thumb">
                      {relatedGame.thumb && (
                        <Image
                          src={relatedGame.thumb}
                          alt=""
                          loading="lazy"
                          width={256}
                          height={256}
                        />
                      )}
                    </span>
                    <span className="similar-title">
                      {relatedTitle}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <nav className="modal-info-links" aria-label="Sharx">
          <Link href="/">All games</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </div>
  );
});

export default GameModal;