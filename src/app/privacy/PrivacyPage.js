"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  ChevronDown, ArrowLeft, Shield, Database,
  Cookie, Fingerprint, ArrowUp, Home
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRIVACY_EMAIL = "hello@sharx.in";
const LAST_UPDATED = "Sept 2026";

const QUICK_CARDS = [
  { icon: <Database size={20} strokeWidth={2.2} />, label: "What we collect", color: "#D4F5E7", accent: "#0EA56B", i: 1 },
  { icon: <Cookie size={20} strokeWidth={2.2} />, label: "Cookies & storage", color: "#EAE0FF", accent: "#7C4DFF", i: 2 },
  { icon: <Fingerprint size={20} strokeWidth={2.2} />, label: "Your rights", color: "#FFE0DA", accent: "#FF5A4A", i: 3 },
  { icon: <Shield size={20} strokeWidth={2.2} />, label: "Security", color: "#FFF2CC", accent: "#E8A100", i: 3 },
];

const DATA_ITEMS = [
  { q: "Account information", a: "When you create an account, we collect your name and email address. If you sign in using Google, we receive your name, email address, and profile identifier from Google. We do not receive or store your Google password. Your account creation date and basic preferences are also stored so your account works as expected." },
  { q: "Device and technical information", a: "We log basic technical information — such as your browser type, device type, operating system, and IP address — to keep the platform secure, diagnose errors, and prevent abuse. Some of this information may be processed automatically when you load the site or play a game." },
  { q: "Usage information", a: "We may keep basic usage information such as which games you open and your recent activity, so features like your history and saved preferences can work correctly." },
  { q: "Support and contact information", a: "If you contact us through the contact form or email, we collect your name, email address, and the content of your message so we can respond to you." },
  { q: "Information from third-party sign-in", a: "If you sign in with Google, we receive limited information from Google to create and manage your account. Google's own privacy policy also applies to how they handle your data. We never receive or store your Google password." }
];

const COOKIE_ITEMS = [
  { q: "Essential cookies and storage", a: "We use essential cookies and browser storage (such as localStorage) to keep you signed in, remember your session, and protect your account. Without these, the platform cannot work correctly. These are not used for advertising or unrelated tracking." },
  { q: "Preference storage", a: "We may store basic preferences — such as your chosen display settings, recently viewed games, or profile details — so the site feels consistent when you return." },
  { q: "Analytics", a: "We do not currently run a dedicated analytics provider. If this changes in the future, this section will be updated before any such tool is added." },
  { q: "How to manage cookies and storage", a: "You can clear cookies and site data from your browser settings at any time. Clearing essential cookies will sign you out and may reset saved preferences. Some browser settings may block certain features from working properly." }
];

const RIGHTS_ITEMS = [
  { q: "Access your information", a: `You can request a copy of the personal information we hold about you by contacting us at ${PRIVACY_EMAIL}. We will respond within a reasonable time.` },
  { q: "Correct your information", a: `You can update your name directly from your profile. For other corrections, contact us at ${PRIVACY_EMAIL} and we will help where we can.` },
  { q: "Delete your account", a: `You can request account deletion by contacting us at ${PRIVACY_EMAIL}. We will remove your account and associated personal data, except where we are required to keep certain information for legal, security, or fraud-prevention reasons. Some data may remain in backups for a limited time before being overwritten.` },
  { q: "Withdraw consent", a: "Where we rely on your consent, you can withdraw it at any time. Withdrawing consent may affect features that depend on it, including your account." },
  { q: "Children and younger users", a: `SHARX is not intended to knowingly collect personal information from children without the required safeguards. If you are a parent or guardian and believe a child has provided personal information improperly, please contact us at ${PRIVACY_EMAIL} and we will review and take appropriate action.` },
  { q: "Security", a: "We use reasonable technical and organisational measures designed to protect information against unauthorised access, loss, misuse, or alteration. These include HTTPS encryption in transit, hashed password storage, and authentication tokens. No method of transmission over the internet is completely secure, and we cannot guarantee absolute security." },
  { q: "Changes to this policy", a: `We may update this policy from time to time. When we make meaningful changes, we will update the "Last updated" date at the top of this page. We encourage you to review this page periodically.` },
  { q: "Contact us about privacy", a: `For any privacy-related question or request, email us at ${PRIVACY_EMAIL}. We try to respond as quickly as we can.` }
];

