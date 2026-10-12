// src/lib/game-history-store.js — SHARX · server game history, shared state
//
// One module singleton shared by GameModal (writer) and the Profile panel (reader).
//
//  - State is tagged with the user it belongs to. If the logged-in user changes
//    (or logs out) the state is wiped, so User B can never see User A's list.
//  - Duplicate loads are merged into ONE in-flight request.
//  - Loading always ends: authFetch has a timeout -> "error" state with retry.
//  - After a play is saved we update the list instantly (optimistic) and then
//    reconcile with the server. No polling anywhere.
//  - The server stays the authority: it identifies the user from the JWT.
//    We never send a userId.
//
// Old exports are kept so nothing else breaks:
//   trackPendingSave, waitForPendingSaves, notifyGameHistoryChanged,
//   subscribeGameHistory, getGameHistoryVersion

import { useSyncExternalStore } from "react";
import { authFetch, currentUserId, readToken } from "./auth-session";

const HISTORY_PATH = "/user/games/history";
const STALE_MS = 30_000;

/* ═════════ pending saves (unchanged behaviour) ═════════ */
let version = 0;
const versionListeners = new Set();
const pending = new Set();

export function trackPendingSave(promise) {
  pending.add(promise);
  const done = () => pending.delete(promise);
  promise.then(done, done);
  return promise;
}

export async function waitForPendingSaves() {
  while (pending.size > 0) {
    await Promise.allSettled(Array.from(pending));
  }
}

/** Call after a session was saved successfully. Triggers a reconcile fetch. */
export function notifyGameHistoryChanged() {
  version += 1;
  versionListeners.forEach((fn) => {
    try {
      fn(version);
    } catch {}
  });
  // Keep every open Profile panel in sync with the server.
  void loadGameHistory({ force: true });
}

export function subscribeGameHistory(fn) {
  versionListeners.add(fn);
  return () => versionListeners.delete(fn);
}

export function getGameHistoryVersion() {
  return version;
}

/* ═════════ shared state ═════════ */
// status: "idle" | "loading" | "ready" | "error" | "noauth"
const EMPTY = Object.freeze({
  ownerId: null,
  games: Object.freeze([]),
  status: "idle",
  error: "",
  loadedAt: 0,
});

let state = EMPTY;
const stateListeners = new Set();

function setState(next) {
  state = next;
  stateListeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

export function getGameHistoryState() {
  return state;
}

export function subscribeGameHistoryState(fn) {
  stateListeners.add(fn);
  return () => stateListeners.delete(fn);
}

/* ═════════ loading ═════════ */
let inflight = null; // { ownerId, seq, promise }
let requestSeq = 0;

function normalizeList(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.games)
    ? data.games
    : Array.isArray(data?.history)
    ? data.history
    : Array.isArray(data?.items)
    ? data.items
    : [];
  return list.filter((g) => g && typeof g === "object");
}

/** Wipe everything (logout / user switch / expired token). */
export function resetGameHistory() {
  requestSeq += 1; // invalidate any response that is still on its way
  inflight = null;
  if (state !== EMPTY) setState(EMPTY);
}

/**
 * Load the CURRENT user's history.
 *  - { force: true }  always hits the server (still merged with an in-flight request)
 *  - otherwise a fresh-enough cached list for the same user is reused
 */
export function loadGameHistory({ force = false } = {}) {
  const ownerId = currentUserId();

  // Guest / expired: nothing to load, never touch the network.
  if (!ownerId || !readToken()) {
    if (state.status !== "noauth" || state.ownerId !== null) {
      requestSeq += 1;
      inflight = null;
      setState({ ...EMPTY, status: "noauth" });
    }
    return Promise.resolve(state);
  }

  // Different account than the cached one -> never show the old list.
  if (state.ownerId !== null && state.ownerId !== ownerId) {
    resetGameHistory();
  }

  if (inflight && inflight.ownerId === ownerId) return inflight.promise;

  const fresh =
    state.ownerId === ownerId &&
    state.status === "ready" &&
    Date.now() - state.loadedAt < STALE_MS;
  if (fresh && !force) return Promise.resolve(state);

  const seq = ++requestSeq;

  // Keep showing known data while revalidating; only show spinner if we have none.
  if (state.ownerId !== ownerId || state.status !== "ready") {
    setState({ ...EMPTY, ownerId, status: "loading" });
  }

  const promise = (async () => {
    try {
      await waitForPendingSaves(); // never read before our own save landed
    } catch {}

    try {
      const data = await authFetch(HISTORY_PATH);
      if (seq !== requestSeq) return state; // superseded (logout / switch)
      setState({
        ownerId,
        games: Object.freeze(normalizeList(data)),
        status: "ready",
        error: "",
        loadedAt: Date.now(),
      });
    } catch (err) {
      if (seq !== requestSeq) return state;
      if (err?.kind === "abort") return state;

      if (err?.kind === "noauth") {
        // AuthProvider logs out via auth-expired; just clear our data.
        setState({ ...EMPTY, status: "noauth" });
      } else if (state.status === "ready" && state.ownerId === ownerId) {
        // Background refresh failed: keep the safe list we already have.
        setState({ ...state, error: err?.message || "Refresh failed" });
      } else {
        setState({
          ownerId,
          games: EMPTY.games,
          status: "error",
          error: err?.message || "Could not load game history",
          loadedAt: 0,
        });
      }
    } finally {
      if (inflight && inflight.seq === seq) inflight = null;
    }
    return state;
  })();

  inflight = { ownerId, seq, promise };
  return promise;
}

/**
 * Instant UI update right after a play was saved, before the reconcile fetch.
 * Only touches the list that belongs to `ownerId`.
 */
export function applyPlayToHistory({ ownerId, gameId, gameName, seconds }) {
  if (!ownerId || state.ownerId !== ownerId || state.status !== "ready") return;
  const id = String(gameId);
  const now = new Date().toISOString();
  const add = Math.max(0, Number(seconds) || 0);

  const games = state.games.slice();
  const idx = games.findIndex((g) => String(g.gameId) === id);

  if (idx >= 0) {
    const prev = games[idx];
    games.splice(idx, 1);
    games.unshift({
      ...prev,
      gameName: prev.gameName || gameName || prev.gameId,
      playCount: Number(prev.playCount || 0) + 1,
      totalPlaySeconds: Number(prev.totalPlaySeconds || 0) + add,
      lastPlayedAt: now,
    });
  } else {
    games.unshift({
      id: `local-${id}`,
      gameId: id,
      gameName: gameName || id,
      playCount: 1,
      totalPlaySeconds: add,
      lastPlayedAt: now,
    });
  }

  setState({ ...state, games: Object.freeze(games), error: "" });
}

/* ═════════ React hook ═════════ */
export function useGameHistory() {
  return useSyncExternalStore(
    subscribeGameHistoryState,
    getGameHistoryState,
    () => EMPTY
  );
}
