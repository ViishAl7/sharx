import { MetadataRoute } from "next";
import { GAMES_BASE } from "../../config";

const SITE_URL = "https://sharx.in";
const PER_PAGE = 50;
// Hard safety cap so a backend that never returns a short page (e.g. an
// upstream bug) can't make sitemap generation loop forever. 200 pages *
// 50/page = up to 10,000 game URLs, comfortably under Google's 50,000
// URL-per-sitemap limit.
const MAX_PAGES = 200;

async function fetchAllGameIds(): Promise<string[]> {
  const ids: string[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    let games: Array<{ id?: string }> = [];
    try {
      const res = await fetch(`${GAMES_BASE}/games?page=${page}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const data = await res.json();
      games = Array.isArray(data) ? data : [];
    } catch {
      break;
    }
    if (games.length === 0) break;
    for (const g of games) {
      if (g?.id != null) ids.push(String(g.id));
    }
    if (games.length < PER_PAGE) break;
  }
  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const gameIds = await fetchAllGameIds();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
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
  ];

  const gameEntries: MetadataRoute.Sitemap = gameIds.map((id) => ({
    url: `${SITE_URL}/game/${encodeURIComponent(id)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...gameEntries];
}