const AccordionItem = memo(function AccordionItem({ item, isOpen, onToggle, id }) {
  const panelId = `acc-panel-${id}`;
  const buttonId = `acc-btn-${id}`;
  return (
    <div className={`acc ${isOpen ? "acc-open" : ""}`}>
      <button
        type="button"
        id={buttonId}
        className="acc-q"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>{item.q}</span>
        <span className={`acc-chevron ${isOpen ? "flipped" : ""}`} aria-hidden="true">
          <ChevronDown size={16} strokeWidth={2.6} />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`acc-body ${isOpen ? "open" : ""}`}
      >
        <div className="acc-body-inner">
          <div className="acc-a">{item.a}</div>
        </div>
      </div>
    </div>
  );
});

export default function Privacy() {
  const router = useRouter();
  const [openData, setOpenData] = useState(null);
  const [openCookie, setOpenCookie] = useState(null);
  const [openRights, setOpenRights] = useState(null);
  const [seenSections, setSeenSections] = useState(() => new Set([0]));
  const [navHidden, setNavHidden] = useState(false);

  const section0 = useRef(null);
  const section1 = useRef(null);
  const section2 = useRef(null);
  const section3 = useRef(null);
  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);
  const sectionRefs = [section0, section1, section2, section3];

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined") window.history.back();
  }, []);

  const goHome = useCallback(() => router.push("/"), [router]);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setSeenSections(new Set([0, 1, 2, 3]));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sectionRefs.findIndex((r) => r.current === entry.target);
          if (index === -1) continue;
          setSeenSections((prev) => {
            if (prev.has(index)) return prev;
            const next = new Set(prev);
            next.add(index);
            return next;
          });
        }
      },
      { threshold: 0.3, rootMargin: "0px" }
    );
    sectionRefs.forEach((r) => r.current && observer.observe(r.current));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const y = el.scrollTop;
        const delta = y - lastScrollY.current;
        if (y > 120 && delta > 8) setNavHidden(true);
        else if (delta < -8 || y < 80) setNavHidden(false);
        lastScrollY.current = y;
        rafId = null;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const goTo = useCallback((i) => {
    if (i < 0 || i > 3) return;
    const el = sectionRefs[i]?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setSeenSections((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after {
          margin: 0; padding: 0; box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        :root {
          --ink: #1B2A41;
          --ink-soft: #5A6B82;
          --ink-mute: #98A6B8;
          --blue: #2E7FE8;
          --yellow: #FFD966;
          --yellow-soft: #FFF2CC;
          --coral: #FF8B7B;
          --coral-deep: #DC4A3A;
          --coral-soft: #FFE0DA;
          --mint: #7BE5B5;
          --mint-soft: #D4F5E7;
          --lilac: #C7B4FF;
          --lilac-soft: #EAE0FF;
          --paper: #FFFDF7;
          --cream: #FBF8F2;
          --border: 1.5px solid var(--ink);
          --shadow-sm: 2px 2px 0 var(--ink);
          --shadow-md: 3px 3px 0 var(--ink);
          --shadow-lg: 4px 4px 0 var(--ink);
        }

        body { font-family: var(--font-comfortaa), "Comic Sans MS", cursive; }

        .cw {
          position: fixed;
          inset: 0;
          overflow-y: auto;
          overflow-x: hidden;
          font-family: var(--font-comfortaa), sans-serif;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          background: var(--cream);
          transform: translateZ(0);
          overscroll-behavior-y: none;
        }
        .cw::-webkit-scrollbar { width: 6px; }
        .cw::-webkit-scrollbar-thumb { background: rgba(27,42,65,0.15); border-radius: 10px; }

        .cw-inner {
          position: relative;
          min-height: 100%;
          padding-bottom: 24px;
        }

        .section {
          min-height: 100vh;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 96px 0 72px;
          content-visibility: auto;
          contain-intrinsic-size: 100vh;
          overflow: hidden;
        }

        .s1 {
          background:
            radial-gradient(ellipse 65% 45% at 20% 15%, rgba(255, 224, 218, 0.32), transparent 65%),
            linear-gradient(170deg, #FFFDF9 0%, #FBF8F2 50%, #FDFAF3 100%);
        }
        .s2 {
          background:
            radial-gradient(ellipse 65% 45% at 80% 20%, rgba(212, 245, 231, 0.32), transparent 65%),
            linear-gradient(170deg, #FFFDF9 0%, #FBF8F2 50%, #FDFAF3 100%);
        }
        .s3 {
          background:
            radial-gradient(ellipse 65% 45% at 20% 15%, rgba(234, 224, 255, 0.32), transparent 65%),
            linear-gradient(170deg, #FFFDF9 0%, #FBF8F2 50%, #FDFAF3 100%);
        }
        .s4 {
          background:
            radial-gradient(ellipse 65% 45% at 80% 20%, rgba(255, 242, 204, 0.32), transparent 65%),
            linear-gradient(170deg, #FFFDF9 0%, #FBF8F2 50%, #FDFAF3 100%);
        }

        .section::before {
          content: "";
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 0 0, rgba(27, 42, 65, 0.11) 1.2px, transparent 1.7px);
          background-size: 28px 28px;
          opacity: 0.7;
          pointer-events: none;
        }

        @keyframes drawIn {
          0%   { opacity: 0; transform: translate3d(0, 20px, 0); }
          70%  { opacity: 1; transform: translate3d(0, -2px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes footerRise {
          0%   { opacity: 0; transform: translate3d(0, 40px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        .hero-inner, .hero-btn-wrap, .quick-grid, .two-col { opacity: 0; will-change: opacity, transform; position: relative; z-index: 1; }
        .seen .hero-inner { animation: drawIn 0.65s cubic-bezier(.34,1.3,.4,1) forwards 0.05s; }
        .seen .hero-btn-wrap { animation: drawIn 0.65s cubic-bezier(.34,1.3,.4,1) forwards 0.18s; }
        .seen .quick-grid  { animation: drawIn 0.65s cubic-bezier(.34,1.3,.4,1) forwards 0.30s; }
        .seen .two-col     { animation: drawIn 0.65s cubic-bezier(.34,1.3,.4,1) forwards 0.10s; }

        /* ─── HEADER ─── */
        .navbar {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 48px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          height: 90px;
          background: transparent;
          border: 0;
          border-radius: 0;
          box-shadow: none;
          transform: none;
          transition: none;
        }
        .navbar.hidden {
          transform: none;
          opacity: 1;
          pointer-events: auto;
        }
        .logo {
          display: flex;
          align-items: center;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          transition: opacity 0.2s ease;
        }
        .logo:hover { opacity: 0.75; }
        .logo img {
          height: 62px;
          width: auto;
          object-fit: contain;
          display: block;
        }

        .nav-btn {
          height: 40px;
          padding: 0 20px;
          border: var(--border);
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: var(--ink);
          background: var(--paper);
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(.34,1.3,.4,1), box-shadow 0.22s, background 0.22s;
          box-shadow: var(--shadow-sm);
        }
        .nav-btn:hover {
          background: var(--yellow);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
        }
        .nav-btn:active { transform: translate3d(0,0,0); box-shadow: var(--shadow-sm); }

        @media (max-width: 768px) {
          .navbar { padding: 22px 22px 0; height: 84px; }
          .logo img { height: 58px; }
        }
        @media (max-width: 560px) {
          .navbar { padding: 18px 18px 0; height: 78px; }
          .logo img { height: 54px; }
          .nav-btn { height: 38px; padding: 0 17px; font-size: 12.5px; }
        }

        .wrap {
          position: relative; z-index: 10;
          width: 100%; max-width: 1160px;
          margin: 0 auto;
          padding: 0 40px;
        }
        @media (max-width: 768px) { .wrap { padding: 0 22px; } }
        @media (max-width: 560px) { .wrap { padding: 0 18px; } }

        /* ─── HERO ─── */
        .hero-inner { text-align: center; max-width: 820px; margin: 0 auto; }
        .hero-title {
          font-size: clamp(36px, 6.5vw, 76px);
          font-weight: 800; color: var(--ink);
          line-height: 1.08; letter-spacing: -1px;
          margin-bottom: 24px;
          font-family: var(--font-comfortaa), sans-serif;
          position: relative;
        }
        .hero-title .hl {
          display: inline-block;
          position: relative;
          padding: 0 4px;
          color: #0EA56B;
          z-index: 1;
        }
        .hero-title .hl::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -4px;
          height: 6px;
          background: var(--yellow);
          border-radius: 999px;
          transform: rotate(-1deg);
          z-index: -1;
        }
        .hero-title .hl-coral {
          display: inline-block;
          position: relative;
          padding: 0 4px;
          color: #E4572E;
          z-index: 1;
        }
        .hero-title .hl-coral::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -4px;
          height: 6px;
          background: var(--mint);
          border-radius: 999px;
          transform: rotate(1deg);
          z-index: -1;
        }
        .hero-title .hl-lilac {
          display: inline-block;
          position: relative;
          padding: 0 4px;
          color: #7C4DFF;
          z-index: 1;
        }
        .hero-title .hl-lilac::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -4px;
          height: 6px;
          background: var(--coral);
          border-radius: 999px;
          transform: rotate(-0.8deg);
          z-index: -1;
        }

        .hero-sub {
          font-size: clamp(15px, 1.8vw, 18px);
          color: var(--ink-soft);
          line-height: 1.7;
          font-weight: 600;
          max-width: 640px;
          margin: 0 auto 24px;
        }
        .hero-meta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: var(--paper);
          border: var(--border);
          border-radius: 100px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12px;
          font-weight: 800;
          color: var(--ink-soft);
          box-shadow: var(--shadow-sm);
          margin-bottom: 40px;
        }
        .hero-meta-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--mint);
          border: 1.5px solid var(--ink);
        }
        .hero-btn-wrap { display: flex; justify-content: center; }
        .hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 22px 14px 30px;
          background: var(--yellow);
          color: var(--ink);
          font-size: 16px;
          font-weight: 800;
          border-radius: 100px;
          border: var(--border);
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: transform 0.26s cubic-bezier(.34,1.4,.4,1), box-shadow 0.26s, background 0.26s;
          font-family: var(--font-comfortaa), sans-serif;
        }
        .hero-btn:hover {
          transform: translate3d(-2px, -2px, 0) rotate(-1.5deg);
          box-shadow: var(--shadow-lg);
          background: var(--coral);
        }
        .hero-btn:active { transform: translate3d(0, 0, 0); box-shadow: var(--shadow-md); }
        .hero-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--paper);
          border: 2px solid var(--ink);
          color: var(--ink);
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(.34,1.4,.4,1);
        }
        .hero-btn:hover .hero-btn-icon { transform: rotate(180deg); }
        .hero-btn-icon svg { width: 16px; height: 16px; }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 14px;
          margin-top: 40px;
        }
        .quick-card {
          background: var(--paper);
          border: var(--border);
          border-radius: 20px;
          padding: 22px 16px;
          text-align: center;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: transform 0.28s cubic-bezier(.34,1.4,.4,1), box-shadow 0.28s;
        }
        .quick-card:hover {
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-lg);
        }
        .quick-card-icon {
          width: 46px; height: 46px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
          border: var(--border);
        }
        .quick-card h3 {
          font-size: 12.5px; font-weight: 800;
          color: var(--ink); line-height: 1.4;
          font-family: var(--font-comfortaa), sans-serif;
        }
        @media (max-width: 640px) {
          .quick-grid { gap: 10px; margin-top: 28px; grid-template-columns: repeat(2, 1fr); }
          .quick-card { padding: 18px 10px; border-radius: 18px; }
          .quick-card-icon { width: 42px; height: 42px; }
          .quick-card h3 { font-size: 11.5px; }
        }

        .two-col {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 56px;
          align-items: start;
        }
        .col-sticky { position: sticky; top: 110px; }
        .col-num {
          font-weight: 900;
          font-size: 72px;
          line-height: 0.9;
          margin-bottom: -6px;
          font-family: var(--font-comfortaa), sans-serif;
          color: transparent;
          -webkit-text-stroke: 2px rgba(27, 42, 65, 0.14);
        }
        .section-tag {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px;
          background: var(--paper);
          border: var(--border);
          border-radius: 100px;
          font-size: 11px; font-weight: 800;
          color: var(--ink);
          text-transform: uppercase;
          margin-bottom: 16px;
          box-shadow: var(--shadow-sm);
          font-family: var(--font-comfortaa), sans-serif;
          letter-spacing: 0.5px;
        }
        .col-title {
          font-size: clamp(28px, 4.2vw, 44px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.12;
          letter-spacing: -0.8px;
          margin-bottom: 14px;
          font-family: var(--font-comfortaa), sans-serif;
        }
        .col-title .hl-green {
          display: inline-block;
          position: relative;
          padding: 0 3px;
          color: #0EA56B;
          z-index: 1;
        }
        .col-title .hl-green::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -4px;
          height: 5px;
          background: var(--mint);
          border-radius: 999px;
          transform: rotate(-1deg);
          z-index: -1;
        }
        .col-title .hl-lilac {
          display: inline-block;
          position: relative;
          padding: 0 3px;
          color: #7C4DFF;
          z-index: 1;
        }
        .col-title .hl-lilac::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -4px;
          height: 5px;
          background: var(--lilac);
          border-radius: 999px;
          transform: rotate(1deg);
          z-index: -1;
        }
        .col-title .hl-coral {
          display: inline-block;
          position: relative;
          padding: 0 3px;
          color: #E4572E;
          z-index: 1;
        }
        .col-title .hl-coral::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -4px;
          height: 5px;
          background: var(--coral);
          border-radius: 999px;
          transform: rotate(-0.8deg);
          z-index: -1;
        }

        .col-desc {
          font-size: 14.5px;
          color: var(--ink-soft);
          line-height: 1.7;
          margin-bottom: 24px;
          font-weight: 600;
        }
        .back-top-btn {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 11px 22px;
          background: var(--paper);
          border: var(--border);
          border-radius: 100px;
          font-size: 13px; font-weight: 800;
          color: var(--ink);
          cursor: pointer;
          transition: transform 0.26s cubic-bezier(.34,1.4,.4,1), box-shadow 0.26s, background 0.26s;
          box-shadow: var(--shadow-sm);
          font-family: var(--font-comfortaa), sans-serif;
        }
        .back-top-btn:hover {
          background: var(--yellow);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
        }

        @media (max-width: 900px) {
          .two-col { grid-template-columns: 1fr; gap: 32px; }
          .col-sticky { position: static; text-align: center; }
          .col-num { font-size: 56px; }
          .section-tag { margin: 0 auto 16px; }
          .col-title br { display: none; }
        }
        @media (max-width: 480px) {
          .col-num { font-size: 46px; -webkit-text-stroke-width: 1.5px; }
          .col-title { font-size: 26px; }
          .col-desc { font-size: 13px; }
        }

        .acc {
          background: var(--paper);
          border: var(--border);
          border-radius: 20px;
          margin-bottom: 12px;
          box-shadow: var(--shadow-md);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s, background 0.35s;
          overflow: hidden;
          will-change: transform;
        }
        .acc:hover {
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-lg);
        }
        .acc.acc-open {
          background: #FFFFFF;
          transform: translate3d(-1px, -1px, 0);
          box-shadow: var(--shadow-md);
        }

        .acc-q {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          gap: 16px;
          width: 100%;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-comfortaa), sans-serif;
          color: var(--ink);
          transition: padding 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .acc-q:focus-visible {
          outline: 3px solid var(--blue);
          outline-offset: 3px;
          border-radius: 12px;
        }
        .acc-q span {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
          line-height: 1.4;
          font-family: var(--font-comfortaa), sans-serif;
        }

        .acc-chevron {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--paper);
          border: var(--border);
          color: var(--ink);
          flex-shrink: 0;
          box-shadow: 1.5px 1.5px 0 var(--ink);
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s ease;
          will-change: transform;
        }
        .acc-chevron.flipped {
          transform: rotate(-180deg);
          background: var(--yellow);
        }

        .acc-body {
          display: grid;
          grid-template-rows: 0fr;
          transition:
            grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          opacity: 0;
        }
        .acc-body.open {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .acc-body-inner {
          overflow: hidden;
          min-height: 0;
        }
        .acc-a {
          padding: 14px 22px 20px;
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.8;
          font-weight: 500;
          border-top: 1.5px dashed rgba(27, 42, 65, 0.15);
          margin: 0 4px;
          padding-top: 14px;
          transform: translateY(-6px);
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .acc-body.open .acc-a {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .acc-q { padding: 14px 16px; }
          .acc-chevron { width: 28px; height: 28px; }
          .acc-q span { font-size: 13.5px; }
          .acc-a { padding: 12px 16px 16px; font-size: 12.5px; }
        }

        .contact-section {
          padding: 20px 0 60px;
          position: relative;
          z-index: 1;
        }
        .contact-inner {
          max-width: 760px;
          margin: 0 auto;
          background: var(--paper);
          border: var(--border);
          border-radius: 28px;
          padding: 48px 48px 44px;
          box-shadow: var(--shadow-lg);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .contact-inner::before {
          content: "";
          position: absolute;
          top: -30%; right: -20%;
          width: 60%; height: 80%;
          background: radial-gradient(circle, var(--mint-soft), transparent 70%);
          opacity: 0.7;
          pointer-events: none;
        }
        .contact-inner > * { position: relative; z-index: 1; }

        .contact-label {
          display: inline-block;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--ink);
          padding: 6px 14px;
          background: var(--lilac-soft);
          border: var(--border);
          border-radius: 100px;
          box-shadow: var(--shadow-sm);
          margin-bottom: 16px;
          transform: rotate(-1deg);
        }
        .contact-heading {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(24px, 3.2vw, 34px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.1;
          letter-spacing: -0.6px;
          margin-bottom: 14px;
        }
        .contact-text {
          font-size: 14.5px;
          color: var(--ink-soft);
          line-height: 1.7;
          font-weight: 500;
          margin-bottom: 22px;
        }
        .contact-email {
          display: inline-block;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(18px, 2.6vw, 26px);
          font-weight: 800;
          color: var(--ink);
          padding: 6px 12px;
          position: relative;
          word-break: break-all;
          transition: transform 0.24s cubic-bezier(.34,1.4,.4,1), color 0.24s;
        }
        .contact-email::after {
          content: "";
          position: absolute;
          left: 12px; right: 12px; bottom: 2px;
          height: 3px;
          background: var(--coral);
          border-radius: 100px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.32s cubic-bezier(.34,1.4,.4,1);
        }
        .contact-email:hover {
          color: #E4572E;
          transform: translate3d(0, -2px, 0);
        }
        .contact-email:hover::after { transform: scaleX(1); }

        .contact-hint {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-mute);
          margin-top: 18px;
        }

        @media (max-width: 640px) {
          .contact-inner { padding: 32px 22px 28px; border-radius: 24px; }
        }

        /* ═══════════════════════════════════════════
           FOOTER — perfectly aligned, single clean row
        ═══════════════════════════════════════════ */
        .site-footer {
          position: relative;
          margin-top: 40px;
          padding: 0 24px 28px;
          z-index: 10;
          animation: footerRise 0.8s cubic-bezier(.34,1.3,.4,1) both;
        }

        .footer-body {
          background: var(--paper);
          background-image: radial-gradient(circle, rgba(27, 42, 65, 0.045) 1px, transparent 1.4px);
          background-size: 18px 18px;
          border: var(--border);
          border-radius: 28px;
          box-shadow: var(--shadow-lg);
          max-width: 1000px;
          margin: 0 auto;
          padding: 26px 40px 22px;
        }

        /* ═════ ROW 1: logo · links · copyright — one aligned line ═════ */
        .footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          min-height: 56px;
        }

        /* Logo — locked height, centered */
        .footer-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.2s ease;
          line-height: 0;
          height: 46px;
        }
        .footer-logo:hover { opacity: 0.75; }
        .footer-logo img {
          height: 46px;
          width: auto;
          display: block;
          object-fit: contain;
        }

        /* Links — one flex line, centered vertically */
        .footer-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 26px;
          flex-wrap: wrap;
          flex: 1;
          min-width: 0;
        }
        .footer-link {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 13.5px;
          font-weight: 800;
          color: var(--ink);
          line-height: 1;
          white-space: nowrap;
          position: relative;
          padding: 4px 0;
          transition: color 0.22s ease;
          display: inline-flex;
          align-items: center;
        }
        .footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          background: var(--blue);
          border-radius: 100px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.28s cubic-bezier(.34,1.4,.4,1);
        }
        .footer-link:hover { color: var(--blue); }
        .footer-link:hover::after { transform: scaleX(1); }

        /* Copyright — locked baseline */
        .footer-copyright {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-mute);
          letter-spacing: 0.3px;
          line-height: 1;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ═════ ROW 2: Back to Home, centered ═════ */
        .footer-home-row {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 22px;
          padding-top: 22px;
          border-top: 1.5px dashed rgba(27, 42, 65, 0.15);
        }
        .footer-home-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px 10px 12px;
          background: var(--paper);
          border: var(--border);
          border-radius: 100px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 13px;
          font-weight: 900;
          color: var(--ink);
          line-height: 1;
          text-decoration: none;
          box-shadow: var(--shadow-sm);
          transition: transform 0.26s cubic-bezier(.34,1.4,.4,1), box-shadow 0.26s, background 0.26s;
          cursor: pointer;
          white-space: nowrap;
        }
        .footer-home-btn-ic {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--mint);
          border: 2px solid var(--ink);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(.34,1.4,.4,1), background 0.25s ease;
          color: var(--ink);
          line-height: 0;
        }
        .footer-home-btn:hover {
          background: var(--yellow);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
        }
        .footer-home-btn:hover .footer-home-btn-ic {
          background: var(--coral);
          transform: rotate(-12deg);
        }
        .footer-home-btn:active { transform: translate3d(0, 0, 0); box-shadow: var(--shadow-sm); }

        @media (max-width: 768px) {
          .footer-body { padding: 24px 22px 20px; }
          .footer-row {
            flex-direction: column;
            justify-content: center;
            gap: 16px;
            min-height: 0;
          }
          .footer-links { flex: none; gap: 18px 22px; }
        }
        @media (max-width: 480px) {
          .site-footer { margin-top: 32px; padding: 0 16px 22px; }
          .footer-body { padding: 22px 18px 18px; border-radius: 22px; }
          .footer-logo, .footer-logo img { height: 40px; }
          .footer-link { font-size: 12.5px; }
          .footer-copyright { font-size: 11.5px; }
          .footer-home-btn { font-size: 12px; padding: 9px 16px 9px 11px; }
          .footer-home-row { margin-top: 18px; padding-top: 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="cw" ref={scrollRef}>
        <div className="cw-inner">

          <nav className={`navbar ${navHidden ? "hidden" : ""}`}>
            <button
              type="button"
              className="logo"
              onClick={goHome}
              aria-label="Go to Sharx home"
            >
              <img src="/sharx-logo.webp" alt="SHARX Logo" />
            </button>
            <button className="nav-btn" onClick={handleBack}>
              <ArrowLeft size={14} strokeWidth={2.6} /> Back
            </button>
          </nav>

          {/* SECTION 1 — Hero */}
          <div className={`section s1 ${seenSections.has(0) ? "seen" : ""}`} ref={section0}>
            <div className="wrap">
              <div className="hero-inner">
                <h1 className="hero-title">
                  Your Data,<br />
                  <span className="hl">Handled</span>{" "}
                  <span className="hl-coral">With</span>{" "}
                  <span className="hl-lilac">Care.</span>
                </h1>

                <p className="hero-sub">
                  A clear, no-nonsense look at what SHARX collects, why we use it,
                  and the choices you always have. No jargon, no hidden corners.
                </p>

                <div className="hero-meta">
                  <span className="hero-meta-dot" />
                  Last updated: {LAST_UPDATED}
                </div>

                <div className="hero-btn-wrap">
                  <button className="hero-btn" onClick={() => goTo(1)}>
                    <span>Read the policy</span>
                    <span className="hero-btn-icon">
                      <ChevronDown size={16} strokeWidth={3} />
                    </span>
                  </button>
                </div>

                <div className="quick-grid">
                  {QUICK_CARDS.map(({ icon, label, color, accent, i }) => (
                    <div key={label} className="quick-card" onClick={() => goTo(i)}>
                      <div className="quick-card-icon" style={{ background: color, color: accent }}>{icon}</div>
                      <h3>{label}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — Data */}
          <div className={`section s2 ${seenSections.has(1) ? "seen" : ""}`} ref={section1}>
            <div className="wrap">
              <div className="two-col">
                <div className="col-sticky">
                  <div className="col-num">01</div>
                  <div className="section-tag"><Database size={12} strokeWidth={2.6} /> What we collect</div>
                  <h2 className="col-title">
                    Information We<br />
                    <span className="hl-green">Gather.</span>
                  </h2>
                  <p className="col-desc">
                    Only what&apos;s needed to run SHARX, keep it secure, and give
                    you the features you actually use. Nothing extra, nothing hidden.
                  </p>
                </div>
                <div>
                  {DATA_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={`data-${i}`}
                      id={`data-${i}`}
                      item={item}
                      isOpen={openData === i}
                      onToggle={() => setOpenData(openData === i ? null : i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 — Cookies */}
          <div className={`section s3 ${seenSections.has(2) ? "seen" : ""}`} ref={section2}>
            <div className="wrap">
              <div className="two-col">
                <div className="col-sticky">
                  <div className="col-num">02</div>
                  <div className="section-tag"><Cookie size={12} strokeWidth={2.6} /> Cookies & storage</div>
                  <h2 className="col-title">
                    Cookies and<br />
                    Local <span className="hl-lilac">Storage.</span>
                  </h2>
                  <p className="col-desc">
                    SHARX uses a small number of essential cookies and browser
                    storage to keep things working smoothly. Here&apos;s exactly
                    what, and why.
                  </p>
                </div>
                <div>
                  {COOKIE_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={`cookie-${i}`}
                      id={`cookie-${i}`}
                      item={item}
                      isOpen={openCookie === i}
                      onToggle={() => setOpenCookie(openCookie === i ? null : i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 — Rights */}
          <div className={`section s4 ${seenSections.has(3) ? "seen" : ""}`} ref={section3}>
            <div className="wrap">
              <div className="two-col">
                <div className="col-sticky">
                  <div className="col-num">03</div>
                  <div className="section-tag"><Shield size={12} strokeWidth={2.6} /> Your rights</div>
                  <h2 className="col-title">
                    Your Privacy<br />
                    <span className="hl-coral">Rights.</span>
                  </h2>
                  <p className="col-desc">
                    You&apos;re always in control of your information. Here&apos;s
                    how to access, correct, or delete it — and how to reach us.
                  </p>
                  <button className="back-top-btn" onClick={() => goTo(0)}>
                    <ArrowUp size={13} strokeWidth={2.6} /> Back to top
                  </button>
                </div>
                <div>
                  {RIGHTS_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={`rights-${i}`}
                      id={`rights-${i}`}
                      item={item}
                      isOpen={openRights === i}
                      onToggle={() => setOpenRights(openRights === i ? null : i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact us about privacy */}
          <section className="contact-section" aria-label="Contact us about privacy">
            <div className="wrap">
              <div className="contact-inner">
                <div className="contact-label">Contact Us About Privacy</div>
                <h2 className="contact-heading">Have a privacy question?</h2>
                <p className="contact-text">
                  We&apos;re happy to help. For any privacy-related question or
                  request, reach us directly at:
                </p>
                <a href={`mailto:${PRIVACY_EMAIL}`} className="contact-email">
                  {PRIVACY_EMAIL}
                </a>

                <p className="contact-hint">
                  We review every message and respond as soon as we can.
                </p>
              </div>
            </div>
          </section>

          {/* ═══════ FOOTER — perfectly aligned ═══════ */}
          <footer className="site-footer">
            <div className="footer-body">

              {/* Row 1: logo · links · copyright */}
              <div className="footer-row">
                <button
                  type="button"
                  className="footer-logo"
                  onClick={goHome}
                  aria-label="Go to Sharx home"
                >
                  <img src="/sharx-logo.webp" alt="Sharx" draggable={false} />
                </button>

                <nav className="footer-links" aria-label="Footer navigation">
                  <Link href="/about" className="footer-link">About Us</Link>
                  <Link href="/contact" className="footer-link">Contact</Link>
                  <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                  <Link href="/terms" className="footer-link">Terms of Service</Link>
                  <Link href="/copyright" className="footer-link">Copyright</Link>
                </nav>

                <span className="footer-copyright">
                  © {new Date().getFullYear()} Sharx. All rights reserved.
                </span>
              </div>

              {/* Row 2: Back to Home, centered */}
              <div className="footer-home-row">
                <Link href="/" className="footer-home-btn">
                  <span className="footer-home-btn-ic" aria-hidden="true">
                    <Home size={12} strokeWidth={2.8} />
                  </span>
                  Back to Home
                </Link>
              </div>

            </div>
          </footer>

        </div>
      </div>
    </>
  );
}