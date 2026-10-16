"use client";

import Image from "next/image";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Handshake,
  MessageCircle,
  Send,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  Mail,
  Clock,
  Loader2,
  Home,
  Shield,
  Lightbulb,
  Gamepad2,
  Sparkles,
  KeyRound,
  AlertTriangle,
  ZapOff,
} from "lucide-react";
import Link from "next/link";

/* ─── Emails ─── */
const ACTIVE_EMAIL = "hello@sharx.in";
const ALT_EMAIL = "vishalxr92@gmail.com";

const MIN_MESSAGE_LENGTH = 4;
const MAX_MESSAGE_LENGTH = 2000;

/* ─────────────────────────────────────────────────────────────
   BugIcon
   Same look as the lucide "bug" glyph, but the antennae and the
   left / right legs are separate groups so the "Bug" category can
   animate them (two-step crawl) without any emoji or new library.
   Accepts no props on purpose: size / stroke come from the
   existing .reason-chip-icon svg CSS, same as every other icon.
───────────────────────────────────────────────────────────── */
function BugIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g className="bug-ant">
        <path d="m8 2 1.88 1.88" />
        <path d="M14.12 3.88 16 2" />
      </g>
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <g className="bug-legs-l">
        <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
        <path d="M6 13H2" />
        <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      </g>
      <g className="bug-legs-r">
        <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
        <path d="M22 13h-4" />
        <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
      </g>
    </svg>
  );
}

/* Reason chips: icon + contextual motion key (fx).
   fx maps to the [data-fx="..."] rules in the CSS below. */
const REASONS = [
  { value: "general", label: "General", icon: MessageCircle, fx: "think" },
  { value: "account", label: "Login issue", icon: KeyRound, fx: "key" },
  { value: "broken-game", label: "Broken game", icon: ZapOff, fx: "glitch" },
  { value: "content", label: "Bad content", icon: AlertTriangle, fx: "shield" },
  { value: "bug", label: "Bug", icon: BugIcon, fx: "diag" },
  { value: "feedback", label: "Feedback", icon: Lightbulb, fx: "idea" },
  { value: "business", label: "Business", icon: Handshake, fx: "shake" },
  { value: "submission", label: "Game submit", icon: Gamepad2, fx: "upload" },
  { value: "other", label: "Other", icon: Sparkles, fx: "morph" },
];

const REASON_LABEL = (value) =>
  REASONS.find((r) => r.value === value)?.label || value;

/* Context colors for the selected reason chip.
   These are intentionally restrained so the Contact page keeps its
   existing SHARX visual language while each reason gets its own identity. */
const REASON_COLORS = {
  general: { bg: "#DDF5EA", accent: "#169B69", ring: "rgba(22,155,105,.20)" },
  account: { bg: "#E8E1FF", accent: "#7357D6", ring: "rgba(115,87,214,.20)" },
  "broken-game": { bg: "#FFE0DB", accent: "#E05243", ring: "rgba(224,82,67,.20)" },
  content: { bg: "#FFE8D5", accent: "#D8792F", ring: "rgba(216,121,47,.20)" },
  bug: { bg: "#FFF0B8", accent: "#B98500", ring: "rgba(185,133,0,.20)" },
  feedback: { bg: "#DCEEFF", accent: "#3478C8", ring: "rgba(52,120,200,.20)" },
  business: { bg: "#E8DFFF", accent: "#7651C7", ring: "rgba(118,81,199,.20)" },
  submission: { bg: "#D9F2F4", accent: "#168C98", ring: "rgba(22,140,152,.20)" },
  other: { bg: "#E7EAF0", accent: "#596579", ring: "rgba(89,101,121,.20)" },
};

const CONTACT_OPTIONS = [
  {
    id: "general",
    icon: <MessageCircle size={22} strokeWidth={2.4} />,
    title: "General Support",
    desc: "Questions about SHARX, accounts, games, or website features.",
    action: "Send a Message",
    color: "#D4F5E7",
    accent: "#0EA56B",
    defaultReason: "general",
  },
  {
    id: "report",
    icon: <AlertCircle size={22} strokeWidth={2.4} />,
    title: "Report an Issue",
    desc: "Tell us about broken games, bugs, unwanted redirects, or inappropriate content.",
    action: "Report Issue",
    color: "#FFE0DA",
    accent: "#FF5A4A",
    defaultReason: "broken-game",
  },
  {
    id: "business",
    icon: <Handshake size={22} strokeWidth={2.4} />,
    title: "Business & Collaboration",
    desc: "For partnerships, game submissions, collaborations, and business inquiries.",
    action: "Business Inquiry",
    color: "#EAE0FF",
    accent: "#7C4DFF",
    defaultReason: "business",
  },
];

