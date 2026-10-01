"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

const AuthContext = createContext(null);

/* ─── Safe JWT payload decode ─── */
function decodeToken(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // base64url → base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    // atob returns latin1 string; decode to UTF-8 safely
    const binary = atob(padded);
    const json = decodeURIComponent(
      Array.prototype.map
        .call(binary, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(json);
    if (!payload || typeof payload !== "object") return null;
    return payload;
  } catch {
    return null;
  }
}

/* ─── Token expiry check ─── */
function isExpired(payload) {
  if (!payload || typeof payload !== "object") return true;
  if (!payload.exp) return false; // no exp → treat as non-expiring
  return payload.exp * 1000 <= Date.now();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* Hydrate auth state from localStorage on mount */
  useEffect(() => {
    if (typeof window === "undefined") {
      setAuthLoading(false);
      return;
    }

    const syncFromStorage = () => {
      try {
        const token = window.localStorage.getItem("token");
        const payload = decodeToken(token);

        if (!payload || isExpired(payload)) {
          window.localStorage.removeItem("token");
          setUser(null);
        } else {
          setUser(payload);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    syncFromStorage();
  }, []);

  /* Cross-tab sync: if token changes in another tab, reflect here */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onStorage = (e) => {
      if (e.key !== "token") return;
      const payload = decodeToken(e.newValue);
      if (!payload || isExpired(payload)) {
        setUser(null);
      } else {
        setUser(payload);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* login: returns true on success, false otherwise */
  const login = useCallback((token) => {
    if (typeof window === "undefined") return false;
    if (!token || typeof token !== "string") return false;

    const payload = decodeToken(token);
    if (!payload || isExpired(payload)) return false;

    try {
      window.localStorage.setItem("token", token);
    } catch {
      return false;
    }

    setUser(payload);
    return true;
  }, []);

  /* logout: optional redirect param (default true) */
  const logout = useCallback((redirect = true) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("token");
      } catch {}
    }
    setUser(null);

    if (redirect && typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, authLoading }),
    [user, login, logout, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    // Safe fallback so components outside provider don't crash hard
    return { user: null, login: () => false, logout: () => {}, authLoading: false };
  }
  return ctx;
};

export default AuthContext;