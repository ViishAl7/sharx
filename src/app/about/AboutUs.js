"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, ArrowRight, Shield } from "lucide-react";

/* ─── Static data ─── */
const APPROACH_BLOCKS = [
  {
    num: "01",
    title: "Clear by Design",
    desc: "An interface that helps players find their way around without unnecessary complexity.",
  },
  {
    num: "02",
    title: "Built for Browsing",
    desc: "A growing selection of games arranged to make discovery feel natural and effortless.",
  },
  {
    num: "03",
    title: "Always Evolving",
    desc: "SHARX is a work in progress, shaped through improvement, experimentation, and attention to detail.",
  },
];

/* ─── Smooth reveal on scroll — Privacy-style easing ─── */
const Reveal = memo(function Reveal({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -70px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "visible" : ""}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
});

export default function About() {
  const router = useRouter();
  const scrollRef = useRef(null);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined") window.history.back();
  }, []);
  const goHome = useCallback(() => router.push("/"), [router]);
  const goPrivacy = useCallback(() => router.push("/privacy"), [router]);
  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <style>{`
        /*
          NOTE: the @import url(fonts.googleapis.com...) that used to be
          here is REMOVED on purpose. Comfortaa is already loaded once,
          self-hosted, with no render-blocking network request, by
          next/font/google in app/layout.js — it exposes the font as
          the --font-comfortaa CSS variable on <html>. Importing it a
          second time here created a duplicate render-blocking request
          on every single page (confirmed in Lighthouse: ~840ms wasted
          on Google Fonts, repeated on About/Privacy/Contact). Do not
          re-add this import — if the font ever needs to change, change
          it once in layout.js.
        */

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
          --shadow-hover: 5px 5px 0 var(--ink);
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
        .cw-inner::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle at 0 0, rgba(27, 42, 65, 0.1) 1.2px, transparent 1.7px);
          background-size: 28px 28px;
          opacity: 0.7;
          pointer-events: none;
          z-index: 0;
        }

        /* ─── Navbar — exact clean header family used by Privacy / Contact ─── */
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
          transition:
            transform 0.22s cubic-bezier(.34,1.3,.4,1),
            box-shadow 0.22s,
            background 0.22s;
          box-shadow: var(--shadow-sm);
        }
        .nav-btn:hover {
          background: var(--yellow);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
        }
        .nav-btn:active {
          transform: translate3d(0,0,0);
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 22px 22px 0;
            height: 84px;
          }
          .logo img { height: 58px; }
        }

        @media (max-width: 560px) {
          .navbar {
            padding: 18px 18px 0;
            height: 78px;
          }
          .logo img { height: 54px; }
          .nav-btn {
            height: 38px;
            padding: 0 17px;
            font-size: 12.5px;
          }
        }

        .wrap {
          position: relative; z-index: 1;
          width: 100%; max-width: 1120px;
          margin: 0 auto;
          padding: 0 40px;
        }
        @media (max-width: 768px) { .wrap { padding: 0 22px; } }
        @media (max-width: 560px) { .wrap { padding: 0 18px; } }

        /* ─── Reveal — smooth Privacy-style easing ─── */
        .reveal {
          opacity: 0;
          transform: translate3d(0, 28px, 0);
          transition:
            opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }
        .reveal.visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: var(--paper);
          border: var(--border);
          border-radius: 100px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: var(--ink);
          box-shadow: var(--shadow-sm);
        }
        .eyebrow-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          border: 1.5px solid var(--ink);
          flex-shrink: 0;
        }
        .eyebrow-dot.y { background: var(--yellow); }
        .eyebrow-dot.c { background: var(--coral); }
        .eyebrow-dot.m { background: var(--mint); }
        .eyebrow-dot.l { background: var(--lilac); }

        /* ─── HERO ─── */
        .hero-section {
          position: relative;
          padding: 180px 0 160px;
          overflow: hidden;
          z-index: 1;
        }
        .hero-inner {
          position: relative;
          max-width: 840px;
          margin: 0 auto;
          text-align: center;
          z-index: 2;
        }
        .hero-eyebrow-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 36px;
          opacity: 0;
          animation: heroFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.05s forwards;
        }
        .hero-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(42px, 6.8vw, 94px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.02;
          letter-spacing: -2.8px;
          margin-bottom: 40px;
          opacity: 0;
          animation: heroFade 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;
          position: relative;
          z-index: 3;
        }
        .hero-hl {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .hero-hl::before {
          content: "";
          position: absolute;
          left: -8px; right: -8px; bottom: 4px;
          height: 44%;
          background: var(--yellow);
          border-radius: 12px;
          z-index: -1;
          transform: rotate(-0.9deg) scaleX(0);
          transform-origin: left center;
          animation: hlGrow 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.65s forwards;
        }
        @keyframes hlGrow {
          to { transform: rotate(-0.9deg) scaleX(1); }
        }
        .hero-lead {
          font-size: clamp(17px, 2vw, 21px);
          font-weight: 700;
          color: var(--ink);
          line-height: 1.55;
          max-width: 640px;
          margin: 0 auto 22px;
          opacity: 0;
          animation: heroFade 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;
          position: relative;
          z-index: 3;
        }
        .hero-sub {
          font-size: clamp(15px, 1.7vw, 17px);
          font-weight: 500;
          color: var(--ink-soft);
          line-height: 1.75;
          max-width: 620px;
          margin: 0 auto;
          opacity: 0;
          animation: heroFade 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.5s forwards;
          position: relative;
          z-index: 3;
        }
        @keyframes heroFade {
          from { opacity: 0; transform: translate3d(0, 24px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        .hero-doodle {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }
        .hero-doodle.d1 {
          top: 22%; left: 8%;
          width: 42px; height: 42px;
          border: 2.5px solid var(--ink);
          border-radius: 12px;
          background: var(--mint);
          box-shadow: var(--shadow-sm);
          --dr: -10deg;
          animation: doodleFloat 6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .hero-doodle.d2 {
          top: 20%; right: 10%;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: var(--coral);
          border: 2.5px solid var(--ink);
          box-shadow: var(--shadow-sm);
          --dr: 0deg;
          animation: doodleFloat 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite 0.4s;
        }
        .hero-doodle.d3 {
          bottom: 18%; left: 14%;
          width: 64px; height: 8px;
          background: var(--lilac);
          border: 2px solid var(--ink);
          border-radius: 100px;
          box-shadow: var(--shadow-sm);
          --dr: 14deg;
          animation: doodleFloat 7s cubic-bezier(0.45, 0, 0.55, 1) infinite 0.8s;
        }
        .hero-doodle.d4 {
          bottom: 22%; right: 10%;
          width: 34px; height: 34px;
          border: 2.5px solid var(--ink);
          border-radius: 8px;
          background: var(--yellow);
          box-shadow: var(--shadow-sm);
          --dr: 12deg;
          animation: doodleFloat 5.5s cubic-bezier(0.45, 0, 0.55, 1) infinite 1.1s;
        }
        @keyframes doodleFloat {
          0%, 100% { transform: translateY(0) rotate(var(--dr, -8deg)); }
          50%      { transform: translateY(-9px) rotate(var(--dr, -8deg)); }
        }
        @media (max-width: 900px) {
          .hero-doodle.d1 { left: 4%; width: 32px; height: 32px; top: 20%; }
          .hero-doodle.d4 { display: none; }
        }
        @media (max-width: 640px) {
          .hero-doodle.d2, .hero-doodle.d3 { display: none; }
          .hero-doodle.d1 { top: 14%; left: 3%; width: 26px; height: 26px; }
        }

        /* ─── SECTION 2 ─── */
        .split-section { padding: 110px 0; }
        .split-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .split-head { margin-bottom: 26px; }
        .split-head .eyebrow { margin-bottom: 22px; }
        .split-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.08;
          letter-spacing: -1.1px;
        }
        .split-title .accent {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .split-title .accent::before {
          content: "";
          position: absolute;
          left: -4px; right: -4px; bottom: 2px;
          height: 44%;
          background: var(--yellow);
          border-radius: 8px;
          z-index: -1;
          transform: rotate(-0.8deg);
        }
        .split-body p {
          font-size: 15.5px;
          color: var(--ink-soft);
          line-height: 1.85;
          font-weight: 500;
        }
        .split-body p + p { margin-top: 20px; }
        .split-body p strong { color: var(--ink); font-weight: 800; }

        .split-visual {
          position: relative;
          width: 100%;
          height: 470px;
          max-width: 470px;
          margin: 0 auto;
        }
        .pc-tile-panel {
          position: absolute;
          top: 0; left: 0;
          width: 66%; height: 60%;
          background: var(--yellow-soft);
          border: var(--border);
          border-radius: 24px;
          box-shadow: var(--shadow-md);
          padding: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 12px;
          transform: rotate(-1.5deg);
          z-index: 2;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .pc-tile-inner {
          border: 1.5px solid var(--ink);
          border-radius: 14px;
          background: var(--paper);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pc-tile-inner svg { width: 24px; height: 24px; color: var(--ink); }
        .pc-tile-inner:nth-child(1) { background: var(--paper); }
        .pc-tile-inner:nth-child(2) { background: var(--coral-soft); }
        .pc-tile-inner:nth-child(3) { background: var(--mint-soft); }
        .pc-tile-inner:nth-child(4) { background: var(--lilac-soft); }

        .pc-badge {
          position: absolute;
          top: 12%; right: 0;
          width: 34%; height: 30%;
          background: var(--coral);
          border: var(--border);
          border-radius: 22px;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          transform: rotate(4deg);
          color: #fff;
          z-index: 3;
        }
        .pc-badge-num {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
        }
        .pc-badge-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          opacity: 0.95;
        }
        .pc-pill {
          position: absolute;
          bottom: 30%; right: 0;
          width: 56%; height: 56px;
          background: var(--paper);
          border: var(--border);
          border-radius: 100px;
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 18px;
          transform: rotate(-2deg);
          z-index: 3;
        }
        .pc-pill-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--mint);
          border: 1.5px solid var(--ink);
          flex-shrink: 0;
        }
        .pc-pill-text {
          font-size: 12.5px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: 0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pc-card {
          position: absolute;
          bottom: 0; left: 0;
          width: 62%; height: 32%;
          background: var(--ink);
          border: var(--border);
          border-radius: 22px;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          padding: 20px 22px;
          transform: rotate(1.5deg);
          color: var(--paper);
          z-index: 4;
        }
        .pc-card-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 19px;
          font-weight: 800;
          color: var(--paper);
          letter-spacing: -0.3px;
          line-height: 1.15;
        }
        .pc-card-sub {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--paper);
          opacity: 0.7;
          letter-spacing: 0.3px;
        }
        .pc-dot {
          position: absolute;
          bottom: 14%; right: 16%;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--yellow);
          border: 2px solid var(--ink);
          z-index: 5;
        }
        @media (max-width: 900px) {
          .split-grid { grid-template-columns: 1fr; gap: 56px; }
          .split-visual { height: 420px; }
        }
        @media (max-width: 480px) {
          .split-visual { height: 360px; }
          .pc-badge-num { font-size: 26px; }
          .pc-card { padding: 16px 18px; }
          .pc-card-title { font-size: 15px; }
          .pc-pill-text { font-size: 11px; }
        }

        /* ─── SECTION 3 — Founder ─── */
        .founder-section { padding: 120px 0; }
        .founder-inner { max-width: 900px; margin: 0 auto; }
        .founder-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: var(--yellow-soft);
          border: var(--border);
          border-radius: 100px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: var(--ink);
          box-shadow: var(--shadow-sm);
          margin-bottom: 26px;
        }
        .founder-label::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--coral);
          border: 1.5px solid var(--ink);
        }
        .founder-heading {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(32px, 4.5vw, 54px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.08;
          letter-spacing: -1.3px;
          margin-bottom: 38px;
        }
        .founder-heading .accent {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .founder-heading .accent::before {
          content: "";
          position: absolute;
          left: -4px; right: -4px; bottom: 2px;
          height: 44%;
          background: var(--yellow);
          border-radius: 8px;
          z-index: -1;
          transform: rotate(-0.8deg);
        }
        .founder-body {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 44px;
          align-items: start;
        }
        .founder-sig {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 24px 28px;
          background: var(--paper);
          border: var(--border);
          border-radius: 20px;
          box-shadow: var(--shadow-md);
          transform: rotate(-1deg);
          min-width: 230px;
          transition:
            transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .founder-sig:hover {
          transform: rotate(-1deg) translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-hover);
        }
        .founder-sig-name {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 23px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.4px;
          line-height: 1.15;
        }
        .founder-sig-role {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-soft);
          letter-spacing: 0.3px;
        }
        .founder-sig-line {
          width: 42px;
          height: 3px;
          border-radius: 100px;
          background: var(--coral);
          margin-top: 10px;
        }
        .founder-text p {
          font-size: 15.5px;
          color: var(--ink-soft);
          line-height: 1.9;
          font-weight: 500;
        }
        .founder-text p + p { margin-top: 22px; }
        .founder-text p strong { color: var(--ink); font-weight: 800; }
        @media (max-width: 768px) {
          .founder-body { grid-template-columns: 1fr; gap: 30px; }
          .founder-sig { min-width: unset; }
        }

        /* ─── SECTION 4 ─── */
        .why-section { padding: 110px 0; }
        .why-inner {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }
        .why-inner .eyebrow { margin-bottom: 24px; }
        .why-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(34px, 4.4vw, 54px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.08;
          letter-spacing: -1.3px;
          margin-bottom: 30px;
        }
        .why-title .accent {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .why-title .accent::before {
          content: "";
          position: absolute;
          left: -4px; right: -4px; bottom: 2px;
          height: 44%;
          background: var(--coral);
          border-radius: 8px;
          z-index: -1;
          transform: rotate(-0.8deg);
          opacity: 0.55;
        }
        .why-lead {
          font-size: clamp(17px, 2vw, 22px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.5;
          margin-bottom: 22px;
          padding: 24px 30px;
          background: var(--paper);
          border: var(--border);
          border-radius: 20px;
          box-shadow: var(--shadow-md);
          transform: rotate(-0.5deg);
          position: relative;
          transition:
            transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .why-lead:hover {
          transform: rotate(-0.5deg) translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-hover);
        }
        .why-lead::before,
        .why-lead::after {
          content: "";
          position: absolute;
          width: 24px; height: 24px;
          border: 2px solid var(--ink);
          border-radius: 8px;
          background: var(--paper);
        }
        .why-lead::before {
          top: -11px; left: -11px;
          transform: rotate(-14deg);
        }
        .why-lead::after {
          bottom: -11px; right: -11px;
          transform: rotate(16deg);
          background: var(--yellow-soft);
        }
        .why-body {
          font-size: 15.5px;
          color: var(--ink-soft);
          line-height: 1.85;
          font-weight: 500;
          max-width: 620px;
          margin: 0 auto;
        }

        /* ─── SECTION 5 ─── */
        .honest-section { padding: 120px 0; }
        .honest-inner {
          max-width: 820px;
          margin: 0 auto;
          background: var(--paper);
          border: var(--border);
          border-radius: 28px;
          padding: 60px 56px;
          box-shadow: var(--shadow-lg);
          position: relative;
        }
        .honest-inner::before {
          content: "";
          position: absolute;
          top: -24px; left: 34px;
          width: 64px; height: 64px;
          border-radius: 50%;
          background: var(--yellow-soft);
          border: 2px solid var(--ink);
          z-index: -1;
        }
        .honest-inner::after {
          content: "";
          position: absolute;
          bottom: -20px; right: 42px;
          width: 48px; height: 48px;
          border-radius: 12px;
          background: var(--lilac-soft);
          border: 2px solid var(--ink);
          transform: rotate(12deg);
          z-index: -1;
        }
        .honest-inner .eyebrow { margin-bottom: 26px; }
        .honest-heading {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(30px, 4vw, 48px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.1;
          letter-spacing: -1.1px;
          margin-bottom: 30px;
        }
        .honest-heading .accent {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .honest-heading .accent::before {
          content: "";
          position: absolute;
          left: -4px; right: -4px; bottom: 2px;
          height: 44%;
          background: var(--mint);
          border-radius: 8px;
          z-index: -1;
          transform: rotate(-0.8deg);
          opacity: 0.7;
        }
        .honest-text p {
          font-size: 15.5px;
          color: var(--ink-soft);
          line-height: 1.9;
          font-weight: 500;
        }
        .honest-text p + p { margin-top: 22px; }
        .honest-text p strong { color: var(--ink); font-weight: 800; }
        @media (max-width: 640px) {
          .honest-inner { padding: 42px 30px; }
          .honest-inner::before { width: 48px; height: 48px; top: -18px; left: 24px; }
          .honest-inner::after { width: 36px; height: 36px; bottom: -14px; right: 26px; }
        }

        /* ─── SECTION 6 ─── */
        .thanks-section { padding: 120px 0; }
        .thanks-inner {
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }
        .thanks-inner .eyebrow { margin-bottom: 26px; }
        .thanks-heading {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(34px, 4.8vw, 58px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.06;
          letter-spacing: -1.3px;
          margin-bottom: 34px;
        }
        .thanks-heading .accent {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .thanks-heading .accent::before {
          content: "";
          position: absolute;
          left: -4px; right: -4px; bottom: 4px;
          height: 44%;
          background: var(--coral);
          border-radius: 8px;
          z-index: -1;
          transform: rotate(-0.8deg);
          opacity: 0.5;
        }
        .thanks-text {
          text-align: left;
          max-width: 640px;
          margin: 0 auto;
        }
        .thanks-text p {
          font-size: 15.5px;
          color: var(--ink-soft);
          line-height: 1.9;
          font-weight: 500;
        }
        .thanks-text p + p { margin-top: 20px; }

        /* ─── SECTION 7 ─── */
        .approach-section { padding: 110px 0; }
        .approach-head {
          text-align: center;
          margin-bottom: 60px;
        }
        .approach-head .eyebrow { margin-bottom: 24px; }
        .approach-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(32px, 4.2vw, 50px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.08;
          letter-spacing: -1.2px;
        }
        .approach-title .accent {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .approach-title .accent::before {
          content: "";
          position: absolute;
          left: -4px; right: -4px; bottom: 2px;
          height: 44%;
          background: var(--mint);
          border-radius: 8px;
          z-index: -1;
          transform: rotate(-0.8deg);
          opacity: 0.7;
        }
        .approach-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .approach-card {
          position: relative;
          background: var(--paper);
          border: var(--border);
          border-radius: 22px;
          padding: 32px 28px 30px;
          box-shadow: var(--shadow-md);
          transition:
            transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1);
          overflow: hidden;
        }
        .approach-card:hover {
          transform: translate3d(-3px, -3px, 0);
          box-shadow: var(--shadow-hover);
        }
        .approach-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 6px 12px;
          border-radius: 100px;
          border: var(--border);
          margin-bottom: 24px;
          box-shadow: var(--shadow-sm);
          position: relative;
          z-index: 1;
        }
        .approach-card:nth-child(1) .approach-num { background: var(--yellow); }
        .approach-card:nth-child(2) .approach-num { background: var(--coral); color: #fff; }
        .approach-card:nth-child(3) .approach-num { background: var(--mint); }
        .approach-card-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 19px;
          font-weight: 800;
          color: var(--ink);
          line-height: 1.25;
          margin-bottom: 14px;
        }
        .approach-card-desc {
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.75;
          font-weight: 500;
        }
        .approach-corner {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 2px solid var(--ink);
        }
        .approach-card:nth-child(1) .approach-corner { background: var(--yellow-soft); }
        .approach-card:nth-child(2) .approach-corner { background: var(--coral-soft); }
        .approach-card:nth-child(3) .approach-corner { background: var(--mint-soft); }
        @media (max-width: 900px) {
          .approach-grid { grid-template-columns: 1fr; gap: 16px; }
        }

        /* ─── SECTION 8 ─── */
        .direction-section {
          padding: 130px 0;
          position: relative;
          overflow: hidden;
        }
        .direction-inner {
          max-width: 880px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .direction-inner .eyebrow { margin-bottom: 30px; }
        .direction-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(38px, 5.2vw, 70px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.05;
          letter-spacing: -1.7px;
          margin-bottom: 34px;
        }
        .direction-title .accent {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .direction-title .accent::before {
          content: "";
          position: absolute;
          left: -6px; right: -6px; bottom: 4px;
          height: 44%;
          background: var(--lilac);
          border-radius: 10px;
          z-index: -1;
          transform: rotate(1deg);
        }
        .direction-body {
          font-size: clamp(16px, 1.9vw, 19px);
          color: var(--ink);
          line-height: 1.7;
          font-weight: 800;
          max-width: 640px;
          margin: 0 auto 22px;
        }
        .direction-body-2 {
          font-size: clamp(15px, 1.7vw, 16.5px);
          color: var(--ink-soft);
          line-height: 1.85;
          font-weight: 500;
          max-width: 620px;
          margin: 0 auto 22px;
        }
        .direction-playground {
          position: relative;
          height: 210px;
          max-width: 660px;
          margin: 44px auto 0;
        }
        .dp-piece {
          position: absolute;
          border: var(--border);
          box-shadow: var(--shadow-sm);
          animation: dpFloat 5.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .dp-piece.p1 {
          top: 32%; left: 4%;
          width: 58px; height: 58px;
          border-radius: 16px;
          background: var(--yellow);
          --dr: -8deg;
          transform: rotate(var(--dr));
        }
        .dp-piece.p2 {
          top: 8%; left: 28%;
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--coral);
          animation-delay: 0.4s;
        }
        .dp-piece.p3 {
          bottom: 14%; left: 20%;
          width: 78px; height: 12px;
          border-radius: 100px;
          background: var(--mint);
          --dr: 10deg;
          transform: rotate(var(--dr));
          animation-delay: 0.8s;
        }
        .dp-piece.p4 {
          top: 26%; right: 5%;
          width: 68px; height: 68px;
          border-radius: 20px;
          background: var(--lilac);
          --dr: 12deg;
          transform: rotate(var(--dr));
          animation-delay: 0.3s;
        }
        .dp-piece.p5 {
          bottom: 20%; right: 24%;
          width: 32px; height: 32px;
          border-radius: 10px;
          background: var(--yellow);
          --dr: -14deg;
          transform: rotate(var(--dr));
          animation-delay: 0.9s;
        }
        .dp-piece.p6 {
          top: 6%; right: 30%;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: var(--ink);
          animation-delay: 1.2s;
        }
        @keyframes dpFloat {
          0%, 100% { transform: translateY(0) rotate(var(--dr, 0deg)); }
          50%      { transform: translateY(-11px) rotate(var(--dr, 0deg)); }
        }
        @media (max-width: 640px) {
          .direction-playground { height: 170px; }
          .dp-piece.p1 { width: 44px; height: 44px; }
          .dp-piece.p4 { width: 54px; height: 54px; }
        }

        /* ─── SECTION 9 ─── */
        .note-section { padding: 130px 0; }
        .note-inner {
          max-width: 780px;
          margin: 0 auto;
          background: var(--paper);
          border: var(--border);
          border-radius: 28px;
          padding: 64px 56px 58px;
          box-shadow: var(--shadow-lg);
          position: relative;
        }
        .note-inner::before {
          content: "";
          position: absolute;
          top: -30px; left: 42px;
          width: 74px; height: 74px;
          border-radius: 50%;
          background: var(--coral-soft);
          border: 2px solid var(--ink);
          z-index: -1;
        }
        .note-inner::after {
          content: "";
          position: absolute;
          bottom: -26px; right: 46px;
          width: 56px; height: 56px;
          border-radius: 14px;
          background: var(--yellow-soft);
          border: 2px solid var(--ink);
          transform: rotate(-10deg);
          z-index: -1;
        }
        .note-inner .eyebrow { margin-bottom: 28px; }
        .note-heading {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(32px, 4.4vw, 52px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.08;
          letter-spacing: -1.3px;
          margin-bottom: 34px;
        }
        .note-heading .accent {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .note-heading .accent::before {
          content: "";
          position: absolute;
          left: -4px; right: -4px; bottom: 2px;
          height: 44%;
          background: var(--yellow);
          border-radius: 8px;
          z-index: -1;
          transform: rotate(-0.8deg);
        }
        .note-text p {
          font-size: 15.5px;
          color: var(--ink-soft);
          line-height: 1.9;
          font-weight: 500;
        }
        .note-text p + p { margin-top: 22px; }
        .note-closing {
          margin-top: 38px;
          padding-top: 34px;
          border-top: 1.5px dashed rgba(27, 42, 65, 0.2);
        }
        .note-closing > p {
          font-size: 15px;
          color: var(--ink-soft);
          line-height: 1.85;
          font-weight: 500;
          margin-bottom: 28px;
        }
        .note-signature {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .note-sig-line {
          font-size: 13px;
          font-weight: 700;
          color: var(--ink-soft);
          letter-spacing: 0.3px;
          margin-bottom: 10px;
        }
        .note-sig-name {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.6px;
          line-height: 1.15;
        }
        .note-sig-role {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--ink-soft);
          letter-spacing: 0.3px;
        }
        .note-sig-underline {
          width: 50px;
          height: 3px;
          border-radius: 100px;
          background: var(--coral);
          margin-top: 12px;
        }
        @media (max-width: 640px) {
          .note-inner { padding: 44px 30px 40px; }
          .note-inner::before { width: 52px; height: 52px; top: -22px; left: 28px; }
          .note-inner::after { width: 40px; height: 40px; bottom: -18px; right: 30px; }
          .note-sig-name { font-size: 24px; }
        }

        /* ─── SECTION 10 — CTA ─── */
        .cta-section { padding: 110px 0 130px; }
        .cta-inner {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
          background: var(--paper);
          border: var(--border);
          border-radius: 32px;
          padding: 76px 48px;
          box-shadow: var(--shadow-lg);
          position: relative;
          overflow: hidden;
        }
        .cta-inner::before {
          content: "";
          position: absolute;
          top: -50px; right: -50px;
          width: 140px; height: 140px;
          border-radius: 50%;
          background: var(--yellow-soft);
          border: 2px solid var(--ink);
        }
        .cta-inner::after {
          content: "";
          position: absolute;
          bottom: -40px; left: -40px;
          width: 108px; height: 108px;
          border-radius: 50%;
          background: var(--mint-soft);
          border: 2px solid var(--ink);
        }
        .cta-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(34px, 4.4vw, 58px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.06;
          letter-spacing: -1.3px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }
        .cta-title .accent {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .cta-title .accent::before {
          content: "";
          position: absolute;
          left: -4px; right: -4px; bottom: 2px;
          height: 44%;
          background: var(--coral);
          border-radius: 8px;
          z-index: -1;
          transform: rotate(-0.8deg);
          opacity: 0.75;
        }
        .cta-body {
          font-size: 16px;
          color: var(--ink-soft);
          line-height: 1.75;
          font-weight: 500;
          margin-bottom: 36px;
          max-width: 460px;
          margin-left: auto;
          margin-right: auto;
          position: relative;
          z-index: 1;
        }
        .cta-btn-wrap {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 15px 24px 15px 32px;
          background: var(--yellow);
          color: var(--ink);
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 16px;
          font-weight: 800;
          border-radius: 100px;
          border: var(--border);
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition:
            transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1),
            background 0.35s ease;
        }
        .cta-btn:hover {
          transform: translate3d(-2px, -2px, 0) rotate(-1.5deg);
          box-shadow: var(--shadow-hover);
          background: var(--coral);
        }
        .cta-btn:active {
          transform: translate3d(0, 0, 0);
          box-shadow: var(--shadow-md);
        }
        .cta-btn-icon {
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
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cta-btn:hover .cta-btn-icon { transform: translateX(4px); }

        /* ─── Bottom actions — Back to top + Privacy ─── */
        .bottom-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 0 0 40px;
          position: relative;
          z-index: 1;
        }
        .back-top-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          background: var(--paper);
          border: var(--border);
          border-radius: 100px;
          font-size: 13px;
          font-weight: 800;
          color: var(--ink);
          cursor: pointer;
          transition:
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            background 0.35s ease;
          box-shadow: var(--shadow-sm);
          font-family: var(--font-comfortaa), sans-serif;
        }
        .back-top-btn:hover {
          background: var(--yellow);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
        }
        .back-top-btn:active {
          transform: translate3d(0, 0, 0);
          box-shadow: var(--shadow-sm);
        }

        /* Privacy link button — same style family as nav-btn */
        .privacy-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          background: var(--paper);
          border: var(--border);
          border-radius: 100px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 13px;
          font-weight: 800;
          color: var(--ink);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition:
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            background 0.35s ease;
        }
        .privacy-btn:hover {
          background: var(--mint);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
        }
        .privacy-btn:active {
          transform: translate3d(0, 0, 0);
          box-shadow: var(--shadow-sm);
        }
        .privacy-btn svg {
          width: 14px;
          height: 14px;
          stroke-width: 2.6;
        }

        @media (max-width: 900px) {
          .hero-section { padding: 150px 0 110px; }
          .split-section, .why-section, .approach-section { padding: 90px 0; }
          .founder-section, .honest-section, .thanks-section { padding: 100px 0; }
          .direction-section { padding: 110px 0; }
          .note-section { padding: 110px 0; }
          .cta-section { padding: 90px 0 110px; }
          .cta-inner { padding: 56px 34px; }
        }
        @media (max-width: 560px) {
          .hero-section { padding: 130px 0 80px; }
          .hero-title { letter-spacing: -1.8px; margin-bottom: 28px; }
          .hero-lead { margin-bottom: 16px; }
          .split-title, .why-title, .approach-title { font-size: 28px; }
          .founder-heading { font-size: 30px; }
          .honest-heading { font-size: 28px; }
          .thanks-heading { font-size: 30px; }
          .direction-title { font-size: 32px; }
          .note-heading { font-size: 28px; }
          .why-lead { font-size: 16px; padding: 18px 22px; }
          .cta-inner { padding: 48px 26px; border-radius: 26px; }
          .approach-card { padding: 28px 24px; }
          .honest-inner { padding: 38px 26px; }
          .note-inner { padding: 40px 26px 36px; }
          .bottom-actions { gap: 10px; padding-bottom: 32px; }
        }
        @media (max-width: 380px) {
          .hero-title { font-size: 36px; }
          .back-top-btn, .privacy-btn {
            font-size: 12.5px;
            padding: 10px 18px;
          }
        }

        /* ─── Reduced motion ─── */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          .reveal { opacity: 1; transform: none; }
          .hero-eyebrow-wrap, .hero-title, .hero-lead, .hero-sub {
            opacity: 1;
            animation: none;
          }
          .hero-hl::before { transform: rotate(-0.8deg); }
        }
      `}</style>

      <div className="cw" ref={scrollRef}>
        <div className="cw-inner">

          <nav className="navbar">
            <div className="logo" onClick={goHome}>
              <img src="/sharx-logo.webp" alt="SHARX Logo" width="140" height="46" />
            </div>
            <button className="nav-btn" onClick={handleBack}>
              <ArrowLeft size={14} strokeWidth={2.6} /> Back
            </button>
          </nav>

          {/* 1. HERO */}
          <section className="hero-section">
            <div className="wrap">
              <div className="hero-inner">
                <div className="hero-eyebrow-wrap">
                  <div className="eyebrow">
                    <span className="eyebrow-dot y" />
                    About Sharx
                  </div>
                </div>
                <h1 className="hero-title">
                  Games, Without <br />
                  the <span className="hero-hl">Friction.</span>
                </h1>
                <p className="hero-lead">
                  SHARX is built around a simple idea: finding a good game should
                  be quick, clear, and enjoyable.
                </p>
                <p className="hero-sub">
                  We bring browser games into one carefully arranged space — so you
                  can spend less time searching and more time playing.
                </p>
                <span className="hero-doodle d1" aria-hidden="true" />
                <span className="hero-doodle d2" aria-hidden="true" />
                <span className="hero-doodle d3" aria-hidden="true" />
                <span className="hero-doodle d4" aria-hidden="true" />
              </div>
            </div>
          </section>

          {/* 2 */}
          <Reveal>
            <section className="split-section">
              <div className="wrap">
                <div className="split-grid">
                  <div className="split-text">
                    <div className="split-head">
                      <div className="eyebrow">
                        <span className="eyebrow-dot c" />
                        What is SHARX?
                      </div>
                      <h2 className="split-title" style={{ marginTop: 22 }}>
                        What We&apos;re <span className="accent">Building.</span>
                      </h2>
                    </div>
                    <div className="split-body">
                      <p>SHARX is a <strong>browser gaming platform</strong> designed around discovery.</p>
                      <p>From quick sessions to games that keep you coming back, the goal is simple: make it easier to find something worth playing without unnecessary friction.</p>
                      <p>Instead of making the experience feel complicated, SHARX keeps the focus where it belongs — <strong>on the games.</strong></p>
                    </div>
                  </div>
                  <div className="split-visual" aria-hidden="true">
                    <div className="pc-tile-panel">
                      <div className="pc-tile-inner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M9 12h6M12 9v6" /></svg>
                      </div>
                      <div className="pc-tile-inner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M12 4v16M4 12h16" /></svg>
                      </div>
                      <div className="pc-tile-inner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h10M4 18h16" /></svg>
                      </div>
                      <div className="pc-tile-inner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                      </div>
                    </div>
                    <div className="pc-badge">
                      <span className="pc-badge-num">1000+</span>
                      <span className="pc-badge-label">Games</span>
                    </div>
                    <div className="pc-pill">
                      <span className="pc-pill-dot" />
                      <span className="pc-pill-text">Press play, get going</span>
                    </div>
                    <div className="pc-card">
                      <span className="pc-card-title">Discovery first.</span>
                      <span className="pc-card-sub">No detours</span>
                    </div>
                    <span className="pc-dot" />
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* 3 — Founder */}
          <Reveal>
            <section className="founder-section">
              <div className="wrap">
                <div className="founder-inner">
                  <div className="founder-label">Behind SHARX</div>
                  <h2 className="founder-heading">
                    A Founder&apos;s <span className="accent">Note.</span>
                  </h2>
                  <div className="founder-body">
                    <div className="founder-sig">
                      <span className="founder-sig-name">Vishal</span>
                      <span className="founder-sig-role">Founder &amp; Creator, SHARX</span>
                      <span className="founder-sig-line" />
                    </div>
                    <div className="founder-text">
                      <p>Hi, I&apos;m <strong>Vishal</strong> — the founder and creator of SHARX.</p>
                      <p>I&apos;m 18 years old and currently a BCA student. SHARX began as an independent project I created out of curiosity, creativity, and a genuine desire to build something of my own.</p>
                      <p>What started as a personal idea gradually became a real platform — one that I&apos;m continuing to shape, improve, and learn from every day.</p>
                      <p>I&apos;m building SHARX independently, without a large team or unlimited resources. Every part of the platform is being developed step by step, with a lot of learning, experimentation, and care behind it.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* 4 */}
          <Reveal>
            <section className="why-section">
              <div className="wrap">
                <div className="why-inner">
                  <div className="eyebrow"><span className="eyebrow-dot c" />The Idea Behind SHARX</div>
                  <h2 className="why-title" style={{ marginTop: 24 }}>Why It <span className="accent">Exists.</span></h2>
                  <p className="why-lead">Finding a game should not feel like a task.</p>
                  <p className="why-body">Too much time can disappear into searching, switching between pages, and trying to decide what to play next. SHARX is being shaped to make that process more direct — giving players a simple place to browse, discover, and start playing.</p>
                </div>
              </div>
            </section>
          </Reveal>

          {/* 5 */}
          <Reveal>
            <section className="honest-section">
              <div className="wrap">
                <div className="honest-inner">
                  <div className="eyebrow"><span className="eyebrow-dot m" />An Honest Note</div>
                  <h2 className="honest-heading" style={{ marginTop: 26 }}>Still in the <span className="accent">Making.</span></h2>
                  <div className="honest-text">
                    <p>SHARX is still a young platform, and there is plenty left to improve.</p>
                    <p>The game library is growing, but it may not yet offer the depth or quality of games we ultimately want to bring to the platform. High-quality games, proper licensing, infrastructure, and long-term development require resources — and as an independently built project, SHARX is working within a <strong>limited budget for now.</strong></p>
                    <p>I know that some games may not feel as polished as you expect, and you may come across advertisements while using the website. I understand that these things can affect the experience, and I&apos;m not ignoring them.</p>
                    <p>I&apos;m continuing to work toward a better library, a cleaner experience, stronger performance, and more carefully selected games. As SHARX grows, I want to invest more into the platform and bring in better-quality titles that make the experience genuinely worth returning to.</p>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* 6 */}
          <Reveal>
            <section className="thanks-section">
              <div className="wrap">
                <div className="thanks-inner">
                  <div className="eyebrow"><span className="eyebrow-dot c" />A Personal Note</div>
                  <h2 className="thanks-heading" style={{ marginTop: 26 }}>Thank You for <span className="accent">Staying.</span></h2>
                  <div className="thanks-text">
                    <p>If you&apos;re here already, thank you.</p>
                    <p>I know SHARX is not where I want it to be yet. The games, the presentation, and the overall experience still have room to grow. But this is only the beginning, and I&apos;m committed to taking it further.</p>
                    <p>I may not have the resources to bring every high-quality game to the platform today, but I do have the intention to keep building, improving, and making SHARX different from the usual gaming websites.</p>
                    <p>Please stay with SHARX as it grows. I want to bring better games, improve the experience, and turn this small independent project into something much bigger over time.</p>
                    <p>Your time, patience, and support mean more than you may realize.</p>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* 7 */}
          <Reveal>
            <section className="approach-section">
              <div className="wrap">
                <div className="approach-head">
                  <div className="eyebrow"><span className="eyebrow-dot m" />Our Approach</div>
                  <h2 className="approach-title" style={{ marginTop: 24 }}>Designed Around <span className="accent">Discovery.</span></h2>
                </div>
                <div className="approach-grid">
                  {APPROACH_BLOCKS.map((b) => (
                    <article key={b.num} className="approach-card">
                      <span className="approach-num">{b.num}</span>
                      <h3 className="approach-card-title">{b.title}</h3>
                      <p className="approach-card-desc">{b.desc}</p>
                      <span className="approach-corner" aria-hidden="true" />
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>

          {/* 8 */}
          <Reveal>
            <section className="direction-section">
              <div className="wrap">
                <div className="direction-inner">
                  <div className="eyebrow"><span className="eyebrow-dot l" />Our Direction</div>
                  <h2 className="direction-title" style={{ marginTop: 30 }}>Still Taking <span className="accent">Shape.</span></h2>
                  <p className="direction-body">SHARX is growing one detail at a time.</p>
                  <p className="direction-body-2">The platform, the experience, and the library will continue to evolve — but the direction remains consistent: create a better, more considered way to discover browser games.</p>
                  <p className="direction-body-2">Over time, I want SHARX to offer a stronger collection of games, a more refined interface, fewer compromises, and an experience that feels distinctly its own.</p>
                  <div className="direction-playground" aria-hidden="true">
                    <span className="dp-piece p1" />
                    <span className="dp-piece p2" />
                    <span className="dp-piece p3" />
                    <span className="dp-piece p4" />
                    <span className="dp-piece p5" />
                    <span className="dp-piece p6" />
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* 9 — Final Note */}
          <Reveal>
            <section className="note-section">
              <div className="wrap">
                <div className="note-inner">
                  <div className="eyebrow"><span className="eyebrow-dot y" />A Final Note</div>
                  <h2 className="note-heading" style={{ marginTop: 28 }}>One More <span className="accent">Thing.</span></h2>
                  <div className="note-text">
                    <p>SHARX may not be perfect yet, but it is something I care about deeply.</p>
                    <p>I&apos;m building it while learning, experimenting, and figuring things out one step at a time. Every visit, every piece of feedback, and every small improvement helps shape what SHARX can become.</p>
                    <p>I hope you&apos;ll stay around and watch it grow. I have a lot planned for SHARX, and I want to keep taking it further — with better games, better design, and a better experience for everyone who visits.</p>
                  </div>
                  <div className="note-closing">
                    <p>Thank you for giving SHARX a chance, and thank you for being here at this stage of the journey.</p>
                    <div className="note-signature">
                      <span className="note-sig-line">With appreciation,</span>
                      <span className="note-sig-name">Vishal</span>
                      <span className="note-sig-role">Founder &amp; Creator, SHARX</span>
                      <span className="note-sig-underline" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* 10 */}
          <Reveal>
            <section className="cta-section">
              <div className="wrap">
                <div className="cta-inner">
                  <h2 className="cta-title">Find Something <span className="accent">Worth Playing.</span></h2>
                  <p className="cta-body">Take a look around. Your next game may be closer than you think.</p>
                  <div className="cta-btn-wrap">
                    <button className="cta-btn" onClick={goHome}>
                      Browse Games
                      <span className="cta-btn-icon"><ArrowRight size={15} strokeWidth={2.8} /></span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* Bottom actions — Back to top + Privacy link */}
          <div className="bottom-actions">
            <button className="back-top-btn" onClick={scrollToTop}>
              <ArrowUp size={14} strokeWidth={2.6} /> Back to top
            </button>
            <button className="privacy-btn" onClick={goPrivacy} type="button">
              <Shield size={14} strokeWidth={2.6} /> Privacy Policy
            </button>
          </div>

        </div>
      </div>
    </>
  );
}