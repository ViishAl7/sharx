"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  FileText,
  UserCheck,
  Globe,
  Scale,
  Mail,
  ChevronRight,
  PenLine,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TERMS_EMAIL = "hello@sharx.in";
const LAST_UPDATED = "Sept 2026";

const STEPS = [
  {
    id: "step-1",
    number: "01",
    label: "The Basics",
    subtitle: "Acceptance & Eligibility",
    icon: FileText,
    tone: "yellow",
    intro:
      "By using SHARX you agree to these terms. You need to be at least 13 years old (or the minimum digital consent age in your country).",
    points: [
      {
        t: "Acceptance of Terms",
        d: 'By accessing or using SHARX (the "Website"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you must not use the Website. These Terms apply to all visitors, users, and others who access or use SHARX.',
      },
      {
        t: "Eligibility",
        d: "You must be at least 13 years old (or the minimum age of digital consent in your jurisdiction, whichever is higher) to use SHARX. If you are under 18, you may only use SHARX with the involvement and consent of a parent or legal guardian. By using SHARX, you represent and warrant that you meet these requirements and that you have the legal capacity to enter into these Terms.",
      },
      {
        t: "Description of Service",
        d: "SHARX is an online platform that displays and embeds HTML5 browser games provided by third-party game providers, including but not limited to GameMonetize.com (GMO Holding Ltd.) and other game development partners. SHARX does not develop, own, publish, or control these games. The Website is provided free of charge. Some features (such as saving a profile or avatar) require an optional account, but you can access and play games without signing up.",
      },
      {
        t: "No Real-Money Gambling or Prizes",
        d: "SHARX is an entertainment platform. None of the games on SHARX involve real-money gambling, betting, or cash prizes. No deposits or withdrawals are possible. If any game ever appears to offer real-money rewards, that game is not endorsed by SHARX and SHARX is not responsible for such claims.",
      },
    ],
  },
  {
    id: "step-2",
    number: "02",
    label: "Using SHARX",
    subtitle: "User Conduct",
    icon: UserCheck,
    tone: "coral",
    intro:
      "SHARX is free to use, but there are rules. No bots, no hacking, no ad-fraud, no illegal content. Accounts are optional but come with responsibilities.",
    points: [
      {
        t: "Acceptable Use",
        d: "You agree to use SHARX only for lawful, personal, and non-commercial purposes. You must not use the Website in any way that could damage, disable, overburden, or impair SHARX or interfere with any other party's use of SHARX.",
      },
      {
        t: "Prohibited Activities",
        d: "You agree NOT to: (a) use bots, scrapers, automated tools, or any other method to access or copy the Website; (b) hack, reverse-engineer, or attempt to gain unauthorised access to any part of SHARX or its systems; (c) use SHARX to upload, share, or distribute illegal, harmful, threatening, abusive, defamatory, obscene, or infringing content; (d) click on advertisements artificially or generate fake ad impressions (this violates Google AdSense and GameMonetize policies); (e) impersonate any person or entity; (f) collect or store personal data about other users; (g) use SHARX in any way that violates applicable laws and regulations.",
      },
      {
        t: "Optional Accounts",
        d: "Creating an account on SHARX is optional. If you create one, you are responsible for: (a) providing accurate information; (b) keeping your login credentials and passkey secure; (c) all activities that occur under your account. You must notify us immediately of any unauthorised use of your account. We may suspend or terminate accounts at our sole discretion.",
      },
      {
        t: "User-Generated Content",
        d: "If you submit any content to SHARX (such as a display name, avatar, or feedback), you grant SHARX a non-exclusive, worldwide, royalty-free licence to use, store, and display that content solely for operating the Website. You represent that you own or have the necessary rights to any content you submit. We may remove any content that violates these Terms.",
      },
      {
        t: "Enforcement and Termination",
        d: "We reserve the right to terminate or suspend your access to SHARX, without notice and at our sole discretion, if we believe you have violated these Terms or if required by law. We may also remove or disable access to any content at any time. Sections of these Terms that by their nature should survive termination (including IP, indemnity, and liability sections) will survive.",
      },
    ],
  },
  {
    id: "step-3",
    number: "03",
    label: "Games & Ads",
    subtitle: "Third-Party Services",
    icon: Globe,
    tone: "blue",
    intro:
      "Games on SHARX are provided by third-party providers like GameMonetize. Ads come from networks like Google AdSense. Both are outside our direct control.",
    points: [
      {
        t: "Games Provided by GameMonetize and Others",
        d: "Most of the games displayed on SHARX are provided by third-party game providers, including GameMonetize.com (GMO Holding Ltd.), and their partner studios. SHARX embeds these games but does not own, control, or operate them. All game content — including graphics, audio, gameplay, and in-game advertising — is the property of the respective game providers and their licensors.",
      },
      {
        t: "What This Means for You",
        d: "Because the games are provided by third parties, SHARX does not guarantee: (a) that any game will be available at any given time (games may be added, changed, or removed by GameMonetize without notice); (b) that any game will be free of bugs, errors, or security issues; (c) that in-game advertisements (which may appear inside games provided by GameMonetize) will be relevant, safe, or appropriate. Your use of these games is at your own risk and is also subject to the game provider's own terms and privacy policies.",
      },
      {
        t: "In-Game Advertising by GameMonetize",
        d: "Games provided by GameMonetize may include in-game advertisements served by GameMonetize or its advertising partners. SHARX does not control which ads are shown inside these games. Revenue from these ads (where applicable) goes to GameMonetize per our agreement with them. You should review GameMonetize's privacy policy and terms for details on how they handle advertising data.",
      },
      {
        t: "Display Advertising on SHARX",
        d: "SHARX may display its own advertisements on the Website (outside of games) served through third-party advertising networks such as Google AdSense. These ads help keep SHARX free to use. We do not control which specific advertisements are shown, and the content of any ad is the sole responsibility of the advertiser and the ad network. Any dealings you have with advertisers found on SHARX are solely between you and the advertiser.",
      },
      {
        t: "External Links",
        d: "SHARX may contain links to third-party websites that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. By using SHARX, you acknowledge and agree that SHARX shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of any such third-party content, goods, or services.",
      },
    ],
  },
  {
    id: "step-4",
    number: "04",
    label: "The Fine Print",
    subtitle: "Legal & Liability",
    icon: Scale,
    tone: "purple",
    intro:
      "Intellectual property, liability limits, indemnification, and how we resolve disputes. We keep it clear and fair.",
    points: [
      {
        t: "Intellectual Property",
        d: "The SHARX name, logo, design, source code, and original content are owned by SHARX and protected by copyright and trademark laws. You may not copy, modify, distribute, or create derivative works of SHARX's original content without our prior written consent. Game content belongs to the respective game providers and is used by SHARX under the terms of our agreements with them.",
      },
      {
        t: "Copyright Complaints (DMCA)",
        d: `If you believe that any content on SHARX infringes your copyright, please see our separate DMCA / Copyright Policy page for the procedure to submit a notice. You may also contact us at ${TERMS_EMAIL} for any copyright-related questions. We take copyright claims seriously and will act on valid notices.`,
      },
      {
        t: "Disclaimer of Warranties",
        d: 'SHARX is provided "AS IS" and "AS AVAILABLE", without any warranties of any kind, whether express, implied, or statutory. To the fullest extent permitted by law, SHARX disclaims all warranties, including (but not limited to) implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Website will be uninterrupted, error-free, secure, or free of viruses or other harmful components.',
      },
      {
        t: "Limitation of Liability",
        d: "To the maximum extent permitted by applicable law, SHARX, its founder, and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising out of or in connection with your use of the Website or the games, whether based on warranty, contract, tort, or any other legal theory. Where liability cannot be excluded, our total liability to you shall not exceed INR 500 or the amount you have paid SHARX (if any), whichever is greater.",
      },
      {
        t: "Indemnification",
        d: "You agree to indemnify, defend, and hold harmless SHARX, its founder, and its affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of SHARX; (b) your violation of these Terms; (c) your violation of any third-party rights, including any intellectual property or privacy rights; or (d) any content you submit to SHARX.",
      },
      {
        t: "Modifications to the Service and Terms",
        d: 'We may change, suspend, or discontinue any part of SHARX at any time, with or without notice. We may also update these Terms from time to time. When we make meaningful changes, we will update the "Last updated" date at the top of this page. Your continued use of SHARX after any changes take effect constitutes your acceptance of the updated Terms.',
      },
      {
        t: "Governing Law and Dispute Resolution",
        d: `These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in India. Before initiating any formal legal proceeding, you agree to first contact us at ${TERMS_EMAIL} to attempt to resolve the matter informally in good faith.`,
      },
      {
        t: "Grievance Officer (India IT Rules, 2021)",
        d: `In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (India), SHARX has appointed a Grievance Officer. Name: Vishal (Founder, SHARX). Email: ${TERMS_EMAIL}. Response time: We aim to acknowledge complaints within 24 hours and resolve them within 15 days. This contact is for complaints related to content, users, or SHARX's services.`,
      },
      {
        t: "Miscellaneous",
        d: "If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect. Our failure to enforce any right or provision shall not be considered a waiver of that right or provision. These Terms, together with our Privacy Policy, Cookie Policy, Disclaimer, and DMCA Policy, constitute the entire agreement between you and SHARX regarding your use of the Website.",
      },
    ],
  },
];

