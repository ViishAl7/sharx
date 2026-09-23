const LOCAL_API = "http://localhost:5001";
const RENDER_API = "https://sharx-backend.onrender.com";

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ||
  (process.env.NODE_ENV === "development" ? LOCAL_API : RENDER_API)
).replace(/\/$/, "");

export const GAMES_BASE = (
  process.env.NEXT_PUBLIC_GAMES_BASE || API_BASE
).replace(/\/$/, "");