import React from "react";
import Home from "../../legacy/Home";
import {
  getInitialGames,
  getTrendingGames,
  maybePreloadHeroImage,
} from "../../lib/games-data";

export default async function Page() {
  const [initialGames, trendingGames] = await Promise.all([
    getInitialGames(),
    getTrendingGames(12),
  ]);
  maybePreloadHeroImage(initialGames);

  return <Home initialGames={initialGames} initialTrendingGames={trendingGames} />;
}