// components/GameModal.js
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

/* ═══════════════════════════════════════════════════════════
   Extract the embeddable URL from whatever shape the game
   object comes in. Server / API may use any of these keys.
   ═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   GameModal — full-stage player + info under the game.
     • Top bar with thumb + title + Fullscreen + Close
     • One big centered 16:9 stage
     • UNDER the game: About, How to play, Details, More games
       (this text is what Google reads on every game page)
     • Robust scroll-lock (works on iOS Safari too)
     • 15s load timeout → Retry / Open in new tab
     • Escape closes
   Props:
     game, onClose
     games         (optional) full list, used for "More games like this"
     onSwitchGame  (optional) called when a "More games" card is clicked
   ═══════════════════════════════════════════════════════════ */
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

  const iframeSrc = useMemo(() => getGameEmbedUrl(game), [game]);
  const content = useMemo(() => getGameContent(game), [game]);
  const related = useMemo(
    () => getRelatedGames(game, games, 8),
    [game, games]
  );

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const iframeStyle = useMemo(
    () => ({
      opacity: status === "loaded" ? 1 : 0,
      transition: "opacity .3s ease",
    }),
    [status]
  );

  const handleFullscreen = useCallback(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  }, []);

  const handleRetry = useCallback(() => {
    setStatus("loading");
    setReloadKey((k) => k + 1);
  }, []);

  const handleOpenNewTab = useCallback(() => {
    if (iframeSrc) window.open(iframeSrc, "_blank", "noopener,noreferrer");
  }, [iframeSrc]);

  const handleLoad = useCallback(() => {
    clearLoadTimeout();
    setStatus("loaded");
  }, [clearLoadTimeout]);

  const handleError = useCallback(() => {
    clearLoadTimeout();
    setStatus("error");
  }, [clearLoadTimeout]);

  /* "More games" card: switch inside the modal (no full page reload) */
  const handleRelatedClick = useCallback(
    (e, g) => {
      if (!onSwitchGame) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
      e.preventDefault();
      onSwitchGame(g);
    },
    [onSwitchGame]
  );

  /* ─── Robust body scroll-lock ─── */
  useEffect(() => {
    scrollYRef.current = window.scrollY || window.pageYOffset || 0;

    const { style } = document.body;
    const prev = {
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
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      style.overflow = prev.overflow;
      document.body.classList.remove("modal-open");
      window.scrollTo(0, scrollYRef.current);
    };
  }, []);

  /* ─── Load timeout + reset on game switch ─── */
  useEffect(() => {
    clearLoadTimeout();

    if (!iframeSrc) {
      setStatus("error");
      return undefined;
    }

    setStatus("loading");
    timeoutRef.current = window.setTimeout(() => setStatus("error"), 15000);

    return clearLoadTimeout;
  }, [iframeSrc, reloadKey, clearLoadTimeout, game]);

  /* ─── When another game is picked, go back to the top ─── */
  useEffect(() => {
    rootRef.current?.scrollTo({ top: 0 });
  }, [game?.id]);

  /* ─── Escape closes ─── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!game) return null;

  const title = decodeEntities(game.title || "");

  return (
    <div
      ref={rootRef}
      className="modal-bg"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} game player`}
    >
      {/* ─── Top bar ─── */}
      <div className="modal-top">
        <div className="modal-l">
          {game.thumb && (
            <img
              className="modal-thumb"
              src={game.thumb}
              alt=""
              width="48"
              height="48"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
          )}
          <div>
            <div className="modal-gt" title={title}>
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
              <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
            </svg>
            <span>Fullscreen</span>
          </button>
          <button
            className="modal-x"
            onClick={onClose}
            title="Close (Esc)"
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Game stage ─── */}
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
                <button
                  className="modal-btn"
                  onClick={handleOpenNewTab}
                  type="button"
                >
                  Open in new tab
                </button>
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
              sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox allow-pointer-lock allow-presentation"
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleLoad}
              onError={handleError}
              style={iframeStyle}
            />
          )}
        </div>
      </div>

      {/* ─── Info under the game (this is the text Google reads) ─── */}
      <div className="modal-info">
        <div className="modal-info-grid">
          <article className="modal-info-card">
            <h2 className="modal-info-h">About {title}</h2>
            {content.about.map((p, i) => (
              <p key={i} className="modal-info-p">
                {p}
              </p>
            ))}

            <h2 className="modal-info-h modal-info-h-next">How to play</h2>
            <ul className="modal-info-list">
              {content.howTo.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </article>

          <aside className="modal-info-card" aria-label="Game details">
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
                {content.tags.map((t) => (
                  <li key={t}>{t}</li>
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
              {related.map((g) => {
                const gTitle = decodeEntities(g.title || "");
                return (
                  <a
                    key={g.id}
                    href={gameHref(g)}
                    className="similar-card"
                    onClick={(e) => handleRelatedClick(e, g)}
                  >
                    <span className="similar-thumb">
                      {g.thumb && (
                        <img
                          src={g.thumb}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width="256"
                          height="256"
                        />
                      )}
                    </span>
                    <span className="similar-title">{gTitle}</span>
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