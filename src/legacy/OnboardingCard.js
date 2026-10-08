"use client";

// src/legacy/OnboardingCard.js — SHARX · Crayon
//
// Welcome banner shown on Home for brand-new users only.
// Hidden once onboardingCompleted is true (or when dismissed).
// SSR-safe: client-only state gated by a mounted flag.
//
// FIXES:
//  - Avatar step detection uses profile.avatarConfigured (explicit flag).
//  - Username step detection uses profile.usernameConfigured. Label now
//    reads "Set your username" so a brand-new user clearly knows what
//    action is required. No auto-generated name is ever shown.

import { useEffect, useState } from "react";
import { useProfile } from "../context/ProfileContext";

/* ─── Crayon icons (SVG only) ─── */
const Icon = {
  Spark: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.6l-1.6-5.4L5 10.6 10.4 9 12 3.5Z" />
    </svg>
  ),
  Palette: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 1 0 0 20c1 0 2-1 2-2v-1a2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-11z" />
      <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" />
    </svg>
  ),
  Pen: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  Gamepad: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.1 3.3a2.4 2.4 0 0 1-4.4.5L14 15h-4l-1.3 2a2.4 2.4 0 0 1-4.4-.5l-1.1-3.3A4 4 0 0 1 7 8Z" />
      <path d="M8 11v4M6 13h4" />
    </svg>
  ),
  X: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  Arrow: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
};

