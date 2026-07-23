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

export async function getInitialGames() {
  try {
    const res = await fetch(`${GAMES_BASE}/games?page=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return dedupeGamesById(Array.isArray(data) ? data : []);
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