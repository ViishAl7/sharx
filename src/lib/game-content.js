/* ═══════════════════════════════════════════════════════════
   GAME CONTENT HELPERS
   Used by GameModal.js (what people see under the game) and
   game/[id]/page.js (meta description, structured data).

   Where the text comes from, in this order:
     1. src/lib/game-content-overrides.js  ← YOUR OWN rewritten text (best for SEO)
     2. The feed fields: description / instructions / tags (if your API passes them)
     3. A short safe fallback sentence
   ═══════════════════════════════════════════════════════════ */

import { GAME_CONTENT } from "./game-content-overrides";

/* ─── text cleanup (feed text can contain HTML and &amp; etc.) ─── */
const ENTITIES = {
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&#x27;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

export function decodeEntities(value) {
  if (typeof value !== "string" || value.indexOf("&") === -1) return value || "";
  let out = value;
  for (let i = 0; i < 3; i += 1) {
    const next = out
      .replace(/&(quot|apos|lt|gt|nbsp);|&#39;|&#x27;/g, (m) => ENTITIES[m] ?? m)
      .replace(/&#(\d+);/g, (m, n) => {
        const c = Number(n);
        return c > 0 && c < 0x10ffff ? String.fromCodePoint(c) : m;
      })
      .replace(/&amp;/g, "&");
    if (next === out) break;
    out = next;
  }
  return out;
}

function stripHtml(s) {
  return String(s || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|div|h\d)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]*>/g, "");
}

export function cleanText(value) {
  return decodeEntities(stripHtml(value))
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const toParagraphs = (value) =>
  cleanText(value)
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter(Boolean);

const toSteps = (value) => {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);

  const text = cleanText(value);
  if (!text) return [];

  // Keep already-structured instructions intact.
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^[•\-*\d.)\s]+/, "").trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  // GameMonetize often sends controls as one flat string.
  // Split only at strong control-section boundaries so normal
  // sentences are not unnecessarily broken apart.
  const parts = text
    .replace(/\s+(?=(Desktop|Mobile)\s+)/gi, "\n")
    .replace(/\s+(?=(Player\s+(?:Movement|Controls?|1|2|3|4))\s+)/gi, "\n")
    .split(/\n+/)
    .map((line) => line.replace(/^[•\-*\d.)\s]+/, "").trim())
    .filter(Boolean);

  return parts.length > 1 ? parts : [text];
};

const toTags = (value) => {
  const list = Array.isArray(value) ? value : String(value || "").split(/[,;|]/);
  const seen = new Set();
  const out = [];
  for (const t of list) {
    const tag = cleanText(String(t)).toLowerCase();
    if (tag && tag.length <= 30 && !seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
    }
  }
  return out.slice(0, 10);
};

/* ─── slug + link (same rule as Home.js) ─── */
export function slugify(title = "") {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function gameHref(game) {
  const slug = slugify(decodeEntities(game?.title || ""));
  return `/game/${encodeURIComponent(game.id)}${slug ? `-${slug}` : ""}`;
}

/* ─── main helper ─── */
const DEFAULT_STEPS = [
  "Press the play or start button inside the game window to begin.",
  "Most games show their controls on the start screen.",
  "Use the Fullscreen button above for a bigger view. On a phone, turn to landscape if the game asks you to.",
];

export function getGameContent(game) {
  if (!game) return { about: [], howTo: DEFAULT_STEPS, tags: [], isCustom: false };

  const title = cleanText(game.title || "This game");
  const custom = GAME_CONTENT[game.id];

  let about = [];
  if (custom?.about) about = toParagraphs(custom.about);
  else about = toParagraphs(game.description ?? game.desc ?? "");

  if (about.length === 0) {
    const cat = game.category ? `${String(game.category).toLowerCase()} ` : "";
    about = [
      `${title} is a free ${cat}game you can play online in your browser on Sharx. No download is needed — press play and start.`,
    ];
  }

  let howTo = custom?.howTo
    ? toSteps(custom.howTo)
    : toSteps(game.instructions ?? game.howToPlay ?? "");
  if (howTo.length === 0) howTo = DEFAULT_STEPS;

  const tags = toTags(custom?.tags ?? game.tags ?? game.keywords ?? "");

  return { about, howTo, tags, isCustom: Boolean(custom?.about) };
}

/* ─── related games: same category first, then others ─── */
export function getRelatedGames(current, all, limit = 8) {
  if (!current || !Array.isArray(all)) return [];
  const seen = new Set();
  const same = [];
  const other = [];
  for (const g of all) {
    if (!g || g.id == null || g.id === current.id || seen.has(g.id)) continue;
    seen.add(g.id);
    if (current.category && g.category === current.category) same.push(g);
    else other.push(g);
  }
  return [...same, ...other].slice(0, limit);
}