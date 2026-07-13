import React from "react";
import { preload } from "react-dom";
import { getImageProps } from "next/image";
import Home from "../../legacy/Home";
import { GAMES_BASE } from "../../config";

async function getInitialGames() {
  try {
    const res = await fetch(`${GAMES_BASE}/games?page=1`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.log("🔴 DEBUG: fetch failed, status:", res.status, "GAMES_BASE:", GAMES_BASE);
      return [];
    }
    const data = await res.json();
    console.log("🟢 DEBUG: fetch succeeded, games count:", Array.isArray(data) ? data.length : "not an array");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.log("🔴 DEBUG: fetch threw an error:", err.message, "GAMES_BASE:", GAMES_BASE);
    return [];
  }
}

// SAME dedupe logic as Home.js. Duplicated intentionally (not imported)
// because this runs in a server component and Home.js is a client
// component — keep this in sync with dedupeById() in Home.js if that
// function ever changes.
function dedupeById(list) {
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

export default async function Page() {
  const rawGames = await getInitialGames();

  // FIX: dedupe BEFORE picking [0], using the exact same function Home.js
  // uses internally. Previously this preloaded rawGames[0], but Home.js
  // renders dedupeById(rawGames)[0] as the priority/LCP image — if the
  // API ever returns a duplicate or reordered first entry, those two
  // "first games" silently diverged and the preload pointed at an image
  // that was never actually the LCP element. Deduping here guarantees
  // both places agree on what "index 0" means.
  const initialGames = dedupeById(rawGames);

  console.log("🔵 DEBUG: initialGames[0]?.thumb =", initialGames[0]?.thumb || "MISSING/UNDEFINED");

  // Generate the EXACT same optimized src/srcSet that GameCard's <Image>
  // will request, then preload that — not the raw external URL. This
  // keeps the preload and the actual request as the same download,
  // instead of the browser fetching two different images.
  if (initialGames[0]?.thumb) {
    const { props } = getImageProps({
      src: initialGames[0].thumb,
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
    console.log("✅ DEBUG: preload() was called with:", props.src);
  } else {
    console.log("⚠️ DEBUG: preload() was SKIPPED because thumb was missing");
  }

  return React.createElement(Home, { initialGames });
}