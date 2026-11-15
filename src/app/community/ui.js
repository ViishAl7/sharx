"use client";

import { useEffect, useRef, useState } from "react";
import { getInitials, safeUrl, REACTIONS } from "./api";

/* ───────────── icons (24x24 stroke icons, styled by CSS) ───────────── */

const Icon = ({ children, ...p }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    {children}
  </svg>
);

export const HeartIcon = () => (
  <Icon>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Icon>
);
export const CommentIcon = () => (
  <Icon>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Icon>
);
export const SunIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);
export const MoonIcon = () => (
  <Icon>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Icon>
);
export const SendIcon = () => (
  <Icon>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </Icon>
);
export const MoreIcon = () => (
  <Icon style={{ fill: "currentColor", stroke: "none" }}>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </Icon>
);
export const BellIcon = () => (
  <Icon>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
  </Icon>
);
export const ImageIcon = () => (
  <Icon>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </Icon>
);
export const CloseIcon = () => (
  <Icon>
    <path d="M18 6L6 18M6 6l12 12" />
  </Icon>
);
export const BackIcon = () => (
  <Icon>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Icon>
);
export const ArrowUpIcon = () => (
  <Icon>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Icon>
);
export const GamepadIcon = () => (
  <Icon>
    <path d="M6 12h4M8 10v4" />
    <circle cx="15.5" cy="11" r="0.6" />
    <circle cx="17.5" cy="13" r="0.6" />
    <path d="M17.3 5H6.7a4 4 0 0 0-3.9 3.2l-1 6.1A3 3 0 0 0 7 16.6L8.3 15h7.4l1.3 1.6a3 3 0 0 0 5.2-2.3l-1-6.1A4 4 0 0 0 17.3 5z" />
  </Icon>
);
export const ChatIcon = () => (
  <Icon>
    <path d="M17 3H7a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h1v4l5-4h4a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4z" />
    <path d="M8 9h8M8 13h5" />
  </Icon>
);
export const MailIcon = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </Icon>
);
export const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Icon>
);
export const CheckIcon = () => (
  <Icon>
    <path d="M20 6L9 17l-5-5" />
  </Icon>
);
export const CheckDoubleIcon = () => (
  <Icon>
    <path d="M2 12l5 5L17 7M13 16l1 1L22 7" />
  </Icon>
);
export const EditIcon = () => (
  <Icon>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Icon>
);
export const TrashIcon = () => (
  <Icon>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
  </Icon>
);
export const FlagIcon = () => (
  <Icon>
    <path d="M4 22V4M4 4h13l-2 4 2 4H4" />
  </Icon>
);
export const ShieldIcon = () => (
  <Icon>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Icon>
);
export const MuteIcon = () => (
  <Icon>
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M22 9l-6 6M16 9l6 6" />
  </Icon>
);
export const BanIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.6 5.6l12.8 12.8" />
  </Icon>
);
export const UsersIcon = () => (
  <Icon>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
  </Icon>
);
export const UserIcon = () => (
  <Icon>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icon>
);
export const HomeIcon = () => (
  <Icon>
    <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
  </Icon>
);
export const LoginIcon = () => (
  <Icon>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
  </Icon>
);
export const SparkIcon = () => (
  <Icon>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
  </Icon>
);
export const AtIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </Icon>
);
export const HeartHandIcon = () => (
  <Icon>
    <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16M7 20l1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.8-2.8L15 13" />
    <path d="M3 16l5 5" />
  </Icon>
);
export const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const ChevronDownIcon = () => (
  <Icon>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

/* ───────────── avatar (colour picked from the name, optional online dot) ───────────── */

function colorIndex(name) {
  const s = String(name || "P");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 4;
}

export function Avatar({ name, online }) {
  const core = (
    <div
      className={`community-avatar av-${colorIndex(name)}`}
      aria-label={`${name || "Player"} avatar`}
    >
      {getInitials(name)}
    </div>
  );
  if (online === undefined) return core;
  return (
    <div className="community-avatar-wrap">
      {core}
      <span className={`community-presence ${online ? "on" : ""}`} />
    </div>
  );
}

/* ───────────── rich text: @mentions + https links (no innerHTML) ───────────── */

const TOKEN = /(@[a-zA-Z0-9_]{3,20}|https:\/\/[^\s<>"']+)/g;

export function RichText({ text, className }) {
  const parts = String(text || "").split(TOKEN);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^@[a-zA-Z0-9_]{3,20}$/.test(part))
          return (
            <span key={i} className="community-mention">
              {part}
            </span>
          );
        if (part.startsWith("https://")) {
          const href = safeUrl(part);
          return href ? (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
            >
              {part}
            </a>
          ) : (
            part
          );
        }
        return part;
      })}
    </p>
  );
}

/* ───────────── 3-dot menu (items can carry an icon component) ───────────── */

export function Menu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  if (!items.length) return null;

  return (
    <div className="community-menu" ref={ref}>
      <button
        type="button"
        className="community-icon-btn"
        aria-label="More options"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreIcon />
      </button>
      {open && (
        <div className="community-menu-list" role="menu">
          {items.map((item) => {
            const Ico = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={item.danger ? "is-danger" : ""}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {Ico && <Ico />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────────── inline editor ───────────── */

export function InlineEditor({ initial, max, onSave, onCancel, rows = 3 }) {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const clean = text.trim();

  async function save() {
    if (!clean || clean === initial.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(clean);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="community-editor">
      <textarea
        autoFocus
        rows={rows}
        value={text}
        maxLength={max}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
        }}
      />
      <div className="community-editor-actions">
        <span>
          {text.length}/{max}
        </span>
        <button type="button" className="ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!clean || clean === initial.trim() || saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ───────────── reaction button: tap = ❤️, hover / long-press = picker ───────────── */

export function ReactionButton({ myReaction, disabled, onReact }) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const pressTimer = useRef(null);
  const longPressed = useRef(false);

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
      clearTimeout(pressTimer.current);
    },
    []
  );

  const show = () => {
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setOpen(true), 350);
  };
  const hide = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 250);
  };

  return (
    <div className="community-react" onMouseEnter={show} onMouseLeave={hide}>
      {open && (
        <div className="community-react-picker" role="menu" aria-label="Pick a reaction">
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="menuitem"
              className={myReaction === emoji ? "is-active" : ""}
              onClick={() => {
                setOpen(false);
                onReact(emoji);
              }}
              aria-label={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        className={`community-action ${myReaction ? "is-liked" : ""}`}
        onPointerDown={(e) => {
          if (e.pointerType !== "touch") return;
          longPressed.current = false;
          pressTimer.current = setTimeout(() => {
            longPressed.current = true;
            setOpen(true);
          }, 400);
        }}
        onPointerUp={() => clearTimeout(pressTimer.current)}
        onPointerLeave={() => clearTimeout(pressTimer.current)}
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false;
            return;
          }
          setOpen(false);
          onReact(myReaction || "❤️"); // same emoji again = remove
        }}
      >
        {myReaction && myReaction !== "❤️" ? (
          <span className="community-react-emoji">{myReaction}</span>
        ) : (
          <HeartIcon />
        )}
        {myReaction ? "Reacted" : "React"}
      </button>
    </div>
  );
}
