import React from "react";
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
          height: 512,
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

  const [game, initialGames] = await Promise.all([
    getGameById(id),
    getInitialGames(),
  ]);

  if (!game) {
    notFound();
  }

  maybePreloadHeroImage(initialGames);

  const gameTitle = decodeHtml(game.title);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

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