// src/app/sitemap.js
const BASE_URL = "https://sharx.in";

export default async function sitemap() {
  /* ─── Static pages ─── */
  const staticRoutes = [
    "",
    "/home",
    "/inside",
    "/hello",
    "/trust",
    "/terms",
    "/copyright",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/home" ? "daily" : "monthly",
    priority: route === "" || route === "/home" ? 1.0 : 0.7,
  }));

  /* ─── Game pages (agar API available hai) ─── */
  let gameRoutes = [];
  try {
    const res = await fetch(`${BASE_URL}/api/games?limit=500`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const games = Array.isArray(data?.games) ? data.games : [];
      gameRoutes = games
        .filter((g) => g?.id != null && g?.title)
        .map((g) => {
          const slug = String(g.title)
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          return {
            url: `${BASE_URL}/game/${g.id}-${slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          };
        });
    }
  } catch (error) {
    console.error("Sitemap: failed to fetch games", error);
  }

  return [...staticRoutes, ...gameRoutes];
}