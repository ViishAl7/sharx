// src/lib/auth-session.js — SHARX · one place for token + authenticated fetch
//
// Rules:
//  - The token lives ONLY in localStorage under "token" (existing architecture).
//  - Nothing here ever logs the token or its payload.
//  - A 401 from a protected endpoint means the SERVER rejected the token.
//    We broadcast "sharx:auth-expired" and AuthProvider logs the user out.
//  - 403 / 5xx / network errors are NOT auth failures (we never log out on them).
//  - Every request has a timeout so UI can never hang on "Loading..." forever.

import { API_BASE } from "../config";

export const TOKEN_KEY = "token";
export const AUTH_EXPIRED_EVENT = "sharx:auth-expired";
export const AUTH_CHANGED_EVENT = "sharx:auth-changed";
export const RETURN_TO_KEY = "sharx:return-to";

const DEFAULT_TIMEOUT_MS = 30_000;

/* ─────────── token ─────────── */
export function readToken() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

/** Decode a JWT payload. Returns null on ANY problem. Never throws. */
export function decodeJwt(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const json = decodeURIComponent(
      Array.prototype.map
        .call(
          binary,
          (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    const payload = JSON.parse(json);
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

export function isPayloadExpired(payload) {
  if (!payload || typeof payload !== "object") return true;
  if (!payload.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

/** Stable string id of the user inside a JWT payload (display / cache key only —
 *  the BACKEND still derives identity from the token, never from this value). */
export function userIdFromPayload(payload) {
  if (!payload) return null;
  const id = payload.user_id ?? payload.userId ?? payload.id ?? payload.sub ?? null;
  return id === null || id === undefined || id === "" ? null : String(id);
}

/** Id of whoever is logged in right now according to the stored token. */
export function currentUserId() {
  const payload = decodeJwt(readToken());
  if (!payload || isPayloadExpired(payload)) return null;
  return userIdFromPayload(payload);
}

/* ─────────── returnTo (open-redirect safe) ─────────── */
/** Only same-origin relative paths are allowed. Everything else -> fallback. */
export function sanitizeReturnTo(value, fallback = "/home") {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  if (!v.startsWith("/")) return fallback;
  if (v.startsWith("//") || v.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(v)) return fallback;
  // never bounce back into the auth pages (redirect loops)
  if (/^\/(login|signup|auth\/callback)(\/|\?|#|$)/.test(v)) return fallback;
  return v;
}

export function rememberReturnTo(path) {
  if (typeof window === "undefined") return;
  const clean = sanitizeReturnTo(path, null);
  if (!clean) return; // never overwrite a good destination with an auth page
  try {
    window.sessionStorage.setItem(RETURN_TO_KEY, clean);
  } catch {}
}

/** Read AND clear the remembered destination. */
export function consumeReturnTo(fallback = "/home") {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.sessionStorage.getItem(RETURN_TO_KEY);
    window.sessionStorage.removeItem(RETURN_TO_KEY);
    return sanitizeReturnTo(v, fallback);
  } catch {
    return fallback;
  }
}

/* ─────────── OAuth start ─────────── */
const OAUTH_PROVIDERS = new Set(["google", "microsoft"]);

/** Full-page redirect to the backend OAuth entry. Remembers where to come back. */
export function startOAuth(provider, returnTo) {
  if (typeof window === "undefined") return;
  if (!OAUTH_PROVIDERS.has(provider)) return;

  const fallback = `${window.location.pathname}${window.location.search}`;
  rememberReturnTo(returnTo || fallback);
  // External backend URL (full-page OAuth redirect) — not a Next.js route.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${API_BASE}/auth/${provider}`;
}

/* ─────────── authenticated fetch ─────────── */
function broadcastExpired(sentToken) {
  if (typeof window === "undefined") return;
  // Ignore a stale 401 that belongs to a token we've since replaced.
  if (readToken() !== sentToken) return;
  try {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  } catch {}
}

export class AuthRequestError extends Error {
  constructor(message, { status = 0, code, data, kind = "network" } = {}) {
    super(message);
    this.name = "AuthRequestError";
    this.status = status;
    this.code = code;
    this.data = data;
    // "noauth" | "http" | "timeout" | "network" | "abort"
    this.kind = kind;
  }
}

/**
 * fetch() against API_BASE with the CURRENT token.
 *  - no token                -> throws AuthRequestError(kind "noauth") WITHOUT a network call
 *  - 401                     -> broadcasts auth-expired + throws kind "noauth"
 *  - other !ok               -> throws kind "http"
 *  - timeout / offline       -> throws kind "timeout" / "network"
 *  - caller abort            -> throws kind "abort"
 * Resolves to parsed JSON (or null for empty bodies).
 */
export async function authFetch(path, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, headers, ...rest } = options;

  const token = readToken();
  if (!token) {
    throw new AuthRequestError("Not signed in", { status: 401, kind: "noauth" });
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onCallerAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onCallerAbort, { once: true });
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      ...rest,
      headers: {
        Accept: "application/json",
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(headers || {}),
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.status === 401) {
      broadcastExpired(token);
      throw new AuthRequestError(data?.error || "Session expired", {
        status: 401,
        code: data?.code,
        data,
        kind: "noauth",
      });
    }

    if (!response.ok) {
      throw new AuthRequestError(
        data?.error || data?.message || `Request failed (${response.status})`,
        { status: response.status, code: data?.code, data, kind: "http" }
      );
    }

    return data;
  } catch (err) {
    if (err instanceof AuthRequestError) throw err;
    if (timedOut) {
      throw new AuthRequestError("Request timed out", { kind: "timeout" });
    }
    if (err?.name === "AbortError") {
      throw new AuthRequestError("Request cancelled", { kind: "abort" });
    }
    throw new AuthRequestError("Network error", { kind: "network" });
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onCallerAbort);
  }
}
