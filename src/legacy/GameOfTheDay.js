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
───────────────────────────────────────────── */
const hashString = (value) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

/* ─────────────────────────────────────────────
   STABLE GAME KEY
───────────────────────────────────────────── */
const getGameKey = (game) => {
  if (!game) return "";
  if (game.id != null) return `id:${String(game.id)}`;
  if (game.title) return `title:${String(game.title).trim().toLowerCase()}`;
  return "";
};

/* ─────────────────────────────────────────────
   STORAGE KEY
───────────────────────────────────────────── */
const getStorageKey = (dateKey) => `sharx-game-of-day:${dateKey}`;

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const GameOfTheDay = memo(function GameOfTheDay({
  games = [],
  onOpen,
}) {
  const [dateKey, setDateKey] = useState(() => getDateKey());
  const [selectedGameKey, setSelectedGameKey] = useState(null);

  const timeoutRef = useRef(null);

  /* ─── MIDNIGHT SYNC ─── */
  useEffect(() => {
    let cancelled = false;

    const scheduleNextMidnight = () => {
      if (cancelled) return;
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 50);
      const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());

      timeoutRef.current = window.setTimeout(() => {
        if (cancelled) return;
        setDateKey(getDateKey());
        scheduleNextMidnight();
      }, delay);
    };

    scheduleNextMidnight();

    return () => {
      cancelled = true;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  /* ─── LOAD TODAY'S STORED GAME ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = getStorageKey(dateKey);
    const stored = window.localStorage.getItem(storageKey);
    setSelectedGameKey(stored || null);
  }, [dateKey]);

  /* ─── USABLE GAMES ─── */
  const usableGames = useMemo(() => {
    if (!Array.isArray(games)) return [];
    return games.filter((game) => game && (game.id != null || game.title));
  }, [games]);

  /* ─── STORED GAME ─── */
  const storedGame = useMemo(() => {
    if (!selectedGameKey || usableGames.length === 0) return null;
    return (
      usableGames.find((game) => getGameKey(game) === selectedGameKey) || null
    );
  }, [usableGames, selectedGameKey]);

  /* ─── FALLBACK GAME ─── */
  const fallbackGame = useMemo(() => {
    if (usableGames.length === 0) return null;
    const stableGames = [...usableGames].sort((a, b) => {
      const keyA = getGameKey(a);
      const keyB = getGameKey(b);
      return keyA.localeCompare(keyB);
    });
    const index = hashString(`sharx-drop:${dateKey}`) % stableGames.length;
    return stableGames[index];
  }, [usableGames, dateKey]);

  const game = storedGame || fallbackGame;

  /* ─── SAVE TODAY'S SELECTION ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!game) return;
    const gameKey = getGameKey(game);
    if (!gameKey) return;
    const storageKey = getStorageKey(dateKey);
    const alreadyStored = window.localStorage.getItem(storageKey);
    if (alreadyStored !== gameKey) {
      window.localStorage.setItem(storageKey, gameKey);
      setSelectedGameKey(gameKey);
    }
  }, [game, dateKey]);

  /* ─── NO GAME ─── */
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
            sizes="(max-width: 700px) 90vw, (max-width: 1200px) 45vw, 42vw"
            priority
            fetchPriority="high"
            quality={75}
            placeholder="empty"
            className="game-of-day-image"
            style={{ objectFit: "cover" }}
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