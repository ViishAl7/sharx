"use client";

// src/legacy/NotificationBell.js — SHARX · Crayon
//
// Topbar bell + unread badge. Click opens NotificationPanel below it.
// Closes on outside click, Escape, or after navigation.
// SSR-safe: badge only renders after mount (avoids hydration mismatch).

import { useEffect, useRef, useState } from "react";
import { useProfile } from "../context/ProfileContext";
import NotificationPanel from "./NotificationPanel";

export default function NotificationBell() {
  const { unreadNotificationCount } = useProfile();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const wrapperRef = useRef(null);

  /* Mount gate — badge count depends on client-side profile state,
     so we only render the badge after hydration. */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* Outside click closes */
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  /* Escape closes */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const hasUnread = mounted && unreadNotificationCount > 0;
  const countLabel =
    unreadNotificationCount > 9 ? "9+" : String(unreadNotificationCount);

  return (
    <div className="notif-bell-wrap" ref={wrapperRef}>
      <style>{`
        .notif-bell-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .notif-bell-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: var(--paper, #FFFDF7);
          border: 2.5px solid var(--ink, #1B2A41);
          box-shadow: 2px 2px 0 var(--ink, #1B2A41);
          cursor: pointer;
          color: var(--ink, #1B2A41);
          transition:
            transform 0.2s cubic-bezier(.34,1.4,.4,1),
            box-shadow 0.2s ease,
            background 0.2s ease;
          flex-shrink: 0;
        }

        .notif-bell-btn:hover {
          background: var(--yellow, #FFD966);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: 3px 3px 0 var(--ink, #1B2A41);
        }

        .notif-bell-btn:active {
          transform: translate3d(0, 0, 0) scale(0.96);
          box-shadow: 2px 2px 0 var(--ink, #1B2A41);
        }

        .notif-bell-btn:focus-visible {
          outline: 3px solid var(--blue, #2E7FE8);
          outline-offset: 3px;
        }

        .notif-bell-btn svg {
          width: 20px;
          height: 20px;
          stroke-width: 2.4;
        }

        .notif-bell-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 999px;
          background: #EF4444;
          color: #fff;
          border: 2px solid var(--paper, #FFFDF7);
          font-family: var(--font-comfortaa, 'Comfortaa', sans-serif);
          font-size: 10px;
          font-weight: 900;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 2px var(--ink, #1B2A41);
          pointer-events: none;
          animation: notif-bell-pop 0.32s cubic-bezier(.34,1.4,.4,1);
        }

        @keyframes notif-bell-pop {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 640px) {
          .notif-bell-btn { width: 42px; height: 42px; }
          .notif-bell-btn svg { width: 18px; height: 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .notif-bell-btn,
          .notif-bell-badge {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          hasUnread
            ? `Notifications (${unreadNotificationCount} unread)`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {hasUnread && (
          <span className="notif-bell-badge" aria-hidden="true">
            {countLabel}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel onClose={() => setOpen(false)} />
      )}
    </div>
  );
}