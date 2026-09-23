import React from "react";
import { notFound } from "next/navigation";
import Home from "../../../legacy/Home";
import {
  getInitialGames,
  getGameById,
  maybePreloadHeroImage,
} from "../../../lib/games-data";
import { getGameContent, decodeEntities } from "../../../lib/game-content";

const SITE_URL = "https://sharx.in";

/* Short meta description: uses the game's real text when there is some,
   otherwise a simple sentence. Google shows this under the link in search. */
function buildDescription(game, gameTitle, about) {
  const first = (about?.[0] || "").replace(/\s+/g, " ").trim();
  const isFallback = first.includes("No download is needed");
  if (first && !isFallback) {
    return first.length > 155 ? `${first.slice(0, 152).trimEnd()}…` : first;
  }
  return `Play ${gameTitle} instantly in your browser. No download. Free on Sharx.`;
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

  const gameTitle = decodeEntities(game.title);
  const { about } = getGameContent({ ...game, title: gameTitle });

  const title = `Play ${gameTitle} Online Free | Sharx`;

  const description = buildDescription(game, gameTitle, about);

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

  const gameTitle = decodeEntities(game.title);
  const { about } = getGameContent({ ...game, title: gameTitle });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: gameTitle,
    description: buildDescription(game, gameTitle, about),
    image: game.thumb,
    genre: game.category || undefined,
    gamePlatform: "Web browser",
    applicationCategory: "Game",
    operatingSystem: "Any",
    inLanguage: "en",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },

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

      {/* Main game UI. The text, "How to play" and "More games like this"
          now live inside the game window (GameModal), where people can see them. */}
      <Home
        initialGames={initialGames}
        initialActiveGame={{
          ...game,
          title: gameTitle,
        }}
      />
    </>
  );
}