export default function OnboardingCard({
  onOpenProfile,
  onPlayFirstGame,
}) {
  const {
    profile,
    isNewUser,
    onboardingCompleted,
    isAvatarConfigured,
    isUsernameConfigured,
    completeOnboarding,
  } = useProfile();

  const [mounted, setMounted] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Hide until mounted (avoids hydration mismatch) */
  if (!mounted) return null;

  /* Only new users see this. Existing users never do. */
  const shouldShow =
    !!profile &&
    !onboardingCompleted &&
    (isNewUser || profile.isNewAccount === true);

  if (!shouldShow) return null;

  /* ─── Greeting name — only show a name if the user actually set one.
     Otherwise a friendly neutral greeting. ─── */
  const greetingName =
    (profile.stylishUsername && profile.stylishUsername.trim()) ||
    (profile.username && profile.username.trim()) ||
    null;

  /* ─── Step completion heuristics ───
     Avatar step → avatarConfigured.
     Username step → usernameConfigured.
     Game step → gamesPlayed > 0. */
  const avatarDone =
    isAvatarConfigured === true ||
    profile.avatarConfigured === true ||
    Boolean(profile.avatarShape);

  const usernameDone =
    isUsernameConfigured === true ||
    profile.usernameConfigured === true ||
    Boolean(
      (profile.stylishUsername || "").toString().trim()
    );

  const gameDone = Number(profile.gamesPlayed || 0) > 0;

  const steps = [
    {
      id: "avatar",
      label: "Create your avatar",
      sub: "Make it yours",
      done: avatarDone,
      icon: <Icon.Palette />,
      action: () => onOpenProfile?.(),
    },
    {
      id: "username",
      label: "Set your username",
      sub: "Give your profile a name",
      done: usernameDone,
      icon: <Icon.Pen />,
      action: () => onOpenProfile?.(),
    },
    {
      id: "game",
      label: "Play your first game",
      sub: "Pick one and go",
      done: gameDone,
      icon: <Icon.Gamepad />,
      action: () => onPlayFirstGame?.(),
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  const handleDismiss = () => {
    setDismissing(true);
    window.setTimeout(() => {
      completeOnboarding?.();
    }, 200);
  };

  return (
    <>
      <style>{`
        .shx-onb {
          position: relative;
          z-index: 5;
          width: 100%;
          margin: 0 0 24px;
          padding: 22px 22px 20px;
          background:
            radial-gradient(circle at 92% 8%, rgba(255,217,102,0.36), transparent 42%),
            radial-gradient(circle at 4% 100%, rgba(199,180,255,0.28), transparent 42%),
            var(--paper, #FFFDF7);
          border: 2.5px solid var(--ink, #1B2A41);
          border-radius: 26px;
          box-shadow: 5px 5px 0 var(--ink, #1B2A41);
          color: var(--ink, #1B2A41);
          font-family: var(--font-comfortaa, 'Comfortaa', system-ui, sans-serif);
          overflow: hidden;
          animation: shx-onb-in 0.42s cubic-bezier(.34,1.4,.4,1) both;
          isolation: isolate;
        }

        .shx-onb.is-out {
          animation: shx-onb-out 0.2s ease forwards;
        }

        @keyframes shx-onb-in {
          0%   { opacity: 0; transform: translateY(-14px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes shx-onb-out {
          to { opacity: 0; transform: translateY(-8px) scale(0.98); }
        }

        .shx-onb::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(27,42,65,0.055) 1px, transparent 1.3px);
          background-size: 18px 18px;
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
        }

        .shx-onb-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--paper, #FFFDF7);
          border: 2px solid var(--ink, #1B2A41);
          color: var(--ink, #1B2A41);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 1.5px 1.5px 0 var(--ink, #1B2A41);
          z-index: 3;
          transition:
            transform 0.2s cubic-bezier(.34,1.4,.4,1),
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .shx-onb-close:hover {
          background: var(--coral, #FF8B7B);
          transform: translate3d(-1px, -1px, 0) rotate(90deg);
          box-shadow: 2px 2px 0 var(--ink, #1B2A41);
        }

        .shx-onb-close:active {
          transform: translate3d(0, 0, 0) rotate(90deg);
        }

        .shx-onb-close:focus-visible {
          outline: 3px solid var(--blue, #2E7FE8);
          outline-offset: 3px;
        }

        .shx-onb-head {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
          padding-right: 44px;
        }

        .shx-onb-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 12px;
          background: var(--yellow, #FFD966);
          border: 2px solid var(--ink, #1B2A41);
          border-radius: 999px;
          box-shadow: 1.5px 1.5px 0 var(--ink, #1B2A41);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink, #1B2A41);
          margin-bottom: 10px;
        }

        .shx-onb-title {
          margin: 0;
          font-size: clamp(20px, 2.6vw, 26px);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.6px;
          color: var(--ink, #1B2A41);
        }

        .shx-onb-title span {
          background: linear-gradient(
            180deg,
            transparent 60%,
            rgba(255, 139, 123, 0.55) 60%
          );
          padding: 0 3px;
          border-radius: 4px;
        }

        .shx-onb-sub {
          margin: 8px 0 0;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.55;
          color: var(--ink-soft, #5A6B82);
          max-width: 460px;
        }

        .shx-onb-steps {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 14px;
        }

        .shx-onb-step {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: var(--paper, #FFFDF7);
          border: 2px solid var(--ink, #1B2A41);
          border-radius: 16px;
          box-shadow: 2px 2px 0 var(--ink, #1B2A41);
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          color: inherit;
          width: 100%;
          transition:
            transform 0.2s cubic-bezier(.34,1.4,.4,1),
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .shx-onb-step:hover:not(:disabled) {
          transform: translate3d(-2px, -2px, 0);
          box-shadow: 3px 3px 0 var(--ink, #1B2A41);
          background: var(--yellow-soft, #FFF6D9);
        }

        .shx-onb-step:active:not(:disabled) {
          transform: translate3d(0, 0, 0);
          box-shadow: 2px 2px 0 var(--ink, #1B2A41);
        }

        .shx-onb-step:focus-visible {
          outline: 3px solid var(--blue, #2E7FE8);
          outline-offset: 3px;
        }

        .shx-onb-step.is-done {
          background: rgba(123, 229, 181, 0.22);
          cursor: default;
          opacity: 0.85;
        }

        .shx-onb-step.is-done:hover {
          transform: none;
          box-shadow: 2px 2px 0 var(--ink, #1B2A41);
          background: rgba(123, 229, 181, 0.22);
        }

        .shx-onb-step-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          background: var(--lilac, #C7B4FF);
          border: 2px solid var(--ink, #1B2A41);
          border-radius: 11px;
          box-shadow: 1.5px 1.5px 0 var(--ink, #1B2A41);
          color: var(--ink, #1B2A41);
        }

        .shx-onb-step:nth-child(2) .shx-onb-step-icon { background: var(--mint, #7BE5B5); }
        .shx-onb-step:nth-child(3) .shx-onb-step-icon { background: var(--coral, #FF8B7B); }

        .shx-onb-step.is-done .shx-onb-step-icon {
          background: var(--mint, #7BE5B5);
        }

        .shx-onb-step-body {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .shx-onb-step-label {
          font-size: 12.5px;
          font-weight: 900;
          color: var(--ink, #1B2A41);
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .shx-onb-step-sub {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--ink-soft, #5A6B82);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .shx-onb-step-arrow {
          flex-shrink: 0;
          color: var(--ink, #1B2A41);
          opacity: 0.7;
          transition: transform 0.2s ease;
        }

        .shx-onb-step:hover:not(:disabled) .shx-onb-step-arrow {
          transform: translateX(3px);
          opacity: 1;
        }

        .shx-onb-step.is-done .shx-onb-step-arrow {
          display: none;
        }

        .shx-onb-foot {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .shx-onb-progress {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 900;
          color: var(--ink-soft, #5A6B82);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .shx-onb-progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(27, 42, 65, 0.18);
          border: 1.5px solid var(--ink, #1B2A41);
          transition: background 0.2s ease;
        }

        .shx-onb-progress-dot.is-on {
          background: var(--mint, #7BE5B5);
        }

        .shx-onb-progress-num {
          margin-left: 4px;
          color: var(--ink, #1B2A41);
        }

        .shx-onb-skip {
          background: none;
          border: none;
          padding: 4px 6px;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 800;
          color: var(--ink-soft, #5A6B82);
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .shx-onb-skip:hover {
          background: rgba(27, 42, 65, 0.08);
          color: var(--ink, #1B2A41);
        }

        .shx-onb-skip:focus-visible {
          outline: 3px solid var(--blue, #2E7FE8);
          outline-offset: 2px;
        }

        @media (max-width: 720px) {
          .shx-onb {
            padding: 18px 16px 16px;
            border-radius: 22px;
          }
          .shx-onb-head {
            padding-right: 40px;
          }
          .shx-onb-steps {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .shx-onb-step {
            padding: 11px 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shx-onb,
          .shx-onb-step,
          .shx-onb-step-arrow,
          .shx-onb-close,
          .shx-onb-progress-dot {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className={`shx-onb ${dismissing ? "is-out" : ""}`}>
        <button
          type="button"
          className="shx-onb-close"
          onClick={handleDismiss}
          aria-label="Dismiss welcome card"
        >
          <Icon.X />
        </button>

        <div className="shx-onb-head">
          <div>
            <span className="shx-onb-eyebrow">
              <Icon.Spark />
              Welcome to SHARX
            </span>
            <h2 className="shx-onb-title">
              {greetingName ? (
                <>
                  Hey {greetingName},{" "}
                  <span>let&apos;s get you set up</span>.
                </>
              ) : (
                <>
                  Welcome, <span>let&apos;s get you set up</span>.
                </>
              )}
            </h2>
            <p className="shx-onb-sub">
              Three quick steps to make SHARX yours. Takes less than a
              minute — you can skip any time.
            </p>
          </div>
        </div>

        <div className="shx-onb-steps">
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              className={`shx-onb-step ${step.done ? "is-done" : ""}`}
              onClick={step.done ? undefined : step.action}
              disabled={step.done}
              aria-label={`${step.label}. ${step.sub}`}
            >
              <span className="shx-onb-step-icon">{step.icon}</span>
              <span className="shx-onb-step-body">
                <span className="shx-onb-step-label">{step.label}</span>
                <span className="shx-onb-step-sub">
                  {step.done ? "Done" : step.sub}
                </span>
              </span>
              {!step.done && (
                <span className="shx-onb-step-arrow">
                  <Icon.Arrow />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="shx-onb-foot">
          <span className="shx-onb-progress">
            {steps.map((s, i) => (
              <span
                key={i}
                className={`shx-onb-progress-dot ${
                  s.done ? "is-on" : ""
                }`}
                aria-hidden="true"
              />
            ))}
            <span className="shx-onb-progress-num">
              {doneCount}/{steps.length}
            </span>
          </span>

          <button
            type="button"
            className="shx-onb-skip"
            onClick={handleDismiss}
          >
            Skip for now
          </button>
        </div>
      </div>
    </>
  );
}