// src/legacy/Homerows.js
"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GAMES_BASE } from "../config";

const slugify = (title = "") =>
  String(title)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function getPreviewVideoUrl(game) {
  if (!game?.id) return "";
  if (typeof game.feedRank === "number" && game.feedRank >= 100) return "";
  return `${GAMES_BASE.replace(/\/+$/, "")}/preview/${encodeURIComponent(
    game.id
  )}`;
}

const HOVER_DELAY = 300;

export const RowCard = React.memo(function RowCard({
  game,
  index = 0,
  animate = false,
  onNavigate,
}) {
  const [loaded, setLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const hoverTimerRef = useRef(null);
  const videoRef = useRef(null);

  const title = (game?.title || "Untitled").toString();
  const category = game?.category || "";

  const previewSrc = useMemo(() => getPreviewVideoUrl(game), [game]);

  const fallbackSrc = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#FFF6D9"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="#1B2A41" text-anchor="middle" dy=".3em">${title.slice(0, 18)}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [title]);

  const handleImageError = useCallback(
    (e) => {
      e.target.srcset = "";
      e.target.src = fallbackSrc;
      setLoaded(true);
    },
    [fallbackSrc]
  );

  const handleClick = useCallback(
    (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      e.preventDefault();
      onNavigate?.();
    },
    [onNavigate]
  );

  const handleMouseEnter = useCallback(() => {
    if (!previewSrc || videoFailed) return;
    hoverTimerRef.current = window.setTimeout(() => {
      setIsHovering(true);
      videoRef.current?.play?.().catch(() => {});
    }, HOVER_DELAY);
  }, [previewSrc, videoFailed]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHovering(false);
    setVideoReady(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleVideoError = useCallback(() => {
    setVideoFailed(true);
    setIsHovering(false);
    setVideoReady(false);
  }, []);

  const imgSrc = game?.thumb || fallbackSrc;
  const showVideo = isHovering && !!previewSrc && !videoFailed;

  const isAboveFold = index < 2;
  const showRank = animate && index < 12;

  const body = (
    <div
      className="row-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="row-card-thumb">
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 420px) 30vw, (max-width: 640px) 30vw, (max-width: 900px) 22vw, (max-width: 1200px) 16vw, 13vw"
          loading={isAboveFold ? "eager" : "lazy"}
          priority={isAboveFold}
          quality={70}
          onError={handleImageError}
          onLoad={() => setLoaded(true)}
          className={`row-card-img ${loaded ? "loaded" : ""}`}
          style={{ opacity: showVideo && videoReady ? 0 : 1 }}
        />

        {showVideo && (
          <video
            ref={videoRef}
            className="row-card-video"
            src={previewSrc}
            muted
            loop
            playsInline
            autoPlay
            preload="none"
            onCanPlay={() => setVideoReady(true)}
            onError={handleVideoError}
            style={{ opacity: videoReady ? 1 : 0 }}
          />
        )}

        {showRank && (
          <span className="row-card-rank" aria-hidden="true">
            #{String(index + 1).padStart(2, "0")}
          </span>
        )}

        <div className="row-card-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {category ? (
          <span className="row-card-chip" aria-hidden="true">
            {category}
          </span>
        ) : null}
      </div>
      <div className="row-card-title" title={title}>
        {title}
      </div>
    </div>
  );

  const wrapperClass = `row-card-link${animate ? " card-anim" : ""}`;

  if (game?.id == null) {
    return (
      <div
        className={wrapperClass}
        role="button"
        tabIndex={0}
        onClick={onNavigate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onNavigate?.();
          }
        }}
        aria-label={`Play ${title}`}
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={`/game/${encodeURIComponent(game.id)}-${slugify(title)}`}
      prefetch={false}
      className={wrapperClass}
      onClick={handleClick}
      aria-label={`Play ${title}`}
    >
      {body}
    </Link>
  );
});