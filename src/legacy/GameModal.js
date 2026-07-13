"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { API_BASE } from "../config";

/* ─── GAME MODAL ─── */
const GameModal = React.memo(function GameModal({ game, onClose }) {
  const [source, setSource] = useState("proxy");
  const [status, setStatus] = useState("loading");
  const frameRef = useRef(null);
  const timeoutRef = useRef(null);

  const proxyUrl = useMemo(
    () => `${API_BASE}/proxy/game?url=${encodeURIComponent(game.url)}`,
    [game.url],
  );
  const iframeSrc = useMemo(
    () => (source === "direct" ? game.url : proxyUrl),
    [source, game.url, proxyUrl],
  );

  const modalStyle = useMemo(
    () => ({
      opacity: status === "loaded" ? 1 : 0,
      transition: "opacity .25s ease",
    }),
    [status],
  );

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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    setStatus("loading");
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSource((prev) => {
        if (prev === "proxy") {
          return "direct";
        }
        setStatus("error");
        return prev;
      });
    }, 8000);
    return () => clearTimeout(timeoutRef.current);
  }, [source]);

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

  const handleModalClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
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

export default GameModal;