export default function Terms() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(STEPS[0].id);

  const currentStep = useMemo(
    () => STEPS.find((s) => s.id === activeStep) || STEPS[0],
    [activeStep]
  );

  const mailto = useMemo(
    () =>
      `mailto:${TERMS_EMAIL}?subject=${encodeURIComponent(
        "Terms of Service Question"
      )}`,
    []
  );

  const handleBack = () => {
    if (typeof window === "undefined") return;
    const sameOriginReferrer =
      document.referrer && document.referrer.startsWith(window.location.origin);
    if (sameOriginReferrer && window.history.length > 1) {
      window.history.back();
      return;
    }
    router.push("/");
  };

  const CurrentIcon = currentStep.icon;

  return (
    <main className="tp-page">
      <style>{`
        :root {
          --tp-ink: #2a2118;
          --tp-paper: #fdf6e8;
          --tp-paper-deep: #f4ead2;
          --tp-muted: #7a6f5e;
          --tp-line: #2a2118;
          --tp-yellow: #ffd97a;
          --tp-coral: #ff9b8a;
          --tp-blue: #a4d8f5;
          --tp-mint: #b6e8b0;
          --tp-purple: #d9c2f5;
        }

        * { box-sizing: border-box; }

        .tp-page {
          min-height: 100vh;
          color: var(--tp-ink);
          background:
            radial-gradient(circle at 15% 20%, rgba(255,217,122,.20) 0 140px, transparent 141px),
            radial-gradient(circle at 85% 80%, rgba(164,216,245,.18) 0 160px, transparent 161px),
            radial-gradient(circle at 50% 0%, rgba(217,194,245,.14) 0 200px, transparent 201px),
            var(--tp-paper);
          background-attachment: fixed;
          font-family: "Nunito", "Trebuchet MS", system-ui, sans-serif;
          overflow-x: hidden;
        }

        .tp-wrap {
          width: min(1160px, calc(100% - 44px));
          margin: 0 auto;
          padding: 26px 0 60px;
        }

        /* ─── NAV ─── */
        .tp-nav {
          height: 66px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .tp-logo {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
        }
        .tp-logo img {
          height: 62px;
          width: auto;
          display: block;
          object-fit: contain;
        }

        .tp-back {
          min-height: 42px;
          padding: 0 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 2.5px solid var(--tp-line);
          border-radius: 999px;
          background: var(--tp-paper);
          color: var(--tp-ink);
          box-shadow: 4px 4px 0 var(--tp-line);
          font: 800 13px/1 "Nunito", sans-serif;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .tp-back:hover {
          transform: translate(-2px,-2px) rotate(-1deg);
          box-shadow: 6px 6px 0 var(--tp-line);
        }
        .tp-back:active {
          transform: translate(0,0);
          box-shadow: 4px 4px 0 var(--tp-line);
        }

        /* ─── HERO (Split: left text, right card) ─── */
        .tp-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
          gap: 40px;
          align-items: center;
          padding: 55px 0 50px;
        }

        .tp-hero-left { min-width: 0; }

        .tp-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border: 2.5px solid var(--tp-line);
          background: var(--tp-yellow);
          box-shadow: 3px 3px 0 var(--tp-line);
          transform: rotate(-1.2deg);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .tp-hero h1 {
          margin: 20px 0 18px;
          font-size: clamp(42px, 6.2vw, 82px);
          line-height: .96;
          letter-spacing: -.045em;
          font-weight: 900;
        }

        .tp-hero h1 .hl {
          position: relative;
          display: inline-block;
          z-index: 0;
        }
        .tp-hero h1 .hl::before {
          content: "";
          position: absolute;
          z-index: -1;
          left: -6px; right: -10px; bottom: 6px;
          height: 26%;
          background: var(--tp-coral);
          transform: rotate(-1.5deg);
          border-radius: 3px;
        }

        .tp-hero-sub {
          max-width: 560px;
          margin: 0 0 22px;
          color: var(--tp-muted);
          font-size: clamp(16px, 1.8vw, 19px);
          line-height: 1.65;
          font-weight: 500;
        }

        .tp-hero-meta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border: 2px dashed rgba(42,33,24,.4);
          background: rgba(255,255,255,.6);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .04em;
        }
        .tp-hero-meta .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--tp-mint);
          border: 1.5px solid var(--tp-line);
        }

        /* Right card — crayon note */
        .tp-note {
          position: relative;
          background: var(--tp-blue);
          border: 3px solid var(--tp-line);
          border-radius: 4px;
          padding: 30px 28px 26px;
          box-shadow: 6px 6px 0 var(--tp-line);
          transform: rotate(1.2deg);
          max-width: 420px;
          margin-left: auto;
        }
        .tp-note::before {
          content: "";
          position: absolute;
          top: -14px; left: 30px;
          width: 70px; height: 22px;
          background: rgba(255,255,255,.6);
          border: 2px solid var(--tp-line);
          transform: rotate(-3deg);
        }
        .tp-note-icon {
          width: 52px; height: 52px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 2.5px solid var(--tp-line);
          background: var(--tp-yellow);
          box-shadow: 3px 3px 0 var(--tp-line);
          margin-bottom: 14px;
          transform: rotate(-4deg);
        }
        .tp-note small {
          display: block;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
          margin-bottom: 6px;
          color: rgba(42,33,24,.7);
        }
        .tp-note strong {
          display: block;
          font-size: 20px;
          line-height: 1.3;
          font-weight: 900;
          margin-bottom: 8px;
        }
        .tp-note p {
          margin: 0 0 16px;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 600;
          color: rgba(42,33,24,.72);
        }
        .tp-note-mail {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 2.5px solid var(--tp-line);
          background: var(--tp-paper);
          color: var(--tp-ink);
          box-shadow: 3px 3px 0 var(--tp-line);
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
          transition: transform .18s ease, box-shadow .18s ease;
          word-break: break-all;
        }
        .tp-note-mail:hover {
          transform: translate(-2px,-2px);
          box-shadow: 5px 5px 0 var(--tp-line);
        }

        /* ─── STEPS ROW ─── */
        .tp-steps {
          display: grid;
          grid-template-columns: repeat(4, minmax(0,1fr));
          gap: 14px;
          margin-top: 8px;
        }
        .tp-step {
          position: relative;
          text-align: left;
          padding: 20px 18px 22px;
          border: 2.5px solid var(--tp-line);
          background: var(--tp-paper);
          box-shadow: 4px 4px 0 var(--tp-line);
          cursor: pointer;
          font-family: inherit;
          color: var(--tp-ink);
          transition: transform .25s cubic-bezier(.34,1.3,.4,1), box-shadow .25s ease, background .25s ease;
        }
        .tp-step:hover {
          transform: translate(-3px,-3px) rotate(-.6deg);
          box-shadow: 6px 6px 0 var(--tp-line);
        }
        .tp-step.is-active {
          transform: translate(-3px,-3px);
          box-shadow: 6px 6px 0 var(--tp-line);
        }
        .tp-step:nth-child(1).is-active { background: var(--tp-yellow); }
        .tp-step:nth-child(2).is-active { background: var(--tp-coral); }
        .tp-step:nth-child(3).is-active { background: var(--tp-blue); }
        .tp-step:nth-child(4).is-active { background: var(--tp-purple); }

        .tp-step-num {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .1em;
          color: rgba(42,33,24,.45);
          margin-bottom: 12px;
        }
        .tp-step.is-active .tp-step-num { color: rgba(42,33,24,.75); }

        .tp-step-icon {
          width: 40px; height: 40px;
          display: grid;
          place-items: center;
          border: 2.5px solid var(--tp-line);
          background: var(--tp-paper);
          box-shadow: 2px 2px 0 var(--tp-line);
          margin-bottom: 12px;
          transform: rotate(-3deg);
          transition: transform .25s cubic-bezier(.34,1.3,.4,1);
        }
        .tp-step:hover .tp-step-icon { transform: rotate(4deg) scale(1.06); }

        .tp-step-label {
          display: block;
          font-size: 15px;
          font-weight: 900;
          line-height: 1.25;
          margin-bottom: 3px;
        }
        .tp-step-sub {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: rgba(42,33,24,.55);
          letter-spacing: .02em;
        }
        .tp-step.is-active .tp-step-sub { color: rgba(42,33,24,.8); }

        /* ─── CONTENT CARD ─── */
        .tp-content {
          margin-top: 30px;
          border: 3px solid var(--tp-line);
          background: var(--tp-paper);
          box-shadow: 8px 8px 0 var(--tp-line);
          padding: 40px 42px 36px;
          position: relative;
          animation: tpFadeIn .35s ease both;
        }

        @keyframes tpFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tp-content-head {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 22px;
          align-items: flex-start;
          padding-bottom: 22px;
          border-bottom: 2px dashed rgba(42,33,24,.28);
          margin-bottom: 24px;
        }

        .tp-content-icon {
          width: 64px; height: 64px;
          border-radius: 6px;
          display: grid;
          place-items: center;
          border: 2.5px solid var(--tp-line);
          background: var(--tp-yellow);
          box-shadow: 3px 3px 0 var(--tp-line);
          transform: rotate(-3deg);
          flex-shrink: 0;
        }
        .tp-content-icon.tone-coral { background: var(--tp-coral); transform: rotate(2deg); }
        .tp-content-icon.tone-blue { background: var(--tp-blue); transform: rotate(-2deg); }
        .tp-content-icon.tone-purple { background: var(--tp-purple); transform: rotate(3deg); }
        .tp-content-icon.tone-yellow { background: var(--tp-yellow); }

        .tp-content-title {
          margin: 0 0 6px;
          font-size: clamp(24px, 3.2vw, 36px);
          line-height: 1.1;
          letter-spacing: -.03em;
          font-weight: 900;
        }
        .tp-content-title .num {
          color: rgba(42,33,24,.28);
          margin-right: 8px;
        }
        .tp-content-intro {
          margin: 0;
          max-width: 720px;
          color: var(--tp-muted);
          font-size: 14.5px;
          line-height: 1.7;
          font-weight: 500;
        }

        .tp-points {
          display: grid;
          gap: 18px;
        }

        .tp-point {
          padding: 18px 20px;
          border: 2px solid rgba(42,33,24,.85);
          background: rgba(255,255,255,.5);
          box-shadow: 3px 3px 0 rgba(42,33,24,.85);
          transition: transform .22s ease, box-shadow .22s ease;
        }
        .tp-point:hover {
          transform: translate(-2px,-2px);
          box-shadow: 5px 5px 0 rgba(42,33,24,.85);
        }

        .tp-point-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 8px;
          font-size: 15.5px;
          font-weight: 900;
          line-height: 1.3;
        }
        .tp-point-title .marker {
          width: 22px; height: 22px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 2px solid var(--tp-line);
          background: var(--tp-paper);
          border-radius: 50%;
          font-size: 11px;
          font-weight: 900;
          box-shadow: 1.5px 1.5px 0 var(--tp-line);
        }
        .tp-point-text {
          margin: 0;
          color: #57503f;
          font-size: 14px;
          line-height: 1.75;
          font-weight: 500;
        }

        /* ─── BOTTOM ─── */
        .tp-bottom {
          margin-top: 55px;
          padding: 30px 32px;
          border: 3px solid var(--tp-line);
          background: var(--tp-paper-deep);
          box-shadow: 5px 5px 0 var(--tp-line);
          transform: rotate(-.4deg);
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 24px;
          align-items: center;
        }
        .tp-bottom-icon {
          width: 60px; height: 60px;
          display: grid;
          place-items: center;
          border: 2.5px solid var(--tp-line);
          background: var(--tp-mint);
          box-shadow: 3px 3px 0 var(--tp-line);
          transform: rotate(-5deg);
        }
        .tp-bottom-text h3 {
          margin: 0 0 4px;
          font-size: 20px;
          font-weight: 900;
        }
        .tp-bottom-text p {
          margin: 0;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 600;
          color: var(--tp-muted);
        }
        .tp-bottom-text p strong { color: var(--tp-ink); }
        .tp-bottom-mail {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 18px;
          border: 2.5px solid var(--tp-line);
          background: var(--tp-coral);
          color: var(--tp-ink);
          box-shadow: 4px 4px 0 var(--tp-line);
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 900;
          transition: transform .18s ease, box-shadow .18s ease;
          white-space: nowrap;
        }
        .tp-bottom-mail:hover {
          transform: translate(-2px,-2px) rotate(-1deg);
          box-shadow: 6px 6px 0 var(--tp-line);
        }

        /* ─── FOOTER ─── */
        .tp-footer {
          margin-top: 55px;
          padding-top: 22px;
          border-top: 2px dashed rgba(42,33,24,.3);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: var(--tp-muted);
          font-size: 11.5px;
          font-weight: 700;
        }
        .tp-footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }
        .tp-footer a {
          color: inherit;
          text-decoration: none;
          transition: color .2s ease;
        }
        .tp-footer a:hover { color: var(--tp-ink); }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 960px) {
          .tp-hero {
            grid-template-columns: 1fr;
            gap: 30px;
            padding: 42px 0 40px;
          }
          .tp-note {
            margin: 0;
            max-width: none;
            transform: rotate(-.6deg);
          }
          .tp-steps {
            grid-template-columns: repeat(2, minmax(0,1fr));
          }
        }

        @media (max-width: 640px) {
          .tp-wrap {
            width: min(100% - 30px, 560px);
            padding-top: 18px;
          }
          .tp-nav { height: 58px; }
          .tp-logo img { height: 52px; }
          .tp-back { min-height: 38px; padding: 0 16px; font-size: 12px; }

          .tp-hero { padding: 32px 0 30px; }
          .tp-hero h1 { font-size: clamp(38px, 12vw, 56px); }

          .tp-note { padding: 26px 22px 22px; }
          .tp-note-mail { font-size: 12px; padding: 9px 12px; }

          .tp-content {
            padding: 26px 20px 22px;
            box-shadow: 5px 5px 0 var(--tp-line);
          }
          .tp-content-head {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .tp-content-icon { width: 52px; height: 52px; }

          .tp-point { padding: 15px 16px; }
          .tp-point-title { font-size: 14px; }
          .tp-point-text { font-size: 13px; }

          .tp-bottom {
            grid-template-columns: 1fr;
            text-align: left;
            padding: 24px 20px;
            gap: 16px;
          }
          .tp-bottom-icon { width: 52px; height: 52px; }
          .tp-bottom-mail { width: 100%; justify-content: center; }

          .tp-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="tp-wrap">
        {/* NAV */}
        <nav className="tp-nav">
          <button
            type="button"
            className="tp-logo"
            onClick={() => router.push("/")}
            aria-label="Go to SHARX home"
          >
            <img src="/sharx-logo.webp" alt="SHARX" />
          </button>
          <button type="button" className="tp-back" onClick={handleBack}>
            <ArrowLeft size={14} strokeWidth={2.8} />
            Back
          </button>
        </nav>

        {/* HERO */}
        <header className="tp-hero">
          <div className="tp-hero-left">
            <span className="tp-badge">
              <PenLine size={14} strokeWidth={2.8} />
              Terms of Service
            </span>

            <h1>
              Simple rules.
              <br />
              Fair <span className="hl">play.</span>
            </h1>

            <p className="tp-hero-sub">
              Everything you need to know about using SHARX — in plain,
              friendly language. No legalese walls, no hidden surprises.
            </p>

            <span className="tp-hero-meta">
              <span className="dot" />
              Last updated · {LAST_UPDATED}
            </span>
          </div>

          {/* Crayon note on right */}
          <aside className="tp-note">
            <div className="tp-note-icon">
              <Sparkles size={24} strokeWidth={2.6} />
            </div>
            <small>Got a legal question?</small>
            <strong>Talk to us directly.</strong>
            <p>
              For any terms or legal question, drop us a line. We read every
              message and reply when we can.
            </p>
            <a className="tp-note-mail" href={mailto}>
              <Mail size={15} strokeWidth={2.6} />
              {TERMS_EMAIL}
            </a>
          </aside>
        </header>

        {/* STEP TABS */}
        <section className="tp-steps" aria-label="Terms sections">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                className={`tp-step ${isActive ? "is-active" : ""}`}
                onClick={() => setActiveStep(step.id)}
                aria-pressed={isActive}
              >
                <span className="tp-step-num">{step.number}</span>
                <span className="tp-step-icon">
                  <Icon size={18} strokeWidth={2.6} />
                </span>
                <span className="tp-step-label">{step.label}</span>
                <span className="tp-step-sub">{step.subtitle}</span>
              </button>
            );
          })}
        </section>

        {/* CONTENT */}
        <section
          key={currentStep.id}
          className="tp-content"
          aria-live="polite"
        >
          <div className="tp-content-head">
            <div className={`tp-content-icon tone-${currentStep.tone}`}>
              <CurrentIcon size={30} strokeWidth={2.6} />
            </div>
            <div>
              <h2 className="tp-content-title">
                <span className="num">{currentStep.number}.</span>
                {currentStep.subtitle}
              </h2>
              <p className="tp-content-intro">{currentStep.intro}</p>
            </div>
          </div>

          <div className="tp-points">
            {currentStep.points.map((p, i) => (
              <div className="tp-point" key={`${currentStep.id}-${i}`}>
                <h3 className="tp-point-title">
                  <span className="marker">{i + 1}</span>
                  {p.t}
                </h3>
                <p className="tp-point-text">{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM NOTE */}
        <section className="tp-bottom">
          <div className="tp-bottom-icon">
            <ChevronRight size={26} strokeWidth={2.8} />
          </div>
          <div className="tp-bottom-text">
            <h3>Still have a question?</h3>
            <p>
              Use the subject line <strong>Terms of Service Question</strong>{" "}
              so your message is easy to spot in our inbox.
            </p>
          </div>
          <a className="tp-bottom-mail" href={mailto}>
            <Mail size={16} strokeWidth={2.6} />
            Contact SHARX
          </a>
        </section>

        {/* FOOTER */}
        <footer className="tp-footer">
          <span>© {new Date().getFullYear()} SHARX. All rights reserved.</span>
          <div className="tp-footer-links">
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/copyright">Copyright</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}