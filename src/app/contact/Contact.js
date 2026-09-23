"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  memo,
  lazy,
  Suspense,
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
} from "lucide-react";
import Link from "next/link";

const SocialComingSoonModal = lazy(
  () => import("../../legacy/SocialComingSoonModal")
);

/* ─── Emails ─── */
const ACTIVE_EMAIL = "hello@sharx.in";          // primary
const ALT_EMAIL = "vishalxr92@gmail.com";        // alternative

const MIN_MESSAGE_LENGTH = 4;
const MAX_MESSAGE_LENGTH = 2000;

const REASONS = [
  { value: "general", label: "General question" },
  { value: "account", label: "Account or login issue" },
  { value: "broken-game", label: "Report a broken game" },
  { value: "content", label: "Report inappropriate content" },
  { value: "bug", label: "Bug or technical problem" },
  { value: "feedback", label: "Feedback or suggestion" },
  { value: "business", label: "Business inquiry" },
  { value: "submission", label: "Game submission" },
  { value: "other", label: "Other" },
];

const REASON_LABEL = (value) =>
  REASONS.find((r) => r.value === value)?.label || value;

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

const SocialIcon = memo(function SocialIcon({ type, onOpen, href, title }) {
  const handleClick = useCallback(() => {
    if (href) window.open(href, "_blank", "noopener,noreferrer");
    else onOpen(type);
  }, [href, onOpen, type]);

  if (type === "instagram") {
    return (
      <button
        type="button"
        className="social-icon instagram"
        onClick={handleClick}
        title={title}
        aria-label={title}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      </button>
    );
  }
  return (
    <button
      type="button"
      className="social-icon youtube"
      onClick={handleClick}
      title={title}
      aria-label={title}
    >
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    </button>
  );
});

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
  const [socialModal, setSocialModal] = useState(null);
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
  const [sentEmail, setSentEmail] = useState("");
  const statusRef = useRef(null);

  const handleSocialClick = useCallback((p) => setSocialModal(p), []);
  const handleCloseSocialModal = useCallback(() => setSocialModal(null), []);
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

        setSentEmail(email);
        setSubmitState("success");
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
          transition: transform 0.25s cubic-bezier(.34,1.3,.4,1);
          background: none;
          border: none;
          padding: 0;
        }
        .nav-logo:hover { transform: scale(1.04); }
        .nav-logo img { height: 62px; width: auto; display: block; filter: drop-shadow(2px 2px 0 rgba(27,42,65,0.12)); }

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
          font-family: var(--font-comfortaa), sans-serif;
          font-size: 12.5px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 100px;
          background: var(--paper);
          border: var(--border);
          color: var(--ink-soft);
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s, background 0.2s, color 0.2s;
        }
        .reason-chip:hover {
          background: var(--yellow-soft);
          color: var(--ink);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-sm);
        }
        .reason-chip.active {
          background: var(--yellow);
          color: var(--ink);
          box-shadow: var(--shadow-sm);
          transform: translate3d(-2px, -2px, 0);
        }
        .reason-chip:focus-visible { outline: 3px solid var(--blue); outline-offset: 2px; }

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
        .submit-status.success {
          background: var(--mint-soft);
          color: var(--ink);
        }
        .submit-status.success .status-copy,
        .submit-status.success .status-copy span,
        .submit-status.success .status-copy strong {
          color: var(--ink);
        }
        .submit-status.success svg {
          color: #16845F;
        }
        .submit-status.error {
          background: var(--coral-soft);
          color: var(--ink);
        }
        .submit-status.error .status-copy,
        .submit-status.error .status-copy span {
          color: var(--ink);
        }
        .submit-status.error svg {
          color: var(--coral-deep);
        }
        .submit-status svg {
          flex-shrink: 0;
          margin-top: 2px;
          width: 16px;
          height: 16px;
        }
        .submit-status .status-copy {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: var(--ink);
        }
        .submit-status a {
          color: var(--blue);
          font-weight: 800;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
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
        .fallback-row > span {
          color: var(--ink-soft);
        }
        .fallback-row a {
          color: var(--blue);
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          text-underline-offset: 3px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 800;
          opacity: 1;
          visibility: visible;
        }
        .fallback-row a svg {
          color: var(--blue);
          opacity: 1;
          flex-shrink: 0;
        }
        .fallback-row a:hover {
          color: #0D5FBE;
        }
        .fallback-row a:hover svg {
          color: #0D5FBE;
        }

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
          .faq:hover {
            transform: translate3d(-2px, -2px, 0);
            box-shadow: var(--shadow-lg);
          }
        }
        .faq.faq-open {
          background: #FFFFFF;
          transform: translate3d(-1px, -1px, 0);
          box-shadow: var(--shadow-md);
        }

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
        .faq-q:focus-visible {
          outline: 3px solid var(--blue);
          outline-offset: -6px;
          border-radius: 12px;
        }
        .faq-q span:first-child {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
          line-height: 1.4;
        }

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
        .faq-tog.open {
          transform: rotate(-180deg);
          background: var(--yellow);
        }

        .faq-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.42s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: grid-template-rows;
        }
        .faq-body.open {
          grid-template-rows: 1fr;
        }
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
          max-width: 980px;
          margin: 0 auto;
          padding: 30px 40px 26px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 32px;
        }
        .footer-left { display: flex; align-items: center; gap: 18px; justify-content: flex-start; }
        .footer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(.34,1.3,.4,1);
          flex-shrink: 0;
        }
        .footer-logo:hover { transform: scale(1.04); }
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
          padding: 0;
        }
        .social-icon svg { width: 20px; height: 20px; fill: var(--ink); transition: fill 0.28s; }
        .social-icon.instagram svg { fill: #E1306C; }
        .social-icon.youtube svg { fill: #FF0000; }
        .social-icon:hover {
          transform: translate3d(-2px, -2px, 0) rotate(-3deg);
          box-shadow: var(--shadow-md);
          background: #fff;
        }
        .footer-center { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
        .footer-center-title {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--ink-mute);
          font-family: var(--font-comfortaa), sans-serif;
        }
        .footer-center-links { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; justify-content: center; }
        .footer-link {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--ink);
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
          background: var(--coral-deep);
          border-radius: 100px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.28s cubic-bezier(.34,1.4,.4,1);
        }
        .footer-link:hover { color: var(--coral-deep); }
        .footer-link:hover::after { transform: scaleX(1); }
        .footer-right { display: flex; justify-content: flex-end; align-items: center; }
        .footer-copyright {
          font-size: 12px;
          font-weight: 700;
          color: var(--ink-mute);
          letter-spacing: 0.3px;
          font-family: var(--font-comfortaa), sans-serif;
          text-align: right;
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

        @media (max-width: 900px) {
          .main { padding: 22px 24px 30px; }
          .nav-logo img { height: 52px; }
        }
        @media (max-width: 640px) {
          .main { padding: 18px 18px 24px; }
          .nav-logo img { height: 46px; }
          .nav-back { height: 36px; padding: 0 16px; font-size: 12.5px; }
          .hero { padding: 44px 12px 32px; }
          .hero-title { letter-spacing: -1.6px; text-shadow: 3px 3px 0 var(--yellow); }
          .footer-body { padding: 24px 22px 22px; border-radius: 22px; }
          .footer-grid { grid-template-columns: 1fr; gap: 22px; justify-items: center; }
          .footer-left { justify-content: center; flex-wrap: wrap; }
          .footer-center-links { flex-wrap: wrap; justify-content: center; }
          .footer-right { justify-content: center; }
          .footer-copyright { text-align: center; }
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
              <img src="/sharx-logo.webp" alt="Sharx" width="62" height="62" />
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
                    {REASONS.map((r) => (
                      <button
                        type="button"
                        key={r.value}
                        role="radio"
                        aria-checked={formData.reason === r.value}
                        className={`reason-chip ${
                          formData.reason === r.value ? "active" : ""
                        }`}
                        onClick={() => handleReasonSelect(r.value)}
                      >
                        {r.label}
                      </button>
                    ))}
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
                              Message sent successfully! We&apos;ll get back to
                              you at <strong>{sentEmail || "your email address"}</strong> soon.
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
              <div className="footer-grid">
                <div className="footer-left">
                  <div className="footer-logo" onClick={goHome}>
                    <img src="/sharx-logo.webp" alt="Sharx" draggable={false} />
                  </div>
                  <div className="footer-socials">
                    <SocialIcon
                      type="instagram"
                      href="https://www.instagram.com/sharx__games?igsh=NWU3Zm9udDR3NHd4"
                      title="Sharx on Instagram"
                    />
                    <SocialIcon
                      type="youtube"
                      onOpen={handleSocialClick}
                      title="Sharx on YouTube"
                    />
                  </div>
                </div>

                <div className="footer-center">
                  <div className="footer-center-title">Company</div>
                  <div className="footer-center-links">
                    <Link href="/about" className="footer-link">
                      About Us
                    </Link>
                    <Link href="/contact" className="footer-link">
                      Contact
                    </Link>
                    <Link href="/privacy" className="footer-link">
                      Privacy Policy
                    </Link>
                    <Link href="/terms" className="footer-link">
                      Terms of Service
                    </Link>
                    <Link href="/copyright" className="footer-link">
                      Copyright
                    </Link>
                  </div>
                </div>

                <div className="footer-right">
                  <span className="footer-copyright">
                    © {year} Sharx. All rights reserved.
                  </span>
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