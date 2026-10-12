"use client";

// Tracks REAL play time for one GameModal and saves it for the LOGGED-IN user.
//
//  - startPlay(): call from iframe onLoad (ignored if a session is running)
//  - stopPlay():  saves the running session exactly once
//  - Saves automatically on game switch, unmount and pagehide.
//  - Time while the tab is hidden is not counted.
//  - Guests (no valid token) never hit the server and nothing is stored.
//  - The session remembers WHO started it. If the account changed while the
//    game was open (logout / other user logged in) the session is dropped,
//    so one user's play time can never be credited to another account.
//  - The backend identifies the user from the JWT. No userId is ever sent.

import { useCallback, useEffect, useRef } from "react";
import { API_BASE } from "../config";
import { currentUserId, readToken } from "./auth-session";
import {
  applyPlayToHistory,
  notifyGameHistoryChanged,
  trackPendingSave,
} from "./game-history-store";

const MAX_SECONDS = 86400;

function postPlay(session, seconds, token) {
  const url = `${API_BASE}/user/games/${encodeURIComponent(session.gameId)}/play`;

  const request = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      gameName: session.gameName,
      playSeconds: seconds,
    }),
    keepalive: true,
  })
    .then((res) => {
      if (res.status === 401) {
        // Server rejected the token -> AuthProvider logs out immediately.
        try {
          window.dispatchEvent(new CustomEvent("sharx:auth-expired"));
        } catch {}
        throw new Error("status 401");
      }
      if (!res.ok) throw new Error(`status ${res.status}`);

      // 1) instant UI update for an open Profile panel
      applyPlayToHistory({
        ownerId: session.userId,
        gameId: session.gameId,
        gameName: session.gameName,
        seconds,
      });
      // 2) reconcile with the server (single deduped request)
      notifyGameHistoryChanged();
    })
    .catch((err) => {
      // Never log the token.
      console.warn(
        "[GamePlay] Game history could not be saved:",
        err?.message || err
      );
    });

  return trackPendingSave(request);
}

export default function useGamePlayTracker(game, title) {
  const sessionRef = useRef(null);
  const gameId = game?.id;

  const startPlay = useCallback(() => {
    // Some games re-fire iframe onLoad internally — never restart the timer.
    if (sessionRef.current) return;
    if (gameId == null || gameId === "") return;

    sessionRef.current = {
      gameId: String(gameId),
      gameName: title || "",
      userId: currentUserId(), // null for guests
      accumulatedMs: 0,
      resumedAt: document.visibilityState === "hidden" ? null : Date.now(),
    };
  }, [gameId, title]);

  const stopPlay = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null; // clear first => no duplicate saves
    if (!session) return;

    // Guest session, or the account changed while playing -> never save.
    const token = readToken();
    const nowUserId = currentUserId();
    if (!token || !API_BASE) return;
    if (!session.userId || session.userId !== nowUserId) return;

    const ms =
      session.accumulatedMs +
      (session.resumedAt ? Date.now() - session.resumedAt : 0);
    const seconds = Math.min(
      MAX_SECONDS,
      Math.max(0, Math.floor(ms / 1000))
    );

    void postPlay(session, seconds, token);
  }, []);

  // Pause counting while tab hidden + flush on page close.
  useEffect(() => {
    const onVisibility = () => {
      const s = sessionRef.current;
      if (!s) return;
      if (document.visibilityState === "hidden") {
        if (s.resumedAt) {
          s.accumulatedMs += Date.now() - s.resumedAt;
          s.resumedAt = null;
        }
      } else if (!s.resumedAt) {
        s.resumedAt = Date.now();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", stopPlay);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", stopPlay);
    };
  }, [stopPlay]);

  // Logout / other-tab logout while a game is open: drop the session now.
  useEffect(() => {
    const onAuthChanged = (e) => {
      if (e?.detail?.type === "logout") sessionRef.current = null;
    };
    window.addEventListener("sharx:auth-changed", onAuthChanged);
    return () =>
      window.removeEventListener("sharx:auth-changed", onAuthChanged);
  }, []);

  // Game switched or modal unmounted => save the finished session.
  useEffect(() => {
    return () => {
      stopPlay();
    };
  }, [gameId, stopPlay]);

  return { startPlay, stopPlay };
}
