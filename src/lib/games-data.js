// lib/games-data.js
import { preload } from "react-dom";
import { getImageProps } from "next/image";
import { GAMES_BASE } from "../config";

/* ═══════════════════════════════════════════════════════════════
   PERFORMANCE NOTES

   - ISR: `next: { revalidate }` → HTML is built once, served from
     cache instantly, refreshed in the background every 5 min.
   - Server sends ONLY the first page(s) (60 games). Home shows 12
     trending + 48 all-games, so 60 is exactly what's needed.
     "Load More" fetches the rest from the client.
   - If the backend is asleep/down, Next keeps serving the last
     good cached page instead of an empty one.

   BACKEND PATH FIX ("Games API returned 404")

   The server used to call `${GAMES_BASE}/games` directly. If the
   backend actually lives under a prefix (for example /api/v1/games),
   that call returns 404 while the browser route /api/games works.

   fetchFromBackend() now tries the common prefixes once, remembers
   the one that works, and logs the exact URLs if every one fails.
   Once you know the right prefix you can pin it with the env var
   GAMES_API_PREFIX (for example GAMES_API_PREFIX=/api/v1).
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
  return String(GAMES_BASE || "").replace(/\/+$/, "");
}

function toPositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

/* ═══════════════════════════════════════════════════════════════
   Backend path resolver
═══════════════════════════════════════════════════════════════ */
const normalizePrefix = (value) => {
  const trimmed = String(value ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const PINNED_PREFIX =
  process.env.GAMES_API_PREFIX !== undefined
    ? normalizePrefix(process.env.GAMES_API_PREFIX)
    : null;

/* Order matters: the configured base as-is first, then common prefixes. */
const CANDIDATE_PREFIXES = ["", "/api/v1", "/api"];

/* Remembered after the first successful call, so later calls make one request. */
let workingPrefix = PINNED_PREFIX;

function buildUrl(prefix, path, params) {
  const url = new URL(`${getGamesApiBase()}${prefix}${path}`);
  for (const [key, value] of Object.entries(params || {})) {
    url.searchParams.set(key, String(value));
  }
  return url;
}

/*
  Returns { response, url }.
  A 404 is treated as "wrong path" only while the right prefix is unknown.
  Network errors are thrown to the caller as usual.
*/
async function fetchFromBackend(path, params, init) {
  const prefixes = workingPrefix !== null ? [workingPrefix] : CANDIDATE_PREFIXES;
  const tried = [];
  let last = null;

  for (const prefix of prefixes) {
    const url = buildUrl(prefix, path, params);
    const response = await fetch(url.toString(), init);

    if (response.status !== 404) {
      workingPrefix = prefix;
      return { response, url };
    }

    tried.push(url.toString());
    last = { response, url };
  }

  console.error("[games-data] 404 for every known path:", tried.join("  |  "));
  return last;
}

/* ═══════════════════════════════════════════════════════════════
   Single page fetch (cached via ISR).
   NOTE: backend bug — page=1 can return hasMore:false even when
   more games exist. We do NOT trust hasMore for the loop.
═══════════════════════════════════════════════════════════════ */
export async function getGamesPage(page = 1, limit = DEFAULT_LIMIT) {
  const safePage = toPositiveInt(page, 1, 10000);
  const safeLimit = toPositiveInt(limit, DEFAULT_LIMIT, 100);

  const { response, url } = await fetchFromBackend(
    "/games",
    { page: safePage, limit: safeLimit },
    {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: GAMES_REVALIDATE },
    }
  );

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Games API returned invalid JSON.");
  }

  if (!response.ok) {
    throw new Error(
      payload?.error ||
        `Games API returned ${response.status} for ${url.toString()}`
    );
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

    /* The first request learns the working path; the rest reuse it. */
    const first = await Promise.allSettled([getGamesPage(1, PAGE_SIZE)]);
    const rest = await Promise.allSettled(
      Array.from({ length: pagesNeeded - 1 }, (_, i) =>
        getGamesPage(i + 2, PAGE_SIZE)
      )
    );

    const all = [];
    for (const r of [...first, ...rest]) {
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
    const result = await fetchFromBackend(
      "/games/trending",
      { limit },
      {
        method: "GET",
        headers: { Accept: "application/json" },
        next: { revalidate: GAMES_REVALIDATE },
      }
    );

    if (!result?.response?.ok) return [];

    const data = await result.response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.games)) return data.games;
    return [];
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
    const result = await fetchFromBackend(
      `/games/${encodeURIComponent(id)}`,
      null,
      { next: { revalidate: 60 } }
    );

    if (!result?.response?.ok) return null;

    const data = await result.response.json();
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