import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BODIES = [
  { id: "circle", label: "Round", el: (c) => <circle cx="40" cy="40" r="36" fill={c} stroke="rgba(0,0,0,.1)" strokeWidth="2.5"/> },
  { id: "square", label: "Square", el: (c) => <rect x="4" y="4" width="72" height="72" rx="22" fill={c} stroke="rgba(0,0,0,.1)" strokeWidth="2.5"/> },
  { id: "blob", label: "Blob", el: (c) => <path d="M40 6C52 6 70 14 72 28C74 42 66 58 56 66C46 74 28 74 18 64C8 54 6 38 10 24C14 10 28 6 40 6Z" fill={c} stroke="rgba(0,0,0,.1)" strokeWidth="2.5"/> },
  { id: "diamond", label: "Diamond", el: (c) => <polygon points="40,4 74,40 40,76 6,40" fill={c} stroke="rgba(0,0,0,.1)" strokeWidth="2.5"/> },
];

const EYES = [
  (blink) => (<g><g style={{transform:`scaleY(${blink ? 0.8 : 1})`,transformOrigin:"28px 36px",transition:"transform .08s"}}><circle cx="28" cy="36" r="10" fill="white" stroke="rgba(0,0,0,.12)" strokeWidth="2"/><circle cx="28" cy="36" r="6" fill="#1a1a2e"/><circle cx="30" cy="33" r="2" fill="white"/></g><g style={{transform:`scaleY(${blink ? 0.8 : 1})`,transformOrigin:"52px 36px",transition:"transform .08s"}}><circle cx="52" cy="36" r="10" fill="white" stroke="rgba(0,0,0,.12)" strokeWidth="2"/><circle cx="52" cy="36" r="6" fill="#1a1a2e"/><circle cx="54" cy="33" r="2" fill="white"/></g></g>),
  (blink) => (<g><g style={{transform:`scaleY(${blink ? 0.1 : 1})`,transformOrigin:"28px 38px",transition:"transform .08s"}}><circle cx="28" cy="38" r="6" fill="white" stroke="rgba(0,0,0,.12)" strokeWidth="1.5"/><circle cx="28" cy="38" r="3.5" fill="#1a1a2e"/><circle cx="29.5" cy="36.5" r="1.2" fill="white"/></g><g style={{transform:`scaleY(${blink ? 0.1 : 1})`,transformOrigin:"52px 38px",transition:"transform .08s"}}><circle cx="52" cy="38" r="6" fill="white" stroke="rgba(0,0,0,.12)" strokeWidth="1.5"/><circle cx="52" cy="38" r="3.5" fill="#1a1a2e"/><circle cx="53.5" cy="36.5" r="1.2" fill="white"/></g></g>),
  (blink) => (<g><clipPath id="cl"><rect x="18" y="32" width="20" height="12"/></clipPath><clipPath id="cr"><rect x="42" y="32" width="20" height="12"/></clipPath><circle cx="28" cy="36" r="9" fill="white" stroke="rgba(0,0,0,.12)" strokeWidth="2" clipPath="url(#cl)"/><circle cx="28" cy="36" r="5.5" fill="#1a1a2e" clipPath="url(#cl)"/><circle cx="52" cy="36" r="9" fill="white" stroke="rgba(0,0,0,.12)" strokeWidth="2" clipPath="url(#cr)"/><circle cx="52" cy="36" r="5.5" fill="#1a1a2e" clipPath="url(#cr)"/><path d="M18 32Q28 27 38 32" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="2" strokeLinecap="round"/><path d="M42 32Q52 27 62 32" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="2" strokeLinecap="round"/></g>),
  (blink) => (<g><circle cx="28" cy="36" r="10" fill="white" stroke="rgba(0,0,0,.12)" strokeWidth="2"/><polygon points="28,28 29.5,34 36,36 29.5,38 28,44 26.5,38 20,36 26.5,34" fill="#1a1a2e"/><circle cx="52" cy="36" r="10" fill="white" stroke="rgba(0,0,0,.12)" strokeWidth="2"/><polygon points="52,28 53.5,34 60,36 53.5,38 52,44 50.5,38 44,36 50.5,34" fill="#1a1a2e"/></g>),
];

