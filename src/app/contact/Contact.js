"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        .page { min-height:100vh; display:flex; flex-direction:column; -webkit-font-smoothing:antialiased; }

        /* ── MAIN ── */
        .main {
          flex:1;
          position:relative;
          overflow:hidden;
          background:#f0f2f5;
          display:flex;
          flex-direction:column;
          padding:28px 48px 80px;
        }

        .blob {
          position:absolute; border-radius:50%;
          filter:blur(90px); pointer-events:none;
        }
        .blob-1 { width:480px;height:480px;background:rgba(0,210,160,0.20);top:-140px;left:-80px; }
        .blob-2 { width:400px;height:400px;background:rgba(160,140,255,0.16);top:10%;right:-60px; }
        .blob-3 { width:360px;height:360px;background:rgba(255,210,80,0.12);bottom:0;left:25%; }

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
          font-family:'Inter',sans-serif;
          font-size:20px; font-weight:800; color:#1a2e44;
        }
        .nav-back {
          height:38px; padding:0 16px; border:none; border-radius:999px;
          display:flex; align-items:center; gap:6px;
          font-family:'Inter',sans-serif; font-size:13px; font-weight:600; color:#1a2e44;
          background:rgba(26,46,68,0.07); cursor:pointer;
          transition:background .2s ease, transform .2s ease;
        }
        .nav-back:hover { background:rgba(26,46,68,0.13); transform:translateX(-2px); }
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
          font-family:'Nunito',sans-serif;
          font-size:clamp(30px,4.8vw,68px);
          font-weight:900;
          color:#1a2e44;
          letter-spacing:-1.5px;
          line-height:1;
          display:block;
          transition: color .3s ease, transform .3s ease;
        }

        .email-wrap:hover .email-text {
          color:#0ea5e9;
          transform:translateY(-4px);
        }

        .email-line {
          display:block;
          height:3px;
          border-radius:3px;
          background:#0ea5e9;
          width:0%;
          margin:8px auto 0;
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

        /* ==================== FOOTER ==================== */
        .site-footer {
          position: relative;
          background: transparent;
        }

        .footer-wave-wrap {
          display: block;
          line-height: 0;
          overflow: hidden;
        }
        .footer-wave-wrap svg {
          display: block;
          width: 100%;
          height: 0px;
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
          transition: opacity .3s ease, transform .3s ease;
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
          transition: background .25s ease, transform .25s ease;
        }
        .social-icon svg {
          width: 20px;
          height: 20px;
          fill: #64748B;
          transition: fill .25s ease;
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
          transition: color .22s ease, transform .22s ease;
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
          .main { padding:24px 24px 60px; }
          .footer-content { padding: 0 24px 40px; }
          .footer-link { margin: 0 8px; font-size: 13px; }
          .social-icon { width: 36px; height: 36px; }
          .social-icon svg { width: 18px; height: 18px; }
        }
        @media (max-width: 560px) {
          .main { padding:20px 16px 50px; }
          .footer-wave-wrap svg { height: 60px; }
          .footer-links { flex-direction: column; align-items: center; }
          .footer-link { display: block; margin: 8px 0; }
          .footer-bottom { padding-top: 24px; }
        }
      `}</style>

      <div className="page">
        <div className="main">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />

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
              onClick={() => window.location.href = "mailto:sharx.help@gmail.com"}
            >
              <span className="email-text">sharx.help@gmail.com</span>
              <span className="email-line" />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="site-footer">
          <div className="footer-wave-wrap">
            <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,58 C120,82 240,22 360,52 C480,82 600,16 720,46 C840,76 960,20 1080,50 C1200,80 1320,24 1440,54 L1440,90 L0,90 Z" fill="#ffffff"/>
            </svg>
          </div>

          <div className="footer-body">
            <div className="footer-content">
              <div className="footer-main">
                <div className="footer-logo" onClick={() => router.push("/")}>
                  <img src="/sharx.png" alt="Sharx" draggable={false} />
                </div>

                <div className="footer-socials">
                  <div className="social-icon" onClick={() => router.push("/instagram")} title="Instagram">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                  </div>
                  <div className="social-icon" onClick={() => router.push("/youtube")} title="YouTube">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="footer-links">
                <div className="footer-col">
                  <p className="footer-col-title">Company</p>
                  <Link href="/about" className="footer-link">About Us</Link>
                  <Link href="/contact" className="footer-link">Contact</Link>
                  <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                </div>
              </div>

              <div className="footer-bottom">
                <span className="footer-copyright">© {year} Sharx. All rights reserved.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}