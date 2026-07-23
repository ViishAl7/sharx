import React from "react";
import Home from "../../legacy/Home";
import {
  getInitialGames,
  maybePreloadHeroImage,
} from "../../lib/games-data";

export default async function Page() {
  const initialGames = await getInitialGames();
  maybePreloadHeroImage(initialGames);

  return <Home initialGames={initialGames} />;
}