const MOUTH = () => <path d="M28 54Q40 65 52 54" stroke="rgba(0,0,0,.22)" strokeWidth="3" strokeLinecap="round" fill="none"/>;
const CHEEKS = <g><ellipse cx="18" cy="50" rx="8" ry="5" fill="rgba(0,0,0,.06)"/><ellipse cx="62" cy="50" rx="8" ry="5" fill="rgba(0,0,0,.06)"/></g>;

const COLORS = [
  { id:"red", hex:"#ff6b6b", name:"Red" }, { id:"orange", hex:"#ff9f43", name:"Orange" },
  { id:"yellow", hex:"#ffd93d", name:"Yellow" }, { id:"green", hex:"#6bcb77", name:"Green" },
];

function Avatar({ body="circle", eyes=0, color="#ffffff", size=60, animate=true }) {
  const [blink, setBlink] = useState(false);
  const [bounce, setBounce] = useState(false);
  const bodyObj = BODIES.find(b => b.id === body) || BODIES[0];
  const timerRef = useRef(null);

  useEffect(() => {
    if (!animate) return;
    const next = () => {
      const delay = 3000 + Math.random() * 2000;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        timerRef.current = next();
      }, delay);
    };
    timerRef.current = next();
    return () => clearTimeout(timerRef.current);
  }, [animate, eyes]);

  useEffect(() => {
    if (!animate) return;
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 400);
    return () => clearTimeout(t);
  }, [body, eyes, color, animate]);

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{
      flexShrink:0, display:"block",
      transform: bounce ? "scale(1.15) translateY(-3px)" : "scale(1)",
      transition: "transform .35s cubic-bezier(.34,1.6,.64,1)",
    }}>
      {bodyObj.el(color)}{CHEEKS}{EYES[eyes % EYES.length](blink)}{MOUTH()}
      <ellipse cx="24" cy="16" rx="10" ry="5" fill="rgba(255,255,255,.3)" style={{transform:"rotate(-30deg)",transformOrigin:"24px 16px"}}/>
    </svg>
  );
}

