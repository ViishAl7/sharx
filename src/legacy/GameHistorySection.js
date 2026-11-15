"use client";

// src/legacy/GameHistorySection.js — SHARX · Crayon · Clean
//
// Clean gamepad icon (beaker gone). 3-line layout per row.

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "../config";
import {
  subscribeGameHistory,
  waitForPendingSaves,
} from "../lib/game-history-store";

const INITIAL_VISIBLE = 5;

function readToken() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatLastPlayed(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

/* ── Clean line-art gamepad — same everywhere ── */
const GamepadIcon = ({ size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.1 3.3a2.4 2.4 0 0 1-4.4.5L14 15h-4l-1.3 2a2.4 2.4 0 0 1-4.4-.5l-1.1-3.3A4 4 0 0 1 7 8Z" />
    <path d="M8 11v4M6 13h4" />
    <circle cx="16.5" cy="12" r=".7" fill="currentColor" />
    <circle cx="18.5" cy="14" r=".7" fill="currentColor" />
  </svg>
);

export default function GameHistorySection() {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("loading");
  const [expanded, setExpanded] = useState(false);

  const requestIdRef = useRef(0);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    abortRef.current?.abort();
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    abortRef.current = controller;

    try {
      await waitForPendingSaves();
    } catch {}

    if (!mountedRef.current) return;
    if (requestId !== requestIdRef.current) return;

    const token = readToken();
    if (!token || !API_BASE) {
      setGames([]);
      setStatus("noauth");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/user/games/history`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: controller ? controller.signal : undefined,
      });

      if (!mountedRef.current) return;
      if (requestId !== requestIdRef.current) return;

      if (response.status === 401 || response.status === 403) {
        setGames([]);
        setStatus("noauth");
        return;
      }
      if (!response.ok) throw new Error(`status ${response.status}`);

      const data = await response.json();

      if (!mountedRef.current) return;
      if (requestId !== requestIdRef.current) return;

      setGames(Array.isArray(data) ? data : []);
      setStatus("ready");
    } catch (err) {
      if (err?.name === "AbortError") return;
      if (!mountedRef.current) return;
      if (requestId !== requestIdRef.current) return;
      console.warn("[GameHistory] Could not load history:", err?.message || err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const initialLoad = window.setTimeout(() => { void load(); }, 0);
    const unsubscribe = subscribeGameHistory(() => { void load(); });
    return () => {
      mountedRef.current = false;
      window.clearTimeout(initialLoad);
      unsubscribe();
      requestIdRef.current += 1;
      abortRef.current?.abort();
    };
  }, [load]);

  const handleRetry = () => { setStatus("loading"); void load(); };

  const visible = expanded ? games : games.slice(0, INITIAL_VISIBLE);
  const hiddenCount = Math.max(0, games.length - INITIAL_VISIBLE);

  return (
    <section className="psp-gameHistory" aria-label="Game History">
      <div className="psp-gameHistory-head">
        <div>
          <div className="psp-gameHistory-kicker">
            <span className="psp-gameHistory-dot" />
            YOUR GAMES
          </div>
          <h3 className="psp-gameHistory-title">Game History</h3>
        </div>
        <div className="psp-gameHistory-badge" aria-hidden="true">
          <GamepadIcon size={18} />
        </div>
      </div>

      {status === "loading" ? (
        <div className="psp-gameHistory-empty">Loading your games...</div>
      ) : status === "noauth" ? (
        <div className="psp-gameHistory-empty">
          <strong>Login required.</strong>
          <span>Log in to see your game history.</span>
        </div>
      ) : status === "error" ? (
        <div className="psp-gameHistory-empty">
          <strong>Could not load game history.</strong>
          <button type="button" className="psp-gameHistory-retry" onClick={handleRetry}>
            Try again
          </button>
        </div>
      ) : games.length === 0 ? (
        <div className="psp-gameHistory-empty">
          <strong>No games played yet.</strong>
          <span>Play a game while logged in and it will appear here.</span>
        </div>
      ) : (
        <div className="psp-gameHistory-list">
          {visible.map((game) => {
            const plays = Number(game.playCount || 0);
            const name = game.gameName || game.gameId || "Untitled game";
            const duration = formatDuration(game.totalPlaySeconds);
            const lastPlayed = formatLastPlayed(game.lastPlayedAt);
            return (
              <div className="psp-gameHistory-row" key={game.id ?? `${game.gameId}-${game.lastPlayedAt}`}>
                <div className="psp-gameHistory-gameIcon" aria-hidden="true">
                  <GamepadIcon size={17} />
                </div>
                <div className="psp-gameHistory-info">
                  <div className="psp-gameHistory-name" title={name}>{name}</div>
                  <div className="psp-gameHistory-meta">
                    <span>{plays} {plays === 1 ? "play" : "plays"}</span>
                    <span className="psp-gameHistory-meta-dot" aria-hidden="true" />
                    <span>{duration}</span>
                  </div>
                  <div className="psp-gameHistory-last">Last played: {lastPlayed}</div>
                </div>
              </div>
            );
          })}

          {hiddenCount > 0 && (
            <button
              type="button"
              className="psp-gameHistory-viewAll"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? "Show less" : `View all (${games.length})`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}