"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

const INVALID_GAME_URL =
  /(?:sharx-backend-production\.up\.railway\.app|localhost:5001)/i;

function getGameEmbedUrl(game) {
  const suppliedUrl = String(
    game?.embedUrl ||
      game?.embed_url ||
      game?.playUrl ||
      game?.play_url ||
      game?.url ||
      "",
  ).trim();

  // Actual external game URL ho to use it.
  if (suppliedUrl && !INVALID_GAME_URL.test(suppliedUrl)) {
    return suppliedUrl;
  }

  // GameMonetize thumbnail se game ID nikaal kar direct iframe URL banao.
  const thumbnail = String(game?.thumb || game?.thumbnail || "");
  const gameId = thumbnail.match(
    /img\.gamemonetize\.com\/([^/?#]+)/i,
  )?.[1];

  return gameId
    ? `https://html5.gamemonetize.co/${gameId}/`
    : "";
}

const GameModal = React.memo(function GameModal({ game, onClose }) {
  const [status, setStatus] = useState("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const frameRef = useRef(null);
  const timeoutRef = useRef(null);

  const iframeSrc = useMemo(() => getGameEmbedUrl(game), [game]);

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const modalStyle = useMemo(
    () => ({
      opacity: status === "loaded" ? 1 : 0,
      transition: "opacity .25s ease",
    }),
    [status],
  );

  const handleFullscreen = useCallback(() => {
    frameRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  const handleRetry = useCallback(() => {
    setStatus("loading");
    setReloadKey((key) => key + 1);
  }, []);

  const handleOpenNewTab = useCallback(() => {
    if (iframeSrc) {
      window.open(iframeSrc, "_blank", "noopener,noreferrer");
    }
  }, [iframeSrc]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
  }, [iframeSrc, reloadKey, clearLoadTimeout]);

  const handleLoad = useCallback(() => {
    clearLoadTimeout();
    setStatus("loaded");
  }, [clearLoadTimeout]);

  const handleError = useCallback(() => {
    clearLoadTimeout();
    setStatus("error");
  }, [clearLoadTimeout]);

  const handleModalClick = useCallback(
    (event) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

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
          <button className="modal-x" onClick={onClose} title="Close">
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

        {iframeSrc && (
          <iframe
            key={`${iframeSrc}-${reloadKey}`}
            ref={frameRef}
            className="modal-iframe"
            src={iframeSrc}
            title={game.title}
            allowFullScreen
            allow="autoplay; fullscreen; gamepad"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox allow-pointer-lock"
            onLoad={handleLoad}
            onError={handleError}
            style={modalStyle}
          />
        )}
      </div>
    </div>
  );
});

export default GameModal;