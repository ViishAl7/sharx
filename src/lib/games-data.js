import { preload } from "react-dom";
import { getImageProps } from "next/image";
import { GAMES_BASE } from "../config";
// Shared by both the homepage (src/app/page.js) and the individual game
// route (src/app/game/[id]/page.js) so neither one duplicates this
// fetch/dedupe/preload logic — both routes render the exact same
// homepage grid behind whatever modal state they start with.

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

const DEFAULT_LIMIT = 50;

function getGamesApiBase() {
  // This is resolved on the Next.js server, never in the visitor's browser.
  // It uses Railway in production and localhost only during local development.
  return GAMES_BASE.replace(/\/+$/, "");
}

function toPositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

export async function getGamesPage(page = 1, limit = DEFAULT_LIMIT) {
  const safePage = toPositiveInt(page, 1, 10000);
  const safeLimit = toPositiveInt(limit, DEFAULT_LIMIT, 100);

  const url = new URL(`${getGamesApiBase()}/games`);
  url.searchParams.set("page", String(safePage));
  url.searchParams.set("limit", String(safeLimit));

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
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

  // Array response aur { games: [] } dono support karega.
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

  return {
    games,
    page: safePage,
    limit: safeLimit,
    hasMore,
  };
}

export async function getInitialGames() {
  try {
    const { games } = await getGamesPage(1, DEFAULT_LIMIT);
    return games;
  } catch {
    return [];
  }
}

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
// Primes the browser's preload cache for the grid's first-rendered image
// (the page's LCP element) using the SAME optimized src/srcSet that
// GameCard's own <Image> will end up requesting, so the browser doesn't
// end up downloading two different versions of it.
export function maybePreloadHeroImage(games) {
  const thumb = games?.[0]?.thumb;
  if (!thumb) return;
  const { props } = getImageProps({
    src: thumb,
    alt: "",
    fill: true,
    sizes: "(max-width:768px) 50vw, (max-width:1200px) 33vw, 20vw",
    quality: 65,
    priority: true,
  });
  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: "high",
  });
}
