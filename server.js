const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
app.use(cors());

let cache = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 min cache

// ─── GameMonetize se saare pages ek saath fetch karo ───
async function fetchGameMonetize() {
  const allGames = [];
  const totalPages = 6; // 6 pages x 500 = 3000 games try karega

  for (let p = 1; p <= totalPages; p++) {
    try {
      const url = `https://gamemonetize.com/feed.php?format=0&num=500&page=${p}`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      const text = await res.text();
      if (text.trim().startsWith('<')) break; // HTML aa gaya matlab pages khatam

      const json = JSON.parse(text);
      if (!Array.isArray(json) || json.length === 0) break;

      // Normalize format
      const games = json.map(g => ({
        id: `gm_${g.id || g.title}`,
        title: g.title,
        thumb: g.thumb,
        url: g.url,
        category: g.category || 'Other',
        source: 'gamemonetize'
      }));

      allGames.push(...games);
      console.log(`GameMonetize page ${p}: ${games.length} games`);

      if (json.length < 500) break; // Last page
    } catch (e) {
      console.error(`GameMonetize page ${p} error:`, e.message);
      break;
    }
  }

  return allGames;
}

// ─── GamePix public feed (no key needed) ───
async function fetchGamePix() {
  const allGames = [];
  const totalPages = 5;

  for (let p = 1; p <= totalPages; p++) {
    try {
      const url = `https://www.gamepix.com/api/games?per_page=100&page=${p}`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      const text = await res.text();
      if (text.trim().startsWith('<')) break;

      const json = JSON.parse(text);
      const data = json.data || json;
      if (!Array.isArray(data) || data.length === 0) break;

      const games = data.map(g => ({
        id: `gp_${g.id || g.title}`,
        title: g.title,
        thumb: g.thumbnail || g.thumb,
        url: g.url,
        category: g.category || 'Other',
        source: 'gamepix'
      }));

      allGames.push(...games);
      console.log(`GamePix page ${p}: ${games.length} games`);

      if (data.length < 100) break;
    } catch (e) {
      console.error(`GamePix page ${p} error:`, e.message);
      break;
    }
  }

  return allGames;
}

// ─── Sab fetch karke merge karo ───
async function fetchAllGames() {
  console.log('Fetching all games from all sources...');

  const [gamemonetize, gamepix] = await Promise.allSettled([
    fetchGameMonetize(),
    fetchGamePix(),
  ]);

  let allGames = [];

  if (gamemonetize.status === 'fulfilled') allGames.push(...gamemonetize.value);
  if (gamepix.status === 'fulfilled') allGames.push(...gamepix.value);

  // Duplicates hata do title ke basis pe
  const seen = new Set();
  const unique = allGames.filter(g => {
    if (!g.title || !g.url) return false;
    const key = g.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Total unique games: ${unique.length}`);
  return unique;
}

// ─── Main route ───
app.get('/games', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const category = req.query.category || '';
  const PER_PAGE = 50;

  try {
    // Full list cache
    if (!cache.allGames || Date.now() - cache.allGames.time > CACHE_TTL) {
      console.log('Cache miss — fetching fresh data...');
      const games = await fetchAllGames();
      cache.allGames = { data: games, time: Date.now() };
    } else {
      console.log('Cache hit — using cached games');
    }

    let games = cache.allGames.data;

    // Category filter
    if (category && category !== 'All') {
      games = games.filter(g =>
        g.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Pagination
    const start = (page - 1) * PER_PAGE;
    const paginated = games.slice(start, start + PER_PAGE);

    res.json(paginated);
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── Categories route ───
app.get('/categories', async (req, res) => {
  try {
    if (!cache.allGames || Date.now() - cache.allGames.time > CACHE_TTL) {
      const games = await fetchAllGames();
      cache.allGames = { data: games, time: Date.now() };
    }

    const cats = [...new Set(
      cache.allGames.data.map(g => g.category).filter(Boolean)
    )].sort();

    res.json(['All', ...cats]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Stats route ───
app.get('/stats', (req, res) => {
  res.json({
    totalGames: cache.allGames?.data?.length || 0,
    cacheAge: cache.allGames ? Math.round((Date.now() - cache.allGames.time) / 1000) + 's' : 'no cache',
  });
});

app.listen(4000, "0.0.0.0", () => {
  console.log('✅ Server running at http://localhost:4000');
  console.log('📊 Stats: http://localhost:4000/stats');
  fetchAllGames().then(games => {
    cache.allGames = { data: games, time: Date.now() };
    console.log(`🎮 Preloaded ${games.length} games!`);
  });
});