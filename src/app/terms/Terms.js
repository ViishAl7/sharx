"use client";

import React, { useState, useEffect, useRef, useCallback, memo, lazy, Suspense } from "react";
import {
  ChevronDown, ArrowLeft, Shield, FileText,
  Scale, AlertCircle, ArrowUp, UserCheck,
  Ban, Copyright, Mail, Globe, RefreshCw,
  Trash2, Cookie
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SocialComingSoonModal = lazy(() => import("../../legacy/SocialComingSoonModal"));

const TERMS_EMAIL = "vishalxr92@gmail.com";
const LAST_UPDATED = "Sept 2026";

/* ─── Quick cards (hero) ─── */
const QUICK_CARDS = [
  { icon: <UserCheck size={20} strokeWidth={2.2} />, label: "Eligibility", color: "#D4F5E7", accent: "#0EA56B", i: 1 },
  { icon: <Ban size={20} strokeWidth={2.2} />, label: "User Conduct", color: "#EAE0FF", accent: "#7C4DFF", i: 2 },
  { icon: <Globe size={20} strokeWidth={2.2} />, label: "Third-Party Services", color: "#FFE0DA", accent: "#FF5A4A", i: 3 },
  { icon: <Shield size={20} strokeWidth={2.2} />, label: "Your Rights", color: "#FFF2CC", accent: "#E8A100", i: 4 },
];

/* ─── Section 01 — Acceptance & Eligibility ─── */
const ACCEPTANCE_ITEMS = [
  {
    q: "1. Acceptance of Terms",
    a: "By accessing or using SHARX (the \"Website\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree with any part of these Terms, you must not use the Website. These Terms apply to all visitors, users, and others who access or use SHARX.",
  },
  {
    q: "2. Eligibility",
    a: "You must be at least 13 years old (or the minimum age of digital consent in your jurisdiction, whichever is higher) to use SHARX. If you are under 18, you may only use SHARX with the involvement and consent of a parent or legal guardian. By using SHARX, you represent and warrant that you meet these requirements and that you have the legal capacity to enter into these Terms.",
  },
  {
    q: "3. Description of Service",
    a: "SHARX is an online platform that displays and embeds HTML5 browser games provided by third-party game providers, including but not limited to GameMonetize.com (GMO Holding Ltd.) and other game development partners. SHARX does not develop, own, publish, or control these games. The Website is provided free of charge. Some features (such as saving a profile or avatar) require an optional account, but you can access and play games without signing up.",
  },
  {
    q: "4. No Real-Money Gambling or Prizes",
    a: "SHARX is an entertainment platform. None of the games on SHARX involve real-money gambling, betting, or cash prizes. No deposits or withdrawals are possible. If any game ever appears to offer real-money rewards, that game is not endorsed by SHARX and SHARX is not responsible for such claims.",
  },
];

/* ─── Section 02 — User Conduct & Accounts ─── */
const CONDUCT_ITEMS = [
  {
    q: "1. Acceptable Use",
    a: "You agree to use SHARX only for lawful, personal, and non-commercial purposes. You must not use the Website in any way that could damage, disable, overburden, or impair SHARX or interfere with any other party's use of SHARX.",
  },
  {
    q: "2. Prohibited Activities",
    a: "You agree NOT to: (a) use bots, scrapers, automated tools, or any other method to access or copy the Website; (b) hack, reverse-engineer, or attempt to gain unauthorised access to any part of SHARX or its systems; (c) use SHARX to upload, share, or distribute illegal, harmful, threatening, abusive, defamatory, obscene, or infringing content; (d) click on advertisements artificially or generate fake ad impressions (this violates Google AdSense and GameMonetize policies); (e) impersonate any person or entity; (f) collect or store personal data about other users; (g) use SHARX in any way that violates applicable laws and regulations.",
  },
  {
    q: "3. Optional Accounts",
    a: "Creating an account on SHARX is optional. If you create one, you are responsible for: (a) providing accurate information; (b) keeping your login credentials and passkey secure; (c) all activities that occur under your account. You must notify us immediately of any unauthorised use of your account. We may suspend or terminate accounts at our sole discretion.",
  },
  {
    q: "4. User-Generated Content",
    a: "If you submit any content to SHARX (such as a display name, avatar, or feedback), you grant SHARX a non-exclusive, worldwide, royalty-free licence to use, store, and display that content solely for operating the Website. You represent that you own or have the necessary rights to any content you submit. We may remove any content that violates these Terms.",
  },
  {
    q: "5. Enforcement and Termination",
    a: "We reserve the right to terminate or suspend your access to SHARX, without notice and at our sole discretion, if we believe you have violated these Terms or if required by law. We may also remove or disable access to any content at any time. Sections of these Terms that by their nature should survive termination (including IP, indemnity, and liability sections) will survive.",
  },
];

/* ─── Section 03 — Third-Party Services (GameMonetize + AdSense) ─── */
const THIRD_PARTY_ITEMS = [
  {
    q: "1. Games Provided by GameMonetize and Others",
    a: "Most of the games displayed on SHARX are provided by third-party game providers, including GameMonetize.com (GMO Holding Ltd.), and their partner studios. SHARX embeds these games but does not own, control, or operate them. All game content — including graphics, audio, gameplay, and in-game advertising — is the property of the respective game providers and their licensors.",
  },
  {
    q: "2. What This Means for You",
    a: "Because the games are provided by third parties, SHARX does not guarantee: (a) that any game will be available at any given time (games may be added, changed, or removed by GameMonetize without notice); (b) that any game will be free of bugs, errors, or security issues; (c) that in-game advertisements (which may appear inside games provided by GameMonetize) will be relevant, safe, or appropriate. Your use of these games is at your own risk and is also subject to the game provider's own terms and privacy policies.",
  },
  {
    q: "3. In-Game Advertising by GameMonetize",
    a: "Games provided by GameMonetize may include in-game advertisements served by GameMonetize or its advertising partners. SHARX does not control which ads are shown inside these games. Revenue from these ads (where applicable) goes to GameMonetize per our agreement with them. You should review GameMonetize's privacy policy and terms for details on how they handle advertising data.",
  },
  {
    q: "4. Display Advertising on SHARX",
    a: "SHARX may display its own advertisements on the Website (outside of games) served through third-party advertising networks such as Google AdSense. These ads help keep SHARX free to use. We do not control which specific advertisements are shown, and the content of any ad is the sole responsibility of the advertiser and the ad network. Any dealings you have with advertisers found on SHARX are solely between you and the advertiser.",
  },
  {
    q: "5. External Links",
    a: "SHARX may contain links to third-party websites that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. By using SHARX, you acknowledge and agree that SHARX shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of any such third-party content, goods, or services.",
  },
];

/* ─── Section 04 — IP, Liability, Legal ─── */
const LEGAL_ITEMS = [
  {
    q: "1. Intellectual Property",
    a: "The SHARX name, logo, design, source code, and original content are owned by SHARX and protected by copyright and trademark laws. You may not copy, modify, distribute, or create derivative works of SHARX's original content without our prior written consent. Game content belongs to the respective game providers and is used by SHARX under the terms of our agreements with them.",
  },
  {
    q: "2. Copyright Complaints (DMCA)",
    a: `If you believe that any content on SHARX infringes your copyright, please see our separate DMCA / Copyright Policy page for the procedure to submit a notice. You may also contact us at ${TERMS_EMAIL} for any copyright-related questions. We take copyright claims seriously and will act on valid notices.`,
  },
  {
    q: "3. Disclaimer of Warranties",
    a: "SHARX is provided \"AS IS\" and \"AS AVAILABLE\", without any warranties of any kind, whether express, implied, or statutory. To the fullest extent permitted by law, SHARX disclaims all warranties, including (but not limited to) implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Website will be uninterrupted, error-free, secure, or free of viruses or other harmful components.",
  },
  {
    q: "4. Limitation of Liability",
    a: "To the maximum extent permitted by applicable law, SHARX, its founder, and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising out of or in connection with your use of the Website or the games, whether based on warranty, contract, tort, or any other legal theory. Where liability cannot be excluded, our total liability to you shall not exceed INR 500 or the amount you have paid SHARX (if any), whichever is greater.",
  },
  {
    q: "5. Indemnification",
    a: "You agree to indemnify, defend, and hold harmless SHARX, its founder, and its affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of SHARX; (b) your violation of these Terms; (c) your violation of any third-party rights, including any intellectual property or privacy rights; or (d) any content you submit to SHARX.",
  },
  {
    q: "6. Modifications to the Service and Terms",
    a: `We may change, suspend, or discontinue any part of SHARX at any time, with or without notice. We may also update these Terms from time to time. When we make meaningful changes, we will update the "Last updated" date at the top of this page. Your continued use of SHARX after any changes take effect constitutes your acceptance of the updated Terms.`,
  },
  {
    q: "7. Governing Law and Dispute Resolution",
    a: "These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in India. Before initiating any formal legal proceeding, you agree to first contact us at " + TERMS_EMAIL + " to attempt to resolve the matter informally in good faith.",
  },
  {
    q: "8. Grievance Officer (India IT Rules, 2021)",
    a: `In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (India), SHARX has appointed a Grievance Officer. Name: Vishal (Founder, SHARX). Email: ${TERMS_EMAIL}. Response time: We aim to acknowledge complaints within 24 hours and resolve them within 15 days. This contact is for complaints related to content, users, or SHARX's services.`,
  },
  {
    q: "9. Miscellaneous",
    a: "If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect. Our failure to enforce any right or provision shall not be considered a waiver of that right or provision. These Terms, together with our Privacy Policy, Cookie Policy, Disclaimer, and DMCA Policy, constitute the entire agreement between you and SHARX regarding your use of the Website.",
  },
];

/* ─── Accordion ─── */
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

export default function Terms() {
  const router = useRouter();
  const [openAcceptance, setOpenAcceptance] = useState(null);
  const [openConduct, setOpenConduct] = useState(null);
  const [openThirdParty, setOpenThirdParty] = useState(null);
  const [openLegal, setOpenLegal] = useState(null);
  const [seenSections, setSeenSections] = useState(() => new Set([0]));
  const [socialModal, setSocialModal] = useState(null);
  const [navHidden, setNavHidden] = useState(false);

  const section0 = useRef(null);
  const section1 = useRef(null);
  const section2 = useRef(null);
  const section3 = useRef(null);
  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);
  const sectionRefs = [section0, section1, section2, section3];

  const handleSocialClick = useCallback((p) => setSocialModal(p), []);
  const handleCloseSocialModal = useCallback(() => setSocialModal(null), []);
  const handleBack = useCallback(() => {
    if (typeof window !== "undefined") window.history.back();
  }, []);

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

        .navbar {
          position: fixed;
          top: 20px; left: 50%;
          transform: translate3d(-50%, 0, 0);
          width: calc(100% - 40px);
          max-width: 1180px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 22px;
          background: var(--paper);
          border-radius: 100px;
          border: var(--border);
          box-shadow: var(--shadow-md);
          z-index: 999;
          height: 62px;
          transition: transform 0.4s cubic-bezier(.34,1.3,.4,1), opacity 0.3s ease;
          will-change: transform;
        }
        .navbar.hidden {
          transform: translate3d(-50%, -130%, 0);
          opacity: 0;
          pointer-events: none;
        }
        .logo { display: flex; align-items: center; cursor: pointer; background: none; border: none; padding: 0; }
        .logo img { height: 46px; width: auto; object-fit: contain; display: block; }

        .nav-btn {
          height: 38px; padding: 0 18px;
          border: var(--border);
          border-radius: 100px;
          display: flex; align-items: center; gap: 7px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 13px; font-weight: 800;
          color: var(--ink); background: var(--paper);
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

        .wrap {
          position: relative; z-index: 10;
          width: 100%; max-width: 1160px;
          margin: 0 auto;
          padding: 0 40px;
        }
        @media (max-width: 768px) { .wrap { padding: 0 22px; } }
        @media (max-width: 560px) { .wrap { padding: 0 18px; } }

        .hero-inner { text-align: center; max-width: 820px; margin: 0 auto; }
        .hero-title {
          font-size: clamp(36px, 6.5vw, 76px);
          font-weight: 800; color: var(--ink);
          line-height: 1.05; letter-spacing: -1px;
          margin-bottom: 24px;
          transform: rotate(-1deg);
          font-family: var(--font-comfortaa), sans-serif;
          text-shadow: 4px 4px 0 var(--coral-soft);
        }
        .hero-title .hl {
          position: relative;
          display: inline-block;
          z-index: 1;
        }
        .hero-title .hl::before {
          content: "";
          position: absolute;
          left: -6px; right: -6px; bottom: 4px;
          height: 42%;
          background: var(--coral-soft);
          border-radius: 10px;
          z-index: -1;
          transform: rotate(-0.9deg);
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
          background: var(--coral);
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
          font-weight: 800;
          font-size: 68px;
          color: rgba(27, 42, 65, 0.08);
          line-height: 0.9;
          margin-bottom: -6px;
          font-family: var(--font-comfortaa), sans-serif;
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
          font-size: clamp(26px, 4vw, 42px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.1;
          letter-spacing: -0.6px;
          margin-bottom: 14px;
          transform: rotate(-0.8deg);
          font-family: var(--font-comfortaa), sans-serif;
          text-shadow: 3px 3px 0 var(--yellow);
        }
        .col-title.coral { text-shadow: 3px 3px 0 var(--coral-soft); }
        .col-title.mint { text-shadow: 3px 3px 0 var(--mint-soft); }
        .col-title.lilac { text-shadow: 3px 3px 0 var(--lilac-soft); }
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
          .col-num { font-size: 54px; }
          .section-tag { margin: 0 auto 16px; }
          .col-title br { display: none; }
        }
        @media (max-width: 480px) {
          .col-num { font-size: 44px; }
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
        }
        .contact-label {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--ink-soft);
          margin-bottom: 12px;
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
          background: var(--blue);
          border-radius: 100px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.32s cubic-bezier(.34,1.4,.4,1);
        }
        .contact-email:hover {
          color: var(--blue);
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
          max-width: 980px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          padding: 30px 40px 26px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 32px;
        }
        .footer-left {
          display: flex;
          align-items: center;
          gap: 18px;
          justify-content: flex-start;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }
        .footer-logo:hover { opacity: 0.75; }
        .footer-logo img { height: 44px; width: auto; object-fit: contain; display: block; }
        .footer-socials { display: flex; gap: 10px; }
        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 14px 16px 12px 18px;
          background: var(--paper);
          border: var(--border);
          cursor: pointer;
          transition: transform 0.28s cubic-bezier(.34,1.4,.4,1), box-shadow 0.28s, background 0.28s;
          box-shadow: var(--shadow-sm);
          text-decoration: none;
        }
        .social-icon svg { width: 20px; height: 20px; fill: var(--ink); transition: fill 0.28s; }
        .social-icon.instagram svg { fill: #E1306C; }
        .social-icon.youtube svg { fill: #FF0000; }
        .social-icon:hover {
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
          background: #fff;
        }
        .footer-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }
        .footer-center-title {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--ink-mute);
          font-family: var(--font-comfortaa), sans-serif;
        }
        .footer-center-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .footer-link {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--ink);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.22s ease;
          position: relative;
          font-family: var(--font-comfortaa), sans-serif;
        }
        .footer-link::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -4px;
          height: 2px;
          background: var(--blue);
          border-radius: 100px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.28s cubic-bezier(.34,1.4,.4,1);
        }
        .footer-link:hover { color: var(--blue); }
        .footer-link:hover::after { transform: scaleX(1); }
        .footer-right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .footer-copyright {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-mute);
          letter-spacing: 0.3px;
          font-family: var(--font-comfortaa), sans-serif;
          text-align: right;
          transition: color 0.22s;
        }
        .footer-copyright:hover { color: var(--ink); }

        @media (max-width: 768px) {
          .footer-body { padding: 24px 22px 22px; }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 22px;
            justify-items: center;
          }
          .footer-left { justify-content: center; flex-wrap: wrap; }
          .footer-center-links { flex-wrap: wrap; justify-content: center; }
          .footer-right { justify-content: center; }
          .footer-copyright { text-align: center; }
        }
        @media (max-width: 480px) {
          .site-footer { margin-top: 32px; padding: 0 16px 22px; }
          .footer-body { padding: 22px 18px; border-radius: 22px; }
          .footer-logo img { height: 38px; }
          .social-icon { width: 40px; height: 40px; }
          .social-icon svg { width: 18px; height: 18px; }
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
              onClick={() => router.push("/")}
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
                  Terms of<br />
                  <span className="hl">Service.</span>
                </h1>
                <p className="hero-sub">
                  These terms explain the rules for using SHARX — what you can
                  expect from us, and what we expect from you.
                </p>
                <div className="hero-meta">
                  <span className="hero-meta-dot" />
                  Last updated: {LAST_UPDATED}
                </div>

                <div className="hero-btn-wrap">
                  <button className="hero-btn" onClick={() => goTo(1)}>
                    <span>Read the terms</span>
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

          {/* SECTION 2 — Acceptance & Eligibility */}
          <div className={`section s2 ${seenSections.has(1) ? "seen" : ""}`} ref={section1}>
            <div className="wrap">
              <div className="two-col">
                <div className="col-sticky">
                  <div className="col-num">01</div>
                  <div className="section-tag"><FileText size={12} strokeWidth={2.6} /> Acceptance &amp; Eligibility</div>
                  <h2 className="col-title">Getting<br />Started.</h2>
                  <p className="col-desc">
                    By using SHARX, you agree to these terms. You must be at least
                    13 years old (or the minimum age of digital consent in your
                    country) to use the Website.
                  </p>
                </div>
                <div>
                  {ACCEPTANCE_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={`acceptance-${i}`}
                      id={`acceptance-${i}`}
                      item={item}
                      isOpen={openAcceptance === i}
                      onToggle={() => setOpenAcceptance(openAcceptance === i ? null : i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 — Conduct & Accounts */}
          <div className={`section s3 ${seenSections.has(2) ? "seen" : ""}`} ref={section2}>
            <div className="wrap">
              <div className="two-col">
                <div className="col-sticky">
                  <div className="col-num">02</div>
                  <div className="section-tag"><UserCheck size={12} strokeWidth={2.6} /> User Conduct</div>
                  <h2 className="col-title coral">Using<br />SHARX.</h2>
                  <p className="col-desc">
                    SHARX is free to use, but there are rules. No bots, no
                    hacking, no ad-fraud, no illegal content. Accounts are
                    optional but come with responsibilities.
                  </p>
                </div>
                <div>
                  {CONDUCT_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={`conduct-${i}`}
                      id={`conduct-${i}`}
                      item={item}
                      isOpen={openConduct === i}
                      onToggle={() => setOpenConduct(openConduct === i ? null : i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 — Third-Party Services */}
          <div className={`section s4 ${seenSections.has(3) ? "seen" : ""}`} ref={section3}>
            <div className="wrap">
              <div className="two-col">
                <div className="col-sticky">
                  <div className="col-num">03</div>
                  <div className="section-tag"><Globe size={12} strokeWidth={2.6} /> Third-Party Services</div>
                  <h2 className="col-title mint">Games &amp;<br />Ads.</h2>
                  <p className="col-desc">
                    Games on SHARX are provided by third-party providers like
                    GameMonetize. Ads come from networks like Google AdSense. Both
                    are outside our direct control.
                  </p>
                </div>
                <div>
                  {THIRD_PARTY_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={`third-${i}`}
                      id={`third-${i}`}
                      item={item}
                      isOpen={openThirdParty === i}
                      onToggle={() => setOpenThirdParty(openThirdParty === i ? null : i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 — Legal */}
          <div className="section s1">
            <div className="wrap">
              <div className="two-col">
                <div className="col-sticky">
                  <div className="col-num">04</div>
                  <div className="section-tag"><Scale size={12} strokeWidth={2.6} /> Legal</div>
                  <h2 className="col-title lilac">The Legal<br />Stuff.</h2>
                  <p className="col-desc">
                    Intellectual property, liability limits, indemnification,
                    and how we resolve disputes. We keep it clear and fair.
                  </p>
                  <button className="back-top-btn" onClick={() => goTo(0)}>
                    <ArrowUp size={13} strokeWidth={2.6} /> Back to top
                  </button>
                </div>
                <div>
                  {LEGAL_ITEMS.map((item, i) => (
                    <AccordionItem
                      key={`legal-${i}`}
                      id={`legal-${i}`}
                      item={item}
                      isOpen={openLegal === i}
                      onToggle={() => setOpenLegal(openLegal === i ? null : i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <section className="contact-section" aria-label="Contact us about terms">
            <div className="wrap">
              <div className="contact-inner">
                <div className="contact-label">Questions About These Terms</div>
                <h2 className="contact-heading">Reach Us Directly</h2>
                <p className="contact-text">
                  For any legal or terms-related question, contact us at:
                </p>
                <a href={`mailto:${TERMS_EMAIL}`} className="contact-email">
                  {TERMS_EMAIL}
                </a>
                <p className="contact-hint">
                  We&apos;ll review your message and respond when possible.
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="site-footer">
            <div className="footer-body">
              <div className="footer-grid">
                <div className="footer-left">
                  <div className="footer-logo" onClick={() => router.push("/")}>
                    <img src="/sharx-logo.webp" alt="Sharx" draggable={false} />
                  </div>

                  <div className="footer-socials">
                    <a
                      className="social-icon instagram"
                      href="https://www.instagram.com/sharx__games?igsh=NWU3Zm9udDR3NHd4"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      aria-label="Sharx on Instagram"
                    >
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                      </svg>
                    </a>
                    <button
                      type="button"
                      className="social-icon youtube"
                      onClick={() => handleSocialClick("youtube")}
                      title="YouTube"
                      aria-label="Sharx on YouTube"
                    >
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="footer-center">
                  <div className="footer-center-title">Company</div>
                  <div className="footer-center-links">
                    <Link href="/about" className="footer-link">About Us</Link>
                    <Link href="/contact" className="footer-link">Contact</Link>
                    <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                    <Link href="/terms" className="footer-link">Terms of Service</Link>
                  </div>
                </div>

                <div className="footer-right">
                  <span className="footer-copyright">© {new Date().getFullYear()} Sharx. All rights reserved.</span>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </div>

      {socialModal && (
        <Suspense fallback={null}>
          <SocialComingSoonModal
            platform={socialModal}
            onClose={handleCloseSocialModal}
          />
        </Suspense>
      )}
    </>
  );
}