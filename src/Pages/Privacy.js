import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronDown, ArrowLeft, Shield, Lock, Database, 
  Cookie, Fingerprint, BookOpen, Mail, Heart, ArrowUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Accordion Item ─── */
function AccordionItem({ item, index, openIndex, setOpen }) {
  const isOpen = openIndex === index;
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
  }, [isOpen]);

  return (
    <div className={`acc ${isOpen ? "acc-open" : ""}`} onClick={() => setOpen(isOpen ? null : index)}>
      <div className="acc-q">
        <span>{item.q}</span>
        <div className={`acc-chevron ${isOpen ? "flipped" : ""}`}>
          <ChevronDown size={15} />
        </div>
      </div>
      <div className="acc-body" style={{ height }}>
        <div ref={bodyRef} className="acc-a">{item.a}</div>
      </div>
    </div>
  );
}

export default function Privacy() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [openData, setOpenData] = useState(null);
  const [openCookie, setOpenCookie] = useState(null);
  const [openRights, setOpenRights] = useState(null);
  const [seenSections, setSeenSections] = useState(new Set([0]));
  const containerRef = useRef();
  const sectionRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    const observers = [];
    sectionRefs.forEach((ref, i) => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            setActiveSection(i);
            setSeenSections(prev => { const n = new Set(prev); n.add(i); return n; });
          }
        }),
        { threshold: 0.25 }
      );
      obs.observe(ref.current);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const goTo = (i) => {
    if (!sectionRefs[i]?.current) return;
    sectionRefs[i].current.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(i);
    setSeenSections(prev => { const n = new Set(prev); n.add(i); return n; });
  };

  const dataItems = [
    { q: "Account information", a: "When you sign up, we collect your name and email address. If you use Google Sign-In, we receive your name and email from Google." },
    { q: "Device & technical data", a: "We log basic technical data like your browser type and IP address only to keep the platform secure." },
    { q: "Support messages", a: "Any messages you send through the contact form are stored so we can reply to you." },
  ];

  const cookieItems = [
    { q: "Essential cookies", a: "These are required for login sessions. They store your authentication token so you stay logged in. You cannot opt out without losing access to your account." },
    { q: "How to manage cookies", a: "You can clear all cookies through your browser settings at any time. Clearing essential cookies will log you out of Playvora." },
  ];

  const rightsItems = [
    { q: "Access your data", a: "You can request a copy of your personal data by emailing us at playvora.help@gmail.com." },
    { q: "Correct your data", a: "You can update your name directly in your profile. For other corrections, email us at playvora.help@gmail.com." },
    { q: "Delete your account", a: "To delete your account, email us at playvora.help@gmail.com and we will remove your data." },
    { q: "Children under 13", a: "Playvora is not intended for children under 13. If you believe a child has signed up, contact us at playvora.help@gmail.com." },
    { q: "Security", a: "We protect your data with HTTPS encryption, bcrypt password hashing, and JWT authentication tokens." },
    { q: "Changes to this policy", a: "We may update this policy from time to time. Last updated: May 2026." },
    { q: "Contact us", a: "Any privacy questions? Email us at playvora.help@gmail.com." },
  ];

  const quickCards = [
    { icon: <Database size={22} />, label: "Why we use\nyour data", color: "#0ea5e9", i: 1 },
    { icon: <Cookie size={22} />, label: "How we use\ncookies", color: "#8b5cf6", i: 2 },
    { icon: <Fingerprint size={22} />, label: "Your privacy\nrights", color: "#f97316", i: 3 },
    { icon: <BookOpen size={22} />, label: "Our website\nrules", color: "#10b981", i: 3 },
  ];

  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .prv-root {
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%);
          scroll-behavior: smooth;
        }
        .prv-root::-webkit-scrollbar { width: 5px; }
        .prv-root::-webkit-scrollbar-track { background: transparent; }
        .prv-root::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }

        /* Crystals */
        .crystals-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .crystal { position: absolute; color: rgba(124, 58, 237, 0.12); }

        @keyframes floatLock {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(5deg); }
          66% { transform: translateY(10px) rotate(-5deg); }
        }
        @keyframes floatShield {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(12px) rotate(-4deg); }
          66% { transform: translateY(-8px) rotate(6deg); }
        }

        .lock-crystal  { animation: floatLock   14s ease-in-out infinite; }
        .shield-crystal{ animation: floatShield  16s ease-in-out infinite; }
        .lock-1  { width: 55px; height: 65px; top: 15%; left: 5%; }
        .lock-2  { width: 40px; height: 48px; bottom: 20%; right: 8%; animation-delay: 3s; }
        .shield-1{ width: 65px; height: 75px; top: 30%; right: 6%; }
        .shield-2{ width: 50px; height: 58px; bottom: 35%; left: 7%; animation-delay: 4s; }

        @media (max-width: 768px) {
          .lock-1, .shield-1 { display: none; }
          .lock-2, .shield-2 { opacity: 0.5; }
        }

        /* Navbar */
        .navbar {
          position: fixed;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          max-width: 1180px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(22px);
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.55);
          box-shadow: 0 6px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.7);
          z-index: 999;
          transition: all 0.25s ease;
        }
        .logo {
          font-family: 'Inter', sans-serif;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #1a2e44 0%, #2c4a6e 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          user-select: none;
        }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        .nav-btn {
          height: 38px;
          padding: 0 16px;
          border: none;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1a2e44;
          background: rgba(26,46,68,0.07);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nav-btn:hover { background: rgba(26,46,68,0.12); transform: translateY(-1px); }

        @media (max-width: 768px) {
          .navbar { width: calc(100% - 20px); padding: 8px 14px; }
          .logo { font-size: 16px; }
          .nav-btn { height: 34px; padding: 0 12px; font-size: 11px; }
        }
        @media (max-width: 480px) {
          .navbar { top: 12px; width: calc(100% - 16px); padding: 6px 12px; }
          .logo { font-size: 14px; }
          .nav-btn { height: 30px; padding: 0 10px; font-size: 10px; gap: 4px; }
        }

        /* Side Dots */
        .nav-dots {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 500;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .nav-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(26,46,68,0.25);
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-dot.active { background: #1a2e44; transform: scale(1.6); }

        @media (max-width: 768px) {
          .nav-dots { right: 12px; gap: 8px; }
          .nav-dot { width: 6px; height: 6px; }
        }
        @media (max-width: 480px) {
          .nav-dots { display: none; }
        }

        /* Sections */
        .section {
          min-height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 0 80px;
        }
        .wrap {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }

        @media (max-width: 1024px) { .wrap { padding: 0 32px; } }
        @media (max-width: 768px)  { .section { padding: 80px 0 60px; } .wrap { padding: 0 24px; } }
        @media (max-width: 560px)  { .section { padding: 70px 0 50px; } .wrap { padding: 0 16px; } }

        /* Animations */
        @keyframes fadeUp   { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:none; } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:none; } }

        /* Hero */
        .hero-inner {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title,
        .hero-btn,
        .quick-grid,
        .two-col {
          opacity: 0;
        }

        .seen .hero-title  { animation: fadeUp  0.55s ease forwards 0.00s; }
        .seen .hero-btn    { animation: fadeUp  0.55s ease forwards 0.10s; }
        .seen .quick-grid  { animation: fadeUp  0.55s ease forwards 0.20s; }
        .seen .two-col     { animation: fadeUp  0.50s ease forwards 0.00s; }

        .hero-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(32px, 6vw, 72px);
          font-weight: 800;
          color: #1a2e44;
          line-height: 1.1;
          margin-bottom: 40px;
        }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          background: #1a2e44;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(26,46,68,0.2);
          transition: all 0.3s ease;
        }
        .hero-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(26,46,68,0.28); }

        @media (max-width: 480px) {
          .hero-btn { padding: 10px 20px; font-size: 13px; gap: 8px; }
        }

        /* Quick Cards */
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          margin-top: 60px;
        }
        .quick-card {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 20px;
          padding: 24px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .quick-card:hover { background: white; transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.08); }
        .quick-card-icon {
          width: 48px; height: 48px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
          transition: transform 0.3s ease;
        }
        .quick-card:hover .quick-card-icon { transform: scale(1.08) rotate(-3deg); }
        .quick-card h3 {
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #1a2e44; line-height: 1.4;
          white-space: pre-line;
        }

        @media (max-width: 640px) {
          .quick-grid { gap: 12px; margin-top: 40px; grid-template-columns: repeat(2, 1fr); }
          .quick-card { padding: 18px 12px; }
          .quick-card-icon { width: 42px; height: 42px; }
          .quick-card h3 { font-size: 11px; }
        }
        @media (max-width: 380px) {
          .quick-grid { gap: 10px; }
          .quick-card { padding: 14px 10px; }
        }

        /* Two Column Layout */
        .two-col {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 56px;
          align-items: start;
        }
        .col-sticky { position: sticky; top: 100px; }
        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          background: rgba(26,46,68,0.06);
          border-radius: 100px;
          font-size: 11px; font-weight: 700;
          color: #1a2e44;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .col-num {
          font-family: 'Inter', sans-serif;
          font-weight: 800; font-size: 70px;
          color: rgba(26,46,68,0.05);
          line-height: 0.9; margin-bottom: -8px;
        }
        .col-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(24px, 4vw, 40px);
          font-weight: 800; color: #1a2e44;
          line-height: 1.15; margin-bottom: 14px;
        }
        .col-desc {
          font-size: 14px; color: rgba(26,46,68,0.6);
          line-height: 1.7; margin-bottom: 24px;
        }
        .back-top-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 24px;
          background: transparent;
          border: 1.5px solid rgba(26,46,68,0.15);
          border-radius: 100px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 600;
          color: #1a2e44;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .back-top-btn:hover { background: #1a2e44; color: #fff; border-color: #1a2e44; }

        @media (max-width: 900px) {
          .two-col { grid-template-columns: 1fr; gap: 32px; }
          .col-sticky { position: static; text-align: center; }
          .col-num { font-size: 60px; }
          .col-title br { display: none; }
          .section-tag { margin: 0 auto 16px; }
        }
        @media (max-width: 480px) {
          .col-num { font-size: 45px; }
          .col-title { font-size: 26px; }
          .col-desc { font-size: 13px; }
          .back-top-btn { padding: 7px 18px; font-size: 12px; }
        }

        /* Accordion */
        .acc {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.28s ease;
          overflow: hidden;
        }
        .acc:hover { background: rgba(255,255,255,0.9); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
        .acc.acc-open { background: white; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .acc-q {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          gap: 12px;
        }
        .acc-q span {
          font-size: clamp(13px, 4vw, 15px);
          font-weight: 600; color: #1a2e44; line-height: 1.4;
        }
        .acc-chevron {
          width: 28px; height: 28px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(26,46,68,0.08);
          color: #1a2e44;
          transition: transform 0.35s ease, background 0.25s;
          flex-shrink: 0;
        }
        .acc-chevron.flipped { transform: rotate(-180deg); background: #1a2e44; color: #fff; }
        .acc-body { height: 0; overflow: hidden; transition: height 0.38s ease; }
        .acc-a {
          padding: 13px 20px 18px;
          font-size: clamp(12px, 3.5vw, 14px);
          color: rgba(26,46,68,0.65);
          line-height: 1.65;
          border-top: 1px solid rgba(0,0,0,0.05);
        }

        @media (max-width: 480px) {
          .acc-q { padding: 12px 16px; }
          .acc-chevron { width: 24px; height: 24px; }
          .acc-chevron svg { width: 12px; }
          .acc-a { padding: 10px 16px 14px; }
        }

        /* ══════════════════════════════
           FOOTER — Same as Home Page (Clean)
        ══════════════════════════════ */
        .site-footer {
          position: relative;
          background: transparent;
          margin-top: 80px;
        }

        .footer-wave-wrap {
          display: block;
          line-height: 0;
          overflow: hidden;
        }
        .footer-wave-wrap svg {
          display: block;
          width: 100%;
          height: 90px;
        }

        .footer-body {
          background: #ffffff;
        }

        .footer-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 48px 48px;
        }

        .footer-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 0 36px;
          border-bottom: 1px solid #F1F5F9;
          gap: 28px;
          text-align: center;
        }

        .footer-logo {
          cursor: pointer;
          transition: all .3s ease;
          display: inline-block;
        }
        .footer-logo img {
          height: 42px;
          width: auto;
          display: block;
        }
        .footer-logo:hover { opacity: .7; transform: translateY(-2px); }

        .footer-socials {
          display: flex;
          gap: 24px;
          justify-content: center;
          align-items: center;
        }
        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #F1F5F9;
          cursor: pointer;
          transition: all .25s ease;
        }
        .social-icon svg {
          width: 20px;
          height: 20px;
          fill: #64748B;
          transition: all .25s ease;
        }
        .social-icon:hover {
          background: #1E293B;
          transform: translateY(-3px);
        }
        .social-icon:hover svg {
          fill: #ffffff;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          padding: 32px 0 0;
        }

        .footer-col {
          text-align: center;
        }

        .footer-col-title {
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #CBD5E1;
          margin: 0 0 16px;
        }

        .footer-link {
          display: inline-block;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #64748B;
          text-decoration: none;
          margin: 0 12px;
          cursor: pointer;
          transition: all .22s ease;
        }
        .footer-link:hover {
          color: #1E293B;
          transform: translateY(-1px);
        }

        .footer-bottom {
          padding-top: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .footer-copyright {
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #CBD5E1;
        }

        @media (max-width: 768px) {
          .footer-content { padding: 0 24px 40px; }
          .footer-link { margin: 0 8px; font-size: 13px; }
          .social-icon { width: 36px; height: 36px; }
          .social-icon svg { width: 18px; height: 18px; }
        }
        @media (max-width: 560px) {
          .footer-wave-wrap svg { height: 60px; }
          .footer-links { flex-direction: column; align-items: center; }
          .footer-link { display: block; margin: 8px 0; }
          .footer-bottom { padding-top: 24px; }
        }
      `}</style>

      <div className="prv-root" ref={containerRef}>

        {/* Crystals */}
        <div className="crystals-layer">
          <svg className="crystal lock-crystal lock-1" viewBox="0 0 60 70" fill="none">
            <rect x="8" y="30" width="44" height="32" rx="6" stroke="#7c3aed" strokeWidth="2.5" fill="none"/>
            <path d="M18 30V20a12 12 0 0 1 24 0v10" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="30" cy="46" r="4" fill="#7c3aed" fillOpacity="0.3"/>
          </svg>
          <svg className="crystal lock-crystal lock-2" viewBox="0 0 60 70" fill="none">
            <rect x="8" y="30" width="44" height="32" rx="6" stroke="#7c3aed" strokeWidth="2.5" fill="none"/>
            <path d="M18 30V20a12 12 0 0 1 24 0v10" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="30" cy="46" r="4" fill="#7c3aed" fillOpacity="0.3"/>
          </svg>
          <svg className="crystal shield-crystal shield-1" viewBox="0 0 80 90" fill="none">
            <path d="M40 5L8 18v24c0 20 13.6 38.8 32 44 18.4-5.2 32-24 32-44V18L40 5z" stroke="#7c3aed" strokeWidth="2.5" fill="none"/>
          </svg>
          <svg className="crystal shield-crystal shield-2" viewBox="0 0 80 90" fill="none">
            <path d="M40 5L8 18v24c0 20 13.6 38.8 32 44 18.4-5.2 32-24 32-44V18L40 5z" stroke="#7c3aed" strokeWidth="2.5" fill="none"/>
          </svg>
        </div>

        {/* Navbar */}
        <nav className="navbar">
          <div className="logo">playvora Privacy</div>
          <div className="nav-right">
            <button className="nav-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={12} strokeWidth={2.5} /> Back
            </button>
          </div>
        </nav>

        {/* Dots */}
        <div className="nav-dots">
          {[0,1,2,3].map(i => (
            <div key={i} className={`nav-dot ${activeSection === i ? "active" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>

        {/* SECTION 1 — Hero */}
        <div className={`section ${seenSections.has(0) ? "seen" : ""}`} ref={sectionRefs[0]}>
          <div className="wrap">
            <div className="hero-inner">
              <h1 className="hero-title">Your privacy<br />matters here.</h1>
              <button className="hero-btn" onClick={() => goTo(1)}>
                Let's roll! <ChevronDown size={16} />
              </button>
              <div className="quick-grid">
                {quickCards.map(({ icon, label, color, i }) => (
                  <div key={label} className="quick-card" onClick={() => goTo(i)}>
                    <div className="quick-card-icon" style={{ background: `${color}10`, color }}>{icon}</div>
                    <h3>{label}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — Data */}
        <div className={`section ${seenSections.has(1) ? "seen" : ""}`} ref={sectionRefs[1]}>
          <div className="wrap">
            <div className="two-col">
              <div className="col-sticky">
                <div className="col-num">01</div>
                <div className="section-tag"><Database size={12} /> Data we collect</div>
                <h2 className="col-title">Why we use<br />your data.</h2>
                <p className="col-desc">We collect only what's necessary to give you a secure, personalised gaming experience — nothing extra.</p>
              </div>
              <div>
                {dataItems.map((item, i) => (
                  <AccordionItem key={i} item={item} index={i} openIndex={openData} setOpen={setOpenData} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 — Cookies */}
        <div className={`section ${seenSections.has(2) ? "seen" : ""}`} ref={sectionRefs[2]}>
          <div className="wrap">
            <div className="two-col">
              <div className="col-sticky">
                <div className="col-num">02</div>
                <div className="section-tag"><Cookie size={12} /> Cookies & localStorage</div>
                <h2 className="col-title">How we use<br />cookies.</h2>
                <p className="col-desc">Minimal tracking only. We use cookies for what the platform needs to work and improve — that's it.</p>
              </div>
              <div>
                {cookieItems.map((item, i) => (
                  <AccordionItem key={i} item={item} index={i} openIndex={openCookie} setOpen={setOpenCookie} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 — Rights */}
        <div className={`section ${seenSections.has(3) ? "seen" : ""}`} ref={sectionRefs[3]}>
          <div className="wrap">
            <div className="two-col">
              <div className="col-sticky">
                <div className="col-num">03</div>
                <div className="section-tag"><Shield size={12} /> Your rights</div>
                <h2 className="col-title">Your privacy<br />rights.</h2>
                <p className="col-desc">You own your data completely. Here's what you can do with it and how we protect it.</p>
                <button className="back-top-btn" onClick={() => goTo(0)}>
                  <ArrowUp size={13} /> Back to top
                </button>
              </div>
              <div>
                {rightsItems.map((item, i) => (
                  <AccordionItem key={i} item={item} index={i} openIndex={openRights} setOpen={setOpenRights} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            FOOTER — Same as Home Page
        ══════════════════════════════ */}
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
               
                  <div className="social-icon" onClick={() => navigate("/discord")} title="Discord">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
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
<span className="footer-copyright">
  © {new Date().getFullYear()} Playvora. All rights reserved.
</span>              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}