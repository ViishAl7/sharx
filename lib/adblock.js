/**
 * lib/adblock.js
 * ----------------------------------------------------------------
 * ONE shared ad-blocking + asset-proxying engine.
 * ----------------------------------------------------------------
 */
const dns = require("dns").promises;

const BLOCKLIST_URL =
  "https://raw.githubusercontent.com/anudeepND/blacklist/master/adservers.txt";
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

const CURATED_FALLBACK = [
  "doubleclick.net", "googlesyndication.com", "googleadservices.com",
  "adnxs.com", "rubiconproject.com", "openx.net", "pubmatic.com",
  "criteo.com", "taboola.com", "outbrain.com", "revcontent.com",
  "advertising.com", "yieldmo.com", "smartadserver.com", "appnexus.com",
  "adsafeprotected.com", "moatads.com", "scorecardresearch.com",
  "chartbeat.com", "quantserve.com", "amazon-adsystem.com", "media.net",
  "sharethrough.com", "teads.tv", "33across.com", "indexexchange.com",
  "sovrn.com", "lijit.com", "undertone.com", "conversantmedia.com",
  "flashtalking.com", "mopub.com", "adsymptotic.com", "adtech.de",
  "adverticum.net", "adform.net", "adhigh.net", "adpilot.de",
  "adroll.com", "adzerk.net", "exoclick.com", "trafficjunky.com",
  "traffichaus.com", "cpmstar.com", "kontera.com", "viglink.com",
  "skimlinks.com", "popads.net", "popcash.net", "propellerads.com",
  "hilltopads.net", "adcash.com", "clickadu.com", "zeropark.com",
  "plugrush.com", "adsterra.com", "admaven.com", "mgid.com",
  "revolutiontt.net", "juicyads.com", "ero-advertising.com",
  "adcolony.com", "unityads.unity3d.com", "ads.mopub.com",
  "superawesome.com", "chartboost.com", "vungle.com", "applovin.com",
  "ironsrc.com", "bidvertiser.com", "startapp.com",
];

let blockedDomains = new Set(CURATED_FALLBACK);
let lastRefresh = null;
let lastRefreshError = null;

function parseHostsFile(text) {
  const domains = new Set();
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^0\.0\.0\.0\s+(\S+)/);
    if (match) domains.add(match[1].toLowerCase());
  }
  return domains;
}

async function refreshBlocklist() {
  try {
    const res = await fetch(BLOCKLIST_URL, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const fetched = parseHostsFile(text);
    if (fetched.size < 1000) {
      throw new Error(`Parsed suspiciously few domains (${fetched.size}), refusing to swap in`);
    }
    for (const d of CURATED_FALLBACK) fetched.add(d);
    blockedDomains = fetched;
    lastRefresh = new Date();
    lastRefreshError = null;
    console.log(`[adblock] Refreshed blocklist: ${blockedDomains.size} domains`);
  } catch (err) {
    lastRefreshError = err.message;
    console.error(`[adblock] Blocklist refresh failed, keeping existing ${blockedDomains.size}-domain list:`, err.message);
  }
}

function startBlocklistAutoRefresh() {
  refreshBlocklist();
  setInterval(refreshBlocklist, REFRESH_INTERVAL_MS);
}

function getBlocklistStatus() {
  return {
    domainCount: blockedDomains.size,
    lastRefresh,
    lastRefreshError,
  };
}

function isBlockedHost(hostname) {
  if (!hostname) return false;
  let host = String(hostname).toLowerCase();
  while (true) {
    if (blockedDomains.has(host)) return true;
    const dot = host.indexOf(".");
    if (dot === -1) return false;
    host = host.slice(dot + 1);
  }
}

function isBlockedUrl(url) {
  try {
    return isBlockedHost(new URL(url).hostname);
  } catch {
    return false;
  }
}

function isPrivateOrReservedIp(ip) {
  if (/^127\./.test(ip)) return true;
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true;
  if (ip === "0.0.0.0") return true;
  if (ip === "::1") return true;
  if (/^fe80:/i.test(ip)) return true;
  if (/^fc00:/i.test(ip) || /^fd00:/i.test(ip)) return true;
  return false;
}

async function isSafeTarget(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (!["http:", "https:"].includes(parsed.protocol)) return false;
  const hostname = parsed.hostname.toLowerCase();
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname)) return false;
  if (isPrivateOrReservedIp(hostname)) return false;
  try {
    const records = await dns.lookup(hostname, { all: true });
    if (records.some((r) => isPrivateOrReservedIp(r.address))) return false;
  } catch {
    return false;
  }
  return true;
}

const COSMETIC_SELECTORS = [
  "ins.adsbygoogle",
  "div[id^='div-gpt-ad-']",
  "div[id^='google_ads_']",
  "ins[data-ad-client]",
  "div[data-ad-slot]",
].join(", ");

