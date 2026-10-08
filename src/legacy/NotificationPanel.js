"use client";

// src/legacy/NotificationPanel.js — SHARX · Crayon
//
// Dropdown panel rendered under NotificationBell.
// Reads from ProfileContext, dispatches markNotificationRead /
// markAllNotificationsRead. Relative time formatting is client-only
// (computed after mount) to avoid SSR / hydration mismatch.

import { useEffect, useMemo, useState } from "react";
import { useProfile } from "../context/ProfileContext";

/* ─── Relative time (client-only) ─── */
function formatRelative(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const diff = Math.max(0, Date.now() - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day}d ago`;

  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

/* ─── Type → SVG icon ─── */
function TypeIcon({ type }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };

  switch (type) {
    case "welcome":
      return (
        <svg {...common}>
          <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.6l-1.6-5.4L5 10.6 10.4 9 12 3.5Z" />
        </svg>
      );
    case "avatar":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3.5" />
          <path d="M5.5 20c.7-3.4 3.4-5.5 6.5-5.5S17.8 16.6 18.5 20" />
        </svg>
      );
    case "profile":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      );
    case "game":
      return (
        <svg {...common}>
          <path d="M7 8h10a4 4 0 0 1 3.8 5.2l-1.1 3.3a2.4 2.4 0 0 1-4.4.5L14 15h-4l-1.3 2a2.4 2.4 0 0 1-4.4-.5l-1.1-3.3A4 4 0 0 1 7 8Z" />
          <path d="M8 11v4M6 13h4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8v.01" />
        </svg>
      );
  }
}

export default function NotificationPanel({ onClose }) {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useProfile();

  /* Relative timestamps need Date.now() — compute only after mount
     so SSR HTML matches the first client render (no label text). */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const list = useMemo(() => {
    if (!Array.isArray(notifications)) return [];
    return notifications;
  }, [notifications]);

  const hasUnread = unreadNotificationCount > 0;

  const handleItemClick = (id) => {
    if (!id) return;
    markNotificationRead?.(id);
  };

  const handleMarkAll = () => {
    if (!hasUnread) return;
    markAllNotificationsRead?.();
  };

  return (
    <div
      className="notif-panel"
      role="dialog"
      aria-label="Notifications"
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        .notif-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 340px;
          max-width: calc(100vw - 24px);
          z-index: 300;
          background: var(--paper, #FFFDF7);
          border: 2.5px solid var(--ink, #1B2A41);
          border-radius: 20px;
          box-shadow: 4px 4px 0 var(--ink, #1B2A41);
          overflow: hidden;
          animation: notif-panel-in 0.22s cubic-bezier(.16,1,.3,1);
          transform-origin: top right;
        }

        @keyframes notif-panel-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        .notif-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 14px 16px;
          border-bottom: 2px dashed rgba(27, 42, 65, 0.15);
          background:
            radial-gradient(circle at 92% 10%, rgba(255,217,102,0.30), transparent 55%),
            var(--paper, #FFFDF7);
        }

        .notif-panel-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-comfortaa, 'Comfortaa', sans-serif);
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink, #1B2A41);
        }

        .notif-panel-title-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #EF4444;
          border: 2px solid var(--ink, #1B2A41);
          flex-shrink: 0;
        }

        .notif-panel-title-dot.is-off {
          background: var(--mint, #7BE5B5);
        }

        .notif-panel-count {
          font-size: 10px;
          font-weight: 900;
          color: var(--ink-soft, #5A6B82);
        }

        .notif-panel-markall {
          border: 0;
          background: none;
          padding: 4px 6px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          color: var(--blue, #2E7FE8);
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.15s ease, color 0.15s ease;
          white-space: nowrap;
        }

        .notif-panel-markall:hover:not(:disabled) {
          background: rgba(46, 127, 232, 0.12);
        }

        .notif-panel-markall:disabled {
          color: var(--ink-mute, #98A6B8);
          cursor: default;
        }

        /* ── List ── */
        .notif-panel-list {
          list-style: none;
          margin: 0;
          padding: 6px;
          max-height: 360px;
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .notif-panel-list::-webkit-scrollbar { width: 6px; }
        .notif-panel-list::-webkit-scrollbar-thumb {
          background: rgba(27, 42, 65, 0.18);
          border-radius: 100px;
        }

        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 11px 12px;
          border-radius: 14px;
          cursor: pointer;
          background: transparent;
          border: 0;
          text-align: left;
          width: 100%;
          font-family: inherit;
          transition: background 0.15s ease;
          position: relative;
        }

        .notif-item:hover {
          background: rgba(255, 217, 102, 0.22);
        }

        .notif-item:focus-visible {
          outline: 3px solid var(--blue, #2E7FE8);
          outline-offset: 2px;
        }

        .notif-item.is-unread {
          background: rgba(46, 127, 232, 0.06);
        }

        .notif-item.is-unread:hover {
          background: rgba(255, 217, 102, 0.28);
        }

        .notif-item-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 2px solid var(--ink, #1B2A41);
          border-radius: 11px;
          box-shadow: 1.5px 1.5px 0 var(--ink, #1B2A41);
          color: var(--ink, #1B2A41);
          background: var(--yellow, #FFD966);
        }

        .notif-item[data-type="avatar"]  .notif-item-icon { background: var(--lilac, #C7B4FF); }
        .notif-item[data-type="profile"] .notif-item-icon { background: var(--mint, #7BE5B5); }
        .notif-item[data-type="game"]    .notif-item-icon { background: var(--coral, #FF8B7B); }

        .notif-item-body {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .notif-item-title {
          font-size: 12.5px;
          font-weight: 900;
          color: var(--ink, #1B2A41);
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .notif-item-msg {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--ink-soft, #5A6B82);
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .notif-item-time {
          font-size: 10px;
          font-weight: 800;
          color: var(--ink-mute, #98A6B8);
          margin-top: 3px;
        }

        .notif-item-unread-dot {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #EF4444;
          border: 1.5px solid var(--ink, #1B2A41);
        }

        /* ── Empty ── */
        .notif-panel-empty {
          padding: 40px 20px 36px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .notif-panel-empty-icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          background: var(--yellow-soft, #FFF6D9);
          border: 2.5px solid var(--ink, #1B2A41);
          border-radius: 50%;
          box-shadow: 2px 2px 0 var(--ink, #1B2A41);
          color: var(--ink, #1B2A41);
          transform: rotate(-6deg);
        }

        .notif-panel-empty-title {
          font-size: 13px;
          font-weight: 900;
          color: var(--ink, #1B2A41);
        }

        .notif-panel-empty-sub {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--ink-soft, #5A6B82);
          line-height: 1.5;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .notif-panel {
            width: 300px;
            right: -6px;
          }
          .notif-panel-list { max-height: 320px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .notif-panel {
            animation: none !important;
          }
          .notif-item,
          .notif-panel-markall {
            transition: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="notif-panel-head">
        <div className="notif-panel-title">
          <span
            className={`notif-panel-title-dot ${
              hasUnread ? "" : "is-off"
            }`}
            aria-hidden="true"
          />
          Notifications
          {unreadNotificationCount > 0 && (
            <span className="notif-panel-count">
              ({unreadNotificationCount})
            </span>
          )}
        </div>

        <button
          type="button"
          className="notif-panel-markall"
          onClick={handleMarkAll}
          disabled={!hasUnread}
        >
          Mark all read
        </button>
      </div>

      {/* List / Empty */}
      {list.length === 0 ? (
        <div className="notif-panel-empty">
          <div className="notif-panel-empty-icon" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </div>
          <div className="notif-panel-empty-title">You&apos;re all caught up</div>
          <div className="notif-panel-empty-sub">
            We&apos;ll let you know when something happens.
          </div>
        </div>
      ) : (
        <ul className="notif-panel-list">
          {list.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={`notif-item ${n.read ? "" : "is-unread"}`}
                data-type={n.type || "info"}
                onClick={() => handleItemClick(n.id)}
                aria-label={`${n.title}. ${n.message}`}
              >
                <span className="notif-item-icon" aria-hidden="true">
                  <TypeIcon type={n.type} />
                </span>

                <span className="notif-item-body">
                  <span className="notif-item-title">{n.title}</span>
                  {n.message && (
                    <span className="notif-item-msg">{n.message}</span>
                  )}
                  {mounted && n.createdAt && (
                    <span className="notif-item-time">
                      {formatRelative(n.createdAt)}
                    </span>
                  )}
                </span>

                {!n.read && (
                  <span className="notif-item-unread-dot" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}