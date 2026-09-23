// lib/games-data.js
import { preload } from "react-dom";
import { getImageProps } from "next/image";
import { GAMES_BASE } from "../config";

/* ═══════════════════════════════════════════════════════════════
   WHY THIS FILE CHANGED (LCP 16.5s → fast)

   BEFORE:
   - cache:"no-store" on every fetch  → page could not be static,
     server called the Render backend on EVERY visit.
   - Loop of 60 pages (6 batches x 10) before sending any HTML.
     Render free tier sleeps → 30-50s cold start → blank screen.
   - Build log showed "Dynamic server usage" for every page.

   NOW:
   - ISR: `next: { revalidate }` → HTML is built once, served from
     cache instantly, refreshed in the background every 5 min.
   - Server sends ONLY the first page (60 games). Home shows 12
     trending + 48 all-games, so 60 is exactly what's needed.
     "Load More" fetches the rest from the client.
   - If the backend is asleep/down, Next keeps serving the last
     good cached page instead of an empty one.
═══════════════════════════════════════════════════════════════ */

/* Seconds. Games list changes slowly → 5 min is plenty. */
export const GAMES_REVALIDATE = 300;

const DEFAULT_LIMIT = 50;
const PAGE_SIZE = 50;

/* Must match Homerows.js EXACTLY, otherwise the preloaded image URL
   differs from the one the <Image> really requests → preload wasted. */
export const CARD_IMAGE_SIZES =
  "(max-width:639px) 33vw, (max-width:1099px) 20vw, (max-width:1399px) 16vw, 200px";
export const CARD_IMAGE_QUALITY = 70;

/* Server sends this many games in the first HTML. */
const INITIAL_SERVER_GAMES = 60;

/* ═══════════════════════════════════════════════════════════════
   Dedupe by id — keeps the FIRST occurrence of each id.
═══════════════════════════════════════════════════════════════ */
export function dedupeGamesById(list) {
  const seen = new Set();
  const result = [];
  for (const g of list) {
    if (g?.id == null) {
      result.push(g);
      continue;
    }
    if (!seen.has(g.id)) {
      seen.add(g.id);
      result.push(g);
    }
  }
  return result;
}

function getGamesApiBase() {
  return GAMES_BASE.replace(/\/+$/, "");
}

function toPositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

/* ═══════════════════════════════════════════════════════════════
   Single page fetch (cached via ISR).
   NOTE: backend bug — page=1 can return hasMore:false even when
   more games exist. We do NOT trust hasMore for the loop.
═══════════════════════════════════════════════════════════════ */
export async function getGamesPage(page = 1, limit = DEFAULT_LIMIT) {
  const safePage = toPositiveInt(page, 1, 10000);
  const safeLimit = toPositiveInt(limit, DEFAULT_LIMIT, 100);

  const url = new URL(`${getGamesApiBase()}/games`);
  url.searchParams.set("page", String(safePage));
  url.searchParams.set("limit", String(safeLimit));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: GAMES_REVALIDATE },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Games API returned invalid JSON.");
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Games API returned ${response.status}.`);
  }

  const games = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.games)
      ? payload.games
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  const total = Number(payload?.total);

  const hasMore =
    typeof payload?.hasMore === "boolean"
      ? payload.hasMore
      : Number.isFinite(total)
        ? safePage * safeLimit < total
        : games.length === safeLimit;

  return { games, page: safePage, limit: safeLimit, hasMore };
}

/* ═══════════════════════════════════════════════════════════════
   Initial games for the server-rendered home page.
   Only the first ~60 games (2 small requests, in parallel).
   Never throws: on failure returns [] and Home's client fallback
   fetches instead.
═══════════════════════════════════════════════════════════════ */
export async function getInitialGames() {
  try {
    const pagesNeeded = Math.ceil(INITIAL_SERVER_GAMES / PAGE_SIZE); // 2
    const results = await Promise.allSettled(
      Array.from({ length: pagesNeeded }, (_, i) =>
        getGamesPage(i + 1, PAGE_SIZE)
      )
    );

    const all = [];
    for (const r of results) {
      if (r.status === "fulfilled") all.push(...(r.value?.games || []));
      else console.error("[getInitialGames] page failed:", r.reason);
    }

    return dedupeGamesById(all).slice(0, INITIAL_SERVER_GAMES);
  } catch (err) {
    console.error("[getInitialGames] failed:", err);
    return [];
  }
}

/* Kept for anything else that still imports it.
   Now capped to a small, safe number of pages. */
export async function getAllGames() {
  return getInitialGames();
}

/* ═══════════════════════════════════════════════════════════════
   Trending — cached too (was no-store).
═══════════════════════════════════════════════════════════════ */
export async function getTrendingGames(limit = 12) {
  try {
    const url = new URL(`${getGamesApiBase()}/games/trending`);
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: GAMES_REVALIDATE },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   Single game by id.
═══════════════════════════════════════════════════════════════ */
export async function getGameById(id) {
  if (id == null) return null;

  try {
    const res = await fetch(`${GAMES_BASE}/games/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || typeof data !== "object" || data.error) return null;
    return data;
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Preload the REAL LCP image.

   Home shows the TRENDING row first, so the LCP image is
   trending[0] — NOT allGames[0] (that was the old bug: it
   preloaded an image that is not even on screen first).

   `sizes` and `quality` are shared with Homerows.js, so the
   preloaded URL is identical to the one <Image> requests.
═══════════════════════════════════════════════════════════════ */
export function maybePreloadHeroImage(trending, allGames) {
  const first =
    (Array.isArray(trending) && trending[0]) ||
    (Array.isArray(allGames) && allGames[0]) ||
    null;

  const thumb = first?.thumb;
  if (!thumb) return;

  try {
    const { props } = getImageProps({
      src: thumb,
      alt: "",
      fill: true,
      sizes: CARD_IMAGE_SIZES,
      quality: CARD_IMAGE_QUALITY,
      priority: true,
    });

    preload(props.src, {
      as: "image",
      imageSrcSet: props.srcSet,
      imageSizes: props.sizes,
      fetchPriority: "high",
    });
  } catch {
    /* preload is an optimisation only — never break the page */
  }
}