// stripAds now takes a third argument, proxyOrigin (e.g.
// "http://localhost:4000"), and rewrites every asset URL to route
// through OUR server instead of the game's real origin. This is what
// fixes CORS errors and stops assets from silently bypassing the
// ad-blocker.
function stripAds($, baseUrl, proxyOrigin) {
  const base = new URL(baseUrl);
  let removedCount = 0;

  function toProxiedUrl(rawValue) {
    if (!rawValue) return rawValue;
    if (rawValue.startsWith('data:')) return rawValue;
    if (rawValue.startsWith('blob:')) return rawValue;
    if (rawValue.startsWith('#')) return rawValue;
    if (rawValue.startsWith('javascript:')) return rawValue;
    let absolute;
    try {
      absolute = new URL(rawValue, base).href;
    } catch {
      return rawValue;
    }
    return `${proxyOrigin}/proxy/asset?url=${encodeURIComponent(absolute)}`;
  }

  $("script[src], iframe[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;
    try {
      if (isBlockedUrl(new URL(src, base).href)) {
        $(el).remove();
        removedCount++;
      }
    } catch {}
  });

  $(COSMETIC_SELECTORS).each((_, el) => {
    $(el).remove();
    removedCount++;
  });

  $("[onclick]").each((_, el) => {
    const onclick = $(el).attr("onclick") || "";
    if (/window\.open/i.test(onclick)) {
      $(el).removeAttr("onclick");
      removedCount++;
    }
  });

  $('meta[http-equiv="refresh"]').each((_, el) => {
    $(el).remove();
    removedCount++;
  });

  $("[src]").each((_, el) => {
    const src = $(el).attr("src");
    const rewritten = toProxiedUrl(src);
    if (rewritten !== src) $(el).attr("src", rewritten);
  });

  $("link[href]").each((_, el) => {
    const rel = ($(el).attr("rel") || "").toLowerCase();
    if (!["stylesheet", "preload", "icon", "prefetch", "modulepreload"].includes(rel)) return;
    const href = $(el).attr("href");
    const rewritten = toProxiedUrl(href);
    if (rewritten !== href) $(el).attr("href", rewritten);
  });

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !/^([a-z]+:)?\/\//i.test(href) && !href.startsWith("#")) {
      try { $(el).attr("href", new URL(href, base).href); } catch {}
    }
  });

  $("style").each((_, el) => {
    const css = $(el).html();
    if (!css) return;
    const rewritten = css.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, value) => {
      const proxied = toProxiedUrl(value.trim());
      return `url(${quote}${proxied}${quote})`;
    });
    if (rewritten !== css) $(el).html(rewritten);
  });

  return removedCount;
}

function buildRuntimeScript() {
  return `
(function () {
  'use strict';
  var AD_DOMAINS = ${JSON.stringify([...blockedDomains])};
  var BLOCKED = new Set(AD_DOMAINS);
  function isBlockedHost(hostname) {
    var host = String(hostname || '').toLowerCase();
    while (true) {
      if (BLOCKED.has(host)) return true;
      var dot = host.indexOf('.');
      if (dot === -1) return false;
      host = host.slice(dot + 1);
    }
  }
  function hostOf(u) {
    try { return new URL(u, window.location.href).hostname; } catch (e) { return ''; }
  }
  function isAd(u) { return isBlockedHost(hostOf(u)); }
  var oOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) {
    if (isAd(u)) { this._blocked = true; return; }
    return oOpen.apply(this, arguments);
  };
  var oSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    if (this._blocked) return;
    return oSend.apply(this, arguments);
  };
  var oFetch = window.fetch;
  if (oFetch) {
    window.fetch = function (input) {
      var u = typeof input === 'string' ? input : (input && input.url) || '';
      if (isAd(u)) return Promise.reject(new Error('Blocked by Sharx'));
      return oFetch.apply(this, arguments);
    };
  }
  var oWinOpen = window.open;
  window.open = function (u) {
    if (u && isAd(u)) return null;
    return oWinOpen ? oWinOpen.apply(this, arguments) : null;
  };
  function sweep(root) {
    var nodes = root.querySelectorAll('script[src], iframe[src]');
    for (var i = 0; i < nodes.length; i++) {
      if (isAd(nodes[i].src)) nodes[i].remove();
    }
    var clickers = root.querySelectorAll('[onclick]');
    for (var j = 0; j < clickers.length; j++) {
      var oc = clickers[j].getAttribute('onclick') || '';
      if (oc.indexOf('window.open') !== -1) clickers[j].removeAttribute('onclick');
    }
  }
  sweep(document);
  var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;
        if ((node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') && isAd(node.src)) {
          node.remove();
          continue;
        }
        if (node.querySelectorAll) sweep(node);
      }
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  console.log('[Sharx] Ad blocker active —', AD_DOMAINS.length, 'domains');
})();
`;
}

function mountAdBlockRuntime(app, publicBaseUrl) {
  app.get("/adblock-runtime.js", (req, res) => {
    res.set({
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    });
    res.send(buildRuntimeScript());
  });
  return `${publicBaseUrl.replace(/\/$/, "")}/adblock-runtime.js`;
}

function createAssetCache({ maxEntries = 500, ttlMs = 60 * 60 * 1000 } = {}) {
  const store = new Map();
  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() - entry.time > ttlMs) {
        store.delete(key);
        return null;
      }
      return entry;
    },
    set(key, value) {
      if (store.size >= maxEntries) {
        const oldestKey = store.keys().next().value;
        store.delete(oldestKey);
      }
      store.set(key, { ...value, time: Date.now() });
    },
  };
}

module.exports = {
  startBlocklistAutoRefresh,
  refreshBlocklist,
  getBlocklistStatus,
  isBlockedHost,
  isBlockedUrl,
  isSafeTarget,
  stripAds,
  buildRuntimeScript,
  mountAdBlockRuntime,
  createAssetCache,
};