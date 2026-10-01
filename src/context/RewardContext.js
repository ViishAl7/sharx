"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  startRewardSession,
  heartbeatRewardSession,
  endRewardSession,
  getRewardMe,
} from "../lib/rewardClient";

/* ═══════════════════════════════════════════
   MASTER FEATURE FLAG
   ───────────────────────────────────────────
   false → entire Rewards system is dormant.
           No reward APIs fire. No sessions.
           No heartbeats. No /rewards/me.
   true  → full Rewards functionality resumes.

   This is the SINGLE source of truth.
   Change ONLY this line to enable/disable
   the entire event.
═══════════════════════════════════════════ */
export const REWARDS_EVENT_LIVE = false;

const RewardContext = createContext(null);

const HEARTBEAT_MS = 15_000;

export function RewardProvider({ children }) {
  const { user, authLoading } = useAuth();

  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);

  const [activeSession, setActiveSession] = useState(null);

  const [lastReward, setLastReward] = useState(null);

  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardError, setRewardError] = useState("");

  const heartbeatTimerRef = useRef(null);
  const heartbeatInFlightRef = useRef(false);
  const sessionIdRef = useRef(null);

  /**
   * ---------------------------------------------------------
   * REFRESH REWARD DATA
   * ---------------------------------------------------------
   */

  const refreshRewards = useCallback(async () => {
    /**
     * EVENT LOCK — do not call the reward API at all
     * while the event is not live.
     */
    if (!REWARDS_EVENT_LIVE) {
      return null;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const token = localStorage.getItem("token");

    /**
     * IMPORTANT:
     * Never call the protected rewards API when the
     * authentication system has not produced a token yet.
     */
    if (!token) {
      return null;
    }

    try {
      const data = await getRewardMe();

      if (data?.wallet) {
        setWallet(data.wallet);
      }

      if (Array.isArray(data?.history)) {
        setHistory(data.history);
      }

      if (data?.activeSession) {
        setActiveSession(data.activeSession);
        sessionIdRef.current = data.activeSession.id;
      }

      return data;
    } catch (error) {
      /**
       * 401/403 are expected when authentication expires.
       * Do not spam the console with those.
       */
      if (
        error?.status !== 401 &&
        error?.status !== 403
      ) {
        console.error(
          "Reward refresh failed:",
          error
        );
      }

      return null;
    }
  }, []);

  /**
   * ---------------------------------------------------------
   * STOP HEARTBEAT
   * ---------------------------------------------------------
   */

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      window.clearInterval(
        heartbeatTimerRef.current
      );

      heartbeatTimerRef.current = null;
    }
  }, []);

  /**
   * ---------------------------------------------------------
   * HEARTBEAT
   * ---------------------------------------------------------
   */

  const sendHeartbeat = useCallback(async () => {
    /**
     * EVENT LOCK — never send a heartbeat while the
     * event is not live.
     */
    if (!REWARDS_EVENT_LIVE) {
      return;
    }

    if (
      heartbeatInFlightRef.current ||
      !sessionIdRef.current
    ) {
      return;
    }

    heartbeatInFlightRef.current = true;

    try {
      const data =
        await heartbeatRewardSession(
          sessionIdRef.current
        );

      /**
       * Update live qualified time.
       */
      if (
        data?.qualifiedSeconds != null
      ) {
        setActiveSession((previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,

            qualifiedSeconds:
              data.qualifiedSeconds,

            rewardedMilestones:
              data.rewardedMilestones,
          };
        });
      }

      /**
       * A reward was earned.
       */
      if (
        Array.isArray(data?.earned) &&
        data.earned.length > 0
      ) {
        const newest =
          data.earned[
            data.earned.length - 1
          ];

        setLastReward(newest);

        /**
         * Refresh wallet + history.
         */
        await refreshRewards();
      }
    } catch (error) {
      if (
        error?.code ===
          "SESSION_NOT_ACTIVE" ||
        error?.code ===
          "SESSION_CLIENT_MISMATCH"
      ) {
        stopHeartbeat();

        sessionIdRef.current = null;

        setActiveSession(null);

        return;
      }

      if (
        error?.status !== 401 &&
        error?.status !== 403
      ) {
        console.error(
          "Reward heartbeat failed:",
          error
        );
      }
    } finally {
      heartbeatInFlightRef.current = false;
    }
  }, [
    refreshRewards,
    stopHeartbeat,
  ]);

  /**
   * ---------------------------------------------------------
   * START GAME REWARD TRACKING
   * ---------------------------------------------------------
   */

  const startGameRewardTracking =
    useCallback(
      async (gameId) => {
        /**
         * EVENT LOCK — do not start any reward session
         * while the event is not live.
         */
        if (!REWARDS_EVENT_LIVE) {
          return null;
        }

        if (!gameId) {
          return null;
        }

        /**
         * Don't start reward tracking before
         * authentication is ready.
         */
        if (authLoading || !user) {
          return null;
        }

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : "";

        if (!token) {
          return null;
        }

        setRewardLoading(true);
        setRewardError("");

        try {
          /**
           * Stop previous session first.
           */
          if (sessionIdRef.current) {
            try {
              await endRewardSession(
                sessionIdRef.current
              );
            } catch {
              /**
               * Previous session may already
               * have expired.
               */
            }
          }

          stopHeartbeat();

          /**
           * Start new server-controlled session.
           */
          const data =
            await startRewardSession(
              String(gameId)
            );

          if (!data?.session?.id) {
            throw new Error(
              "Reward session could not be created."
            );
          }

          sessionIdRef.current =
            data.session.id;

          setActiveSession(
            data.session
          );

          setLastReward(null);

          /**
           * Server heartbeat every 15 seconds.
           */
          heartbeatTimerRef.current =
            window.setInterval(() => {
              void sendHeartbeat();
            }, HEARTBEAT_MS);

          return data.session;
        } catch (error) {
          console.error(
            "Could not start reward tracking:",
            error
          );

          setRewardError(
            error?.message ||
              "Rewards could not start right now."
          );

          return null;
        } finally {
          setRewardLoading(false);
        }
      },
      [
        authLoading,
        user,
        sendHeartbeat,
        stopHeartbeat,
      ]
    );

  /**
   * ---------------------------------------------------------
   * STOP GAME REWARD TRACKING
   * ---------------------------------------------------------
   */

  const stopGameRewardTracking =
    useCallback(async () => {
      stopHeartbeat();

      const id =
        sessionIdRef.current;

      sessionIdRef.current = null;

      setActiveSession(null);

      /**
       * EVENT LOCK — no reward session could have been started
       * while locked, so do not fire endRewardSession or
       * refreshRewards either.
       */
      if (!REWARDS_EVENT_LIVE) {
        return;
      }

      if (!id) {
        return;
      }

      try {
        await endRewardSession(id);
      } catch (error) {
        if (
          error?.status !== 401 &&
          error?.status !== 403
        ) {
          console.error(
            "Could not end reward session:",
            error
          );
        }
      }

      await refreshRewards();
    }, [
      refreshRewards,
      stopHeartbeat,
    ]);

  /**
   * ---------------------------------------------------------
   * AUTH-AWARE INITIALIZATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    /**
     * AuthProvider has not finished reading
     * localStorage yet.
     */
    if (authLoading) {
      return undefined;
    }

    let cancelled = false;

    const initializeRewards =
      async () => {
        /**
         * Logged-out user.
         */
        if (!user) {
          stopHeartbeat();

          sessionIdRef.current =
            null;

          setActiveSession(null);
          setWallet(null);
          setHistory([]);
          setLastReward(null);

          return;
        }

        /**
         * EVENT LOCK — do not fetch reward data on login
         * while the event is not live.
         */
        if (!REWARDS_EVENT_LIVE) {
          return;
        }

        /**
         * Logged-in user.
         */
        const data =
          await refreshRewards();

        if (cancelled) {
          return;
        }

        /**
         * Never silently continue an old
         * session after a fresh page load.
         */
        if (data?.activeSession) {
          try {
            await endRewardSession(
              data.activeSession.id
            );
          } catch {
            /**
             * Already expired is fine.
             */
          }

          sessionIdRef.current =
            null;

          setActiveSession(null);
        }
      };

    void initializeRewards();

    return () => {
      cancelled = true;

      stopHeartbeat();

      /**
       * EVENT LOCK — no reward session could exist while
       * locked, so skip the endRewardSession cleanup too.
       */
      if (!REWARDS_EVENT_LIVE) {
        sessionIdRef.current = null;
        return;
      }

      const id =
        sessionIdRef.current;

      if (id) {
        void endRewardSession(
          id
        ).catch(() => {});
      }

      sessionIdRef.current = null;
    };
  }, [
    authLoading,
    user,
    refreshRewards,
    stopHeartbeat,
  ]);

  /**
   * ---------------------------------------------------------
   * CONTEXT VALUE
   * ---------------------------------------------------------
   */

  const value = {
    wallet,
    history,

    activeSession,

    lastReward,

    rewardLoading,
    rewardError,

    refreshRewards,

    startGameRewardTracking,

    stopGameRewardTracking,
  };

  return (
    <RewardContext.Provider
      value={value}
    >
      {children}
    </RewardContext.Provider>
  );
}

export function useRewards() {
  const context =
    useContext(RewardContext);

  if (!context) {
    throw new Error(
      "useRewards must be used inside RewardProvider"
    );
  }

  return context;
}