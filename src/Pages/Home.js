import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useProfile } from "../Context/ProfileContext";
import { GAMES_BASE, API_BASE } from "../config";
import SidePanel from "../Pages/SidePanel";
import ProfileSidePanel from "../Pages/ProfileSidePanel";

const HISTORY_KEY = "pv_history";
const MAX_HISTORY = 12;

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function addToHistory(game) {
  const prev = getHistory().filter(g => g.id !== game.id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([{ ...game, playedAt: Date.now() }, ...prev].slice(0, MAX_HISTORY)));
}
const isFeatured = (i) => i === 0 || i === 7 || i === 16;

/* ════════════════════════════════════════════════════════════
   AD BLOCKER RUNTIME (client‑side)
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

  // 1) Network level — XHR
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

  // 2) Network level — fetch
  var origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (input) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      if (isAdHost(hostnameOf(url))) return Promise.reject(new Error('Blocked by Sharx'));
      return origFetch.apply(this, arguments);
    };
  }

  // 3) Popup ads — window.open
  var origWinOpen = window.open;
  window.open = function (url) {
    if (!url || isAdHost(hostnameOf(url))) return null;
    return origWinOpen.apply(this, arguments);
  };

  // 4) document.write() ad injection
  var origWrite = document.write;
  document.write = function (str) {
    if (typeof str === 'string' && AD_DOMAINS.some(function (d) { return str.indexOf(d) !== -1; })) return;
    return origWrite.apply(document, arguments);
  };

  // 5) Strip ad nodes + onclick popup triggers + meta-refresh redirects
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

  // 6) Watch for ads injected later + big fixed/absolute overlay popups
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

/* ─── HOME ─── */
export default function Home() {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [allGames, setAllGames]           = useState([]);
  const [page, setPage]                   = useState(1);
  const [hasMore, setHasMore]             = useState(true);
  const [loading, setLoading]             = useState(true);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [search, setSearch]               = useState("");
  const [category, setCategory]           = useState("All");
  const [activeGame, setActiveGame]       = useState(null);
  const [error, setError]                 = useState(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [panelMode, setPanelMode]         = useState(null);
  const [showProfile, setShowProfile]     = useState(false);

  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem("token");

  const handleNavLogoClick = () => {
    logoClickCountRef.current += 1;
    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
    logoClickTimerRef.current = setTimeout(() => { logoClickCountRef.current = 0; }, 800);
    if (logoClickCountRef.current === 5) {
      setShowEasterEgg(true);
      logoClickCountRef.current = 0;
      setTimeout(() => setShowEasterEgg(false), 3000);
    }
  };

  const openGame = useCallback((game) => { addToHistory(game); setActiveGame(game); }, []);

  const fetchGames = useCallback(async (pageNum, isFirst) => {
    if (isFirst) setLoading(true); else setLoadingMore(true);
    setError(null);
    try {
      const res  = await fetch(`${GAMES_BASE}/games?page=${pageNum}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAllGames(prev => isFirst ? data : [...prev, ...data]);
        setHasMore(data.length === 50);
      } else { setHasMore(false); }
    } catch (e) { setError(e.message); }
    finally {
      if (isFirst) setLoading(false); else setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchGames(1, true); }, [fetchGames]);

  const loadMore = () => {
    if (loadingMore) return;
    const next = page + 1;
    setPage(next);
    fetchGames(next, false);
  };

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setActiveGame(null); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const categories     = ["All", ...Array.from(new Set(allGames.map(g => g.category).filter(Boolean))).sort()];
  const filtered       = allGames.filter(g =>
    (category === "All" || g.category === category) &&
    g.title?.toLowerCase().includes(search.toLowerCase())
  );
  const displayedGames = filtered;

  const renderMiniAvatar = () => {
    if (!profile) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      );
    }
    if (profile.avatarType === "google" && profile.avatarUrl) {
      return <img src={profile.avatarUrl} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />;
    }
    const shape = profile.avatarShape || "heart";
    const color = profile.avatarColor || "#c084fc";
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
        {shape === "circle"  && <circle cx="14" cy="14" r="12" fill={color}/>}
        {shape === "square"  && <rect x="2" y="2" width="24" height="24" rx="5" fill={color}/>}
        {shape === "star"    && <polygon points="14,2 17,10 26,10 19,15 22,23 14,18 6,23 9,15 2,10 11,10" fill={color}/>}
        {shape === "hexagon" && <polygon points="14,2 24,8 24,20 14,26 4,20 4,8" fill={color}/>}
        {shape === "heart"   && <path d="M14 23 C14 23 3 16 3 9 C3 5.7 5.7 3 9 3 C11 3 12.7 4 14 5.5 C15.3 4 17 3 19 3 C22.3 3 25 5.7 25 9 C25 16 14 23 14 23Z" fill={color}/>}
      </svg>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Righteous&display=swap');

        *, *::before, *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          outline: none !important;
        }

        input, textarea {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }

        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
          color: #1E293B;
          background: #FFFFFF;
          position: relative;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:10px;}

        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeScale{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        @keyframes liquidGlow{0%{box-shadow:0 8px 32px rgba(0,0,0,.05),0 0 0 1px rgba(255,255,255,.3)}50%{box-shadow:0 12px 40px rgba(0,0,0,.08),0 0 0 2px rgba(255,255,255,.5)}100%{box-shadow:0 8px 32px rgba(0,0,0,.05),0 0 0 1px rgba(255,255,255,.3)}}
        @keyframes easterEggPulse{0%{transform:scale(1) rotate(0deg)}25%{transform:scale(1.15) rotate(-10deg)}50%{transform:scale(1.2) rotate(10deg)}75%{transform:scale(1.15) rotate(-5deg)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes rainbowShift{0%{background:linear-gradient(45deg,#FF6B6B,#4ECDC4)}20%{background:linear-gradient(45deg,#4ECDC4,#45B7D1)}40%{background:linear-gradient(45deg,#45B7D1,#FFA07A)}60%{background:linear-gradient(45deg,#FFA07A,#98D8C8)}80%{background:linear-gradient(45deg,#98D8C8,#FF6B6B)}100%{background:linear-gradient(45deg,#FF6B6B,#4ECDC4)}}
        @keyframes cardEntrance{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes footerFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes softBounce{0%{transform:scale(1)}50%{transform:scale(1.12)}100%{transform:scale(1)}}
        @keyframes sharkSwim{0%{transform:translate(0,0) rotate(0deg) scale(1,1)}15%{transform:translate(5px,-3px) rotate(-5deg) scale(1.02,.98)}35%{transform:translate(2px,1px) rotate(-1deg) scale(1,1)}50%{transform:translate(0,2px) rotate(0deg) scale(.98,1.02)}65%{transform:translate(-2px,1px) rotate(1deg) scale(1,1)}85%{transform:translate(-5px,-3px) rotate(5deg) scale(1.02,.98)}100%{transform:translate(0,0) rotate(0deg) scale(1,1)}}
        @keyframes waveScroll{0%{transform:translateX(0)}100%{transform:translateX(-12.5%)}}
        @keyframes ringPop{0%{transform:translate(-50%,-50%) scale(0);opacity:.9}100%{transform:translate(-50%,-50%) scale(5);opacity:0}}
        @keyframes dropFly{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx,0),var(--dy,-18px)) scale(.4)}}
        @keyframes bubbleRise{0%{opacity:0;transform:translate(0,0) scale(.5)}15%{opacity:.9}100%{opacity:0;transform:translate(6px,-38px) scale(1.1)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

        .easter-egg-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);animation:fadeIn .3s ease forwards}
        .easter-egg-content{position:relative;background:#fff;border-radius:28px;padding:36px;text-align:center;max-width:460px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:fadeUp .4s cubic-bezier(.23,1,.32,1) forwards}
        .easter-egg-emoji{font-size:72px;margin-bottom:16px;display:inline-block;animation:easterEggPulse .6s ease-in-out infinite}
        .easter-egg-title{font-family:'Righteous',cursive;font-size:28px;color:#1E293B;margin-bottom:10px;background:linear-gradient(45deg,#FF6B6B,#4ECDC4,#45B7D1,#FFA07A);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:rainbowShift 3s ease infinite}
        .easter-egg-text{font-size:15px;color:#475569;margin-bottom:20px;line-height:1.6}
        .easter-egg-stats{display:flex;justify-content:space-around;margin-bottom:20px;gap:10px;flex-wrap:wrap}
        .easter-egg-stat{flex:1;background:#F1F5F9;border-radius:14px;padding:10px;min-width:70px}
        .easter-egg-stat-num{font-size:22px;font-weight:800;color:#1E293B;margin-bottom:3px}
        .easter-egg-stat-label{font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase}
        .easter-egg-button{background:linear-gradient(135deg,#FF6B6B,#4ECDC4);color:#fff;border:none;border-radius:100px;padding:11px 28px;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;box-shadow:0 4px 16px rgba(255,107,107,.3)}
        .easter-egg-button:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,107,107,.4)}
        .confetti-piece{position:fixed;pointer-events:none;z-index:9998}

.nav-outer{display:flex;justify-content:center;position:fixed;top:12px;left:0;right:0;z-index:300;padding:0 16px}        .nav-wrap{
          width:100%;max-width:1100px;
          height:52px;
          padding:0 20px;
          background:rgba(255,255,255,.5);
          backdrop-filter:blur(16px) saturate(180%);
          -webkit-backdrop-filter:blur(16px) saturate(180%);
          border-radius:80px;
          border:1px solid rgba(255,255,255,.6);
          box-shadow:0 4px 20px rgba(0,0,0,.06);
          animation:fadeScale .4s ease forwards,liquidGlow 3s ease-in-out infinite;
          display:flex;align-items:center;
        }
        .nav{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;}

        .nav-logo{
          display:flex;align-items:center;
          height:36px;
          overflow:hidden;
          flex-shrink:0;
          cursor:pointer;
          transition:opacity .2s ease;
        }
        .nav-logo:hover{opacity:.7;}
        .nav-logo img{
          height:80px;
          width:auto;
          object-fit:contain;
          display:block;
        }

        .nav-search{
          flex:1;
          min-width:0;
          max-width:380px;
        }
        .nav-si-wrap{
          display:flex;align-items:center;
          background:rgba(255,255,255,.75);
          backdrop-filter:blur(4px);
          border:1.5px solid rgba(255,255,255,.6);
          border-radius:100px;
          padding:0 14px;
          gap:8px;
          height:36px;
          transition:all .25s ease;
          width:100%;
        }
        .nav-si-wrap:focus-within{
          background:rgba(255,255,255,.95);
          border-color:rgba(100,116,139,.35);
          box-shadow:0 0 0 3px rgba(0,0,0,.04);
        }
        .nav-si-wrap svg{flex-shrink:0;color:#64748B;width:15px;height:15px;}
        .nav-si{
          flex:1;
          min-width:0;
          border:none;
          outline:none;
          background:none;
          font-family:'Nunito',sans-serif;
          font-size:13px;
          font-weight:500;
          color:#1E293B;
          width:100%;
        }
        .nav-si::placeholder{color:#94A3B8;font-weight:400}

        .nav-r{display:flex;align-items:center;gap:6px;flex-shrink:0;}

        .login-icon-container{
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;width:38px;height:38px;
          border-radius:50%;
          background:rgba(255,255,255,.5);
          border:1.5px solid rgba(255,255,255,.7);
          transition:background .2s ease,transform .2s ease;
          flex-shrink:0;
        }
        .login-icon-container:hover{
          background:rgba(255,255,255,.9);
          transform:scale(1.05);
        }

        .user-logged{display:flex;align-items:center;gap:6px}
        .profile-btn{
          background:rgba(255,255,255,.6);
          backdrop-filter:blur(8px);
          border:1.5px solid rgba(255,255,255,.7);
          border-radius:100px;
          cursor:pointer;
          display:flex;align-items:center;gap:6px;
          padding:5px 14px 5px 5px;
          transition:all .2s ease;
          color:#1E293B;
          font-family:'Nunito',sans-serif;
          font-size:12px;
          font-weight:800;
          white-space:nowrap;
          max-width:160px;
          overflow:hidden;
          text-overflow:ellipsis;
        }
        .profile-btn:hover{background:rgba(255,255,255,.95);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08);}
        .profile-avatar{width:26px;height:26px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#F1F5F9}

        .hero{padding:90px 40px 20px;max-width:1200px;margin:0 auto;animation:fadeUp .45s ease forwards}
        .hero-title{font-family:'Righteous',cursive;font-size:clamp(28px,4.5vw,50px);line-height:1.1;color:#1E293B;margin-bottom:8px}
        .hero-title em{font-style:normal;background:linear-gradient(135deg,#1E293B 0%,#64748B 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hero-sub{font-size:13px;font-weight:500;color:#475569;max-width:420px;opacity:0;animation:fadeUp .45s ease .1s forwards}

        .cats{padding:0 40px 16px;opacity:0;animation:fadeUp .45s ease .12s forwards;max-width:1200px;margin:0 auto}
        .cats-row{display:flex;gap:6px;flex-wrap:wrap}
        .cat{
          font-size:12px;font-weight:700;color:#475569;
          padding:5px 14px;border-radius:100px;
          background:rgba(255,255,255,.7);
          border:1.5px solid rgba(255,255,255,.9);
          backdrop-filter:blur(6px);
          cursor:pointer;
          transition:all .2s cubic-bezier(.23,1,.32,1);
          white-space:nowrap;
        }
        .cat:hover{background:rgba(255,255,255,.95);transform:translateY(-1px);color:#1E293B}
        .cat.on{background:#1E293B;border-color:#1E293B;color:#fff;transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.15)}

        .grid{
          padding:0 40px;
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(190px,1fr));
          gap:20px;
          max-width:1200px;
          margin:0 auto;
          will-change:transform;
        }

        .gc{
          position:relative;
          border-radius:22px;
          overflow:hidden;
          cursor:pointer;
          background:rgba(255,255,255,0.4);
          aspect-ratio:1;
          transition:transform .25s cubic-bezier(.23,1,.32,1),box-shadow .25s cubic-bezier(.23,1,.32,1);
          animation:cardEntrance .35s ease both;
          box-shadow:0 2px 8px rgba(0,0,0,.07);
          will-change:transform;
          contain:layout style paint;
          backdrop-filter:blur(4px);
          -webkit-backdrop-filter:blur(4px);
          border:1px solid rgba(255,255,255,.6);
        }
        .gc::before{
          content:"";position:absolute;top:0;left:0;right:0;height:35%;
          background:linear-gradient(180deg,rgba(255,255,255,.15) 0%,transparent 100%);
          border-radius:22px 22px 0 0;z-index:2;pointer-events:none;
        }
        .gc.featured{grid-column:span 2;grid-row:span 2;border-radius:26px}
        .gc.featured::before{border-radius:26px 26px 0 0}
        .gc:hover{transform:scale(1.025) translateY(-3px);box-shadow:0 16px 36px rgba(0,0,0,.14);z-index:2}
        .gc-img{
          position:absolute;inset:0;width:100%;height:100%;
          object-fit:cover;display:block;
          transition:transform .35s cubic-bezier(.23,1,.32,1);
          will-change:transform;
        }
        .gc:hover .gc-img{transform:scale(1.05)}
        .gc-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.68) 0%,rgba(0,0,0,.06) 50%,transparent 100%);opacity:0;transition:opacity .22s ease;z-index:3}
        .gc:hover .gc-overlay{opacity:1}
        .gc-play-btn{
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-55%) scale(.4);
          width:42px;height:42px;border-radius:50%;
          background:rgba(255,255,255,.95);
          backdrop-filter:blur(6px);
          display:flex;align-items:center;justify-content:center;
          opacity:0;transition:all .25s cubic-bezier(.2,.9,.4,1.1);
          box-shadow:0 4px 14px rgba(0,0,0,.25);
          pointer-events:none;z-index:4;
        }
        .gc.featured .gc-play-btn{width:52px;height:52px}
        .gc:hover .gc-play-btn{opacity:1;transform:translate(-50%,-50%) scale(1)}
        .gc-play-btn svg{width:11px;height:13px;fill:#1E293B;margin-left:2px}
        .gc-label{
          position:absolute;bottom:0;left:0;right:0;
          padding:24px 11px 11px;
          transform:translateY(4px);opacity:0;
          transition:opacity .2s ease,transform .2s ease;
          pointer-events:none;z-index:4;
        }
        .gc:hover .gc-label{opacity:1;transform:translateY(0)}
        .gc-label-text{font-size:12px;font-weight:800;color:#fff;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-shadow:0 1px 4px rgba(0,0,0,.5)}
        .gc.featured .gc-label{padding:40px 13px 13px}
        .gc.featured .gc-label-text{font-size:17px}
        .gc-cat-chip{position:absolute;top:10px;left:10px;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.2);border-radius:100px;padding:3px 9px;font-size:10px;font-weight:800;color:rgba(255,255,255,.95);pointer-events:none;z-index:5}

        .skels{padding:0 40px;display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:20px;max-width:1200px;margin:0 auto}
        .skel{aspect-ratio:1;border-radius:22px;background:linear-gradient(90deg,rgba(220,225,235,.7) 25%,rgba(240,243,248,.95) 50%,rgba(220,225,235,.7) 75%);background-size:600px 100%;animation:shimmer 1.4s ease infinite}
        .skel.featured{grid-column:span 2;grid-row:span 2;border-radius:26px}

        .empty{text-align:center;padding:70px 24px;animation:fadeUp .35s ease forwards}
        .empty-t{font-family:'Righteous',cursive;font-size:22px;color:#1E293B;margin-bottom:8px}
        .empty-b{font-family:'Nunito',sans-serif;font-size:13px;font-weight:800;color:#fff;background:#1E293B;border:none;border-radius:14px;padding:10px 24px;cursor:pointer;transition:all .2s ease}
        .empty-b:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.15)}

        .load-more-wrap{text-align:center;padding:36px 0 16px}
        .load-more-btn{background:linear-gradient(135deg,#1E293B,#334155);color:#fff;border:none;border-radius:28px;padding:13px 44px;font-family:'Nunito',sans-serif;font-weight:800;font-size:14px;cursor:pointer;transition:all .25s cubic-bezier(.23,1,.32,1);box-shadow:0 4px 18px rgba(0,0,0,.14);display:inline-flex;align-items:center;gap:8px}
        .load-more-btn:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.2)}
        .load-more-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .load-more-btn .spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .5s linear infinite;display:inline-block}

        .modal-bg{
          position:fixed;inset:0;z-index:999;
          background:rgba(15,23,42,.85);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
          display:flex;flex-direction:column;
          animation:fadeIn .18s ease forwards;
        }
        .modal-top{
          display:flex;align-items:center;justify-content:space-between;
          padding:10px 16px;
          background:rgba(255,255,255,.9);
          backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(0,0,0,.07);
          gap:10px;
          min-height:56px;
          flex-shrink:0;
        }
        .modal-l{display:flex;align-items:center;gap:10px;min-width:0;}
        .modal-thumb{width:44px;height:32px;object-fit:cover;border-radius:7px;flex-shrink:0}
        .modal-gt{font-family:'Righteous',cursive;font-size:16px;color:#1E293B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px}
        .modal-gc{font-size:10px;font-weight:700;color:#64748B}
        .modal-acts{display:flex;gap:6px;align-items:center;flex-shrink:0;}
        .modal-btn{font-family:'Nunito',sans-serif;font-size:12px;font-weight:800;color:#1E293B;padding:7px 16px;border-radius:9px;background:#F1F5F9;border:1px solid rgba(226,232,240,.9);cursor:pointer;transition:all .15s ease;white-space:nowrap}
        .modal-btn:hover{background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08)}
        .modal-x{width:34px;height:34px;border-radius:9px;background:#F1F5F9;border:1px solid rgba(226,232,240,.9);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s ease;font-size:16px;color:#64748B;flex-shrink:0}
        .modal-x:hover{background:#fee2e2;border-color:#fecaca;color:#ef4444}
        .modal-game{flex:1;background:#000;position:relative;min-height:0;overflow:hidden}
        .modal-iframe{width:100%;height:100%;border:none;display:block}
        .modal-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#0f172a}
        .modal-spin{width:34px;height:34px;border-radius:50%;border:3px solid #334155;border-top-color:#fff;animation:spin .7s linear infinite}
        .modal-lt{font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#64748B}
        .modal-error-actions{display:flex;gap:10px}

        .site-footer{position:relative;margin-top:80px;background:transparent;animation:footerFadeUp 0.7s ease forwards;opacity:0;}
        .footer-body{background:transparent;border-top:1px solid rgba(226,232,240,.5);position:relative;}
        .footer-content{max-width:1100px;margin:0 auto;padding:0 40px 48px;position:relative;z-index:1;}
        .footer-main{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 0 32px;border-bottom:1px solid rgba(226,232,240,.8);gap:28px;text-align:center;}
        .footer-logo{display:flex;align-items:center;justify-content:center;height:34px;overflow:hidden;cursor:pointer;transition:all .35s cubic-bezier(.2,.9,.4,1.1);}
        .footer-logo img{height:76px;width:auto;display:block;object-fit:contain;transition:all .35s cubic-bezier(.2,.9,.4,1.1);}
        .footer-logo:hover{transform:scale(1.05);}
        .footer-logo:hover img{filter:drop-shadow(0 5px 12px rgba(0,0,0,.14));}
        .shark-tank{position:relative;display:flex;align-items:center;justify-content:center;height:60px;overflow:visible;cursor:pointer;}
        .shark-tank .footer-logo{position:relative;z-index:4;}
        .shark-reflection{position:absolute;top:56%;left:50%;transform:translateX(-50%) scaleY(-1);width:50px;height:30px;overflow:hidden;opacity:0;z-index:1;filter:blur(1px) brightness(.7);pointer-events:none;-webkit-mask-image:linear-gradient(to bottom,rgba(0,0,0,.5),transparent);mask-image:linear-gradient(to bottom,rgba(0,0,0,.5),transparent);transition:opacity .35s ease;}
        .shark-reflection img{height:76px;width:auto;display:block;margin:0 auto;}
        .shark-tank:hover .shark-reflection{opacity:1;}
        .shark-tank:hover .shark-reflection img{animation:sharkSwim 1.1s ease-in-out infinite;}
        .water-wrap{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:110px;height:24px;overflow:hidden;border-radius:0 0 55px 55px;opacity:0;transition:opacity .3s ease;z-index:2;pointer-events:none;}
        .shark-tank:hover .water-wrap{opacity:1;}
        .wave-svg{position:absolute;top:0;left:0;width:170%;height:100%;}
        .wave-back{fill:#7dd3fc;opacity:.55;animation:waveScroll 5s linear infinite;}
        .wave-front{fill:#0ea5e9;opacity:.9;animation:waveScroll 3.2s linear infinite reverse;}
        .foam-line{position:absolute;top:1px;left:-10%;width:120%;height:3px;background:rgba(255,255,255,.7);border-radius:100px;filter:blur(1.5px);animation:waveScroll 3.2s linear infinite reverse;}
        .splash-rings{position:absolute;bottom:18px;left:50%;width:0;height:0;z-index:3;pointer-events:none;}
        .ring{position:absolute;top:0;left:0;width:8px;height:8px;margin:-4px;border:1.5px solid rgba(125,211,252,.9);border-radius:50%;transform:translate(-50%,-50%) scale(0);opacity:0;}
        .shark-tank:hover .ring{animation:ringPop .65s ease-out forwards;}
        .shark-tank:hover .ring.r2{animation-delay:.08s;}
        .shark-tank:hover .ring.r3{animation-delay:.16s;}
        .droplets{position:absolute;bottom:20px;left:50%;width:0;height:0;z-index:5;pointer-events:none;}
        .drop{position:absolute;top:0;left:0;width:3px;height:3px;border-radius:50%;background:#bae6fd;opacity:0;}
        .shark-tank:hover .drop{animation:dropFly .5s ease-out forwards;}
        .shark-tank:hover .drop.d1{--dx:-13px;--dy:-15px;}
        .shark-tank:hover .drop.d2{--dx:-4px;--dy:-19px;animation-delay:.05s;}
        .shark-tank:hover .drop.d3{--dx:5px;--dy:-18px;animation-delay:.1s;}
        .shark-tank:hover .drop.d4{--dx:14px;--dy:-14px;animation-delay:.05s;}
        .bubble{position:absolute;bottom:10px;width:4px;height:4px;background:rgba(255,255,255,.85);border-radius:50%;opacity:0;z-index:3;pointer-events:none;}
        .bubble.b1{left:30%}.bubble.b2{left:44%}.bubble.b3{left:57%}.bubble.b4{left:70%}
        .shark-tank:hover .bubble{animation:bubbleRise 2s ease-in infinite;}
        .shark-tank:hover .bubble.b2{animation-delay:.4s;}
        .shark-tank:hover .bubble.b3{animation-delay:.85s;}
        .shark-tank:hover .bubble.b4{animation-delay:1.25s;}
        .shark-tank:hover .footer-logo img{animation:sharkSwim 1.1s ease-in-out infinite;transform-origin:50% 70%;}
        .footer-socials{display:flex;gap:5px;padding:5px;border-radius:100px;background:#F1F5F9;border:1px solid rgba(226,232,240,.9);}
        .social-icon{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:transparent;cursor:pointer;transition:all .3s cubic-bezier(.2,.9,.4,1.1);border:1px solid transparent;}
        .social-icon svg{width:17px;height:17px;fill:#1E293B;transition:all .3s cubic-bezier(.2,.9,.4,1.1);}
        .social-icon:hover{background:#1E293B;transform:translateY(-5px) scale(1.14) rotate(5deg);box-shadow:0 10px 24px rgba(30,41,59,.2);border-color:#1E293B;}
        .social-icon:hover svg{fill:#fff;}
        .social-icon:nth-child(1){animation:softBounce .5s ease .2s both;}
        .social-icon:nth-child(2){animation:softBounce .5s ease .3s both;}
        .footer-links{display:flex;justify-content:center;gap:60px;padding:36px 0 0;flex-wrap:wrap;}
        .footer-col{text-align:center;}
        .footer-col-title{font-family:'Nunito',sans-serif;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#94A3B8;margin:0 0 10px 0;}
        .footer-col-links{display:flex;justify-content:center;align-items:center;gap:24px;flex-wrap:wrap;}
        .footer-link{display:inline-block;font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;color:#475569;text-decoration:none;cursor:pointer;transition:all .2s ease;position:relative;}
        .footer-link::after{content:'';position:absolute;bottom:-3px;left:0;width:0;height:2px;background:#1E293B;transition:width .25s cubic-bezier(.2,.9,.4,1.1);border-radius:2px;}
        .footer-link:hover{color:#1E293B;transform:translateY(-1px);}
        .footer-link:hover::after{width:100%;}
        .footer-bottom{padding-top:28px;display:flex;align-items:center;justify-content:center;text-align:center;}
        .footer-copyright{font-family:'Nunito',sans-serif;font-size:12px;font-weight:600;color:#94A3B8;letter-spacing:.3px;transition:color .2s ease;}
        .footer-copyright:hover{color:#1E293B;}

        @media(max-width:768px){
          .hero,.cats,.grid,.skels{padding-left:16px;padding-right:16px;}
          .nav-outer{padding:0 12px;top:10px;}
          .nav-wrap{height:48px;padding:0 14px;}
          .nav-logo{height:32px;}
          .nav-logo img{height:72px;}
          .nav{gap:10px;}
          .nav-search{max-width:none;}
          .grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;}
          .footer-content{padding:0 20px 36px;}
          .footer-links{gap:36px;}
          .footer-col-links{gap:16px;}
          .footer-logo{height:28px;}
          .footer-logo img{height:62px;}
          .social-icon{width:36px;height:36px;}
          .social-icon svg{width:15px;height:15px;}
        }
        @media(max-width:560px){
          .hero{padding-top:76px;}
          .nav-wrap{height:44px;padding:0 12px;}
          .nav-logo{height:28px;}
          .nav-logo img{height:62px;}
          .profile-btn{padding:4px 10px 4px 4px;font-size:11px;max-width:120px;}
          .profile-avatar{width:22px;height:22px;}
          .grid{gap:10px;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}
          .gc.featured,.skel.featured{grid-column:span 1;grid-row:span 1;}
        }
        @media(max-width:400px){
          .hero-title{font-size:26px;}
          .grid{grid-template-columns:repeat(2,1fr);gap:9px;}
          .nav-si{font-size:12px;}
        }
      `}</style>

      {showEasterEgg && <EasterEggModal gameCount={displayedGames.length} onClose={() => setShowEasterEgg(false)} />}

      {/* ── NAV ── */}
      <div className="nav-outer">
        <div className="nav-wrap">
          <nav className="nav">
            <div className="nav-logo" onClick={() => { handleNavLogoClick(); navigate("/"); }}>
              <img src="/sharx.png" alt="Sharx Logo" />
            </div>
            <div className="nav-search">
              <div className="nav-si-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="nav-si"
                  type="text"
                  placeholder="Search games..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="nav-r">
              {isLoggedIn ? (
                <div className="user-logged">
                  <button className="profile-btn" onClick={() => setShowProfile(true)}>
                    <div className="profile-avatar">{renderMiniAvatar()}</div>
                    {profile?.stylishUsername || "Profile"}
                  </button>
                </div>
              ) : (
                <div className="login-icon-container" onClick={() => setPanelMode("login")} title="Login">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-title">Play Games,<br /><em>Have Fun.</em></div>
        <p className="hero-sub">Free games — action, puzzle, racing and more. No downloads, just open and play.</p>
      </div>

      {/* ── CATEGORIES ── */}
      {!loading && !error && (
        <div className="cats">
          <div className="cats-row">
            {categories.map(c => (
              <button key={c} className={`cat${category===c?" on":""}`}
                onClick={() => { setCategory(c); setSearch(""); }}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── GRID ── */}
      {loading ? (
        <div className="skels">
          {Array.from({length:18}).map((_,i)=>(
            <div key={i} className={`skel${isFeatured(i)?" featured":""}`} style={{animationDelay:`${i*15}ms`}}/>
          ))}
        </div>
      ) : error ? (
        <div className="empty">
          <div className="empty-t">Server Error</div>
          <button className="empty-b" onClick={() => fetchGames(1,true)}>Retry</button>
        </div>
      ) : displayedGames.length===0 ? (
        <div className="empty">
          <div className="empty-t">No games found</div>
          <button className="empty-b" onClick={() => { setCategory("All"); setSearch(""); }}>All Games</button>
        </div>
      ) : (
        <>
          <div className="grid" id="games-grid">
            {displayedGames.map((game,i)=>(
              <GameCard key={game.id||i} game={game} index={i} featured={isFeatured(i)} onClick={()=>openGame(game)}/>
            ))}
          </div>
          {hasMore && (
            <div className="load-more-wrap">
              <button className="load-more-btn" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <><span className="spinner"/>Loading...</> : "Load More Games"}
              </button>
            </div>
          )}
        </>
      )}

      {activeGame && <GameModal game={activeGame} onClose={() => setActiveGame(null)} adBlockScript={AD_BLOCK_SCRIPT} />}
      {panelMode  && <SidePanel mode={panelMode} onClose={() => setPanelMode(null)} />}
      {showProfile && (
        <ProfileSidePanel
          profile={profile}
          onUpdateProfile={updateProfile}
          onClose={() => setShowProfile(false)}
          onLogout={authLogout}
        />
      )}

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="footer-body">
          <div className="footer-content">
            <div className="footer-main">
              <div className="shark-tank" onClick={() => navigate("/")}>
                <div className="footer-logo">
                  <img src="/sharx.png" alt="Sharx" draggable={false} />
                </div>
                <div className="water-wrap">
                  <svg className="wave-svg" viewBox="0 0 800 50" preserveAspectRatio="none">
                    <path className="wave-back" d="M0,25 C200,0 400,50 800,25 L800,50 L0,50 Z"/>
                    <path className="wave-front" d="M0,30 C150,10 350,45 800,20 L800,50 L0,50 Z"/>
                  </svg>
                  <div className="foam-line"/>
                </div>
                <div className="splash-rings">
                  <div className="ring r1"/><div className="ring r2"/><div className="ring r3"/>
                </div>
                <div className="droplets">
                  <div className="drop d1"/><div className="drop d2"/><div className="drop d3"/><div className="drop d4"/>
                </div>
                <span className="bubble b1"/><span className="bubble b2"/>
                <span className="bubble b3"/><span className="bubble b4"/>
                <div className="shark-reflection">
                  <img src="/sharx.png" alt="" draggable={false} />
                </div>
              </div>
              <div className="footer-socials">
                <div className="social-icon" onClick={() => navigate("/instagram")} title="Instagram">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </div>
                <div className="social-icon" onClick={() => navigate("/youtube")} title="YouTube">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <p className="footer-col-title">Company</p>
                <div className="footer-col-links">
                  <a className="footer-link" onClick={() => navigate("/about")}>About Us</a>
                  <a className="footer-link" onClick={() => navigate("/contact")}>Contact</a>
                  <a className="footer-link" onClick={() => navigate("/privacy")}>Privacy Policy</a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <span className="footer-copyright">© {new Date().getFullYear()} Sharx. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ─── EASTER EGG ─── */
function EasterEggModal({ gameCount, onClose }) {
  const [confetti, setConfetti] = useState([]);
  useEffect(() => {
    setConfetti(Array.from({length:40},(_,i)=>({
      id:i, left:Math.random()*100,
      delay:Math.random()*.2, duration:2+Math.random(),
      color:["#FF6B6B","#4ECDC4","#45B7D1","#FFA07A","#98D8C8"][Math.floor(Math.random()*5)],
    })));
    const t=setTimeout(onClose,3000);
    return ()=>clearTimeout(t);
  },[onClose]);
  return (
    <div className="easter-egg-modal">
      {confetti.map(p=>(
        <div key={p.id} className="confetti-piece" style={{left:`${p.left}%`,background:p.color,width:"7px",height:"7px",borderRadius:"50%",animation:`confetti ${p.duration}s linear forwards`,animationDelay:`${p.delay}s`}}/>
      ))}
      <div className="easter-egg-content">
        <div className="easter-egg-emoji">🎮</div>
        <div className="easter-egg-title">Sharx UNLOCKED!</div>
        <div className="easter-egg-text">You've discovered the secret! True gaming enthusiast!</div>
        <div className="easter-egg-stats">
          <div className="easter-egg-stat"><div className="easter-egg-stat-num">∞</div><div className="easter-egg-stat-label">Fun Awaits</div></div>
          <div className="easter-egg-stat"><div className="easter-egg-stat-num">{gameCount}+</div><div className="easter-egg-stat-label">Games</div></div>
          <div className="easter-egg-stat"><div className="easter-egg-stat-num">Free</div><div className="easter-egg-stat-label">Always</div></div>
        </div>
        <button className="easter-egg-button" onClick={onClose}>Continue Playing</button>
      </div>
    </div>
  );
}

/* ─── GAME CARD ─── */
const GameCard = React.memo(function GameCard({ game, index, featured, onClick }) {
  return (
    <div
      className={`gc${featured ? " featured" : ""}`}
      style={{ animationDelay: `${Math.min(index, 20) * 22}ms` }}
      onClick={onClick}
    >
      {featured && game.category && <span className="gc-cat-chip">{game.category}</span>}
      <img
        className="gc-img" src={game.thumb} alt={game.title}
        loading="lazy" decoding="async"
        onError={e => { e.target.src = `https://placehold.co/400x400/D8DDE6/475569?text=${encodeURIComponent(game.title || "Game")}`; }}
      />
      <div className="gc-overlay" />
      <div className="gc-play-btn">
        <svg viewBox="0 0 20 22"><path d="M2 1.5L19 11L2 20.5V1.5Z" fill="#1E293B" /></svg>
      </div>
      <div className="gc-label">
        <div className="gc-label-text">{game.title}</div>
      </div>
    </div>
  );
});

/* ─── GAME MODAL with PROXY + DIRECT FALLBACK + TIMEOUT + ERROR STATE ─── */
function GameModal({ game, onClose, adBlockScript }) {
  // "proxy"  -> trying the backend proxy URL first
  // "direct" -> proxy failed/timed out, trying game.url directly
  const [source, setSource] = useState("proxy");
  // "loading" -> waiting for iframe  |  "loaded" -> rendering  |  "error" -> both sources failed
  const [status, setStatus] = useState("loading");

  const frameRef   = useRef(null);
  const timeoutRef = useRef(null);

  const proxyUrl  = `${API_BASE}/proxy/game?url=${encodeURIComponent(game.url)}`;
  const iframeSrc = source === "direct" ? game.url : proxyUrl;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Every time the source changes (proxy -> direct, or a manual retry),
  // reset to "loading" and arm a timeout. A blocked/silently-failing iframe
  // (X-Frame-Options, CSP, dead proxy) often never fires onLoad or onError,
  // so without this the spinner would spin forever.
  useEffect(() => {
    setStatus("loading");
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSource(prev => {
        if (prev === "proxy") return "direct";
        setStatus("error");
        return prev;
      });
    }, 8000);
    return () => clearTimeout(timeoutRef.current);
  }, [source]);

  const injectAdBlocker = () => {
    try {
      const iframe = frameRef.current;
      const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
      if (doc) {
        const script = doc.createElement("script");
        script.textContent = adBlockScript;
        doc.head.appendChild(script);
      }
    } catch (e) {
      // Cross-origin — expected for most real game embeds, sandbox still applies
    }
  };

  const handleLoad = () => {
    clearTimeout(timeoutRef.current);
    setStatus("loaded");
    injectAdBlocker();
  };

  // NOTE: this only fires for hard network failures, not for HTTP error
  // pages, CSP blocks, or X-Frame-Options blocks (browsers don't expose
  // those as iframe error events). The timeout above is the real safety net.
  const handleError = () => {
    clearTimeout(timeoutRef.current);
    if (source === "proxy") setSource("direct");
    else setStatus("error");
  };

  const handleRetry = () => setSource("proxy");

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-top">
        <div className="modal-l">
          <img className="modal-thumb" src={game.thumb} alt={game.title} />
          <div>
            <div className="modal-gt">{game.title}</div>
            <div className="modal-gc">{game.category}</div>
          </div>
        </div>
        <div className="modal-acts">
          <button className="modal-btn" onClick={() => frameRef.current?.requestFullscreen?.()}>⛶ Fullscreen</button>
          <button className="modal-x" onClick={onClose} title="Close">✕</button>
        </div>
      </div>
      <div className="modal-game">
        {status === "loading" && (
          <div className="modal-loader">
            <div className="modal-spin" />
            <div className="modal-lt">Loading game...</div>
          </div>
        )}

        {status === "error" && (
          <div className="modal-loader">
            <div className="modal-lt">This game couldn't be loaded.</div>
            <div className="modal-error-actions">
              <button className="modal-btn" onClick={handleRetry}>Retry</button>
              <button
                className="modal-btn"
                onClick={() => window.open(game.url, "_blank", "noopener,noreferrer")}
              >
                Open in new tab
              </button>
            </div>
          </div>
        )}

        <iframe
          key={iframeSrc}
          ref={frameRef}
          className="modal-iframe"
          src={iframeSrc}
          title={game.title}
          allowFullScreen
          allow="autoplay; fullscreen; gamepad"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox allow-pointer-lock"
          onLoad={handleLoad}
          onError={handleError}
          style={{ opacity: status === "loaded" ? 1 : 0, transition: "opacity .25s ease" }}
        />
      </div>
    </div>
  );
}