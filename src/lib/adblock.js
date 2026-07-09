/* ════════════════════════════════════════════════════════════
   AD BLOCKER RUNTIME (client‑side) - UNCHANGED, moved from Home.js
   so it's only fetched when a game is actually opened (dynamic
   import from GameModal's injectAdBlocker), instead of shipping
   inside the initial Home page bundle that Lighthouse audits.
════════════════════════════════════════════════════════════ */
const AD_BLOCK_SCRIPT = `
(function() {
  'use strict';
  var AD_DOMAINS = [
    'doubleclick.net','googlesyndication.com','googleadservices.com',
    'adnxs.com','rubiconproject.com','openx.net','pubmatic.com',
    'criteo.com','taboola.com','outbrain.com','revcontent.com',
    'advertising.com','yieldmo.com','smartadserver.com','appnexus.com',
    'adsafeprotected.com','moatads.com','scorecardresearch.com',
    'chartbeat.com','quantserve.com','amazon-adsystem.com',
    'media.net','sharethrough.com','teads.tv','33across.com',
    'indexexchange.com','sovrn.com','lijit.com','undertone.com',
    'conversantmedia.com','flashtalking.com','mopub.com',
    'adsymptotic.com','adtech.de','adverticum.net','adform.net',
    'adhigh.net','adpilot.de','adroll.com','adzerk.net',
    'exoclick.com','trafficjunky.com','traffichaus.com',
    'cpmstar.com','kontera.com','viglink.com','skimlinks.com',
    'popads.net','popcash.net','propellerads.com',
    'hilltopads.net','adcash.com','clickadu.com','zeropark.com',
    'plugrush.com','adsterra.com','admaven.com'
  ];

  function hostnameOf(url) {
    try { return new URL(url, window.location.href).hostname; } catch (e) { return ''; }
  }
  function isAdHost(hostname) {
    return AD_DOMAINS.some(function (d) { return hostname === d || hostname.endsWith('.' + d); });
  }

  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    if (isAdHost(hostnameOf(url))) { this._blocked = true; return; }
    return origOpen.apply(this, arguments);
  };
  var origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    if (this._blocked) return;
    return origSend.apply(this, arguments);
  };

  var origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (input) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (isAdHost(hostnameOf(url))) return Promise.reject(new Error('Blocked by Sharx'));
      return origFetch.apply(this, arguments);
    };
  }

  var origWinOpen = window.open;
  window.open = function (url) {
    if (!url || isAdHost(hostnameOf(url))) return null;
    return origWinOpen.apply(this, arguments);
  };

  var origWrite = document.write;
  document.write = function (str) {
    if (typeof str === 'string' && AD_DOMAINS.some(function (d) { return str.indexOf(d) !== -1; })) return;
    return origWrite.apply(document, arguments);
  };

  function sweep(root) {
    root.querySelectorAll('script[src], iframe[src]').forEach(function (node) {
      if (isAdHost(hostnameOf(node.src))) node.remove();
    });
    root.querySelectorAll('[onclick]').forEach(function (node) {
      if (/window\\.open/i.test(node.getAttribute('onclick') || '')) node.removeAttribute('onclick');
    });
    root.querySelectorAll('meta[http-equiv="refresh"]').forEach(function (node) { node.remove(); });
  }
  sweep(document);

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
          if (isAdHost(hostnameOf(node.src))) { node.remove(); return; }
        }
        if (node.hasAttribute && node.hasAttribute('onclick') && /window\\.open/i.test(node.getAttribute('onclick'))) {
          node.removeAttribute('onclick');
        }
        try {
          var style = window.getComputedStyle(node);
          if ((style.position === 'fixed' || style.position === 'absolute') && parseInt(style.zIndex || 0, 10) > 9000) {
            var rect = node.getBoundingClientRect();
            var src = node.src || '';
            if (rect.width > 200 && rect.height > 200 && AD_DOMAINS.some(function (d) { return src.indexOf(d) !== -1; })) {
              node.remove();
            }
          }
        } catch (e) {}
        if (node.querySelectorAll) sweep(node);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  console.log('[Sharx] Ad blocker active');
})();
`;

export default AD_BLOCK_SCRIPT;