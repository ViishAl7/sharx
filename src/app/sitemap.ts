import { MetadataRoute } from "next";
import { GAMES_BASE } from "../config";
const SITE_URL = "https://sharx.in";
const PER_PAGE = 50;
const MAX_PAGES = 200;

function slugify(title: string = "") {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Game = {
  id?: string;
  title?: string;
};

async function fetchAllGames(): Promise<Game[]> {
  const games: Game[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const res = await fetch(`${GAMES_BASE}/games?page=${page}`, {
        next: { revalidate: 3600 },
      });

      if (!res.ok) break;

      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) break;

      games.push(...data);

      if (data.length < PER_PAGE) break;
    } catch {
      break;
    }
  }

  return games;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await fetchAllGames();
  const now = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/home`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },

    ...games
      .filter((game) => game.id)
      .map((game) => ({
        url: `${SITE_URL}/game/${encodeURIComponent(game.id!)}-${slugify(
          game.title ?? ""
        )}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
  ];
}