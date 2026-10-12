// src/config.js — SHARX · single source of truth
//
// All API calls import { API_BASE } from "../config".
// All game/embed calls import { GAMES_BASE } from "../config".
//
// Environment variables (Next.js public — bundled client-side):
//   NEXT_PUBLIC_API_BASE   — backend API root (auth, user, rewards, history)
//   NEXT_PUBLIC_GAMES_BASE — games/media root (if different from API root)
//
// Defaults:
//   development → http://localhost:5001
//   production  → https://sharx-backend.onrender.com
//
// Both are trailing-slash stripped for consistent URL joins.

const LOCAL_API = "http://localhost:5001";
const RENDER_API = "https://sharx-backend.onrender.com";

const DEFAULT_API =
  process.env.NODE_ENV === "development" ? LOCAL_API : RENDER_API;

/* ─── API root ─── */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || DEFAULT_API
).replace(/\/+$/, "");

/* ─── Games / embed root (falls back to API root) ─── */
export const GAMES_BASE = (
  process.env.NEXT_PUBLIC_GAMES_BASE || API_BASE
).replace(/\/+$/, "");

/* ─── Default export for convenience ─── */
export default {
  API_BASE,
  GAMES_BASE,
};