const FAQS = [
  {
    q: "How can I report a broken game?",
    a: 'Use the form above and select "Report a broken game" as your reason. If possible, include the game\'s name or URL so we can find and fix it faster.',
  },
  {
    q: "Can I submit my own game?",
    a: `Yes — we're open to game submissions. Choose "Game submission" as your reason and tell us about your game. You can also email us directly at ${ACTIVE_EMAIL}.`,
  },
  {
    q: "I can't log in. What should I do?",
    a: 'Select "Account or login issue" in the form and describe what\'s happening. Don\'t share your password — just explain the problem and we\'ll help you from there.',
  },
  {
    q: "How can I contact SHARX about privacy?",
    a: `For any privacy-related question, email us at ${ACTIVE_EMAIL} or refer to our Privacy Policy page.`,
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BACKEND_API = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://sharx-backend.onrender.com"
).replace(/\/$/, "");

function buildMailtoUrl({ to, subject, body }) {
  return `mailto:${to}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

const FaqItem = memo(function FaqItem({ faq, isOpen, onToggle, id }) {
  const panelId = `faq-panel-${id}`;
  const btnId = `faq-btn-${id}`;
  return (
    <div className={`faq ${isOpen ? "faq-open" : ""}`}>
      <button
        type="button"
        id={btnId}
        className="faq-q"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>{faq.q}</span>
        <span className={`faq-tog ${isOpen ? "open" : ""}`} aria-hidden="true">
          <ChevronDown size={16} strokeWidth={2.6} />
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className={`faq-body ${isOpen ? "open" : ""}`}
      >
        <div className="faq-body-inner">
          <div className="faq-a">{faq.a}</div>
        </div>
      </div>
    </div>
  );
});

export default function ContactPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const year = new Date().getFullYear();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "general",
    game: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [openFaq, setOpenFaq] = useState(null);

  const [submitState, setSubmitState] = useState("idle");
  const [fallbackMailto, setFallbackMailto] = useState(null);
  const statusRef = useRef(null);

  /* Which chip just became selected (drives the one-shot micro-interaction) */
  const [burst, setBurst] = useState(null);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined") router.back();
  }, [router]);
  const goHome = useCallback(() => router.push("/"), [router]);

  const handleFieldChange = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
      if (submitState !== "idle") setSubmitState("idle");
    },
    [submitState]
  );

  const handleBlur = useCallback(
    (field) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  const handleReasonSelect = useCallback((reason) => {
    setFormData((prev) => ({ ...prev, reason }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.reason;
      return next;
    });
    setSubmitState("idle");
    setBurst(reason);
  }, []);

  const handleFaqToggle = useCallback((i) => {
    setOpenFaq((prev) => (prev === i ? null : i));
  }, []);

  const handleContactOptionClick = useCallback(
    (option) => {
      handleReasonSelect(option.defaultReason);
      const el = document.getElementById("contact-form");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        const nameInput = document.getElementById("field-name");
        if (nameInput) nameInput.focus({ preventScroll: true });
      }, 500);
    },
    [handleReasonSelect]
  );

  const validate = useCallback(() => {
    const errs = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();
    const game = formData.game.trim();

    if (!name) errs.name = "Please enter your name.";
    else if (name.length < 2) errs.name = "Name is too short.";

    if (!email) errs.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(email))
      errs.email = "Please enter a valid email address.";

    if (!message) errs.message = "Please enter a message.";
    else if (message.length < MIN_MESSAGE_LENGTH)
      errs.message = `Message is too short (min ${MIN_MESSAGE_LENGTH} characters).`;
    else if (formData.message.length > MAX_MESSAGE_LENGTH)
      errs.message = `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`;

    if (
      ["broken-game", "content", "submission"].includes(formData.reason) &&
      !game
    ) {
      errs.game = "Please include the game name or URL.";
    }

    return errs;
  }, [formData]);

  const errorsLive = useMemo(() => validate(), [validate]);
  const isValid = Object.keys(errorsLive).length === 0;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitState === "sending") return;

      const errs = validate();
      setErrors(errs);
      setTouched({
        name: true,
        email: true,
        reason: true,
        message: true,
        game: true,
      });

      if (Object.keys(errs).length > 0) {
        setSubmitState("idle");
        const firstKey = Object.keys(errs)[0];
        const firstErr =
          document.getElementById(`field-${firstKey}`) ||
          document.getElementById(`reason-chips`);
        if (firstErr && typeof firstErr.focus === "function") {
          firstErr.focus({ preventScroll: false });
        }
        return;
      }

      setSubmitState("sending");

      const reasonLabel = REASON_LABEL(formData.reason);
      const subject = `SHARX Contact - ${reasonLabel}`;
      const name = formData.name.trim();
      const email = formData.email.trim();
      const game = formData.game.trim();
      const message = formData.message.trim();

      const payload = {
        name,
        email,
        topic: reasonLabel,
        game: game || "",
        message,
        website: "",
      };

      const bodyLines = [
        `Name: ${name}`,
        `Sender email: ${email}`,
        `Contact reason: ${reasonLabel}`,
      ];
      if (game) bodyLines.push(`Game name or URL: ${game}`);
      bodyLines.push("", "Message:", message);
      const mailtoUrl = buildMailtoUrl({
        to: ACTIVE_EMAIL,
        subject,
        body: bodyLines.join("\n"),
      });
      setFallbackMailto(mailtoUrl);

      try {
        const res = await fetch(`${BACKEND_API}/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        let data = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok || data?.success !== true) {
          throw new Error(data?.message || "Failed to send message");
        }

        setSubmitState("success");
        setBurst(null);
        setFormData({
          name: "",
          email: "",
          reason: "general",
          game: "",
          message: "",
        });
        setTouched({});

        if (statusRef.current) statusRef.current.focus();
      } catch (err) {
        console.error("Contact form failed:", err);
        setSubmitState("error");
        if (statusRef.current) statusRef.current.focus();
      }
    },
    [formData, submitState, validate]
  );

  const showGameField = useMemo(
    () => ["broken-game", "content", "submission"].includes(formData.reason),
    [formData.reason]
  );

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const isSending = submitState === "sending";

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
          --bg: #FFF7E8;
          --border: 1.5px solid var(--ink);
          --shadow-sm: 2px 2px 0 var(--ink);
          --shadow-md: 3px 3px 0 var(--ink);
          --shadow-lg: 4px 4px 0 var(--ink);
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          font-family: var(--font-comfortaa), "Comic Sans MS", cursive;
          background: var(--bg);
          position: relative;
          overflow-x: hidden;
        }

        .page::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle at 0 0, rgba(27, 42, 65, 0.09) 1.2px, transparent 1.7px);
          background-size: 28px 28px;
          opacity: 0.85;
          pointer-events: none;
          z-index: 0;
        }

        .main {
          flex: 1;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          padding: 28px 48px 40px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        a, a:link, a:visited, a:active, a:focus, a:hover { text-decoration: none; }

        /* ─── NAVBAR ─── */
        .navbar {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
        }
        .nav-logo {
          cursor: pointer;
          display: flex;
          align-items: center;
          background: none;
          border: none;
          padding: 0;
          line-height: 0;
        }
        .nav-logo img {
          height: 62px;
          width: auto;
          display: block;
          filter: drop-shadow(2px 2px 0 rgba(27,42,65,0.12));
        }

        .nav-back {
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
          box-shadow: var(--shadow-sm);
          transition: transform 0.22s cubic-bezier(.34,1.3,.4,1), box-shadow 0.22s, background 0.22s;
        }
        .nav-back:hover {
          background: var(--yellow);
          transform: translate3d(-2px, -2px, 0) rotate(-1.5deg);
          box-shadow: var(--shadow-md);
        }
        .nav-back:active { transform: translate3d(0,0,0); box-shadow: var(--shadow-sm); }

        /* ─── HERO ─── */
        .hero {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 60px 20px 40px;
          max-width: 720px;
          margin: 0 auto;
        }
        .hero-eyebrow {
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
          margin-bottom: 22px;
          opacity: 0;
          transform: rotate(-1.5deg);
        }
        .hero-eyebrow.vis { animation: drawIn 0.65s cubic-bezier(.34,1.3,.4,1) forwards 0s; }
        .hero-eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--coral);
          border: 1.5px solid var(--ink);
        }

        .hero-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(44px, 7vw, 92px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.02;
          letter-spacing: -2.5px;
          margin-bottom: 22px;
          opacity: 0;
          transform: rotate(-1deg);
          text-shadow: 5px 5px 0 var(--yellow);
        }
        .hero-title.vis { animation: drawIn 0.75s cubic-bezier(.34,1.3,.4,1) forwards 0.15s; }

        .hero-sub {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(15px, 1.8vw, 18px);
          font-weight: 600;
          color: var(--ink-soft);
          line-height: 1.7;
          max-width: 560px;
          margin: 0 auto;
          opacity: 0;
        }
        .hero-sub.vis { animation: drawIn 0.7s cubic-bezier(.34,1.3,.4,1) forwards 0.3s; }

        /* ─── OPTION CARDS ─── */
        .options-section { padding: 30px 0 50px; position: relative; z-index: 1; }
        .options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .option-card {
          position: relative;
          background: var(--paper);
          border: var(--border);
          border-radius: 24px;
          padding: 28px 24px 26px;
          box-shadow: var(--shadow-md);
          transition: transform 0.3s cubic-bezier(.34,1.4,.4,1), box-shadow 0.3s;
          display: flex;
          flex-direction: column;
        }
        .option-card:hover {
          transform: translate3d(-3px, -3px, 0);
          box-shadow: var(--shadow-lg);
        }
        .option-icon {
          width: 50px;
          height: 50px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: var(--border);
          box-shadow: var(--shadow-sm);
          margin-bottom: 20px;
          color: var(--ink);
        }
        .option-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 19px;
          font-weight: 800;
          color: var(--ink);
          line-height: 1.2;
          margin-bottom: 10px;
        }
        .option-desc {
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.7;
          font-weight: 500;
          margin-bottom: 22px;
          flex: 1;
        }
        .option-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 13.5px;
          font-weight: 800;
          color: var(--ink);
          background: var(--paper);
          border: var(--border);
          border-radius: 100px;
          padding: 10px 20px;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform 0.22s cubic-bezier(.34,1.4,.4,1), box-shadow 0.22s, background 0.22s;
          align-self: flex-start;
        }
        .option-action:hover {
          background: var(--yellow);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
        }
        .option-action:active { transform: translate3d(0,0,0); box-shadow: var(--shadow-sm); }

        @media (max-width: 900px) {
          .options-grid { grid-template-columns: 1fr; gap: 16px; }
        }

        /* ═══════════════════════════════════════════
           TWO-COLUMN: INFO + FORM
        ═══════════════════════════════════════════ */
        .contact-grid-section {
          padding: 20px 0 60px;
          position: relative;
          z-index: 1;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 40px;
          align-items: start;
        }

        .info-card {
          background: var(--paper);
          border: var(--border);
          border-radius: 24px;
          padding: 32px 28px;
          box-shadow: var(--shadow-md);
          position: sticky;
          top: 100px;
        }
        .info-heading {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 8px;
          letter-spacing: -0.4px;
        }
        .info-sub {
          font-size: 13.5px;
          color: var(--ink-soft);
          font-weight: 600;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .info-list { display: flex; flex-direction: column; gap: 20px; }
        .info-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .info-item-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: var(--border);
          box-shadow: var(--shadow-sm);
          flex-shrink: 0;
          color: var(--ink);
        }
        .info-item-icon.mint { background: var(--mint-soft); }
        .info-item-icon.yellow { background: var(--yellow-soft); }
        .info-item-icon.lilac { background: var(--lilac-soft); }
        .info-item-body { min-width: 0; flex: 1; }
        .info-item-label {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: var(--ink-mute);
          margin-bottom: 4px;
        }
        .info-item-value {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.5;
          word-break: break-word;
        }
        .info-item-value a {
          color: var(--blue);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }
        .info-item-value a:hover { color: var(--coral-deep); }
        .info-item-value .email-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .info-item-value .email-list small {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--ink-mute);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr; gap: 24px; }
          .info-card { position: static; padding: 26px 22px; }
        }

        .form-card {
          background: var(--paper);
          border: var(--border);
          border-radius: 28px;
          padding: 40px 44px 38px;
          box-shadow: var(--shadow-lg);
        }
        .form-head { margin-bottom: 28px; }
        .form-head-title {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 800;
          color: var(--ink);
          line-height: 1.1;
          letter-spacing: -0.6px;
          margin-bottom: 8px;
        }
        .form-head-sub {
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.6;
          font-weight: 500;
        }

        .reason-label {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          display: block;
        }
        .reason-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
        .reason-chip {
          position: relative;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          padding: 8px 14px;
          border-radius: 100px;
          background: var(--paper);
          border: var(--border);
          color: var(--ink-soft);
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s, background 0.2s, color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .reason-chip .reason-chip-icon {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          transition: transform 0.25s cubic-bezier(.34,1.4,.4,1);
        }
        .reason-chip .reason-chip-icon svg {
          width: 14px;
          height: 14px;
          stroke-width: 2.4;
        }
        .reason-chip:hover {
          background: var(--yellow-soft);
          color: var(--ink);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-sm);
        }
        .reason-chip:hover .reason-chip-icon {
          transform: rotate(-10deg) scale(1.15);
        }
        .reason-chip.active {
          background: linear-gradient(180deg, var(--reason-bg), var(--reason-bg-deep));
          color: var(--ink);
          border-color: var(--reason-accent);
          box-shadow:
            0 3px 0 var(--reason-accent),
            0 0 0 2px var(--reason-ring),
            var(--shadow-sm);
          transform: translate3d(-2px, -2px, 0);
        }
        .reason-chip.active .reason-chip-icon {
          color: var(--reason-accent);
          transform: scale(1.1);
        }
        .reason-chip.active .reason-chip-icon svg {
          stroke: currentColor;
        }
        .reason-chip:focus-visible { outline: 3px solid var(--blue); outline-offset: 2px; }

        /* ═══════════════════════════════════════════
           CATEGORY CONTEXTUAL MICRO-INTERACTIONS
           Same chip, same selected style. Only the motion differs.
           All motion is one-shot, runs inside the chip, and never
           touches layout (transform / opacity only, absolute overlays).
        ═══════════════════════════════════════════ */

        /* Glyph wrapper: animated instead of .reason-chip-icon so the
           existing hover / active scale on the icon is never fought. */
        .reason-chip .fx-glyph {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          transform-origin: 50% 50%;
        }

        /* Overlay layers: invisible by default, driven only by keyframes. */
        .reason-chip .reason-chip-icon::before,
        .reason-chip .reason-chip-icon::after,
        .reason-chip::after {
          content: "";
          position: absolute;
          pointer-events: none;
          opacity: 0;
        }

        /* Keep every effect physically inside the pill while it plays. */
        .reason-chip.fx-play { overflow: hidden; }

        /* 1. GENERAL: question received (pop + soft ripple) */
        .reason-chip.fx-play[data-fx="think"] .fx-glyph {
          animation: fx-think 520ms cubic-bezier(.34,1.3,.4,1);
        }
        .reason-chip.fx-play[data-fx="think"] .reason-chip-icon::after {
          inset: -2px;
          border-radius: 50%;
          border: 1.5px solid var(--ink);
          animation: fx-ring-soft 620ms ease-out;
        }
        @keyframes fx-think {
          0%   { transform: scale(.7) rotate(-12deg); }
          45%  { transform: scale(1.2) rotate(7deg); }
          72%  { transform: scale(.95) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes fx-ring-soft {
          0%   { opacity: .4; transform: scale(.6); }
          100% { opacity: 0; transform: scale(1.9); }
        }

        /* 2. ACCOUNT: key turns, verification scan passes through */
        .reason-chip.fx-play[data-fx="key"] .fx-glyph {
          animation: fx-key 620ms cubic-bezier(.4,0,.2,1);
        }
        .reason-chip.fx-play[data-fx="key"]::after {
          top: 0;
          bottom: 0;
          left: 0;
          width: 38%;
          background: linear-gradient(90deg, rgba(27,42,65,0) 0%, rgba(27,42,65,.16) 50%, rgba(27,42,65,0) 100%);
          transform: translateX(-100%);
          animation: fx-scan 560ms ease-in-out 120ms;
        }
        @keyframes fx-key {
          0%   { transform: rotate(0); }
          30%  { transform: rotate(-32deg) translateY(-1px); }
          55%  { transform: rotate(14deg); }
          78%  { transform: rotate(-5deg); }
          100% { transform: rotate(0); }
        }
        @keyframes fx-scan {
          0%   { opacity: 0; transform: translateX(-100%); }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { opacity: 0; transform: translateX(270%); }
        }

        /* 3. BROKEN GAME: one short glitch, then back to normal */
        .reason-chip.fx-play[data-fx="glitch"] .fx-glyph {
          animation: fx-glitch 440ms steps(1, end);
        }
        .reason-chip.fx-play[data-fx="glitch"] .reason-chip-icon::before {
          left: -2px;
          right: -2px;
          top: 0;
          height: 2px;
          background: var(--coral-deep);
          animation: fx-tear 440ms steps(1, end);
        }
        @keyframes fx-glitch {
          0%   { transform: translate(0, 0); opacity: 1; color: var(--ink); }
          10%  { transform: translate(-1.6px, .6px) skewX(-14deg); opacity: .45; color: var(--coral-deep); }
          22%  { transform: translate(1.6px, -.6px) skewX(12deg); opacity: 1; color: var(--coral-deep); }
          34%  { transform: translate(-1px, 0); opacity: .35; color: var(--coral-deep); }
          46%  { transform: translate(1px, .5px) skewX(-8deg); opacity: 1; color: var(--coral-deep); }
          58%  { transform: translate(0, 0); opacity: .6; color: var(--coral-deep); }
          72%  { transform: none; opacity: 1; color: var(--coral-deep); }
          86%  { transform: none; opacity: 1; color: var(--ink); }
          100% { transform: none; opacity: 1; color: var(--ink); }
        }
        @keyframes fx-tear {
          0%   { opacity: 0; transform: translateY(0); }
          16%  { opacity: .9; transform: translateY(4px); }
          28%  { opacity: 0; transform: translateY(4px); }
          40%  { opacity: .9; transform: translateY(10px); }
          52%  { opacity: 0; transform: translateY(10px); }
          100% { opacity: 0; transform: translateY(0); }
        }

        /* 4. BAD CONTENT: restrained alert + two protective rings */
        .reason-chip.fx-play[data-fx="shield"] .fx-glyph {
          animation: fx-alert 560ms cubic-bezier(.34,1.3,.4,1);
        }
        .reason-chip.fx-play[data-fx="shield"] .reason-chip-icon::before,
        .reason-chip.fx-play[data-fx="shield"] .reason-chip-icon::after {
          inset: -1px;
          border-radius: 6px 6px 9px 9px;
          border: 1.5px solid var(--coral-deep);
        }
        .reason-chip.fx-play[data-fx="shield"] .reason-chip-icon::before {
          animation: fx-ring-guard 640ms ease-out;
        }
        .reason-chip.fx-play[data-fx="shield"] .reason-chip-icon::after {
          animation: fx-ring-guard 640ms ease-out 140ms;
        }
        @keyframes fx-alert {
          0%   { transform: scale(1) rotate(0); }
          25%  { transform: scale(1.18) rotate(-7deg); }
          50%  { transform: scale(1.05) rotate(6deg); }
          75%  { transform: scale(1.12) rotate(-2deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes fx-ring-guard {
          0%   { opacity: .55; transform: scale(.8); }
          100% { opacity: 0; transform: scale(2); }
        }

        /* 5. BUG: technical issue detected (two-step crawl, leg skitter,
              antenna twitch, diagnostic flicker, status dot) */
        .reason-chip .bug-ant,
        .reason-chip .bug-legs-l,
        .reason-chip .bug-legs-r {
          transform-box: fill-box;
        }
        .reason-chip .bug-ant { transform-origin: 50% 100%; }
        .reason-chip .bug-legs-l { transform-origin: 100% 50%; }
        .reason-chip .bug-legs-r { transform-origin: 0% 50%; }

        .reason-chip.fx-play[data-fx="diag"] .fx-glyph {
          animation: fx-crawl 680ms cubic-bezier(.45,0,.25,1);
        }
        .reason-chip.fx-play[data-fx="diag"] .bug-legs-l {
          animation: fx-legs-a 680ms ease-in-out;
        }
        .reason-chip.fx-play[data-fx="diag"] .bug-legs-r {
          animation: fx-legs-b 680ms ease-in-out;
        }
        .reason-chip.fx-play[data-fx="diag"] .bug-ant {
          animation: fx-ant 680ms ease-in-out;
        }
        .reason-chip.fx-play[data-fx="diag"] .reason-chip-icon::after {
          top: -3px;
          right: -4px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--coral-deep);
          animation: fx-led 680ms ease-out;
        }
        @keyframes fx-crawl {
          0%   { transform: translateX(0); opacity: .45; }
          12%  { opacity: 1; }
          20%  { transform: translateX(0); opacity: .55; }
          30%  { transform: translateX(1.4px); opacity: 1; }
          45%  { transform: translateX(.5px); }
          65%  { transform: translateX(1.7px); }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes fx-legs-a {
          0%   { transform: rotate(0); }
          18%  { transform: rotate(-16deg); }
          36%  { transform: rotate(10deg); }
          54%  { transform: rotate(-14deg); }
          72%  { transform: rotate(8deg); }
          100% { transform: rotate(0); }
        }
        @keyframes fx-legs-b {
          0%   { transform: rotate(0); }
          18%  { transform: rotate(10deg); }
          36%  { transform: rotate(-16deg); }
          54%  { transform: rotate(8deg); }
          72%  { transform: rotate(-14deg); }
          100% { transform: rotate(0); }
        }
        @keyframes fx-ant {
          0%   { transform: rotate(0); }
          25%  { transform: rotate(-12deg); }
          45%  { transform: rotate(8deg); }
          65%  { transform: rotate(-8deg); }
          100% { transform: rotate(0); }
        }
        @keyframes fx-led {
          0%   { opacity: 0; transform: scale(0); }
          15%  { opacity: 1; transform: scale(1.3); }
          30%  { opacity: .35; transform: scale(.8); }
          45%  { opacity: 1; transform: scale(1.2); }
          60%  { opacity: .35; transform: scale(.8); }
          78%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(.6); }
        }

        /* 6. FEEDBACK: idea flick + a quick pen stroke under the icon */
        .reason-chip.fx-play[data-fx="idea"] .fx-glyph {
          animation: fx-idea 560ms cubic-bezier(.34,1.4,.4,1);
        }
        .reason-chip.fx-play[data-fx="idea"] .reason-chip-icon::after {
          left: 1px;
          right: 1px;
          bottom: -3px;
          height: 2px;
          border-radius: 2px;
          background: var(--ink);
          transform-origin: left center;
          transform: scaleX(0);
          animation: fx-write 680ms ease-in-out;
        }
        @keyframes fx-idea {
          0%   { transform: translateY(0) scale(.85) rotate(-8deg); }
          40%  { transform: translateY(-2px) scale(1.2) rotate(5deg); }
          70%  { transform: translateY(0) scale(.97) rotate(-2deg); }
          100% { transform: none; }
        }
        @keyframes fx-write {
          0%   { opacity: 1; transform: scaleX(0); }
          55%  { opacity: 1; transform: scaleX(1); }
          82%  { opacity: 1; transform: scaleX(1); }
          100% { opacity: 0; transform: scaleX(1); }
        }

        /* 7. BUSINESS: deal-closing lift + one soft shine across the pill */
        .reason-chip.fx-play[data-fx="shake"] .fx-glyph {
          animation: fx-deal 600ms cubic-bezier(.34,1.3,.4,1);
        }
        .reason-chip.fx-play[data-fx="shake"]::after {
          top: 0;
          bottom: 0;
          left: 0;
          width: 60%;
          background: linear-gradient(105deg, rgba(255,255,255,0) 20%, rgba(255,255,255,.65) 50%, rgba(255,255,255,0) 80%);
          transform: translateX(-110%);
          animation: fx-shine 640ms ease-in-out 80ms;
        }
        @keyframes fx-deal {
          0%   { transform: translateY(0) rotate(0); }
          22%  { transform: translateY(-2px) rotate(-5deg); }
          42%  { transform: translateY(.5px) rotate(3deg); }
          62%  { transform: translateY(-1.5px) rotate(-3deg); }
          82%  { transform: translateY(0) rotate(1deg); }
          100% { transform: none; }
        }
        @keyframes fx-shine {
          0%   { opacity: 0; transform: translateX(-110%); }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { opacity: 0; transform: translateX(190%); }
        }

        /* 8. GAME SUBMIT: dip, lift off, thin progress line along the base */
        .reason-chip.fx-play[data-fx="upload"] .fx-glyph {
          animation: fx-upload 620ms cubic-bezier(.3,1.2,.4,1);
        }
        .reason-chip.fx-play[data-fx="upload"]::after {
          left: 0;
          right: 0;
          bottom: 0;
          height: 2.5px;
          background: var(--blue);
          transform-origin: left center;
          transform: scaleX(0);
          animation: fx-progress 720ms ease-in-out;
        }
        @keyframes fx-upload {
          0%   { transform: translateY(0); }
          20%  { transform: translateY(2px) scale(.94); }
          55%  { transform: translateY(-3px) scale(1.08); }
          80%  { transform: translateY(.5px); }
          100% { transform: none; }
        }
        @keyframes fx-progress {
          0%   { opacity: 1; transform: scaleX(0); }
          70%  { opacity: 1; transform: scaleX(1); }
          85%  { opacity: 1; transform: scaleX(1); }
          100% { opacity: 0; transform: scaleX(1); }
        }

        /* 9. OTHER: icon morphs into three dots, then twinkles back */
        .reason-chip.fx-play[data-fx="morph"] .fx-glyph {
          animation: fx-morph 700ms cubic-bezier(.34,1.4,.4,1);
        }
        .reason-chip.fx-play[data-fx="morph"] .reason-chip-icon::after {
          top: 50%;
          left: 50%;
          width: 3px;
          height: 3px;
          margin: -1.5px 0 0 -1.5px;
          border-radius: 50%;
          opacity: 1;
          background: transparent;
          box-shadow: -5.5px 0 0 0 transparent, 5.5px 0 0 0 transparent;
          animation: fx-dots 700ms ease-in-out;
        }
        @keyframes fx-morph {
          0%   { opacity: 0; transform: scale(.4) rotate(-40deg); }
          38%  { opacity: 0; transform: scale(.4) rotate(-40deg); }
          70%  { opacity: 1; transform: scale(1.25) rotate(12deg); }
          100% { opacity: 1; transform: none; }
        }
        @keyframes fx-dots {
          0%   { background: transparent; box-shadow: -5.5px 0 0 0 transparent, 5.5px 0 0 0 transparent; }
          10%  { background: transparent; box-shadow: -5.5px 0 0 0 var(--ink), 5.5px 0 0 0 transparent; }
          22%  { background: var(--ink); box-shadow: -5.5px 0 0 0 var(--ink), 5.5px 0 0 0 transparent; }
          34%  { background: var(--ink); box-shadow: -5.5px 0 0 0 var(--ink), 5.5px 0 0 0 var(--ink); }
          52%  { background: var(--ink); box-shadow: -5.5px 0 0 0 var(--ink), 5.5px 0 0 0 var(--ink); }
          62%  { background: transparent; box-shadow: -5.5px 0 0 0 transparent, 5.5px 0 0 0 transparent; }
          100% { background: transparent; box-shadow: -5.5px 0 0 0 transparent, 5.5px 0 0 0 transparent; }
        }

        /* Reduced motion: no contextual movement, static selected state only */
        @media (prefers-reduced-motion: reduce) {
          .reason-chip.fx-play .fx-glyph,
          .reason-chip.fx-play .reason-chip-icon::before,
          .reason-chip.fx-play .reason-chip-icon::after,
          .reason-chip.fx-play::after,
          .reason-chip.fx-play .bug-ant,
          .reason-chip.fx-play .bug-legs-l,
          .reason-chip.fx-play .bug-legs-r {
            animation: none !important;
          }
        }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 18px; }
        .field { display: flex; flex-direction: column; }
        .field-label {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12.5px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: 0.3px;
          margin-bottom: 8px;
        }
        .field-label .req { color: var(--coral-deep); margin-left: 3px; }
        .field-input,
        .field-textarea {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          color: var(--ink);
          background: var(--paper);
          border: var(--border);
          border-radius: 14px;
          padding: 13px 16px;
          outline: none;
          transition: box-shadow 0.22s cubic-bezier(.34,1.4,.4,1), background 0.22s, transform 0.22s;
          box-shadow: var(--shadow-sm);
          width: 100%;
        }
        .field-input::placeholder,
        .field-textarea::placeholder { color: var(--ink-mute); font-weight: 500; }
        .field-input:focus,
        .field-textarea:focus {
          background: #FFFFFF;
          box-shadow: var(--shadow-md);
          transform: translate3d(-2px, -2px, 0);
        }
        .field-input.error,
        .field-textarea.error { box-shadow: 0 0 0 2px var(--coral-deep), var(--shadow-sm); }
        .field-textarea { resize: vertical; min-height: 130px; line-height: 1.6; padding: 14px 16px; }
        .field-error {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--coral-deep);
          margin-top: 6px;
        }
        .char-count {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--ink-mute);
          text-align: right;
          margin-top: 6px;
        }
        .char-count.warn { color: var(--coral-deep); }

        .submit-wrap { display: flex; flex-direction: column; align-items: center; margin-top: 24px; gap: 14px; }
        .submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 15px 26px 15px 32px;
          background: var(--yellow);
          color: var(--ink);
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 15.5px;
          font-weight: 800;
          border-radius: 100px;
          border: var(--border);
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: transform 0.26s cubic-bezier(.34,1.4,.4,1), box-shadow 0.26s, background 0.26s, color 0.26s;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translate3d(-2px, -2px, 0) rotate(-1.5deg);
          box-shadow: var(--shadow-lg);
          background: var(--coral);
          color: #fff;
        }
        .submit-btn:active:not(:disabled) { transform: translate3d(0, 0, 0); box-shadow: var(--shadow-md); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: var(--shadow-sm); }
        .submit-icon {
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
        .submit-btn:hover:not(:disabled) .submit-icon { transform: translateX(3px); }
        .submit-btn .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .safety-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 20px;
          padding: 14px 18px;
          background: var(--yellow-soft);
          border: var(--border);
          border-radius: 16px;
          box-shadow: var(--shadow-sm);
        }
        .safety-note svg { flex-shrink: 0; color: var(--ink); margin-top: 2px; width: 16px; height: 16px; }
        .safety-note p {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.55;
        }

        .submit-status {
          width: 100%;
          border-radius: 16px;
          padding: 14px 18px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.55;
          text-align: left;
          border: var(--border);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: flex-start;
          gap: 10px;
          outline: none;
          animation: fadeIn 0.3s ease both;
        }
        .submit-status.success { background: var(--mint-soft); color: var(--ink); }
        .submit-status.success .status-copy,
        .submit-status.success .status-copy span,
        .submit-status.success .status-copy strong { color: var(--ink); }
        .submit-status.success svg { color: #16845F; }
        .submit-status.error { background: var(--coral-soft); color: var(--ink); }
        .submit-status.error .status-copy,
        .submit-status.error .status-copy span { color: var(--ink); }
        .submit-status.error svg { color: var(--coral-deep); }
        .submit-status svg { flex-shrink: 0; margin-top: 2px; width: 16px; height: 16px; }
        .submit-status .status-copy { display: flex; flex-direction: column; gap: 6px; color: var(--ink); }
        .submit-status a { color: var(--blue); font-weight: 800; text-decoration: underline; text-underline-offset: 2px; }
        .submit-status a:hover { color: var(--ink); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

        .fallback-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 8px;
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--ink-soft);
          text-align: center;
        }
        .fallback-row > span { color: var(--ink-soft); }
        .fallback-row a {
          color: var(--blue);
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          text-underline-offset: 3px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 800;
        }
        .fallback-row a svg { color: var(--blue); flex-shrink: 0; }
        .fallback-row a:hover, .fallback-row a:hover svg { color: #0D5FBE; }

        @media (max-width: 640px) {
          .form-card { padding: 30px 22px 26px; border-radius: 24px; }
          .field-row { grid-template-columns: 1fr; gap: 16px; }
        }

        /* ═══════════════════════════════════════════
           FAQ
        ═══════════════════════════════════════════ */
        .faq-section { padding: 20px 0 60px; position: relative; z-index: 1; }
        .faq-inner { max-width: 720px; margin: 0 auto; }
        .faq-head { text-align: center; margin-bottom: 32px; }
        .faq-head h2 {
          font-family: var(--font-comfortaa), sans-serif;
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.6px;
        }

        .faq {
          background: var(--paper);
          border: var(--border);
          border-radius: 18px;
          margin-bottom: 12px;
          box-shadow: var(--shadow-md);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s, background 0.3s;
          overflow: hidden;
          will-change: transform;
        }
        @media (hover: hover) and (pointer: fine) {
          .faq:hover { transform: translate3d(-2px, -2px, 0); box-shadow: var(--shadow-lg); }
        }
        .faq.faq-open { background: #FFFFFF; transform: translate3d(-1px, -1px, 0); box-shadow: var(--shadow-md); }

        .faq-q {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          width: 100%;
          padding: 18px 22px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-comfortaa), sans-serif;
          color: var(--ink);
          -webkit-tap-highlight-color: transparent;
          transition: background 0.2s ease;
        }
        .faq-q:active { background: rgba(255, 217, 102, 0.15); }
        .faq-q:focus-visible { outline: 3px solid var(--blue); outline-offset: -6px; border-radius: 12px; }
        .faq-q span:first-child { font-size: 15px; font-weight: 800; color: var(--ink); line-height: 1.4; }

        .faq-tog {
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
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease;
          will-change: transform;
        }
        .faq-tog.open { transform: rotate(-180deg); background: var(--yellow); }

        .faq-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.42s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: grid-template-rows;
        }
        .faq-body.open { grid-template-rows: 1fr; }
        .faq-body-inner {
          overflow: hidden;
          min-height: 0;
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .faq-a {
          padding: 14px 22px 20px;
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.75;
          font-weight: 500;
          border-top: 1.5px dashed rgba(27, 42, 65, 0.15);
          margin: 0 4px;
        }

        /* ═══════════════════════════════════════════
           FOOTER
        ═══════════════════════════════════════════ */
        .site-footer {
          position: relative;
          z-index: 1;
          margin-top: 20px;
          padding: 0 0 40px;
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

        .footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          min-height: 56px;
        }

        .footer-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          flex-shrink: 0;
          line-height: 0;
          height: 46px;
        }
        .footer-logo img {
          height: 46px;
          width: auto;
          display: block;
          object-fit: contain;
        }

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
          background: var(--coral-deep);
          border-radius: 100px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.28s cubic-bezier(.34,1.4,.4,1);
        }
        .footer-link:hover { color: var(--coral-deep); }
        .footer-link:hover::after { transform: scaleX(1); }

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

        @keyframes drawIn {
          0%   { opacity: 0; transform: translate3d(0, 20px, 0); }
          70%  { opacity: 1; transform: translate3d(0, -2px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes footerRise {
          0%   { opacity: 0; transform: translate3d(0, 40px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @media (max-width: 900px) {
          .main { padding: 22px 24px 30px; }
          .nav-logo img { height: 52px; }
          .footer-body { padding: 24px 26px 22px; }
        }
        @media (max-width: 768px) {
          .footer-row {
            flex-direction: column;
            justify-content: center;
            gap: 16px;
            min-height: 0;
          }
          .footer-links {
            flex: none;
            gap: 18px 22px;
          }
        }
        @media (max-width: 640px) {
          .main { padding: 18px 18px 24px; }
          .nav-logo img { height: 46px; }
          .nav-back { height: 36px; padding: 0 16px; font-size: 12.5px; }
          .hero { padding: 44px 12px 32px; }
          .hero-title { letter-spacing: -1.6px; text-shadow: 3px 3px 0 var(--yellow); }
          .footer-body { padding: 22px 18px 18px; border-radius: 22px; }
          .footer-logo, .footer-logo img { height: 40px; }
          .footer-link { font-size: 12.5px; }
          .footer-copyright { font-size: 11.5px; }
          .footer-home-btn { font-size: 12px; padding: 9px 16px 9px 11px; }
          .footer-home-row { margin-top: 18px; padding-top: 18px; }
        }
        @media (max-width: 380px) {
          .hero-title { font-size: 38px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .hero-eyebrow, .hero-title, .hero-sub { opacity: 1; animation: none; }
        }
      `}</style>

      <div className="page">
        <div className="main">

          {/* Navbar */}
          <nav className="navbar">
            <button
              type="button"
              className="nav-logo"
              onClick={goHome}
              aria-label="Go to Sharx home"
            >
              <Image src="/sharx-logo.webp" alt="Sharx" width={62} height={62} />
            </button>
            <button className="nav-back" onClick={handleBack}>
              <ArrowLeft size={13} strokeWidth={2.6} /> Back
            </button>
          </nav>

          {/* Hero */}
          <section className="hero">
            <div className={`hero-eyebrow ${visible ? "vis" : ""}`}>
              <span className="hero-eyebrow-dot" />
              Contact Sharx
            </div>
            <h1 className={`hero-title ${visible ? "vis" : ""}`}>
              Let&apos;s Talk.
            </h1>
            <p className={`hero-sub ${visible ? "vis" : ""}`}>
              Have a question, found an issue, or want to work with SHARX?
              Send us a message and we&apos;ll get back to you.
            </p>
          </section>

          {/* Contact options */}
          <section className="options-section" aria-label="Contact options">
            <div className="options-grid">
              {CONTACT_OPTIONS.map((opt) => (
                <article key={opt.id} className="option-card">
                  <div
                    className="option-icon"
                    style={{ background: opt.color, color: opt.accent }}
                  >
                    {opt.icon}
                  </div>
                  <h3 className="option-title">{opt.title}</h3>
                  <p className="option-desc">{opt.desc}</p>
                  <button
                    type="button"
                    className="option-action"
                    onClick={() => handleContactOptionClick(opt)}
                  >
                    {opt.action}
                    <ArrowRight size={14} strokeWidth={2.8} />
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Two-column: info + form */}
          <section className="contact-grid-section" id="contact-form">
            <div className="contact-grid">
              <aside className="info-card" aria-label="Contact information">
                <h2 className="info-heading">Reach Us Directly</h2>
                <p className="info-sub">
                  Prefer a direct line? Use any of these — we&apos;ll respond as
                  soon as we can.
                </p>

                <div className="info-list">
                  <div className="info-item">
                    <div className="info-item-icon mint">
                      <Mail size={18} strokeWidth={2.4} />
                    </div>
                    <div className="info-item-body">
                      <div className="info-item-label">Email</div>
                      <div className="info-item-value">
                        <div className="email-list">
                          <a href={`mailto:${ACTIVE_EMAIL}`}>{ACTIVE_EMAIL}</a>
                          <small>Alternative</small>
                          <a href={`mailto:${ALT_EMAIL}`}>{ALT_EMAIL}</a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-icon yellow">
                      <Clock size={18} strokeWidth={2.4} />
                    </div>
                    <div className="info-item-body">
                      <div className="info-item-label">Response Time</div>
                      <div className="info-item-value">
                        We try to respond within 24–48 hours.
                      </div>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-icon lilac">
                      <MessageCircle size={18} strokeWidth={2.4} />
                    </div>
                    <div className="info-item-body">
                      <div className="info-item-label">General</div>
                      <div className="info-item-value">
                        Questions, feedback, game submissions, partnerships.
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="form-card">
                <div className="form-head">
                  <h2 className="form-head-title">Send Us a Message</h2>
                  <p className="form-head-sub">
                    Fill in the details below — messages go straight to our inbox.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <span id="reason-label" className="reason-label">
                    What&apos;s this about?{" "}
                    <span className="req" style={{ color: "var(--coral-deep)" }}>
                      *
                    </span>
                  </span>
                  <div
                    className="reason-chips"
                    role="radiogroup"
                    aria-labelledby="reason-label"
                    id="reason-chips"
                    tabIndex={-1}
                  >
                    {REASONS.map((r) => {
                      const ReasonIcon = r.icon;
                      const isActive = formData.reason === r.value;
                      const isPlaying = isActive && burst === r.value;
                      return (
                        <button
                          type="button"
                          key={r.value}
                          role="radio"
                          aria-checked={isActive}
                          data-fx={r.fx}
                          className={`reason-chip ${isActive ? "active" : ""} ${
                            isPlaying ? "fx-play" : ""
                          }`}
                          style={
                            isActive
                              ? {
                                  "--reason-bg": REASON_COLORS[r.value]?.bg || "var(--yellow)",
                                  "--reason-bg-deep": REASON_COLORS[r.value]?.bg || "var(--yellow)",
                                  "--reason-accent": REASON_COLORS[r.value]?.accent || "var(--ink)",
                                  "--reason-ring": REASON_COLORS[r.value]?.ring || "rgba(27,42,65,.16)",
                                }
                              : undefined
                          }
                          onClick={() => handleReasonSelect(r.value)}
                        >
                          <span className="reason-chip-icon" aria-hidden="true">
                            <span className="fx-glyph">
                              <ReasonIcon />
                            </span>
                          </span>
                          {r.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="field-name" className="field-label">
                        Your Name <span className="req">*</span>
                      </label>
                      <input
                        id="field-name"
                        type="text"
                        className={`field-input ${
                          touched.name && errors.name ? "error" : ""
                        }`}
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleFieldChange("name")}
                        onBlur={handleBlur("name")}
                        autoComplete="name"
                        maxLength={80}
                        aria-invalid={!!(touched.name && errors.name)}
                        aria-describedby={
                          touched.name && errors.name ? "err-name" : undefined
                        }
                      />
                      {touched.name && errors.name && (
                        <span className="field-error" id="err-name" role="alert">
                          {errors.name}
                        </span>
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="field-email" className="field-label">
                        Email Address <span className="req">*</span>
                      </label>
                      <input
                        id="field-email"
                        type="email"
                        className={`field-input ${
                          touched.email && errors.email ? "error" : ""
                        }`}
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleFieldChange("email")}
                        onBlur={handleBlur("email")}
                        autoComplete="email"
                        maxLength={120}
                        aria-invalid={!!(touched.email && errors.email)}
                        aria-describedby={
                          touched.email && errors.email ? "err-email" : undefined
                        }
                      />
                      {touched.email && errors.email && (
                        <span className="field-error" id="err-email" role="alert">
                          {errors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {showGameField && (
                    <div className="field" style={{ marginBottom: 18 }}>
                      <label htmlFor="field-game" className="field-label">
                        Game Name or URL <span className="req">*</span>
                      </label>
                      <input
                        id="field-game"
                        type="text"
                        className={`field-input ${
                          touched.game && errors.game ? "error" : ""
                        }`}
                        placeholder="Which game is this about?"
                        value={formData.game}
                        onChange={handleFieldChange("game")}
                        onBlur={handleBlur("game")}
                        maxLength={200}
                        aria-invalid={!!(touched.game && errors.game)}
                        aria-describedby={
                          touched.game && errors.game ? "err-game" : undefined
                        }
                      />
                      {touched.game && errors.game && (
                        <span className="field-error" id="err-game" role="alert">
                          {errors.game}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="field" style={{ marginBottom: 18 }}>
                    <label htmlFor="field-message" className="field-label">
                      Message <span className="req">*</span>
                    </label>
                    <textarea
                      id="field-message"
                      className={`field-textarea ${
                        touched.message && errors.message ? "error" : ""
                      }`}
                      placeholder="Tell us what's going on..."
                      value={formData.message}
                      onChange={handleFieldChange("message")}
                      onBlur={handleBlur("message")}
                      maxLength={MAX_MESSAGE_LENGTH}
                      aria-invalid={!!(touched.message && errors.message)}
                      aria-describedby={
                        touched.message && errors.message
                          ? "err-message"
                          : undefined
                      }
                    />
                    <span
                      className={`char-count ${
                        formData.message.length > MAX_MESSAGE_LENGTH - 100
                          ? "warn"
                          : ""
                      }`}
                    >
                      {formData.message.length} / {MAX_MESSAGE_LENGTH}
                    </span>
                    {touched.message && errors.message && (
                      <span className="field-error" id="err-message" role="alert">
                        {errors.message}
                      </span>
                    )}
                  </div>

                  <div className="safety-note">
                    <AlertCircle size={16} strokeWidth={2.4} aria-hidden="true" />
                    <p>
                      Please do not include passwords, authentication codes,
                      payment details, or other sensitive information.
                    </p>
                  </div>

                  <div className="submit-wrap">
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSending || !isValid}
                      aria-busy={isSending}
                    >
                      <span>{isSending ? "Sending…" : "Send Message"}</span>
                      <span className="submit-icon" aria-hidden="true">
                        {isSending ? (
                          <Loader2 size={15} strokeWidth={2.6} className="spin" />
                        ) : (
                          <Send size={15} strokeWidth={2.6} />
                        )}
                      </span>
                    </button>

                    <div
                      ref={statusRef}
                      tabIndex={-1}
                      aria-live="polite"
                      aria-atomic="true"
                      className={`submit-status ${
                        submitState === "success"
                          ? "success"
                          : submitState === "error"
                          ? "error"
                          : ""
                      }`}
                      style={{
                        display:
                          submitState === "success" || submitState === "error"
                            ? "flex"
                            : "none",
                      }}
                    >
                      {submitState === "success" && (
                        <>
                          <CheckCircle2
                            size={16}
                            strokeWidth={2.6}
                            aria-hidden="true"
                          />
                          <div className="status-copy">
                            <span>
                              <strong>Message sent successfully!</strong>
                            </span>
                            <span>
                              Thanks for reaching out. We&apos;ll get back to
                              you as soon as we can — usually within 24–48 hours.
                            </span>
                          </div>
                        </>
                      )}
                      {submitState === "error" && (
                        <>
                          <AlertCircle
                            size={16}
                            strokeWidth={2.6}
                            aria-hidden="true"
                          />
                          <div className="status-copy">
                            <span>
                              Something went wrong while sending. Please try
                              again, or use the direct email link below.
                            </span>
                            {fallbackMailto && (
                              <a href={fallbackMailto}>Open in email app</a>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="fallback-row">
                      <span>Prefer email directly?</span>
                      <a href={`mailto:${ACTIVE_EMAIL}`}>
                        {ACTIVE_EMAIL}
                        <ExternalLink size={11} strokeWidth={2.6} aria-hidden="true" />
                      </a>
                      <span>·</span>
                      <a href={`mailto:${ALT_EMAIL}`}>
                        {ALT_EMAIL}
                        <ExternalLink size={11} strokeWidth={2.6} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="faq-section" aria-label="Frequently asked questions">
            <div className="faq-inner">
              <div className="faq-head">
                <h2>Quick Answers</h2>
              </div>
              {FAQS.map((faq, i) => (
                <FaqItem
                  key={i}
                  id={i}
                  faq={faq}
                  isOpen={openFaq === i}
                  onToggle={() => handleFaqToggle(i)}
                />
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="site-footer">
            <div className="footer-body">

              <div className="footer-row">
                <button
                  type="button"
                  className="footer-logo"
                  onClick={goHome}
                  aria-label="Go to Sharx home"
                >
                  <Image src="/sharx-logo.webp" alt="Sharx" width={62} height={42} draggable={false} />
                </button>

                <nav className="footer-links" aria-label="Footer navigation">
                  <Link href="/inside" className="footer-link">About Us</Link>
                  <Link href="/hello" className="footer-link">Contact</Link>
                  <Link href="/trust" className="footer-link">Privacy Policy</Link>
                  <Link href="/terms" className="footer-link">Terms of Service</Link>
                  <Link href="/copyright" className="footer-link">Copyright</Link>
                </nav>

                <span className="footer-copyright">
                  © {year} Sharx. All rights reserved.
                </span>
              </div>

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