export default function PageLayout({ title, subtitle, children }) {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState("body");
  const profileRef = useRef(null);
  const [username, setUsername] = useState(() => localStorage.getItem("pv_un") || "Player");
  const [body, setBody] = useState(() => localStorage.getItem("pv_sh") || "circle");
  const [eyes, setEyes] = useState(() => +(localStorage.getItem("pv_ey") || 0));
  const [color, setColor] = useState(() => localStorage.getItem("pv_co") || "#ffffff");
  const [pBody, setPBody] = useState(body);
  const [pEyes, setPEyes] = useState(eyes);
  const [pColor, setPColor] = useState(color);
  const [editName, setEditName] = useState(username);
  const isLoggedIn = !!localStorage.getItem("token");

  const openProfile = (e) => {
    e.stopPropagation();
    setEditName(username);
    setPBody(body);
    setPEyes(eyes);
    setPColor(color);
    setProfileTab("body");
    setShowProfile(true);
  };

  const saveProfile = () => {
    const n = editName.trim() || username;
    setUsername(n);
    setBody(pBody);
    setEyes(pEyes);
    setColor(pColor);
    localStorage.setItem("pv_un", n);
    localStorage.setItem("pv_sh", pBody);
    localStorage.setItem("pv_ey", String(pEyes));
    localStorage.setItem("pv_co", pColor);
    setShowProfile(false);
  };

  const logout = (e) => {
    e.stopPropagation();
    authLogout();
    setShowProfile(false);
  };

  useEffect(() => {
    if (!showProfile) return;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Righteous&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #9CC3D5; font-family: 'Nunito', sans-serif; color: #1e293b; min-height: 100vh; -webkit-font-smoothing: antialiased; }

        /* Navbar */
        .nav-wrap { position: sticky; top: 0; z-index: 300; padding: 12px 24px; background: rgba(255,255,255,0.98); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.05); }
        .nav { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 150px 1fr 220px; align-items: center; gap: 20px; }
        .nav-logo { font-family: 'Righteous', cursive; font-size: 24px; background: linear-gradient(135deg, #0063B2 0%, #1e293b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; cursor: pointer; transition: opacity .2s ease; }
        .nav-logo:hover { opacity: .75; }
        .nav-si-wrap { display: flex; align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 100px; padding: 0 16px; gap: 10px; height: 44px; transition: border-color .2s ease, box-shadow .2s ease; }
        .nav-si-wrap:focus-within { border-color: #0063B2; box-shadow: 0 0 0 3px rgba(0,99,178,0.1); }
        .nav-si-wrap svg { color: #94a3b8; flex-shrink: 0; }
        .nav-si { flex: 1; border: none; outline: none; background: none; font-size: 14px; color: #1e293b; }
        .nav-si::placeholder { color: #94a3b8; }
        .nav-r { display: flex; align-items: center; gap: 12px; justify-content: flex-end; }
        .btn-login { font-size: 13px; font-weight: 800; color: #fff; padding: 9px 24px; border-radius: 100px; background: #0063B2; border: none; cursor: pointer; transition: background .2s ease, transform .15s ease; }
        .btn-login:hover { background: #00589e; }
        .btn-login:active { transform: scale(0.97); }
        .btn-signup { font-size: 13px; font-weight: 700; color: #0063B2; padding: 9px 22px; border-radius: 100px; background: #eff6ff; border: 1px solid #bfdbfe; cursor: pointer; transition: background .2s ease, transform .15s ease; }
        .btn-signup:hover { background: #dbeafe; }
        .btn-signup:active { transform: scale(0.97); }
        .prof-btn { display: flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 100px; padding: 4px 16px 4px 6px; cursor: pointer; transition: border-color .2s ease, box-shadow .2s ease; }
        .prof-btn:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .prof-name { font-size: 13px; font-weight: 800; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .prof-chevron { font-size: 9px; color: #94a3b8; transition: transform .2s ease; }

        /* Profile Panel */
        .prof-panel { position: absolute; top: calc(100% + 10px); right: 0; width: 360px; background: #fff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); z-index: 500; animation: popIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) both; overflow: hidden; }
        .pp-top { position: relative; padding: 28px 20px 20px; display: flex; flex-direction: column; align-items: center; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .pp-close, .pp-done { position: absolute; top: 12px; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: background .2s ease, transform .15s ease; }
        .pp-close { left: 12px; background: #fff; border: 1px solid #e2e8f0; color: #64748b; }
        .pp-close:hover { background: #f1f5f9; }
        .pp-done { right: 12px; background: #0063B2; border: none; color: #fff; }
        .pp-done:hover { background: #00589e; }
        .pp-close:active, .pp-done:active { transform: scale(0.92); }
        .pp-info-name { margin-top: 10px; font-size: 15px; font-weight: 800; color: #1e293b; }
        .pp-name-wrap { padding: 14px 18px; border-bottom: 1px solid #e2e8f0; }
        .pp-input { width: 100%; padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 100px; background: #f8fafc; text-align: center; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; color: #1e293b; outline: none; transition: border-color .2s ease; }
        .pp-input:focus { border-color: #0063B2; background: #fff; }
        .pp-tabs { display: flex; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .pp-tab { flex: 1; padding: 12px 6px; font-size: 12px; font-weight: 800; color: #64748b; background: none; border: none; cursor: pointer; border-bottom: 2px solid transparent; transition: color .2s ease, border-color .2s ease, background .2s ease; }
        .pp-tab:hover { color: #1e293b; }
        .pp-tab.on { color: #0063B2; border-bottom-color: #0063B2; background: #fff; }
        .pp-opts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 16px; }
        .pp-opt { aspect-ratio: 1; border-radius: 16px; border: 2px solid #e2e8f0; background: #f8fafc; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 8px; transition: border-color .2s ease, background .2s ease, transform .15s ease; }
        .pp-opt:hover { border-color: #94a3b8; transform: translateY(-1px); }
        .pp-opt.on { border-color: #0063B2; background: #eff6ff; }
        .pp-swatch { width: 100%; height: 100%; border-radius: 12px; }
        .pp-foot { padding: 0 16px 18px; }
        .pp-logout { width: 100%; padding: 12px; border-radius: 100px; background: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; color: #475569; transition: border-color .2s ease, color .2s ease, background .2s ease; }
        .pp-logout:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

        /* Page Content */
        .page-container { max-width: 1200px; margin: 0 auto; padding: 48px 24px; min-height: calc(100vh - 200px); }
        .page-title { font-family: 'Righteous', cursive; font-size: 48px; color: #1e293b; margin-bottom: 16px; line-height: 1.15; }
        .page-subtitle { font-size: 18px; color: #475569; margin-bottom: 40px; border-left: 4px solid #0063B2; padding-left: 20px; }
        .page-content { background: #fff; border-radius: 32px; padding: 40px; box-shadow: 0 12px 28px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .page-content h2 { font-size: 24px; margin: 24px 0 16px; color: #1e293b; }
        .page-content h2:first-child { margin-top: 0; }
        .page-content h3 { font-size: 18px; margin: 20px 0 12px; color: #0063B2; }
        .page-content p { font-size: 16px; line-height: 1.65; color: #475569; margin-bottom: 16px; }
        .page-content ul, .page-content ol { margin: 16px 0 16px 24px; color: #475569; line-height: 1.65; }
        .page-content li { margin: 8px 0; }
        .page-content a { color: #0063B2; text-decoration: none; border-bottom: 1px solid #0063B2; transition: opacity .2s ease; }
        .page-content a:hover { opacity: .7; }

        /* Footer */
        .site-footer { margin-top: 60px; background: #fff; border-top: 1px solid #e2e8f0; }
        .footer-content { max-width: 1200px; margin: 0 auto; padding: 48px 48px 32px; }
        .footer-top { display: flex; flex-wrap: wrap; gap: 48px; margin-bottom: 32px; }
        .footer-brand { flex: 1; min-width: 260px; }
        .footer-logo span { font-family: 'Righteous', cursive; font-size: 24px; color: #1e293b; }
        .footer-links-group { display: flex; flex: 2; gap: 32px; justify-content: space-around; flex-wrap: wrap; }
        .footer-links h4 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #1e293b; margin-bottom: 16px; }
        .footer-links a { display: block; font-size: 14px; color: #64748b; text-decoration: none; margin-bottom: 10px; cursor: pointer; transition: color 0.2s ease; }
        .footer-links a:hover { color: #0063B2; }
        .footer-bottom { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
        .footer-copyright { font-size: 13px; color: #94a3b8; }

        @keyframes popIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 768px) {
          .nav { grid-template-columns: 130px 1fr 180px; gap: 12px; }
          .page-title { font-size: 32px; }
          .page-content { padding: 24px; }
          .footer-content { padding: 40px 24px 24px; }
          .footer-top { flex-direction: column; gap: 32px; }
        }
        @media (max-width: 640px) {
          .nav { grid-template-columns: auto 1fr auto; gap: 10px; }
          .nav-logo { font-size: 18px; }
          .btn-signup { display: none; }
          .page-container { padding: 32px 16px; }
          .page-title { font-size: 28px; }
          .prof-panel { width: calc(100vw - 32px); right: -12px; }
        }
      `}</style>

      {/* Navbar */}
      <div className="nav-wrap">
        <nav className="nav">
          <div className="nav-logo" onClick={() => navigate("/")}>Sharx</div>
          <div className="nav-search">
            <div className="nav-si-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input className="nav-si" type="text" placeholder="Search games..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="nav-r">
            {isLoggedIn ? (
              <div ref={profileRef} style={{ position: "relative" }}>
                <button className="prof-btn" onClick={openProfile}>
                  <Avatar body={body} eyes={eyes} color={color} size={34} animate />
                  <span className="prof-name">{username}</span>
                  <span className="prof-chevron">▼</span>
                </button>
                {showProfile && (
                  <div className="prof-panel" onClick={e => e.stopPropagation()}>
                    <div className="pp-top">
                      <button className="pp-close" onClick={() => setShowProfile(false)}>✕</button>
                      <button className="pp-done" onClick={saveProfile}>✓</button>
                      <Avatar body={pBody} eyes={pEyes} color={pColor} size={100} animate />
                      <div className="pp-info"><div className="pp-info-name">{editName || username}</div></div>
                    </div>
                    <div className="pp-name-wrap">
                      <input className="pp-input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name..." />
                    </div>
                    <div className="pp-tabs">
                      <button className={`pp-tab${profileTab === "body" ? " on" : ""}`} onClick={() => setProfileTab("body")}>Body</button>
                      <button className={`pp-tab${profileTab === "eyes" ? " on" : ""}`} onClick={() => setProfileTab("eyes")}>Eyes</button>
                      <button className={`pp-tab${profileTab === "color" ? " on" : ""}`} onClick={() => setProfileTab("color")}>Color</button>
                    </div>
                    <div className="pp-opts">
                      {profileTab === "body" && BODIES.map(b => (
                        <button key={b.id} className={`pp-opt${pBody === b.id ? " on" : ""}`} onClick={() => setPBody(b.id)}>
                          <svg width="100%" height="100%" viewBox="0 0 80 80">{b.el(pBody === b.id ? pColor : "#cbd5e1")}</svg>
                        </button>
                      ))}
                      {profileTab === "eyes" && EYES.map((_, i) => (
                        <button key={i} className={`pp-opt${pEyes === i ? " on" : ""}`} onClick={() => setPEyes(i)}>
                          <Avatar body={pBody} eyes={i} color={pColor} size={50} animate={false} />
                        </button>
                      ))}
                      {profileTab === "color" && COLORS.map(c => (
                        <button key={c.id} className={`pp-opt${pColor === c.hex ? " on" : ""}`} onClick={() => setPColor(c.hex)}>
                          <div className="pp-swatch" style={{ background: c.hex }} />
                        </button>
                      ))}
                    </div>
                    <div className="pp-foot">
                      <button className="pp-logout" onClick={logout}>Log out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn-signup" onClick={() => navigate("/signup")}>Sign Up</button>
                <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Page Content */}
      <div className="page-container">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
        <div className="page-content">
          {children}
        </div>
      </div>

      {/* Footer */}
      <SiteFooter />
    </>
  );
}

function SiteFooter() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo"><span>Sharx</span></div>
          </div>
          <div className="footer-links-group">
            <div className="footer-links">
              <h4>Explore</h4>
              <a onClick={() => navigate("/all-games")}>All Games</a>
              <a onClick={() => navigate("/new-games")}>New Games</a>
              <a onClick={() => navigate("/popular")}>Popular</a>
              <a onClick={() => navigate("/categories")}>Categories</a>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <a onClick={() => navigate("/about")}>About Us</a>
              <a onClick={() => navigate("/contact")}>Contact</a>
              <a onClick={() => navigate("/privacy")}>Privacy Policy</a>
              <a onClick={() => navigate("/terms")}>Terms of Service</a>
            </div>
            <div className="footer-links">
              <h4>Connect</h4>
              <a onClick={() => navigate("/twitter")}>Twitter</a>
              <a onClick={() => navigate("/discord")}>Discord</a>
              <a onClick={() => navigate("/instagram")}>Instagram</a>
              <a onClick={() => navigate("/youtube")}>YouTube</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">© {currentYear} Sharx. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}