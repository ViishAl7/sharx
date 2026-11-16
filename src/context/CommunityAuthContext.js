"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { COMMUNITY_API_BASE } from "../config";

const CommunityAuthContext = createContext(null);

export function CommunityAuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(
        `${COMMUNITY_API_BASE}/api/v1/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        setAccessToken(null);
        return null;
      }

      const data = await response.json();
      setAccessToken(data.accessToken || null);
      return data.accessToken || null;
    } catch {
      setAccessToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const response = await fetch(
          `${COMMUNITY_API_BASE}/api/v1/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        if (active) setAccessToken(data.accessToken || null);
      } catch {
        // User may not have a Community session yet.
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const response = await fetch(
      `${COMMUNITY_API_BASE}/api/v1/auth/login`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Login failed. Please try again."
      );
    }

    if (!data.accessToken) {
      throw new Error("Access token was not returned by the server.");
    }

    setAccessToken(data.accessToken);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${COMMUNITY_API_BASE}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setAccessToken(null);
    }
  }, []);

  return (
    <CommunityAuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: Boolean(accessToken),
        loading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </CommunityAuthContext.Provider>
  );
}

export function useCommunityAuth() {
  const context = useContext(CommunityAuthContext);

  if (!context) {
    throw new Error(
      "useCommunityAuth must be used inside CommunityAuthProvider"
    );
  }

  return context;
}
