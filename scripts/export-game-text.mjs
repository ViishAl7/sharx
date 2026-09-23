import { writeFile } from "node:fs/promises";

const feedUrl = process.argv[2];
const site = (process.argv[3] || "https://sharx.in").replace(/\/$/, "");

if (!feedUrl) {
  console.log('Feed URL is missing. Run: node scripts/export-game-text.mjs "FEED_URL"');
  process.exit(1);
}

const codeOf = (value) => String(value || "").match(/[a-z0-9]{32}/i)?.[0]?.toLowerCase();

async function getJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(url + "\n  -> HTTP " + res.status);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("This is not JSON:\n  " + text.slice(0, 160));
  }
}

const listFrom = (data) =>
  Array.isArray(data)
    ? data
    : data?.items ||
      data?.games ||
      data?.data ||
      Object.values(data || {}).find(Array.isArray) ||
      [];

console.log("1/3  Reading your games from", site, "...");
const mine = listFrom(await getJson(site + "/api/games?page=1&limit=200"));
console.log("     found " + mine.length + " games on your site");

console.log("2/3  Downloading the GameMonetize feed ...");
const feed = listFrom(await getJson(feedUrl));
console.log("     feed has " + feed.length + " games");

const byCode = new Map();
for (const item of feed) {
  const code = codeOf(item.url) || codeOf(item.thumb);
  if (code) byCode.set(code, item);
}

console.log("3/3  Matching ...");
const found = [];
const missing = [];

for (const g of mine) {
  const code = codeOf(g.url) || codeOf(g.thumb);
  const item = code ? byCode.get(code) : null;
  if (!item) {
    missing.push({ id: g.id, title: g.title });
    continue;
  }
  found.push({
    id: g.id,
    title: g.title,
    category: g.category,
    tags: item.tags ?? "",
    instructions: item.instructions ?? "",
    description: item.description ?? "",
    width: item.width,
    height: item.height,
  });
}

await writeFile("game-text-export.json", JSON.stringify({ found, missing }, null, 2), "utf8");

console.log("\nDONE\n  matched : " + found.length + " games\n  missing : " + missing.length + " games\n");
console.log('File "game-text-export.json" is ready. Send it to Claude.');
if (missing.length) {
  console.log("\nMissing games:");
  for (const m of missing) console.log("  -", m.id, m.title);
  console.log("\nTip: make your feed link return MORE games and run again.");
}
