
// src/config.js — SHARX · single source of truth

const LOCAL_API = "http://localhost:5001";
const RENDER_API = "https://sharx-backend.onrender.com";

const DEFAULT_API =
  process.env.NODE_ENV === "development" ? LOCAL_API : RENDER_API;

/* Existing API — Google OAuth, Passkey, etc. */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || DEFAULT_API
).replace(/\/+$/, "");

/* Community API — Email/Password authentication */
export const COMMUNITY_API_BASE = (
  process.env.NEXT_PUBLIC_COMMUNITY_API_BASE ||
  "http://localhost:4100"
).replace(/\/+$/, "");

/* Games / embed root */
export const GAMES_BASE = (
  process.env.NEXT_PUBLIC_GAMES_BASE || API_BASE
).replace(/\/+$/, "");

export default {
  API_BASE,
  COMMUNITY_API_BASE,
  GAMES_BASE,
};
