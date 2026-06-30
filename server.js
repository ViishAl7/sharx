/**
 * server.js — Sharx Games Backend
 * ----------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const compression = require('compression');
const adblock = require('./lib/adblock');

const app = express();
app.use(cors());
app.use(compression());

const PORT = process.env.PORT || 4000;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

let cache = {};
let fetchInFlight = null;
const CACHE_TTL = 10 * 60 * 1000;

async function fetchGameMonetize() {
  const allGames = [];
  const totalPages = 6;

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
      if (text.trim().startsWith('<')) break;

      const json = JSON.parse(text);
      if (!Array.isArray(json) || json.length === 0) break;

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

      if (json.length < 500) break;
    } catch (e) {
      console.error(`GameMonetize page ${p} error:`, e.message);
      break;
    }
  }

  return allGames;
}

async function fetchAllGames() {
  console.log('Fetching all games from all sources...');

  const gamemonetize = await fetchGameMonetize();
  let allGames = [...gamemonetize];

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

async function getGames() {
  if (cache.allGames && Date.now() - cache.allGames.time < CACHE_TTL) {
    return cache.allGames.data;
  }
  if (!fetchInFlight) {
    fetchInFlight = fetchAllGames()
      .then(games => {
        cache.allGames = { data: games, time: Date.now() };
        fetchInFlight = null;
        return games;
      })
      .catch(err => {
        fetchInFlight = null;
        throw err;
      });
  }
  return fetchInFlight;
}

app.get('/games', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const category = req.query.category || '';
  const PER_PAGE = 50;

  try {
    let games = await getGames();

    if (category && category !== 'All') {
      games = games.filter(g => g.category?.toLowerCase() === category.toLowerCase());
    }

    const start = (page - 1) * PER_PAGE;
    const paginated = games.slice(start, start + PER_PAGE);

    res.json(paginated);
  } catch (e) {
    console.error('Error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const games = await getGames();
    const cats = [...new Set(games.map(g => g.category).filter(Boolean))].sort();
    res.json(['All', ...cats]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/stats', (req, res) => {
  res.json({
    totalGames: cache.allGames?.data?.length || 0,
    cacheAge: cache.allGames ? Math.round((Date.now() - cache.allGames.time) / 1000) + 's' : 'no cache',
    adblock: adblock.getBlocklistStatus(),
  });
});

// ════════════════════════════════════════════════════════════════
//  🛡️ GAME PROXY + AD BLOCKER
// ════════════════════════════════════════════════════════════════

adblock.mountAdBlockRuntime(app, PUBLIC_BASE_URL);
const RUNTIME_SCRIPT_TAG = `<script src="${PUBLIC_BASE_URL}/adblock-runtime.js"></script>`;
const proxyCache = adblock.createAssetCache({ maxEntries: 1000, ttlMs: 60 * 60 * 1000 });

// Remembers the most recently proxied game's URL, so that asset
// requests the game's OWN JavaScript makes using a relative path
// (e.g. "/proxy/CookieRun-Black.ttf") can be resolved against it —
// see the fallback route at the bottom of this section.
let lastProxiedGameUrl = null;

app.get('/proxy/game', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  lastProxiedGameUrl = targetUrl;

  const cached = proxyCache.get(targetUrl);
  if (cached) {
    res.set('Content-Type', cached.contentType);
    return res.send(cached.buffer);
  }

  const safe = await adblock.isSafeTarget(targetUrl);
  if (!safe) {
    return res.status(400).send('Invalid or unsafe URL');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const upstream = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SharxProxy/1.0)' },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return res.status(502).send(`Upstream returned ${upstream.status}`);
    }

    const contentType = upstream.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
      res.set('Content-Type', contentType);
      const { Readable } = require('stream');
      const nodeStream = Readable.fromWeb(upstream.body);
      const chunks = [];
      nodeStream.on('data', (chunk) => chunks.push(chunk));
      nodeStream.on('end', () => {
        proxyCache.set(targetUrl, { buffer: Buffer.concat(chunks), contentType });
      });
      nodeStream.on('error', (err) => console.error('[proxy] stream error:', err.message));
      return nodeStream.pipe(res);
    }

    const html = await upstream.text();
    const $ = cheerio.load(html);

    adblock.stripAds($, targetUrl, PUBLIC_BASE_URL);
    $('head').append(RUNTIME_SCRIPT_TAG);

    const finalHtml = $.html();
    const buffer = Buffer.from(finalHtml, 'utf-8');
    proxyCache.set(targetUrl, { buffer, contentType: 'text/html; charset=utf-8' });

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(buffer);
  } catch (err) {
    console.error('[Sharx Proxy] failed:', err.message);
    if (err.name === 'AbortError') {
      return res.status(504).send('Game host took too long to respond');
    }
    res.status(502).send('Could not load game');
  } finally {
    clearTimeout(timeoutId);
  }
});

// ─── Generic asset proxy ─────────────────────────────────────
// Catches every rewritten asset URL from stripAds(): fonts, images,
// scripts, css, json, audio. No HTML parsing here — just fetch and
// stream straight through with permissive CORS, so the browser stops
// rejecting cross-origin font/script loads.
//
// Pulled into a standalone function (instead of living inline inside
// app.get('/proxy/asset', ...)) so the fallback route below it can call
// the exact same logic directly. An earlier version of the fallback
// route used app._router.handle() to re-dispatch into this route —
// that's an Express internal that doesn't exist on every version
// (app._router can be undefined), and calling .handle on undefined
// crashed with a 500 on every asset the game's own JS requested via a
// relative path. Calling the function directly avoids depending on
// Express internals entirely.
async function handleAssetProxy(targetUrl, res) {
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  const cached = proxyCache.get(targetUrl);
  if (cached) {
    res.set('Content-Type', cached.contentType);
    res.set('Access-Control-Allow-Origin', '*');
    return res.send(cached.buffer);
  }

  const safe = await adblock.isSafeTarget(targetUrl);
  if (!safe) {
    return res.status(400).send('Invalid or unsafe URL');
  }

  if (adblock.isBlockedUrl(targetUrl)) {
    return res.status(204).end();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const upstream = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SharxProxy/1.0)' },
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return res.status(502).send(`Upstream returned ${upstream.status}`);
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');

    const buf = Buffer.from(await upstream.arrayBuffer());
    proxyCache.set(targetUrl, { buffer: buf, contentType });
    res.send(buf);
  } catch (err) {
    console.error('[Sharx Asset Proxy] failed:', err.message);
    if (err.name === 'AbortError') {
      return res.status(504).send('Asset host took too long to respond');
    }
    res.status(502).send('Could not load asset');
  } finally {
    clearTimeout(timeoutId);
  }
}

app.get('/proxy/asset', async (req, res) => {
  await handleAssetProxy(req.query.url, res);
});

// ─── Fallback: catches the game's OWN relative-path requests ──
// Some games' bundled JS builds asset URLs itself (e.g. fetching
// "/proxy/CookieRun-Black.ttf", "/proxy/Build/xyz.loader.js", or
// "/proxy/ServiceWorker.js" directly), bypassing our HTML rewrite
// entirely because that JS never went through stripAds(). We resolve
// these against the last game URL proxied in this session, then call
// the SAME function the real /proxy/asset route uses — directly, not
// through Express's router — so there's no dependency on internals
// like app._router that vary between Express versions.
app.get(/^\/proxy\/(?!game$|asset$)(.+)$/, async (req, res) => {
  const assetPath = req.params[0];

  if (!lastProxiedGameUrl) {
    return res.status(404).send('No active game session to resolve this asset against');
  }

  let resolved;
  try {
    resolved = new URL(assetPath, lastProxiedGameUrl).href;
  } catch {
    return res.status(400).send('Could not resolve asset path');
  }

  await handleAssetProxy(resolved, res);
});

// ─── Start server ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📊 Stats: http://localhost:${PORT}/stats`);
  console.log(`🎮 Games API: http://localhost:${PORT}/games`);
  console.log(`🏷️  Categories API: http://localhost:${PORT}/categories`);
  console.log(`🛡️  Proxy API: http://localhost:${PORT}/proxy/game?url=...`);
  console.log(`🌐 Public base URL (used for ad-block runtime): ${PUBLIC_BASE_URL}`);
  if (PUBLIC_BASE_URL.includes('localhost')) {
    console.log(`⚠️  PUBLIC_BASE_URL is not set — falling back to localhost, which will NOT work for real visitors. Set it in your .env.`);
  }

  adblock.startBlocklistAutoRefresh();

  getGames()
    .then(games => console.log(`🎮 Preloaded ${games.length} games successfully!`))
    .catch(err => console.error('❌ Failed to preload games:', err.message));
});