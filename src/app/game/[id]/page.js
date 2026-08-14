import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Home from "../../../legacy/Home";
import {
  getInitialGames,
  getGameById,
  maybePreloadHeroImage,
} from "../../../lib/games-data";

const SITE_URL = "https://sharx.in";

function decodeHtml(str = "") {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Matches src/app/sitemap.ts's slugify() exactly — same lowercase, same
// non-alphanumeric collapse, same trim. sitemap.ts does NOT decode HTML
// entities before slugifying, so this doesn't either: an entity like
// "&amp;" becomes the literal word "amp" in both places. If this ever
// drifts from sitemap.ts, Related Games links and sitemap URLs for the
// same game will point to different paths.
function slugify(title = "") {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getGameHref(game) {
  const slug = slugify(game?.title ?? "");
  return `/game/${encodeURIComponent(game.id)}${slug ? `-${slug}` : ""}`;
}

// Picks up to `limit` related games out of the games list already fetched
// by getInitialGames() — no extra fetch, no new endpoint. Same-category
// games come first, other games fill any remaining slots. The current
// game is excluded and duplicate ids (if the source list ever had any)
// are collapsed via the id Set below.
function getRelatedGames(currentGame, allGames, limit = 8) {
  if (!currentGame || !Array.isArray(allGames)) return [];

  const currentId = currentGame.id;
  const currentCategory = currentGame.category;

  const seen = new Set();
  const sameCategory = [];
  const otherCategory = [];

  for (const g of allGames) {
    if (!g || g.id == null) continue;
    if (g.id === currentId) continue;
    if (seen.has(g.id)) continue;
    seen.add(g.id);

    if (currentCategory && g.category === currentCategory) {
      sameCategory.push(g);
    } else {
      otherCategory.push(g);
    }
  }

  return [...sameCategory, ...otherCategory].slice(0, limit);
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  const gameId = id.match(/^gm_\d+/)?.[0] || id;

  const game = await getGameById(gameId);

  if (!game) {
    return {
      title: "Game not found | Sharx",
    };
  }

  const gameTitle = decodeHtml(game.title);

  const title = `Play ${gameTitle} Online Free | Sharx`;

  const description = `Play ${gameTitle} instantly in your browser. No download. Free on Sharx.`;

  const url = `${SITE_URL}/game/${encodeURIComponent(id)}`;

  const images = game.thumb
    ? [
        {
          url: game.thumb,
          width: 512,
          height: 384,
          alt: gameTitle,
        },
      ]
    : undefined;

  return {
    title,
    description,

    alternates: {
      canonical: `/game/${encodeURIComponent(id)}`,
    },

    openGraph: {
      type: "website",
      url,
      title,
      description,
      images,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: game.thumb ? [game.thumb] : undefined,
    },
  };
}

export default async function GamePage({ params }) {
  const { id } = await params;

  const gameId = id.match(/^gm_\d+/)?.[0] || id;

  const [game, initialGames] = await Promise.all([
    getGameById(gameId),
    getInitialGames(),
  ]);

  if (!game) {
    notFound();
  }

  maybePreloadHeroImage(initialGames);

  const gameTitle = decodeHtml(game.title);

  const relatedGames = getRelatedGames(game, initialGames, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: gameTitle,
    image: game.thumb,
    genre: game.category || undefined,

    publisher: {
      "@type": "Organization",
      name: "Sharx",
      url: SITE_URL,
    },

    url: `${SITE_URL}/game/${encodeURIComponent(id)}`,
  };

  return (
    <>
      {/* Structured data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* Main game UI */}
      <Home
        initialGames={initialGames}
        initialActiveGame={{
          ...game,
          title: gameTitle,
        }}
      />

      {relatedGames.length > 0 && (
        <section className="related-games" aria-labelledby="related-games-heading">
          <h2 id="related-games-heading" className="related-games-heading">
            Related Games
          </h2>

          <div className="related-games-grid">
            {relatedGames.map((rg) => {
              const rgTitle = decodeHtml(rg.title);
              return (
                <Link key={rg.id} href={getGameHref(rg)} className="related-game-card">
                  {rg.thumb && (
                    <img
                      className="related-game-thumb"
                      src={rg.thumb}
                      alt={rgTitle}
                      loading="lazy"
                      width={512}
                      height={384}
                    />
                  )}
                  <span className="related-game-title">{rgTitle}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}