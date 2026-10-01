"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Link from "next/link";

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
  return String(
    game?.embedUrl ||
      game?.embed_url ||
      game?.playUrl ||
      game?.play_url ||
      game?.url ||
      ""
  ).trim();
}

/* ============================================================
   GAME MODAL / GAME DETAIL VIEW

   This is intentionally the original SHARX game-page layout:

   Header
      ↓
   Game player
      ↓
   About + How to play
      +
   Game details
      ↓
   More games like this
      ↓
   Footer
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

  /* ============================================================
     REWARD SYSTEM
     ============================================================ */

  const {
    startGameRewardTracking,
    stopGameRewardTracking,
  } = useRewards();

  /* ============================================================
     GAME DATA
     ============================================================ */

  const iframeSrc = useMemo(
    () => getGameEmbedUrl(game),
    [game]
  );

  const content = useMemo(
    () => getGameContent(game),
    [game]
  );

  const related = useMemo(
    () => getRelatedGames(game, games, 8),
    [game, games]
  );

  const title = useMemo(
    () => decodeEntities(game?.title || game?.name || ""),
    [game]
  );

  /* ============================================================
     REWARD TRACKING
     ────────────────────────────────────────────────────────────
     EVENT LOCK:
     When REWARDS_EVENT_LIVE === false, this effect returns
     immediately and no reward session is started or stopped.
     The game itself continues to load and play normally.
     ============================================================ */

  useEffect(() => {
    if (!game?.id) return undefined;

    /**
     * EVENT LOCK — do not start or stop reward tracking
     * while the event is not live.
     */
    if (!REWARDS_EVENT_LIVE) {
      return undefined;
    }

    let cancelled = false;

    const start = async () => {
      try {
        if (cancelled) return;

        await startGameRewardTracking(
          String(game.id)
        );
      } catch (error) {
        console.warn(
          "[GameModal] Reward tracking could not start:",
          error
        );
      }
    };

    void start();

    return () => {
      cancelled = true;

      void stopGameRewardTracking().catch((error) => {
        console.warn(
          "[GameModal] Reward tracking could not stop:",
          error
        );
      });
    };
  }, [
    game?.id,
    startGameRewardTracking,
    stopGameRewardTracking,
  ]);

  /* ============================================================
     TIMEOUT
     ============================================================ */

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /* ============================================================
     IFRAME STYLE
     ============================================================ */

  const iframeStyle = useMemo(
    () => ({
      opacity: status === "loaded" ? 1 : 0,
      transition: "opacity .3s ease",
    }),
    [status]
  );

  /* ============================================================
     FULLSCREEN
     ============================================================ */

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

  /* ============================================================
     RETRY
     ============================================================ */

  const handleRetry = useCallback(() => {
    clearLoadTimeout();

    setStatus("loading");
    setReloadKey((value) => value + 1);
  }, [clearLoadTimeout]);

  /* ============================================================
     OPEN NEW TAB
     ============================================================ */

  const handleOpenNewTab = useCallback(() => {
    if (!iframeSrc) return;

    window.open(
      iframeSrc,
      "_blank",
      "noopener,noreferrer"
    );
  }, [iframeSrc]);

  /* ============================================================
     IFRAME LOAD
     ============================================================ */

  const handleLoad = useCallback(() => {
    clearLoadTimeout();
    setStatus("loaded");
  }, [clearLoadTimeout]);

  /* ============================================================
     IFRAME ERROR
     ============================================================ */

  const handleError = useCallback(() => {
    clearLoadTimeout();
    setStatus("error");
  }, [clearLoadTimeout]);

  /* ============================================================
     RELATED GAME CLICK
     ============================================================ */

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

  /* ============================================================
     BODY SCROLL LOCK
     ============================================================ */

  useEffect(() => {
    if (!game) return undefined;

    scrollYRef.current =
      window.scrollY ||
      window.pageYOffset ||
      0;

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

      document.body.classList.remove(
        "modal-open"
      );

      window.scrollTo(
        0,
        scrollYRef.current
      );
    };
  }, [game]);

  /* ============================================================
     LOAD TIMEOUT
     ============================================================ */

  useEffect(() => {
    clearLoadTimeout();

    if (!iframeSrc) {
      setStatus("error");
      return undefined;
    }

    setStatus("loading");

    timeoutRef.current = window.setTimeout(() => {
      setStatus("error");
    }, 15000);

    return clearLoadTimeout;
  }, [
    iframeSrc,
    reloadKey,
    game,
    clearLoadTimeout,
  ]);

  /* ============================================================
     SCROLL GAME VIEW TO TOP WHEN SWITCHING GAME
     ============================================================ */

  useEffect(() => {
    if (!rootRef.current) return;

    rootRef.current.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [game?.id]);

  /* ============================================================
     ESCAPE
     ============================================================ */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  /* ============================================================
     CLEANUP TIMEOUT
     ============================================================ */

  useEffect(() => {
    return () => {
      clearLoadTimeout();
    };
  }, [clearLoadTimeout]);

  if (!game) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="modal-bg"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} game player`}
    >
      {/* ========================================================
          TOP HEADER
          ======================================================== */}

      <div className="modal-top">
        <div className="modal-l">
          {game.thumb && (
            <img
              className="modal-thumb"
              src={game.thumb}
              alt=""
              width="48"
              height="48"
              loading="eager"
              decoding="async"
              onError={(event) => {
                event.currentTarget.style.visibility =
                  "hidden";
              }}
            />
          )}

          <div>
            <div
              className="modal-gt"
              title={title}
            >
              {title}
            </div>

            {game.category && (
              <div className="modal-gc">
                {game.category}
              </div>
            )}
          </div>
        </div>

        <div className="modal-acts">
          {/* FULLSCREEN */}

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

          {/* CLOSE */}

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

      {/* ========================================================
          GAME PLAYER
          ======================================================== */}

      <div className="modal-body">
        <div
          className="modal-game"
          ref={stageRef}
        >
          {/* LOADING */}

          {status === "loading" && (
            <div className="modal-loader">
              <div className="modal-spin" />

              <div className="modal-lt">
                Loading game…
              </div>
            </div>
          )}

          {/* ERROR */}

          {status === "error" && (
            <div className="modal-loader">
              <div className="modal-lt">
                This game couldn&apos;t be loaded.
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

          {/* IFRAME */}

          {iframeSrc && (
            <iframe
              key={`${iframeSrc}-${reloadKey}`}
              ref={frameRef}
              className="modal-iframe"
              src={iframeSrc}
              title={title}
              allowFullScreen
              allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope; clipboard-write"
              sandbox="
                allow-scripts
                allow-same-origin
                allow-forms
                allow-downloads
                allow-popups
                allow-popups-to-escape-sandbox
                allow-pointer-lock
                allow-presentation
              "
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleLoad}
              onError={handleError}
              style={iframeStyle}
            />
          )}

          {/* NO URL */}

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

      {/* ========================================================
          INFORMATION BELOW GAME
          ======================================================== */}

      <div className="modal-info">
        <div className="modal-info-grid">

          {/* ABOUT + HOW TO PLAY */}

          <article className="modal-info-card">
            <h2 className="modal-info-h">
              About {title}
            </h2>

            {content.about.map((paragraph, index) => (
              <p
                key={`${title}-about-${index}`}
                className="modal-info-p"
              >
                {paragraph}
              </p>
            ))}

            <h2 className="modal-info-h modal-info-h-next">
              How to play
            </h2>

            <ul className="modal-info-list">
              {content.howTo.map(
                (step, index) => (
                  <li
                    key={`${title}-how-${index}`}
                  >
                    {step}
                  </li>
                )
              )}
            </ul>
          </article>

          {/* GAME DETAILS */}

          <aside
            className="modal-info-card"
            aria-label="Game details"
          >
            <h2 className="modal-info-h">
              Game details
            </h2>

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
              <ul
                className="modal-info-tags"
                aria-label="Tags"
              >
                {content.tags.map((tag) => (
                  <li key={tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <Link href="/contact" className="modal-info-report">
              Something not working? Tell us
            </Link>
          </aside>
        </div>

        {/* ======================================================
            MORE GAMES
            ====================================================== */}

        {related.length > 0 && (
          <section
            className="modal-info-card modal-related"
            aria-labelledby="modal-related-h"
          >
            <h2
              id="modal-related-h"
              className="modal-info-h"
            >
              More games like this
            </h2>

            <div className="similar-grid">
              {related.map((relatedGame) => {
                const relatedTitle =
                  decodeEntities(
                    relatedGame.title || ""
                  );

                return (
                  <a
                    key={relatedGame.id}
                    href={gameHref(
                      relatedGame
                    )}
                    className="similar-card"
                    onClick={(event) =>
                      handleRelatedClick(
                        event,
                        relatedGame
                      )
                    }
                  >
                    <span className="similar-thumb">
                      {relatedGame.thumb && (
                        <img
                          src={relatedGame.thumb}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width="256"
                          height="256"
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