"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

/* ─────────────────────────────────────────────
   DATE KEY — local YYYY-MM-DD
───────────────────────────────────────────── */
const getDateKey = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
};

/* ─────────────────────────────────────────────
   DETERMINISTIC HASH — FNV-1a 32-bit
   Same date string → same number, every time.
───────────────────────────────────────────── */
const hashDate = (value) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const GameOfTheDay = memo(function GameOfTheDay({ games = [], onOpen }) {
  const [dateKey, setDateKey] = useState(() => getDateKey());
  const timeoutRef = useRef(null);

  /* Schedule a rollover at local midnight.
     After firing, it re-schedules for the next midnight,
     so the drop keeps updating every day without refresh. */
  useEffect(() => {
    let cancelled = false;

    const scheduleNextDay = () => {
      if (cancelled) return;

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 2, 0); // 2 s past local midnight

      const delay = Math.max(1000, tomorrow.getTime() - now.getTime());

      timeoutRef.current = window.setTimeout(() => {
        if (cancelled) return;
        setDateKey(getDateKey());
        scheduleNextDay();
      }, delay);
    };

    scheduleNextDay();

    return () => {
      cancelled = true;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  /* Deterministic pick — same date → same game */
  const game = useMemo(() => {
    const usable = Array.isArray(games)
      ? games.filter((item) => item && (item.id != null || item.title))
      : [];

    if (usable.length === 0) return null;

    const index = hashDate(dateKey) % usable.length;
    return usable[index];
  }, [games, dateKey]);

  if (!game) return null;

  const title = String(game.title || "Today's Pick");
  const image = game.thumb || "";

  return (
    <section className="game-of-day" aria-label="The SHARX Drop">
      <div className="game-of-day-copy">
        <div className="game-of-day-eyebrow">
          <span className="game-of-day-dot" aria-hidden="true" />
          FRESH FROM SHARX
        </div>

        <h2 className="game-of-day-title">The SHARX Drop</h2>
        <p className="game-of-day-subtitle">
          A new game lands here every day.
        </p>

        <button
          type="button"
          className="game-of-day-button"
          onClick={() => onOpen?.(game)}
        >
          <span>PLAY THE DROP</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <button
        type="button"
        className="game-of-day-art"
        onClick={() => onOpen?.(game)}
        aria-label={`Play ${title}`}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 700px) 90vw, 42vw"
            priority
            className="game-of-day-image"
          />
        ) : (
          <div className="game-of-day-fallback">
            {title.slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="game-of-day-play" aria-hidden="true">
          ▶
        </span>
      </button>
    </section>
  );
});

export default GameOfTheDay;