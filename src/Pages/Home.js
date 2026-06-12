// src/Pages/Home.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useProfile } from "../Context/ProfileContext";
import { GAMES_BASE } from "../config";
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
  const logout   = useCallback((e) => { e.stopPropagation(); authLogout(); }, [authLogout]);

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
        *{margin:0;padding:0;box-sizing:border-box;}

        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
          color: #1E293B;
          background: #f0f2f7;
          position: relative;
          overflow-x: hidden;
        }

        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: -1;
          background:
            radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 10%, rgba(244, 114, 182, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%),
            radial-gradient(circle at 10% 80%, rgba(45, 212, 191, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(251, 191, 36, 0.1) 0%, transparent 40%);
          background-color: #f8fafc;
          filter: blur(80px);
          transform: scale(1.2);
        }

        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:10px;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-700px 0}100%{background-position:700px 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeScale{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        @keyframes liquidGlow{0%{box-shadow:0 8px 32px rgba(0,0,0,.05),0 0 0 1px rgba(255,255,255,.3)}50%{box-shadow:0 12px 40px rgba(0,0,0,.08),0 0 0 2px rgba(255,255,255,.5)}100%{box-shadow:0 8px 32px rgba(0,0,0,.05),0 0 0 1px rgba(255,255,255,.3)}}
        @keyframes easterEggPulse{0%{transform:scale(1) rotate(0deg)}25%{transform:scale(1.15) rotate(-10deg)}50%{transform:scale(1.2) rotate(10deg)}75%{transform:scale(1.15) rotate(-5deg)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes rainbowShift{0%{background:linear-gradient(45deg,#FF6B6B,#4ECDC4)}20%{background:linear-gradient(45deg,#4ECDC4,#45B7D1)}40%{background:linear-gradient(45deg,#45B7D1,#FFA07A)}60%{background:linear-gradient(45deg,#FFA07A,#98D8C8)}80%{background:linear-gradient(45deg,#98D8C8,#FF6B6B)}100%{background:linear-gradient(45deg,#FF6B6B,#4ECDC4)}}

        .easter-egg-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);animation:fadeIn .3s ease forwards}
        .easter-egg-content{position:relative;background:#fff;border-radius:32px;padding:40px;text-align:center;max-width:500px;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:fadeUp .4s cubic-bezier(.23,1,.32,1) forwards}
        .easter-egg-emoji{font-size:80px;margin-bottom:20px;display:inline-block;animation:easterEggPulse .6s ease-in-out infinite}
        .easter-egg-title{font-family:'Righteous',cursive;font-size:32px;color:#1E293B;margin-bottom:12px;background:linear-gradient(45deg,#FF6B6B,#4ECDC4,#45B7D1,#FFA07A);background-size:300% 300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:rainbowShift 3s ease infinite}
        .easter-egg-text{font-size:16px;color:#475569;margin-bottom:24px;line-height:1.6}
        .easter-egg-stats{display:flex;justify-content:space-around;margin-bottom:24px;gap:12px;flex-wrap:wrap}
        .easter-egg-stat{flex:1;background:linear-gradient(135deg,#F1F5F9,#E8F0F7);border-radius:16px;padding:12px;border:1px solid rgba(226,232,240,.8)}
        .easter-egg-stat-num{font-size:24px;font-weight:800;color:#1E293B;margin-bottom:4px}
        .easter-egg-stat-label{font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase}
        .easter-egg-button{background:linear-gradient(135deg,#FF6B6B,#4ECDC4);color:#fff;border:none;border-radius:100px;padding:12px 32px;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;cursor:pointer;transition:all .3s ease;box-shadow:0 4px 16px rgba(255,107,107,.3)}
        .easter-egg-button:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,107,107,.4)}
        .confetti-piece{position:fixed;pointer-events:none;z-index:9998}

        /* ── NAV ── */
        .nav-outer{display:flex;justify-content:center;position:sticky;top:20px;z-index:300;padding:0 24px}
        .nav-wrap{width:100%;max-width:1100px;padding:8px 24px;background:rgba(255,255,255,.4);backdrop-filter:blur(16px) saturate(180%);border-radius:80px;border:1px solid rgba(255,255,255,.6);box-shadow:0 8px 32px rgba(0,0,0,.05);animation:fadeScale .5s ease forwards,liquidGlow 3s ease-in-out infinite;transition:all .4s cubic-bezier(.2,.9,.4,1.1)}
        .nav-wrap:hover{background:rgba(255,255,255,.55);border-color:rgba(255,255,255,.8)}
        .nav{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
        .nav-logo{display:flex;align-items:center;cursor:pointer;transition:all .3s ease}
        .nav-logo img{height:36px;width:auto;object-fit:contain;transition:all .3s ease}
        .nav-logo:hover{opacity:.7;transform:scale(1.02)}
        .nav-search{flex:1;min-width:180px;max-width:400px}
        .nav-si-wrap{display:flex;align-items:center;background:rgba(255,255,255,.7);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.5);border-radius:100px;padding:0 18px;gap:10px;height:44px;transition:all .3s ease}
        .nav-si-wrap:focus-within{background:rgba(255,255,255,.95);border-color:rgba(100,116,139,.3);box-shadow:0 0 0 4px rgba(0,0,0,.02)}
        .nav-si-wrap svg{flex-shrink:0;color:#64748B;width:16px;height:16px}
        .nav-si{flex:1;border:none;outline:none;background:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:500;color:#1E293B}
        .nav-si::placeholder{color:#94A3B8;font-weight:400}
        .nav-r{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .btn-login,.btn-signup{font-family:'Nunito',sans-serif;font-size:13px;font-weight:800;padding:8px 24px;border-radius:100px;cursor:pointer;transition:all .3s ease;position:relative;overflow:hidden}
        .btn-login{background:#1E293B;color:#fff;border:none}
        .btn-login:hover{background:#0F172A;transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.1)}
        .btn-signup{background:rgba(255,255,255,.8);backdrop-filter:blur(4px);color:#1E293B;border:1px solid rgba(226,232,240,.8)}
        .btn-signup:hover{background:#fff;border-color:#CBD5E1;transform:translateY(-2px)}

        .user-logged{display:flex;align-items:center;gap:8px}
        .profile-btn{background:rgba(255,255,255,.5);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.6);border-radius:100px;cursor:pointer;display:flex;align-items:center;gap:7px;padding:7px 16px 7px 7px;transition:all .3s ease;color:#1E293B;font-family:'Nunito',sans-serif;font-size:13px;font-weight:800;position:relative;overflow:hidden}
        .profile-btn:hover{background:rgba(255,255,255,.9);border-color:rgba(100,116,139,.3);transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.09)}
        .profile-avatar{width:28px;height:28px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#F1F5F9}

        /* ── Content ── */
        .hero{padding:100px 48px 22px;max-width:1200px;margin:0 auto;animation:fadeUp .5s ease forwards}
        .hero-title{font-family:'Righteous',cursive;font-size:clamp(30px,4.5vw,52px);line-height:1.08;color:#1E293B;margin-bottom:10px}
        .hero-title em{font-style:normal;background:linear-gradient(135deg,#1E293B 0%,#64748B 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hero-sub{font-size:13px;font-weight:500;color:#475569;max-width:440px;opacity:0;animation:fadeUp .5s ease .1s forwards}
        .cats{padding:0 48px 18px;opacity:0;animation:fadeUp .5s ease .13s forwards;max-width:1200px;margin:0 auto}
        .cats-row{display:flex;gap:7px;flex-wrap:wrap}
        .cat{font-size:12px;font-weight:700;color:#475569;padding:6px 16px;border-radius:100px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.85);border-bottom-color:rgba(0,0,0,.06);backdrop-filter:blur(8px);cursor:pointer;transition:all .3s cubic-bezier(.23,1,.32,1)}
        .cat:hover{background:rgba(255,255,255,.9);transform:translateY(-2px);color:#1E293B}
        .cat.on{background:#1E293B;border-color:#1E293B;color:#fff;transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.15)}
        .grid{padding:0 48px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:24px;max-width:1200px;margin:0 auto}
        .gc{position:relative;border-radius:20px;overflow:hidden;cursor:pointer;background:rgba(216,221,230,0.5);aspect-ratio:1;transition:transform .32s cubic-bezier(.23,1,.32,1),box-shadow .32s cubic-bezier(.23,1,.32,1);animation:fadeUp .4s ease both;box-shadow:0 2px 8px rgba(0,0,0,.08);contain:layout style paint;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.3)}
        .gc.featured{grid-column:span 2;grid-row:span 2}
        .gc:hover{transform:scale(1.02) translateY(-3px);box-shadow:0 18px 40px rgba(0,0,0,.18);z-index:2}
        .gc-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .45s cubic-bezier(.23,1,.32,1)}
        .gc:hover .gc-img{transform:scale(1.06)}
        .gc-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.72) 0%,rgba(0,0,0,.08) 50%,transparent 100%);opacity:0;transition:opacity .28s ease}
        .gc-play-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-55%) scale(.45);width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.95);display:flex;align-items:center;justify-content:center;opacity:0;transition:all .32s cubic-bezier(.2,.9,.4,1.1);box-shadow:0 4px 16px rgba(0,0,0,.28);pointer-events:none}
        .gc.featured .gc-play-btn{width:52px;height:52px}
        .gc:hover .gc-play-btn{opacity:1;transform:translate(-50%,-50%) scale(1)}
        .gc-play-btn svg{width:12px;height:14px;fill:#1E293B;margin-left:2px}
        .gc-label{position:absolute;bottom:0;left:0;right:0;padding:26px 10px 10px;transform:translateY(5px);opacity:0;transition:opacity .26s ease,transform .26s ease;pointer-events:none}
        .gc:hover .gc-label{opacity:1;transform:translateY(0)}
        .gc-label-text{font-size:14px;font-weight:800;color:#fff;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-shadow:0 1px 4px rgba(0,0,0,.5)}
        .gc.featured .gc-label{padding:44px 14px 14px}
        .gc.featured .gc-label-text{font-size:18px}
        .gc-cat-chip{position:absolute;top:11px;left:11px;background:rgba(0,0,0,.42);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.18);border-radius:100px;padding:3px 10px;font-size:10px;font-weight:800;color:rgba(255,255,255,.92);pointer-events:none}
        .skels{padding:0 48px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:24px;max-width:1200px;margin:0 auto}
        .skel{aspect-ratio:1;border-radius:20px;background:linear-gradient(90deg,rgba(255,255,255,.35) 25%,rgba(255,255,255,.65) 50%,rgba(255,255,255,.35) 75%);background-size:800px 100%;animation:shimmer 1.6s ease infinite}
        .skel.featured{grid-column:span 2;grid-row:span 2;border-radius:20px}
        .empty{text-align:center;padding:80px 24px;animation:fadeUp .4s ease forwards}
        .empty-t{font-family:'Righteous',cursive;font-size:24px;color:#1E293B;margin-bottom:8px}
        .empty-b{font-family:'Nunito',sans-serif;font-size:13px;font-weight:800;color:#fff;background:#1E293B;border:none;border-radius:14px;padding:11px 28px;cursor:pointer;transition:all .3s ease}
        .empty-b:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.15);background:#0F172A}
        .load-more-wrap{text-align:center;padding:40px 0 20px}
        .load-more-btn{background:linear-gradient(135deg,#1E293B,#334155);color:#fff;border:none;border-radius:30px;padding:14px 48px;font-family:'Nunito',sans-serif;font-weight:800;font-size:14px;cursor:pointer;transition:all .35s cubic-bezier(.23,1,.32,1);box-shadow:0 4px 20px rgba(0,0,0,.15);display:inline-flex;align-items:center;gap:8px}
        .load-more-btn:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.2)}
        .load-more-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .load-more-btn .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;display:inline-block}

        /* ── MODAL ── */
        .modal-bg{position:fixed;inset:0;z-index:999;background:rgba(15,23,42,.8);backdrop-filter:blur(12px);display:flex;flex-direction:column;animation:fadeIn .22s ease forwards}
        .modal-top{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.6);flex-wrap:wrap;gap:10px}
        .modal-l{display:flex;align-items:center;gap:12px}
        .modal-thumb{width:46px;height:34px;object-fit:cover;border-radius:8px}
        .modal-gt{font-family:'Righteous',cursive;font-size:17px;color:#1E293B}
        .modal-gc{font-size:10px;font-weight:700;color:#64748B}
        .modal-acts{display:flex;gap:8px}
        .modal-btn{font-family:'Nunito',sans-serif;font-size:12px;font-weight:800;color:#1E293B;padding:7px 18px;border-radius:10px;background:rgba(241,245,249,.8);border:1px solid rgba(226,232,240,.8);cursor:pointer;transition:all .2s ease}
        .modal-btn:hover{background:#fff;transform:translateY(-1px)}
        .modal-x{width:34px;height:34px;border-radius:10px;background:rgba(241,245,249,.8);border:1px solid rgba(226,232,240,.8);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s ease}
        .modal-x:hover{background:#fee2e2;border-color:#fecaca;transform:rotate(90deg)}
        .modal-game{flex:1;background:#000;position:relative;min-height:0;overflow:hidden}
        .modal-iframe{width:100%;height:100%;border:none;display:block}

        /* ── AD NUCLEAR BLOCK ── */
        .modal-game > iframe ~ iframe{display:none !important;width:0 !important;height:0 !important;pointer-events:none !important;visibility:hidden !important;opacity:0 !important;}
        .modal-game [id*="ad"],
        .modal-game [class*="ad-"],
        .modal-game [class*="-ad"],
        .modal-game [id*="banner"],
        .modal-game [class*="banner"],
        .modal-game [id*="overlay"],
        .modal-game [id*="popup"],
        .modal-game [class*="popup"]{display:none !important;visibility:hidden !important;pointer-events:none !important;width:0 !important;height:0 !important;opacity:0 !important;}

        .modal-loader{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#000}
        .modal-spin{width:36px;height:36px;border-radius:50%;border:3px solid #334155;border-top-color:#fff;animation:spin .8s linear infinite}
        .modal-lt{font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:#94A3B8}

        /* ── FOOTER ── (Original structure, only style refined) */
        .site-footer{position:relative;background:transparent;margin-top:80px;}
        .footer-wave-wrap{display:block;line-height:0;overflow:hidden;}
        .footer-wave-wrap svg{display:block;width:100%;height:90px;}
        .footer-body{background:#ffffff;border-radius:32px 32px 0 0;box-shadow:0 -4px 20px rgba(0,0,0,0.02);}
        .footer-content{max-width:1100px;margin:0 auto;padding:0 48px 48px;}
        .footer-main{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 0 36px;border-bottom:1px solid #F1F5F9;gap:28px;text-align:center;}
        .footer-logo{cursor:pointer;transition:all .3s ease;display:inline-block;}
        .footer-logo img{height:42px;width:auto;display:block;transition:opacity .2s;}
        .footer-logo:hover{opacity:.7;transform:translateY(-2px);}
        .footer-socials{display:flex;gap:24px;justify-content:center;align-items:center;}
        .social-icon{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:#F1F5F9;cursor:pointer;transition:all .25s ease;border:1px solid transparent;}
        .social-icon svg{width:20px;height:20px;fill:#64748B;transition:all .25s ease;}
        .social-icon:hover{background:#1E293B;transform:translateY(-3px);border-color:#1E293B;}
        .social-icon:hover svg{fill:#ffffff;}
        .footer-links{display:flex;justify-content:center;padding:32px 0 0;}
        .footer-col{text-align:center;}
        .footer-col-title{font-family:'Nunito',sans-serif;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#CBD5E1;margin:0 0 16px;}
        .footer-link{display:inline-block;font-family:'Nunito',sans-serif;font-size:14px;font-weight:600;color:#64748B;text-decoration:none;margin:0 12px;cursor:pointer;transition:all .22s ease;}
        .footer-link:hover{color:#1E293B;transform:translateY(-1px);}
        .footer-bottom{padding-top:32px;display:flex;align-items:center;justify-content:center;text-align:center;}
        .footer-copyright{font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;color:#c1c5ce;}

        @media(max-width:768px){
          .hero,.cats,.grid,.skels{padding-left:20px;padding-right:20px;}
          .nav{gap:12px;}.nav-search{min-width:140px;}
          .grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;}
          .footer-content{padding:0 24px 40px;}
          .footer-link{margin:0 8px;font-size:13px;}
          .social-icon{width:36px;height:36px;}.social-icon svg{width:18px;height:18px;}
        }
        @media(max-width:560px){
          .hero{padding-top:80px;}.nav-wrap{padding:6px 16px;}.nav-logo img{height:28px;}
          .nav-search{min-width:120px;}.btn-signup{display:none;}
          .grid{gap:12px;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}
          .gc.featured,.skel.featured{grid-column:span 1;grid-row:span 1;}
          .footer-wave-wrap svg{height:60px;}
          .footer-links{flex-direction:column;align-items:center;}
          .footer-link{display:block;margin:8px 0;}
          .footer-bottom{padding-top:24px;}
        }
        @media(max-width:480px){
          .hero-title{font-size:28px;}
          .profile-btn{padding:5px 12px 5px 5px;font-size:11px;}
          .profile-avatar{width:24px;height:24px;}
          .grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;}
        }
      `}</style>

      {showEasterEgg && <EasterEggModal gameCount={displayedGames.length} onClose={() => setShowEasterEgg(false)} />}

      {/* ── NAV ── */}
      <div className="nav-outer">
        <div className="nav-wrap">
          <nav className="nav">
            <div className="nav-logo" onClick={() => { handleNavLogoClick(); navigate("/"); }}>
              <img src="/playvora.png" alt="Playvora Logo" />
            </div>
            <div className="nav-search">
              <div className="nav-si-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input className="nav-si" type="text" placeholder="Search games..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="nav-r">
              {isLoggedIn ? (
                <div className="user-logged">
                  <button className="profile-btn" onClick={() => setShowProfile(true)}>
                    <div className="profile-avatar">
                      {renderMiniAvatar()}
                    </div>
                    {profile?.stylishUsername || "Profile"}
                  </button>
                </div>
              ) : (
                <>
                  <button className="btn-signup" onClick={() => setPanelMode("signup")}>Sign Up</button>
                  <button className="btn-login"  onClick={() => setPanelMode("login")}>Login</button>
                </>
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
            <div key={i} className={`skel${isFeatured(i)?" featured":""}`} style={{animationDelay:`${i*20}ms`}}/>
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
          <div className="grid">
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

      {activeGame && <GameModal game={activeGame} onClose={() => setActiveGame(null)} />}
      {panelMode  && <SidePanel mode={panelMode} onClose={() => setPanelMode(null)} />}

      {showProfile && (
        <ProfileSidePanel
          profile={profile}
          onUpdateProfile={updateProfile}
          onClose={() => setShowProfile(false)}
          onLogout={authLogout}
        />
      )}

      {/* ── FOOTER ── (Original structure, only visual polish) */}
      <footer className="site-footer">
        <div className="footer-wave-wrap">
          <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,58 C120,82 240,22 360,52 C480,82 600,16 720,46 C840,76 960,20 1080,50 C1200,80 1320,24 1440,54 L1440,90 L0,90 Z" fill="#ffffff"/>
          </svg>
        </div>
        <div className="footer-body">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-logo" onClick={() => navigate("/")}>
                <img src="/playvora.png" alt="Playvora" draggable={false} />
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
                <a className="footer-link" onClick={() => navigate("/about")}>About Us</a>
                <a className="footer-link" onClick={() => navigate("/contact")}>Contact</a>
                <a className="footer-link" onClick={() => navigate("/privacy")}>Privacy Policy</a>
              </div>
            </div>
            <div className="footer-bottom">
              <span className="footer-copyright">© {new Date().getFullYear()} Playvora. All rights reserved.</span>
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
    setConfetti(Array.from({length:50},(_,i)=>({
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
        <div key={p.id} className="confetti-piece" style={{left:`${p.left}%`,background:p.color,width:"8px",height:"8px",borderRadius:"50%",animation:`confetti ${p.duration}s linear forwards`,animationDelay:`${p.delay}s`}}/>
      ))}
      <div className="easter-egg-content">
        <div className="easter-egg-emoji">🎮</div>
        <div className="easter-egg-title">PLAYVORA UNLOCKED!</div>
        <div className="easter-egg-text">You've discovered the secret! You're one of the true gaming enthusiasts!</div>
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
  const [preloaded, setPreloaded] = useState(false);

  return (
    <div
      className={`gc${featured ? " featured" : ""}`}
      style={{ animationDelay: `${Math.min(index, 20) * 28}ms` }}
      onClick={onClick}
      onMouseEnter={() => setPreloaded(true)}
    >
      {featured && game.category && <span className="gc-cat-chip">{game.category}</span>}
      <img
        className="gc-img"
        src={game.thumb}
        alt={game.title}
        loading="lazy"
        decoding="async"
        onError={e => {
          e.target.src = `https://placehold.co/400x400/D8DDE6/475569?text=${encodeURIComponent(game.title || "Game")}`;
        }}
      />
      <div className="gc-overlay" />
      <div className="gc-play-btn">
        <svg viewBox="0 0 20 22"><path d="M2 1.5L19 11L2 20.5V1.5Z" fill="#1E293B" /></svg>
      </div>
      <div className="gc-label">
        <div className="gc-label-text">{game.title}</div>
      </div>

      {preloaded && (
        <iframe
          src={game.url}
          title={`preload-${game.id}`}
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
            border: "none",
          }}
          sandbox="allow-scripts allow-same-origin allow-forms"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
});

/* ─── GAME MODAL ─── */
function GameModal({ game, onClose }) {
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

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
          <button className="modal-btn" onClick={() => frameRef.current?.requestFullscreen?.()}>Fullscreen</button>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="modal-game">
        {!loaded && (
          <div className="modal-loader">
            <div className="modal-spin" />
            <div className="modal-lt">Loading game...</div>
          </div>
        )}
        <iframe
          ref={frameRef}
          className="modal-iframe"
          src={game.url}
          title={game.title}
          allowFullScreen
          allow="autoplay; fullscreen; gamepad"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity .3s ease" }}
        />
      </div>
    </div>
  );
}