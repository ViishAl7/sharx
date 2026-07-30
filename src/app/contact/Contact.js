"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Loaded on demand — only when someone actually clicks the YouTube icon,
// same pattern the homepage already uses for its footer social icons.
const SocialComingSoonModal = lazy(() => import("../../legacy/SocialComingSoonModal"));

export default function ContactPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [socialModal, setSocialModal] = useState(null);
  const year = new Date().getFullYear();

  const handleSocialClick = (platform) => setSocialModal(platform);
  const handleCloseSocialModal = () => setSocialModal(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        .page { min-height:100vh; display:flex; flex-direction:column; -webkit-font-smoothing:antialiased; font-family:'Comfortaa', sans-serif; }

        /* ── MAIN — warm coral/peach gradient background ── */
        .main {
          flex:1;
          position:relative;
          overflow:hidden;
          background: #ffffffff;
          display:flex;
          flex-direction:column;
          padding:28px 48px 80px;
        }

        /* ── NAV ── */
        .navbar {
          position:relative; z-index:10;
          display:flex; align-items:center; justify-content:space-between;
        }
        .nav-logo {
          cursor:pointer; display:flex; align-items:center;
          transition:opacity .2s ease; text-decoration:none;
        }
        .nav-logo:hover { opacity:.65; }
        .nav-logo img { height:70px; width:auto; display:block; }
        .nav-logo-text {
          font-family:'Comfortaa',sans-serif;
          font-size:20px; font-weight:800; color:#1a2e44;
        }
        .nav-back {
          height:38px; padding:0 16px; border:none; border-radius:999px;
          display:flex; align-items:center; gap:6px;
          font-family:'Comfortaa',sans-serif; font-size:13px; font-weight:600; color:#1a2e44;
          background:rgba(26,46,68,0.07); cursor:pointer;
          transition:background .2s ease, transform .2s ease;
        }
        .nav-back:hover { background:rgba(37,99,235,0.1); transform:translateX(-2px); }
        .nav-back:active { transform:translateX(-2px) scale(0.97); }

        /* ── HERO ── */
        .hero {
          position:relative; z-index:10; flex:1;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center; padding:56px 0 0;
        }

        .hero-eyebrow {
          font-size:16px; font-weight:600;
          color:rgba(26,46,68,0.45);
          margin-bottom:24px; opacity:0;
        }
        .hero-eyebrow.vis { animation:fadeUp .5s ease forwards; }

        .email-wrap {
          display:inline-block;
          cursor:pointer;
          margin-bottom:20px;
          opacity:0;
          padding:4px 0;
        }
        .email-wrap.vis { animation:fadeUp .55s .08s ease forwards; }

        .email-text {
          font-family:'Comfortaa',sans-serif;
          font-size:clamp(34px,6vw,80px);
          font-weight:900;
          color:#1a2e44;
          letter-spacing:-1.8px;
          line-height:1;
          display:block;
          transition: color .3s ease, transform .3s ease;
        }

        .email-wrap:hover .email-text {
          color:#2563EB;
          transform:translateY(-4px);
        }

        .email-line {
          display:block;
          height:4px;
          border-radius:4px;
          background:#2563EB;
          width:0%;
          margin:12px auto 0;
          transition:width .4s cubic-bezier(.23,1,.32,1);
        }
        .email-wrap:hover .email-line { width:100%; }

        .hero-hint {
          font-size:14px; font-weight:500;
          color:rgba(26,46,68,0.38); opacity:0;
        }
        .hero-hint.vis { animation:fadeUp .5s .16s ease forwards; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* ══════════════════════════════════════════════════════════════
           FOOTER — matches Privacy page's footer structure/animation
           exactly (shark-tank hover, water wave, bubbles, droplets,
           splash rings, crystal-top banner).

           FIX APPLIED: .site-footer now has an explicit background
           (#EAE3F2 — the same color .main's gradient fades into) so
           the area behind .footer-crystal-top is no longer transparent.
           Without this, whatever sits behind the page (browser chrome /
           black canvas) showed through as a black band above the
           footer. Setting this to match .main's last gradient stop
           makes the coral crystal patti appear to flow directly out
           of the hero section, seamlessly, instead of floating over
           a black gap.
        ══════════════════════════════════════════════════════════════ */
        .site-footer {
          --sx-sky: #BFDBFE;
          --sx-deep: #1a2e44;
          --sx-deep-rgb: 26, 46, 68;
          --sx-accent: #2563EB;

          position: relative;
          margin-top: -1px;
          width: 100%;
          background: #FFFFFF;
        }

        .footer-crystal-top {
          position: relative;
          width: 100%;
          height: 90px;
          margin-bottom: -2px;
          overflow: hidden;
          z-index: 2;
          pointer-events: none;
          background: #FFFFFF;
        }

        .crystal-poly-svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .footer-body {
          background: #FFFFFF;
          border-top: none;
          position: relative;
        }

        .footer-content { max-width: 1100px; margin: 0 auto; padding: 0 40px 48px; position: relative; z-index: 1; }
        .footer-main { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px 0 32px; gap: 28px; text-align: center; }
        .footer-logo { display: flex; align-items: center; justify-content: center; height: 34px; overflow: hidden; cursor: pointer; transition: transform .35s cubic-bezier(.2,.9,.4,1.1); }
        .footer-logo img { height: 76px; width: auto; display: block; object-fit: contain; transition: filter .35s cubic-bezier(.2,.9,.4,1.1); }
        .footer-logo:hover { transform: scale(1.05); }
        .footer-logo:hover img { filter: drop-shadow(0 4px 10px rgba(37, 99, 235, 0.25)); }

        .shark-tank { position: relative; display: flex; align-items: center; justify-content: center; height: 60px; overflow: visible; cursor: pointer; }
        .shark-tank .footer-logo { position: relative; z-index: 4; }
        .shark-reflection {
          position: absolute; top: 56%; left: 50%; transform: translateX(-50%) scaleY(-1);
          width: 50px; height: 30px; overflow: hidden; opacity: 0; z-index: 1;
          filter: blur(1px) brightness(.7); pointer-events: none;
          -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,.5), transparent);
          mask-image: linear-gradient(to bottom, rgba(0,0,0,.5), transparent);
          transition: opacity .35s ease;
        }
        .shark-reflection img { height: 76px; width: auto; display: block; margin: 0 auto; }
        .shark-tank:hover .shark-reflection { opacity: 1; }
        .shark-tank:hover .shark-reflection img { animation: sharkSwim 1.1s ease-in-out infinite; }

        .water-wrap {
          position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
          width: 110px; height: 24px; overflow: hidden; border-radius: 0 0 55px 55px;
          opacity: 0; transition: opacity .3s ease; z-index: 2; pointer-events: none;
        }
        .shark-tank:hover .water-wrap { opacity: 1; }
        .wave-svg { position: absolute; top: 0; left: 0; width: 170%; height: 100%; }
        .wave-back { fill: var(--sx-sky); opacity: .55; animation: waveScroll 5s linear infinite; }
        .wave-front { fill: var(--sx-deep); opacity: .9; animation: waveScroll 3.2s linear infinite reverse; }
        .foam-line { position: absolute; top: 1px; left: -10%; width: 120%; height: 3px; background: rgba(255,255,255,.8); border-radius: 100px; filter: blur(1.5px); animation: waveScroll 3.2s linear infinite reverse; }

        .splash-rings { position: absolute; bottom: 18px; left: 50%; width: 0; height: 0; z-index: 3; pointer-events: none; }
        .ring { position: absolute; top: 0; left: 0; width: 8px; height: 8px; margin: -4px; border: 1.5px solid rgba(37, 99, 235, .8); border-radius: 50%; transform: translate(-50%,-50%) scale(0); opacity: 0; }
        .shark-tank:hover .ring { animation: ringPop .65s ease-out forwards; }
        .shark-tank:hover .ring.r2 { animation-delay: .08s; }
        .shark-tank:hover .ring.r3 { animation-delay: .16s; }

        .droplets { position: absolute; bottom: 20px; left: 50%; width: 0; height: 0; z-index: 5; pointer-events: none; }
        .drop { position: absolute; top: 0; left: 0; width: 3px; height: 3px; border-radius: 50%; background: #DBEAFE; opacity: 0; }
        .shark-tank:hover .drop { animation: dropFly .5s ease-out forwards; }
        .shark-tank:hover .drop.d1 { --dx: -13px; --dy: -15px; }
        .shark-tank:hover .drop.d2 { --dx: -4px; --dy: -19px; animation-delay: .05s; }
        .shark-tank:hover .drop.d3 { --dx: 5px; --dy: -18px; animation-delay: .1s; }
        .shark-tank:hover .drop.d4 { --dx: 14px; --dy: -14px; animation-delay: .05s; }

        .bubble { position: absolute; bottom: 10px; width: 4px; height: 4px; background: rgba(255,255,255,.85); border-radius: 50%; opacity: 0; z-index: 3; pointer-events: none; }
        .bubble.b1 { left: 30% } .bubble.b2 { left: 44% } .bubble.b3 { left: 57% } .bubble.b4 { left: 70% }
        .shark-tank:hover .bubble { animation: bubbleRise 2s ease-in infinite; }
        .shark-tank:hover .bubble.b2 { animation-delay: .4s; }
        .shark-tank:hover .bubble.b3 { animation-delay: .85s; }
        .shark-tank:hover .bubble.b4 { animation-delay: 1.25s; }
        .shark-tank:hover .footer-logo img { animation: sharkSwim 1.1s ease-in-out infinite; transform-origin: 50% 70%; }

        .footer-socials { display: flex; gap: 6px; padding: 6px; border-radius: 100px; background: #FFFFFF; border: 1px solid rgba(226, 232, 240, 0.8); }
        .social-icon {
          display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;
          border-radius: 50%; background: transparent; cursor: pointer; border: none;
          transition: background .3s cubic-bezier(.2,.9,.4,1.1), transform .3s cubic-bezier(.2,.9,.4,1.1), box-shadow .3s cubic-bezier(.2,.9,.4,1.1);
        }
        .social-icon svg { width: 17px; height: 17px; fill: #1a2e44; transition: fill .3s cubic-bezier(.2,.9,.4,1.1); }
        .social-icon:hover { background: #000000; transform: translateY(-4px) scale(1.12) rotate(5deg); box-shadow: 0 6px 16px rgba(var(--sx-deep-rgb), .35); }
        .social-icon:hover svg { fill: #fff; }
        .social-icon:nth-child(1) { animation: softBounce .5s ease .2s both; }
        .social-icon:nth-child(2) { animation: softBounce .5s ease .3s both; }

        .footer-links { display: flex; justify-content: center; gap: 60px; padding: 36px 0 0; flex-wrap: wrap; }
        .footer-col { text-align: center; }
        .footer-col-title { font-family:'Comfortaa',sans-serif; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #64748B; margin: 0 0 10px 0; }
        .footer-col-links { display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap; }
        .footer-link { display: inline-block; font-family:'Comfortaa',sans-serif; font-size: 13px; font-weight: 700; color: #475569; text-decoration: none; cursor: pointer; transition: color .2s ease; position: relative; }
        .footer-link:hover { color: #0F172A; text-decoration: underline; }
        .footer-bottom { padding-top: 28px; display: flex; align-items: center; justify-content: center; text-align: center; }
        .footer-copyright { font-family:'Comfortaa',sans-serif; font-size: 12px; font-weight: 700; color: #64748B; letter-spacing: .3px; transition: color .2s ease; }
        .footer-copyright:hover { color: #0F172A; }

        @keyframes sharkSwim {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-2px) rotate(-2deg); }
          75% { transform: translateX(2px) rotate(2deg); }
        }
        @keyframes waveScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-41%); }
        }
        @keyframes ringPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: .8; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
        @keyframes dropFly {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }
        @keyframes bubbleRise {
          0% { transform: translateY(0) scale(.6); opacity: 0; }
          15% { opacity: .9; }
          100% { transform: translateY(-42px) scale(1); opacity: 0; }
        }
        @keyframes softBounce {
          0% { transform: translateY(6px); opacity: 0; }
          60% { transform: translateY(-2px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .main { padding:24px 24px 60px; }
          .footer-crystal-top { height: 60px; }
          .footer-content { padding: 0 20px 36px; }
          .footer-links { gap: 36px; }
          .footer-col-links { gap: 16px; }
          .footer-logo { height: 28px; }
          .footer-logo img { height: 62px; }
          .social-icon { width: 36px; height: 36px; }
          .social-icon svg { width: 15px; height: 15px; }
        }
        @media (max-width: 560px) {
          .main { padding:20px 16px 50px; }
          .footer-links { flex-direction: column; align-items: center; gap: 20px; }
          .footer-bottom { padding-top: 24px; }
        }
      `}</style>

      <div className="page">
        <div className="main">
          {/* NAV */}
          <nav className="navbar">
            <div className="nav-logo" onClick={() => router.push("/")}>
              <img
                src="/sharx.png" alt="Sharx"
                onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="block"; }}
              />
              <span className="nav-logo-text" style={{ display:"none" }}>Sharx</span>
            </div>
            <button className="nav-back" onClick={() => router.back()}>
              <ArrowLeft size={12} strokeWidth={2.5} /> Back
            </button>
          </nav>

          {/* HERO */}
          <div className="hero">
            <div className={`hero-eyebrow${visible ? " vis" : ""}`}>
              Connect With Us Anytime
            </div>

            <div
              className={`email-wrap${visible ? " vis" : ""}`}
              onClick={() => window.location.href = "mailto:hello@sharx.in"}
            >
              <span className="email-text">hello@sharx.in</span>
              <span className="email-line" />
            </div>
          </div>
        </div>

        {/* FOOTER — matches Privacy page's footer exactly */}
        <footer className="site-footer">
          <div className="footer-crystal-top" aria-hidden="true">
            <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="crystal-poly-svg">
              <polygon points="0,45 320,5 560,60 1440,20 1440,90 0,90" fill="#BFDBFE" opacity="0.7" />
              <polygon points="320,5 560,60 420,90" fill="#DBEAFE" opacity="0.55" />
              <polygon points="0,70 300,18 440,82 1440,25 1440,90 0,90" fill="#FFFFFF" />
              <polygon points="300,18 440,82 300,82" fill="#F8FAFC" opacity="0.6" />
            </svg>
          </div>

          <div className="footer-body">
            <div className="footer-content">
              <div className="footer-main">

                <div className="shark-tank" onClick={() => router.push("/")}>
                  <div className="footer-logo">
                    <img src="/sharx-logo.png" alt="Sharx" draggable={false} />
                  </div>
                  <div className="shark-reflection">
                    <img src="/sharx-logo.png" alt="" draggable={false} />
                  </div>
                  <div className="water-wrap">
                    <svg className="wave-svg" viewBox="0 0 200 24" preserveAspectRatio="none">
                      <path className="wave-back" d="M0,12 Q25,2 50,12 T100,12 T150,12 T200,12 L200,24 L0,24 Z" />
                      <path className="wave-front" d="M0,16 Q25,8 50,16 T100,16 T150,16 T200,16 L200,24 L0,24 Z" />
                    </svg>
                    <div className="foam-line" />
                  </div>
                  <div className="splash-rings">
                    <div className="ring r1" />
                    <div className="ring r2" />
                    <div className="ring r3" />
                  </div>
                  <div className="droplets">
                    <div className="drop d1" />
                    <div className="drop d2" />
                    <div className="drop d3" />
                    <div className="drop d4" />
                  </div>
                  <div className="bubble b1" />
                  <div className="bubble b2" />
                  <div className="bubble b3" />
                  <div className="bubble b4" />
                </div>

                <div className="footer-socials">
                  <div
                    className="social-icon"
                    onClick={() => window.open("https://www.instagram.com/sharx__games?igsh=NWU3Zm9udDR3NHd4", "_blank", "noopener,noreferrer")}
                    title="Instagram"
                  >
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                  </div>
                  <div className="social-icon" onClick={() => handleSocialClick("youtube")} title="YouTube">
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
                    <Link href="/about" className="footer-link">About Us</Link>
                    <Link href="/contact" className="footer-link">Contact</Link>
                    <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                  </div>
                </div>
              </div>

              <div className="footer-bottom">
                <span className="footer-copyright">© {year} Sharx. All rights reserved.</span>
              </div>
            </div>
          </div>
        </footer>

        {socialModal && (
          <Suspense fallback={null}>
            <SocialComingSoonModal platform={socialModal} onClose={handleCloseSocialModal} />
          </Suspense>
        )}
      </div>
    </>
  );
}