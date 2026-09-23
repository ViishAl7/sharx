"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Copyright,
  FileWarning,
  Mail,
  ShieldCheck,
  Scale,
  Send,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

const COPYRIGHT_EMAIL = "copyright@sharx.in";
const LAST_UPDATED = "Sept 2026";

const sections = [
  {
    id: "commitment",
    number: "01",
    label: "THE PROMISE",
    title: "Our commitment to creators",
    icon: ShieldCheck,
    tone: "yellow",
    body: (
      <>
        <p>
          SHARX respects the intellectual property rights of game developers,
          publishers, artists, creators, and other rights holders.
        </p>
        <p>
          SHARX may provide access to browser games and other content supplied,
          embedded, linked, or distributed through third-party sources. Unless
          expressly stated otherwise, SHARX does not claim ownership of
          third-party games, characters, artwork, music, trademarks, logos, or
          other copyrighted materials.
        </p>
        <p>
          If you believe content available through SHARX infringes your
          copyright or other intellectual-property rights, you can submit a
          copyright removal request using the process on this page.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    number: "02",
    label: "WHO CAN REPORT",
    title: "Who can submit a complaint?",
    icon: Scale,
    tone: "blue",
    body: (
      <>
        <p>A copyright complaint should be submitted only by:</p>
        <ul>
          <li>the copyright owner; or</li>
          <li>a person authorized to act on behalf of the copyright owner.</li>
        </ul>
        <p>
          If you are reporting content owned by someone else, please provide
          information establishing your authority to submit the complaint.
        </p>
      </>
    ),
  },
  {
    id: "notice",
    number: "03",
    label: "THE NOTICE",
    title: "What to include in a copyright notice",
    icon: FileWarning,
    tone: "coral",
    body: (
      <>
        <p>
          To help us locate and review the reported material, please include
          the following information:
        </p>
        <ol className="sx-list">
          <li><strong>Identification of the copyrighted work.</strong> Clearly identify the original work you believe has been infringed.</li>
          <li><strong>Identification of the reported content.</strong> Identify the game, page, image, video, artwork, audio, text, or other material you are reporting.</li>
          <li><strong>Location of the content.</strong> Provide the SHARX URL or other information reasonably sufficient for us to locate it.</li>
          <li><strong>Your contact information.</strong> Include your full name, email address, telephone number if available, and mailing address.</li>
          <li><strong>Your authority.</strong> State whether you are the copyright owner or an authorized representative.</li>
          <li><strong>Good-faith statement.</strong> State that you have a good-faith belief that the reported use is not authorized by the copyright owner, its agent, or applicable law.</li>
          <li><strong>Accuracy and authority statement.</strong> Confirm that the information in the notification is accurate and, where applicable, that you are authorized to act for the copyright owner.</li>
          <li><strong>Signature.</strong> Provide a physical or electronic signature.</li>
        </ol>
      </>
    ),
  },
  {
    id: "review",
    number: "04",
    label: "OUR PROCESS",
    title: "What happens after a report?",
    icon: Send,
    tone: "green",
    body: (
      <>
        <p>
          After receiving a copyright complaint, SHARX may review the
          information provided and may request additional information or
          documentation where necessary.
        </p>
        <p>
          Where appropriate, SHARX may contact a relevant developer, publisher,
          distributor, content provider, or reporting party and may restrict,
          disable, or remove access to reported material while the matter is
          reviewed.
        </p>
        <p>
          Submitting a complaint does not by itself establish that infringement
          has occurred. SHARX may consider the information provided and the
          circumstances of the complaint before taking action.
        </p>
      </>
    ),
  },
  {
    id: "counter",
    number: "05",
    label: "IF SOMETHING WAS REMOVED",
    title: "Counter-notifications",
    icon: Copyright,
    tone: "purple",
    body: (
      <>
        <p>
          If content has been removed or disabled because of a copyright
          complaint and you believe the removal resulted from a mistake or
          misidentification, you may submit a counter-notification where the
          applicable legal process permits.
        </p>
        <p>
          A DMCA-style counter-notification generally identifies the removed
          material and its former location, includes the required good-faith
          statement, and provides the required contact information and
          signature.
        </p>
        <p>
          Where a specific statutory process applies, SHARX will handle a valid
          counter-notification in accordance with the applicable law and
          procedure.
        </p>
      </>
    ),
  },
  {
    id: "false",
    number: "06",
    label: "PLEASE BE ACCURATE",
    title: "False or misleading complaints",
    icon: FileWarning,
    tone: "orange",
    body: (
      <>
        <p>
          Please do not submit a copyright complaint containing information
          that you know to be false or misleading.
        </p>
        <p>
          SHARX may request additional information where necessary to evaluate
          the validity of a complaint and may take appropriate action regarding
          knowingly abusive or misleading submissions.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    number: "07",
    label: "THIRD-PARTY CONTENT",
    title: "Games & content from others",
    icon: ExternalLink,
    tone: "blue",
    body: (
      <>
        <p>
          Some games and other content accessible through SHARX may be supplied,
          embedded, linked, or distributed by third-party developers,
          publishers, distributors, game networks, or other content providers.
        </p>
        <p>
          Copyright and other intellectual-property rights in third-party
          content remain with their respective owners.
        </p>
        <p>
          If your complaint concerns third-party content, you may also contact
          the relevant developer, publisher, distributor, or original content
          provider.
        </p>
      </>
    ),
  },
];

function PolicyCard({ item, open, onToggle }) {
  const Icon = item.icon;

  return (
    <article className={`sx-card tone-${item.tone} ${open ? "open" : ""}`} id={item.id}>
      <button
        type="button"
        className="sx-card-button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`${item.id}-body`}
      >
        <span className="sx-card-index">{item.number}</span>
        <span className="sx-card-icon"><Icon size={19} strokeWidth={2.4} /></span>
        <span className="sx-card-heading">
          <small>{item.label}</small>
          <strong>{item.title}</strong>
        </span>
        <span className="sx-card-arrow"><ChevronDown size={19} strokeWidth={2.7} /></span>
      </button>

      <div
        id={`${item.id}-body`}
        className={`sx-card-body ${open ? "open" : ""}`}
        role="region"
        aria-hidden={!open}
      >
        <div className="sx-card-body-inner">
          <div className="sx-card-text">{item.body}</div>
        </div>
      </div>
    </article>
  );
}

export default function CopyrightPage() {
  // ✅ FIX: koi bhi card shuru mein khula nahi hoga
  const [open, setOpen] = useState("");

  const handleBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };

  const jumpTo = (id) => {
    setOpen(id);
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <main className="sx-page">
      <style>{`
        :root {
          --sx-ink: #20211d;
          --sx-paper: #fffdf5;
          --sx-paper-deep: #f8f1dd;
          --sx-muted: #66665d;
          --sx-line: #22231f;
          --sx-yellow: #ffe66b;
          --sx-coral: #ff806f;
          --sx-blue: #9ddaf7;
          --sx-green: #a7df9f;
          --sx-purple: #d8b8f5;
          --sx-orange: #ffc875;
          --sx-shadow: 5px 5px 0 var(--sx-line);
        }

        * { box-sizing: border-box; }

        .sx-page {
          min-height: 100vh;
          color: var(--sx-ink);
          background:
            radial-gradient(circle at 20% 12%, rgba(255,230,107,.16) 0 120px, transparent 121px),
            radial-gradient(circle at 88% 72%, rgba(157,218,247,.13) 0 150px, transparent 151px),
            radial-gradient(circle at 8% 88%, rgba(167,223,159,.10) 0 110px, transparent 111px),
            var(--sx-paper);
          background-attachment: fixed;
          font-family: "Nunito", "Trebuchet MS", system-ui, sans-serif;
          overflow-x: hidden;
        }

        .sx-wrap {
          width: min(1160px, calc(100% - 44px));
          margin: 0 auto;
          padding: 26px 0 54px;
        }

        .sx-nav {
          height: 66px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .sx-logo {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
        }

        .sx-logo img {
          width: auto;
          height: 62px;
          display: block;
          object-fit: contain;
        }

        .sx-back {
          min-height: 40px;
          padding: 0 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 2px solid var(--sx-line);
          border-radius: 999px;
          background: var(--sx-paper);
          color: var(--sx-ink);
          box-shadow: 3px 3px 0 var(--sx-line);
          font: 800 13px/1 "Nunito", sans-serif;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .sx-back:hover {
          transform: translate(-2px,-2px) rotate(-1deg);
          box-shadow: 5px 5px 0 var(--sx-line);
        }
        .sx-back:active {
          transform: translate(0,0);
          box-shadow: 3px 3px 0 var(--sx-line);
        }

        /* ─── HERO ─── */
        .sx-hero {
          position: relative;
          padding: 72px 0 46px;
        }

        .sx-doodle {
          position: absolute;
          right: 7%;
          top: 42px;
          width: 104px;
          height: 78px;
          pointer-events: none;
          transform: rotate(7deg);
        }

        .sx-doodle::before,
        .sx-doodle::after {
          content: "";
          position: absolute;
          border: 3px solid var(--sx-line);
          border-radius: 48% 52% 50% 46%;
        }

        .sx-doodle::before {
          inset: 7px 17px 10px 9px;
          border-right-color: transparent;
          transform: rotate(-18deg);
        }

        .sx-doodle::after {
          inset: 17px 4px 1px 28px;
          border-left-color: transparent;
          transform: rotate(24deg);
        }

        .sx-sticker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border: 2px solid var(--sx-line);
          background: var(--sx-yellow);
          box-shadow: 3px 3px 0 var(--sx-line);
          transform: rotate(-1.5deg);
          font-size: 11px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: .11em;
          text-transform: uppercase;
        }

        .sx-hero h1 {
          max-width: 930px;
          margin: 21px 0 18px;
          font-size: clamp(50px, 7.4vw, 92px);
          line-height: .95;
          letter-spacing: -.05em;
          font-weight: 900;
          color: var(--sx-ink);
        }

        .sx-highlight {
          position: relative;
          display: inline-block;
          z-index: 0;
        }

        .sx-highlight::before {
          content: "";
          position: absolute;
          z-index: -1;
          left: -5px;
          right: -10px;
          bottom: 7px;
          height: 23%;
          background: var(--sx-coral);
          transform: rotate(-1.8deg);
          border-radius: 2px;
        }

        .sx-lead {
          max-width: 760px;
          margin: 0;
          color: var(--sx-muted);
          font-size: clamp(17px, 2vw, 21px);
          line-height: 1.65;
          font-weight: 500;
        }

        .sx-meta {
          margin-top: 25px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .sx-meta span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 12px;
          border: 1.7px dashed rgba(32,33,29,.48);
          background: rgba(255,255,255,.54);
          font-size: 11px;
          font-weight: 800;
        }

        /* ─── CONTACT BOX (DISABLED) ─── */
        .sx-contact {
          position: relative;
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 22px;
          align-items: center;
          padding: 25px 28px;
          border: 2px solid var(--sx-line);
          background: var(--sx-blue);
          box-shadow: var(--sx-shadow);
          transform: rotate(-.35deg);
        }

        .sx-contact::after {
          content: "✓";
          position: absolute;
          right: 17px;
          top: -19px;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 2px solid var(--sx-line);
          border-radius: 50%;
          background: var(--sx-green);
          font-size: 19px;
          font-weight: 900;
          transform: rotate(9deg);
          box-shadow: 2px 2px 0 var(--sx-line);
        }

        .sx-contact small {
          display: block;
          margin-bottom: 5px;
          font-size: 10px;
          letter-spacing: .12em;
          font-weight: 900;
          text-transform: uppercase;
        }

        .sx-contact strong {
          display: block;
          font-size: 19px;
          line-height: 1.3;
        }

        .sx-contact p {
          margin: 6px 0 0;
          color: rgba(32,33,29,.68);
          font-size: 13px;
          line-height: 1.5;
        }

        /* Disabled email pill */
        .sx-mail-disabled {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px dashed rgba(32,33,29,.45);
          background: rgba(255,253,245,.6);
          color: rgba(32,33,29,.55);
          box-shadow: 3px 3px 0 rgba(32,33,29,.25);
          font-size: 14px;
          font-weight: 800;
          cursor: not-allowed;
          position: relative;
          user-select: none;
        }
        .sx-mail-disabled::after {
          content: "Temporarily unavailable";
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: #b0453a;
          white-space: nowrap;
        }

        /* ─── CONTENT ─── */
        .sx-content {
          display: grid;
          grid-template-columns: 225px minmax(0,1fr);
          gap: 27px;
          align-items: start;
          margin-top: 48px;
        }

        .sx-index {
          position: sticky;
          top: 20px;
          padding: 17px;
          border: 2px solid var(--sx-line);
          background: var(--sx-paper-deep);
          box-shadow: 4px 4px 0 var(--sx-line);
          transform: rotate(-.55deg);
          transition: transform .3s ease;
        }
        .sx-index:hover { transform: rotate(0deg); }

        .sx-index-title {
          margin: 0 0 9px;
          font-size: 10px;
          letter-spacing: .12em;
          font-weight: 900;
          text-transform: uppercase;
        }

        .sx-index button {
          width: 100%;
          padding: 10px 4px;
          border: 0;
          border-bottom: 1.5px dashed rgba(32,33,29,.25);
          background: transparent;
          color: var(--sx-ink);
          text-align: left;
          font: 700 11px/1.3 "Nunito", sans-serif;
          cursor: pointer;
          transition: padding .15s ease, transform .15s ease;
        }

        .sx-index button:last-child { border-bottom: 0; }

        .sx-index button:hover {
          padding-left: 9px;
          transform: rotate(-.6deg);
        }

        .sx-cards {
          display: grid;
          gap: 14px;
        }

        .sx-card {
          scroll-margin-top: 22px;
          border: 2px solid var(--sx-line);
          background: rgba(255,253,245,.95);
          box-shadow: 3px 3px 0 var(--sx-line);
          transition: transform .25s cubic-bezier(.34,1.3,.4,1), box-shadow .25s ease;
          overflow: hidden;
        }

        .sx-card:nth-child(2n) { transform: rotate(.22deg); }
        .sx-card:nth-child(3n) { transform: rotate(-.18deg); }

        .sx-card:hover {
          transform: translate(-2px,-2px) rotate(0deg);
          box-shadow: 5px 5px 0 var(--sx-line);
        }

        .sx-card.open {
          transform: translate(-2px,-2px) rotate(0deg);
          box-shadow: 6px 6px 0 var(--sx-line);
        }

        .sx-card-button {
          width: 100%;
          min-height: 77px;
          display: grid;
          grid-template-columns: 38px 43px minmax(0,1fr) 25px;
          align-items: center;
          gap: 11px;
          padding: 12px 18px;
          border: 0;
          background: transparent;
          color: var(--sx-ink);
          text-align: left;
          cursor: pointer;
          font-family: inherit;
        }
        .sx-card-button:focus-visible {
          outline: 3px solid var(--sx-blue);
          outline-offset: -6px;
        }

        .sx-card-index {
          font-size: 11px;
          font-weight: 900;
          opacity: .42;
        }

        .sx-card-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border: 2px solid var(--sx-line);
          box-shadow: 2px 2px 0 var(--sx-line);
          background: var(--sx-yellow);
          transform: rotate(-3deg);
          transition: transform .3s cubic-bezier(.34,1.3,.4,1);
        }

        .sx-card:hover .sx-card-icon {
          transform: rotate(4deg) scale(1.05);
        }

        .tone-blue .sx-card-icon { background: var(--sx-blue); transform: rotate(3deg); }
        .tone-coral .sx-card-icon { background: var(--sx-coral); }
        .tone-green .sx-card-icon { background: var(--sx-green); transform: rotate(2deg); }
        .tone-purple .sx-card-icon { background: var(--sx-purple); transform: rotate(-2deg); }
        .tone-orange .sx-card-icon { background: var(--sx-orange); }

        .sx-card-heading small {
          display: block;
          margin-bottom: 3px;
          color: #77766d;
          font-size: 9px;
          letter-spacing: .1em;
          font-weight: 900;
        }

        .sx-card-heading strong {
          display: block;
          font-size: 17px;
          line-height: 1.3;
          font-weight: 800;
        }

        .sx-card-arrow {
          display: inline-flex;
          transition: transform .3s cubic-bezier(.34,1.3,.4,1);
        }

        .sx-card.open .sx-card-arrow { transform: rotate(180deg); }

        /* Accordion body — smooth grid animation */
        .sx-card-body {
          display: grid;
          grid-template-rows: 0fr;
          transition:
            grid-template-rows .45s cubic-bezier(.34,1.3,.4,1),
            opacity .3s ease;
          opacity: 0;
          border-top: 2px dashed rgba(32,33,29,.27);
        }
        .sx-card-body.open {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .sx-card-body-inner {
          overflow: hidden;
          min-height: 0;
        }

        .sx-card-text {
          max-width: 780px;
          color: #56564f;
          font-size: 14.5px;
          line-height: 1.75;
          font-weight: 500;
          padding: 4px 24px 25px 92px;
        }

        .sx-card-text p { margin: 18px 0 0; }
        .sx-card-text p:first-child { margin-top: 18px; }

        .sx-card-text ul,
        .sx-list {
          margin: 16px 0 0;
          padding-left: 22px;
        }

        .sx-card-text li {
          margin: 9px 0;
          padding-left: 3px;
        }

        .sx-list li::marker {
          color: var(--sx-ink);
          font-weight: 900;
        }

        .sx-card-text strong { color: var(--sx-ink); }

        /* ─── BOTTOM ─── */
        .sx-bottom {
          margin-top: 55px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 22px;
          align-items: center;
          padding: 25px 28px;
          border: 2px solid var(--sx-line);
          background: var(--sx-paper-deep);
          box-shadow: 4px 4px 0 var(--sx-line);
          transform: rotate(.25deg);
        }

        .sx-bottom h2 {
          margin: 0 0 5px;
          font-size: 23px;
          letter-spacing: -.02em;
          font-weight: 800;
        }

        .sx-bottom p {
          margin: 0;
          color: var(--sx-muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .sx-bottom-disabled {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 2px dashed rgba(32,33,29,.45);
          background: rgba(255,253,245,.7);
          color: rgba(32,33,29,.55);
          box-shadow: 3px 3px 0 rgba(32,33,29,.25);
          font-size: 13px;
          font-weight: 800;
          cursor: not-allowed;
          user-select: none;
        }

        /* ─── FOOTER ─── */
        .sx-footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 2px dashed rgba(32,33,29,.3);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          color: #77766d;
          font-size: 11px;
          font-weight: 700;
        }

        .sx-footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .sx-footer a {
          color: inherit;
          text-decoration: none;
          transition: color .2s ease;
        }

        .sx-footer a:hover { color: var(--sx-ink); }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 850px) {
          .sx-doodle { right: 2%; opacity: .5; }
          .sx-content { grid-template-columns: 1fr; }
          .sx-index {
            position: static;
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 0 10px;
          }
          .sx-index-title { grid-column: 1 / -1; }
          .sx-bottom { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
          .sx-wrap {
            width: min(100% - 30px, 560px);
            padding-top: 18px;
          }

          .sx-nav { height: 58px; }
          .sx-logo img { height: 54px; }

          .sx-back {
            min-height: 38px;
            padding: 0 16px;
            font-size: 12px;
          }

          .sx-hero { padding: 58px 0 38px; }
          .sx-doodle { display: none; }

          .sx-hero h1 {
            font-size: clamp(44px, 14vw, 66px);
          }

          .sx-contact {
            grid-template-columns: 1fr;
            padding: 21px;
          }

          .sx-mail-disabled {
            justify-content: center;
            width: 100%;
            font-size: 13px;
          }
          .sx-mail-disabled::after {
            position: static;
            display: block;
            margin-top: 4px;
            white-space: normal;
            text-align: center;
          }

          .sx-card-button {
            grid-template-columns: 27px 37px minmax(0,1fr) 21px;
            gap: 8px;
            min-height: 70px;
            padding: 10px 12px;
          }

          .sx-card-icon {
            width: 35px;
            height: 35px;
          }

          .sx-card-heading small { font-size: 8px; }
          .sx-card-heading strong { font-size: 14px; }
          .sx-card-text { padding: 4px 15px 20px; font-size: 13.5px; }

          .sx-index {
            grid-template-columns: 1fr 1fr;
          }

          .sx-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="sx-wrap">
        <nav className="sx-nav">
          <button
            type="button"
            className="sx-logo"
            onClick={() => {
              window.location.href = "/";
            }}
            aria-label="Go to SHARX home"
          >
            <img src="/sharx-logo.webp" alt="SHARX" />
          </button>

          <button type="button" className="sx-back" onClick={handleBack}>
            <ArrowLeft size={14} strokeWidth={2.8} />
            Back
          </button>
        </nav>

        <header className="sx-hero">
          <span className="sx-doodle" aria-hidden="true" />

          <span className="sx-sticker">
            <Copyright size={15} strokeWidth={2.8} />
            Copyright &amp; Content Removal
          </span>

          <h1>
            Your work.
            <br />
            Your <span className="sx-highlight">rights.</span>
          </h1>

          <p className="sx-lead">
            SHARX respects the people who create the games, art, music, and
            other content that make the web fun. If you believe something on
            SHARX uses your copyrighted work without authorization, here is the
            straightforward way to tell us.
          </p>

          <div className="sx-meta">
            <span>Last updated · {LAST_UPDATED}</span>
            <span>Clear removal process</span>
            <span>Creator-first reporting</span>
          </div>

          <div className="sx-contact">
            <div>
              <small>Copyright contact</small>
              <strong>Need to report copyrighted content?</strong>
              <p>
                Send the details of the original work and the SHARX content
                you are reporting.
              </p>
            </div>

            <span className="sx-mail-disabled" aria-disabled="true">
              <Mail size={17} strokeWidth={2.6} />
              {COPYRIGHT_EMAIL}
            </span>
          </div>
        </header>

        <section className="sx-content">
          <aside className="sx-index">
            <h2 className="sx-index-title">Quick jump</h2>
            {sections.map((item) => (
              <button key={item.id} type="button" onClick={() => jumpTo(item.id)}>
                {item.number} · {item.title}
              </button>
            ))}
          </aside>

          <div className="sx-cards">
            {sections.map((item) => (
              <PolicyCard
                key={item.id}
                item={item}
                open={open === item.id}
                onToggle={() => setOpen(open === item.id ? "" : item.id)}
              />
            ))}
          </div>
        </section>

        <section className="sx-bottom">
          <div>
            <h2>Have a copyright concern?</h2>
            <p>
              Our copyright email is temporarily unavailable. The reporting
              process above remains the same once it's back online.
            </p>
          </div>
          <span className="sx-bottom-disabled" aria-disabled="true">
            <AlertTriangle size={15} strokeWidth={2.6} />
            Contact temporarily unavailable
          </span>
        </section>

        <footer className="sx-footer">
          <span>© {new Date().getFullYear()} SHARX. All rights reserved.</span>
          <div className="sx-footer-links">
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
             <a href="/terms">Copyright</a>
          </div>
        </footer>
      </div>
    </main>
  );
}