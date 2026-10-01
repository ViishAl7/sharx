// src/legacy/ProfilePage.js — SHARX · Crayon Edition · Hand-painted avatar
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import SharxAvatar from "./SharxAvatar";

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const BODY_SHAPES = [
  { id: "circle",  label: "Circle"  },
  { id: "square",  label: "Square"  },
  { id: "star",    label: "Star"    },
  { id: "hexagon", label: "Hexagon" },
  { id: "heart",   label: "Heart"   },
];

const EYE_STYLES = [
  { id: "round",  label: "Round"  },
  { id: "oval",   label: "Oval"   },
  { id: "sleepy", label: "Sleepy" },
  { id: "wink",   label: "Wink"   },
];

const AVATAR_COLORS = [
  "#FFD966", "#FF8B7B", "#7BE5B5",
  "#8FB8FF", "#C7B4FF", "#FFB4D4",
];

const STROKE = "#1B2A41";
const ACCENT = "#2E7FE8";
const YELLOW = "#FFD966";
const CORAL = "#FF8B7B";
const MINT = "#7BE5B5";
const PAPER = "#FFFDF7";

const STATUS_META = {
  online: { color: "#22C55E", label: "Online" },
  gaming: { color: "#8B5CF6", label: "Gaming" },
  away:   { color: "#F59E0B", label: "Away"   },
};

/* ═══════════════════════════════════════════
   AVATAR — thin wrapper, same props as before.
   Rendering lives in SharxAvatar.js
═══════════════════════════════════════════ */
function AvatarSVG({ shape = "heart", eyes = "round", color = "#C7B4FF", size = 120, ...rest }) {
  return <SharxAvatar shape={shape} eyes={eyes} color={color} size={size} {...rest} />;
}

/* ═══════════════════════════════════════════
   ICONS — crayon line style
═══════════════════════════════════════════ */
const I = {
  Home: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11.5 12 3l9 8.5" />
      <path d="M5.5 10v10h4.5v-5h4v5H18.5V10" />
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Pen: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  ),
  X: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  ),
  Check: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="5 12 10 17 19 7" />
    </svg>
  ),
  Body: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  ),
  Eye: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.3" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="9" ry="6" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  ),
  Palette: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20c1 0 2-1 2-2v-1a2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-11z" />
      <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" />
    </svg>
  ),
  Calendar: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </svg>
  ),
  Google: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 12h17M12 3.5c2.5 2.7 2.5 14.3 0 17M12 3.5c-2.5 2.7-2.5 14.3 0 17" />
    </svg>
  ),
  Key: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="14" r="4" />
      <path d="M11 14h10M18 14v3M15 14v2" />
    </svg>
  ),
  Mail: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
  Trophy: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5 3.5 3.5 0 0 0 6.5 11" />
      <path d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5 3.5 3.5 0 0 1 17.5 11" />
      <path d="M12 13v4M9 20h6M10 17h4" />
    </svg>
  ),
  Gamepad: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="7" width="19" height="12" rx="4.5" />
      <path d="M7 10.5v5M4.5 13h5" />
      <circle cx="16" cy="11.5" r="1.1" />
      <circle cx="18.5" cy="14" r="1.1" />
    </svg>
  ),
  Heart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.8S3.6 15.4 2 10.8C.9 7.4 3.2 4 6.5 4c2 0 3.5 1.3 5.5 3.4 2-2.1 3.5-3.4 5.5-3.4 3.3 0 5.6 3.4 4.5 6.8-1.6 4.6-10 10-10 10Z" />
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  Compass: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.4 8.6 13 13l-4.4 2.4L11 11l4.4-2.4Z" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { profile, updateProfile, updateStatus, isProfileLoading } = useProfile();

  const [localAvatar, setLocalAvatar] = useState({
    avatarShape: "heart",
    avatarEyes: "round",
    avatarColor: "#C7B4FF",
  });

  useEffect(() => {
    if (profile) {
      setLocalAvatar({
        avatarShape: profile.avatarShape || "heart",
        avatarEyes: profile.avatarEyes || "round",
        avatarColor: profile.avatarColor || "#C7B4FF",
      });
    }
  }, [profile]);

  const [isEditing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [avatarTab, setAvatarTab] = useState("body");
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [hasUnsavedAvatar, setHasUnsavedAvatar] = useState(false);
  const [cheerAt, setCheerAt] = useState(0);

  const statusMenuRef = useRef(null);

  useEffect(() => {
    if (profile) setEditName(profile.stylishUsername || "");
  }, [profile]);

  useEffect(() => {
    if (!showStatusMenu) return;
    const handler = (e) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showStatusMenu]);

  const isLoggedIn =
    typeof window !== "undefined" && !!localStorage.getItem("token");
  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  /* ── Loading ── */
  if (isProfileLoading || !profile) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="shx-pp-loading">
          <div className="shx-crayon-loader" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p>Loading your profile…</p>
        </div>
      </>
    );
  }

  /* ── Login badge ── */
  const loginBadge = () => {
    switch (profile.loginMethod) {
      case "google":
        return (
          <span className="shx-login-badge">
            <I.Google />
            <span>Signed in with Google</span>
          </span>
        );
      case "passkey":
        return (
          <span className="shx-login-badge">
            <I.Key />
            <span>Signed in with Passkey</span>
          </span>
        );
      default:
        return (
          <span className="shx-login-badge">
            <I.Mail />
            <span>Signed in with Email</span>
          </span>
        );
    }
  };

  const formatDate = (d) => {
    if (!d) return "Just joined";
    return new Date(d).toLocaleDateString("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed) updateProfile({ stylishUsername: trimmed });
    setEditing(false);
  };

  const handleAvatarChange = (key, value) => {
    setLocalAvatar((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedAvatar(true);
  };

  const handleSaveAvatar = () => {
    updateProfile({
      avatarShape: localAvatar.avatarShape,
      avatarEyes: localAvatar.avatarEyes,
      avatarColor: localAvatar.avatarColor,
    });
    setHasUnsavedAvatar(false);
    setShowAvatarEdit(false);
    setCheerAt(Date.now());
  };

  const handleCancelAvatar = () => {
    setLocalAvatar({
      avatarShape: profile.avatarShape || "heart",
      avatarEyes: profile.avatarEyes || "round",
      avatarColor: profile.avatarColor || "#C7B4FF",
    });
    setHasUnsavedAvatar(false);
    setShowAvatarEdit(false);
  };

  const statusMeta = STATUS_META[profile.status] || STATUS_META.online;

  return (
    <>
      <style>{STYLES}</style>

      <div className="shx-pp-page">

        {/* ─── NAV ─── */}
        <nav className="shx-pp-nav">
          <button
            type="button"
            className="shx-pp-logo"
            onClick={() => router.push("/")}
            aria-label="Go home"
          >
            <img src="/sharx-logo.webp" alt="Sharx" width={36} height={36} />
          </button>

          <div className="shx-pp-nav-btns">
            <button
              type="button"
              className="shx-nav-btn shx-nav-btn-ghost"
              onClick={() => router.push("/")}
            >
              <I.Home />
              <span>Home</span>
            </button>
            <button
              type="button"
              className="shx-nav-btn shx-nav-btn-danger"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              <I.Logout />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        <div className="shx-pp-wrap">

          {/* ─── HERO CARD ─── */}
          <div className="shx-pp-hero">
            <div className="shx-pp-hero-deco" aria-hidden="true" />

            <div className="shx-pp-hero-inner">

              {/* Avatar + status — hidden while editor is open */}
              {!showAvatarEdit && (
                <div className="shx-pp-avatar-wrap" ref={statusMenuRef}>
                  <div className="shx-pp-avatar-img">
                    {profile.avatarType === "google" && profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.username} />
                    ) : (
                      <AvatarSVG
                        shape={localAvatar.avatarShape}
                        eyes={localAvatar.avatarEyes}
                        color={localAvatar.avatarColor}
                        size={120}
                        interactive
                        cheer={cheerAt}
                      />
                    )}
                  </div>

                  {/* Status dot */}
                  <button
                    type="button"
                    className="shx-pp-status-dot"
                    style={{ background: statusMeta.color }}
                    onClick={() => setShowStatusMenu((v) => !v)}
                    title="Change status"
                    aria-label={`Status: ${statusMeta.label}. Click to change.`}
                  />

                  {/* Status menu */}
                  {showStatusMenu && (
                    <div className="shx-pp-status-menu" role="menu">
                      {Object.entries(STATUS_META).map(([s, meta]) => (
                        <button
                          type="button"
                          key={s}
                          className="shx-pp-status-opt"
                          onClick={() => {
                            updateStatus(s);
                            setShowStatusMenu(false);
                          }}
                          role="menuitem"
                        >
                          <span
                            className="shx-pp-status-swatch"
                            style={{ background: meta.color }}
                            aria-hidden="true"
                          />
                          <span>{meta.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Edit avatar button */}
                  {profile.avatarType !== "google" && (
                    <button
                      type="button"
                      className="shx-pp-edit-avatar-btn"
                      onClick={() => setShowAvatarEdit((v) => !v)}
                      title="Customize avatar"
                      aria-label="Customize avatar"
                    >
                      <I.Pen />
                    </button>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="shx-pp-info">
                <div className="shx-pp-username-row">
                  {isEditing ? (
                    <>
                      <input
                        className="shx-pp-edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        aria-label="Username"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") setEditing(false);
                        }}
                      />
                      <button
                        type="button"
                        className="shx-pp-save-btn"
                        onClick={handleSaveName}
                      >
                        <I.Check />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        className="shx-pp-cancel-btn"
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="shx-pp-username">
                        {profile.stylishUsername}
                      </h1>
                      <button
                        type="button"
                        className="shx-pp-edit-btn"
                        onClick={() => setEditing(true)}
                      >
                        <I.Pen />
                        <span>Edit</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="shx-pp-email">{profile.email}</div>
                <div>{loginBadge()}</div>
                <div className="shx-pp-join">
                  <I.Calendar />
                  <span>Joined {formatDate(profile.joinDate)}</span>
                </div>

                {/* Stats */}
                <div className="shx-pp-stats">
                  <div className="shx-pp-stat shx-pp-stat-yellow">
                    <div className="shx-pp-stat-icon">
                      <I.Gamepad />
                    </div>
                    <div className="shx-pp-stat-body">
                      <div className="shx-pp-stat-num">
                        {profile.gamesPlayed || 0}
                      </div>
                      <div className="shx-pp-stat-lbl">Games</div>
                    </div>
                  </div>

                  <div className="shx-pp-stat shx-pp-stat-coral">
                    <div className="shx-pp-stat-icon">
                      <I.Heart />
                    </div>
                    <div className="shx-pp-stat-body">
                      <div className="shx-pp-stat-num">
                        {(profile.favoriteGames || []).length}
                      </div>
                      <div className="shx-pp-stat-lbl">Favorites</div>
                    </div>
                  </div>

                  <div className="shx-pp-stat shx-pp-stat-mint">
                    <div className="shx-pp-stat-icon">
                      <I.Trophy />
                    </div>
                    <div className="shx-pp-stat-body">
                      <div className="shx-pp-stat-num">—</div>
                      <div className="shx-pp-stat-lbl">Rank</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── AVATAR EDITOR ─── */}
          {showAvatarEdit && profile.avatarType !== "google" && (
            <div className="shx-pp-editor">
              <div className="shx-pp-editor-header">
                <div className="shx-pp-editor-title-row">
                  <span className="shx-pp-editor-title">Customize Avatar</span>
                  {hasUnsavedAvatar && (
                    <span
                      className="shx-pp-unsaved-dot"
                      title="Unsaved changes"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="shx-pp-editor-actions">
                  {hasUnsavedAvatar && (
                    <button
                      type="button"
                      className="shx-pp-save-avatar-btn"
                      onClick={handleSaveAvatar}
                    >
                      <I.Check />
                      <span>Save Changes</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="shx-pp-close-btn"
                    onClick={handleCancelAvatar}
                    title="Cancel"
                    aria-label="Cancel avatar changes"
                  >
                    <I.X />
                  </button>
                </div>
              </div>

              <div className="shx-pp-editor-body">
                <div
                  className="shx-pp-avatar-preview"
                  style={{ background: `${localAvatar.avatarColor}22` }}
                >
                  <AvatarSVG
                    shape={localAvatar.avatarShape}
                    eyes={localAvatar.avatarEyes}
                    color={localAvatar.avatarColor}
                    size={130}
                    interactive
                  />
                </div>

                <div className="shx-pp-editor-controls">
                  <div className="shx-pp-editor-tabs" role="tablist">
                    {[
                      ["body", "Body", <I.Body key="b" />],
                      ["eyes", "Eyes", <I.Eye key="e" />],
                      ["color", "Color", <I.Palette key="c" />],
                    ].map(([t, lbl, icon]) => (
                      <button
                        type="button"
                        key={t}
                        role="tab"
                        aria-selected={avatarTab === t}
                        className={`shx-pp-editor-tab ${avatarTab === t ? "active" : ""}`}
                        onClick={() => setAvatarTab(t)}
                      >
                        {icon}
                        <span>{lbl}</span>
                      </button>
                    ))}
                  </div>

                  {avatarTab === "body" && (
                    <div className="shx-pp-options">
                      {BODY_SHAPES.map(({ id, label }) => (
                        <button
                          type="button"
                          key={id}
                          className={`shx-pp-option-btn ${localAvatar.avatarShape === id ? "active" : ""}`}
                          onClick={() => handleAvatarChange("avatarShape", id)}
                          title={label}
                          aria-label={label}
                          aria-pressed={localAvatar.avatarShape === id}
                        >
                          <AvatarSVG
                            shape={id}
                            eyes="round"
                            color={localAvatar.avatarColor}
                            size={32}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {avatarTab === "eyes" && (
                    <div className="shx-pp-options">
                      {EYE_STYLES.map(({ id, label }) => (
                        <button
                          type="button"
                          key={id}
                          className={`shx-pp-option-btn ${localAvatar.avatarEyes === id ? "active" : ""}`}
                          onClick={() => handleAvatarChange("avatarEyes", id)}
                          title={label}
                          aria-label={label}
                          aria-pressed={localAvatar.avatarEyes === id}
                        >
                          <AvatarSVG
                            shape={localAvatar.avatarShape}
                            eyes={id}
                            color={localAvatar.avatarColor}
                            size={32}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {avatarTab === "color" && (
                    <div className="shx-pp-options">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          type="button"
                          key={c}
                          className={`shx-pp-color-btn ${localAvatar.avatarColor === c ? "active" : ""}`}
                          style={{ background: c }}
                          onClick={() => handleAvatarChange("avatarColor", c)}
                          aria-label={`Color ${c}`}
                          aria-pressed={localAvatar.avatarColor === c}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── TABS ─── */}
          <div className="shx-pp-tabs">
            {[
              ["profile", "About", <I.Compass key="a" />],
              ["games", "Games", <I.Gamepad key="g" />],
              ["settings", "Settings", <I.Settings key="s" />],
            ].map(([id, lbl, icon]) => (
              <button
                type="button"
                key={id}
                className={`shx-pp-tab ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                {icon}
                <span>{lbl}</span>
              </button>
            ))}
          </div>

          {/* ─── CONTENT ─── */}
          <div className="shx-pp-card">
            {activeTab === "profile" && (
              <>
                <div className="shx-pp-card-title">
                  <span className="shx-pp-card-dot" aria-hidden="true" />
                  About Me
                </div>
                <p className="shx-pp-about">
                  Passionate gamer enjoying the best free online games.
                  <br />
                  Always ready for the next adventure!
                </p>
              </>
            )}

            {activeTab === "games" && (
              <>
                <div className="shx-pp-card-title">
                  <span className="shx-pp-card-dot" aria-hidden="true" />
                  Recently Played
                </div>
                {(profile.favoriteGames || []).length > 0 ? (
                  <div className="shx-pp-games-grid">
                    {profile.favoriteGames.map((g, i) => (
                      <div className="shx-pp-game-chip" key={i}>
                        {g}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="shx-pp-empty">
                    <div className="shx-pp-empty-icon" aria-hidden="true">
                      <I.Gamepad />
                    </div>
                    <p>No games played yet</p>
                    <button
                      type="button"
                      className="shx-pp-browse-btn"
                      onClick={() => router.push("/")}
                    >
                      Browse Games →
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === "settings" && (
              <>
                <div className="shx-pp-card-title">
                  <span className="shx-pp-card-dot" aria-hidden="true" />
                  Account Settings
                </div>
                <div className="shx-pp-setting-row">
                  <div className="shx-pp-setting-label">Email Address</div>
                  <div className="shx-pp-setting-val">{profile.email || "—"}</div>
                </div>
                <div className="shx-pp-setting-row">
                  <div className="shx-pp-setting-label">Login Method</div>
                  <div className="shx-pp-setting-val">{loginBadge()}</div>
                </div>
                <div className="shx-pp-setting-row">
                  <div className="shx-pp-setting-label">Member Since</div>
                  <div className="shx-pp-setting-val">
                    {formatDate(profile.joinDate)}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   STYLES — SHARX Crayon
═══════════════════════════════════════════ */
const STYLES = `
.shx-pp-page,
.shx-pp-loading {
  --ink: ${STROKE};
  --ink-soft: #5A6B82;
  --cream: #FEFCF7;
  --paper: ${PAPER};
  --yellow: ${YELLOW};
  --yellow-soft: #FFF6D9;
  --coral: ${CORAL};
  --coral-soft: #FFE9E4;
  --mint: ${MINT};
  --mint-soft: #E2F8EF;
  --lilac: #C7B4FF;
  --blue: ${ACCENT};

  --border: 2.5px solid var(--ink);
  --shadow-sm: 2px 2px 0 var(--ink);
  --shadow-md: 3px 3px 0 var(--ink);
  --shadow-lg: 4px 4px 0 var(--ink);

  font-family: var(--font-comfortaa), 'Comfortaa', system-ui, sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}

*, .shx-pp-page *,
.shx-pp-page *::before,
.shx-pp-page *::after {
  box-sizing: border-box;
}
.shx-pp-page button { font-family: inherit; }

/* ── Loading ── */
.shx-pp-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background:
    radial-gradient(ellipse 70% 50% at 15% 10%, rgba(255,246,217,0.6), transparent 65%),
    radial-gradient(ellipse 60% 45% at 88% 15%, rgba(226,248,239,0.55), transparent 65%),
    radial-gradient(ellipse 65% 50% at 85% 90%, rgba(240,233,255,0.55), transparent 65%),
    linear-gradient(180deg, #FFFEFB 0%, #FDFAF3 100%);
  position: relative;
}
.shx-pp-loading::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at center, rgba(27,42,65,0.055) 1.2px, transparent 1.7px);
  background-size: 32px 32px;
  opacity: 0.5;
  pointer-events: none;
}
.shx-pp-loading p {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-soft);
  position: relative;
  z-index: 1;
}
.shx-crayon-loader {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 22px;
  position: relative;
  z-index: 1;
}
.shx-crayon-loader span {
  width: 10px;
  height: 10px;
  border: 2px solid var(--ink);
  border-radius: 48% 42% 55% 45%;
  background: var(--yellow);
  box-shadow: 1.5px 1.5px 0 var(--ink);
  animation: shxCrayonBounce 0.9s infinite cubic-bezier(.34,1.4,.4,1);
}
.shx-crayon-loader span:nth-child(2) { background: var(--coral); animation-delay: .12s; }
.shx-crayon-loader span:nth-child(3) { background: var(--mint);  animation-delay: .24s; }

@keyframes shxCrayonBounce {
  0%,70%,100% { transform: translateY(0) rotate(0) scale(1); }
  35%         { transform: translateY(-8px) rotate(-8deg) scale(1.1); }
}

/* ── Page shell ── */
.shx-pp-page {
  min-height: 100vh;
  padding-bottom: 72px;
  background:
    radial-gradient(ellipse 70% 50% at 15% 10%, rgba(255,246,217,0.55), transparent 65%),
    radial-gradient(ellipse 60% 45% at 88% 15%, rgba(226,248,239,0.5), transparent 65%),
    radial-gradient(ellipse 65% 50% at 85% 90%, rgba(240,233,255,0.5), transparent 65%),
    linear-gradient(180deg, #FFFEFB 0%, #FDFAF3 100%);
  position: relative;
}
.shx-pp-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle at center, rgba(27,42,65,0.055) 1.2px, transparent 1.7px);
  background-size: 32px 32px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}

/* ── Nav ── */
.shx-pp-nav {
  position: sticky;
  top: 16px;
  z-index: 100;
  max-width: 980px;
  margin: 24px auto 0;
  padding: 10px 16px 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--paper);
  border: var(--border);
  border-radius: 100px;
  box-shadow: var(--shadow-md);
}
.shx-pp-logo {
  width: 40px;
  height: 40px;
  padding: 4px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  cursor: pointer;
  border-radius: 50%;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1);
}
.shx-pp-logo:hover { transform: rotate(-6deg) scale(1.06); }
.shx-pp-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.shx-pp-nav-btns {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}
.shx-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 18px;
  min-height: 40px;
  border: 2px solid var(--ink);
  border-radius: 100px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s ease, background 0.2s ease;
}
.shx-nav-btn:focus-visible {
  outline: 3px solid var(--blue);
  outline-offset: 3px;
}
.shx-nav-btn-ghost {
  background: var(--paper);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.shx-nav-btn-ghost:hover {
  background: var(--yellow);
  transform: translate3d(-2px,-2px,0);
  box-shadow: var(--shadow-md);
}
.shx-nav-btn-ghost:active {
  transform: translate3d(0,0,0);
  box-shadow: var(--shadow-sm);
}
.shx-nav-btn-danger {
  background: var(--coral);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.shx-nav-btn-danger:hover {
  background: #FF6B5B;
  transform: translate3d(-2px,-2px,0);
  box-shadow: var(--shadow-md);
}
.shx-nav-btn-danger:active {
  transform: translate3d(0,0,0);
  box-shadow: var(--shadow-sm);
}

/* ── Wrap ── */
.shx-pp-wrap {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 24px 0;
}

/* ── Hero card ── */
.shx-pp-hero {
  position: relative;
  background: var(--paper);
  border: var(--border);
  border-radius: 30px;
  box-shadow: var(--shadow-lg);
  padding: 30px;
  margin-bottom: 22px;
  overflow: hidden;
  animation: shxRiseUp 0.5s cubic-bezier(.34,1.4,.4,1) both;
}
.shx-pp-hero-deco {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(circle at 92% 8%, rgba(255,217,102,0.28), transparent 38%),
    radial-gradient(circle at 4% 92%, rgba(123,229,181,0.22), transparent 40%);
}
.shx-pp-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 30px;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* ── Avatar ── */
.shx-pp-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
/* Circle "frame" — now with premium inner light + depth.
   overflow: visible so the avatar's crayon flecks can escape. */
.shx-pp-avatar-img {
  position: relative;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 30% 25%, rgba(255,255,255,0.75), transparent 55%),
    var(--yellow-soft);
  border: 2.5px solid var(--ink);
  box-shadow:
    var(--shadow-md),
    inset 0 -8px 0 rgba(27, 42, 65, 0.06),
    inset 0 4px 0 rgba(255, 255, 255, 0.5);
}
/* Google photo still crops to the circle */
.shx-pp-avatar-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.shx-pp-status-dot {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2.5px solid var(--paper);
  padding: 0;
  cursor: pointer;
  box-shadow: 0 0 0 2px var(--ink);
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1);
}
.shx-pp-status-dot:hover { transform: scale(1.2); }
.shx-pp-status-dot:focus-visible {
  outline: 3px solid var(--blue);
  outline-offset: 3px;
}

.shx-pp-status-menu {
  position: absolute;
  top: calc(100% - 40px);
  left: 0;
  z-index: 50;
  min-width: 160px;
  padding: 6px;
  background: var(--paper);
  border: var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow-md);
  animation: shxMenuDrop 0.22s cubic-bezier(.16,1,.3,1);
}
@keyframes shxMenuDrop {
  from { opacity: 0; transform: translateY(-10px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.shx-pp-status-opt {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border: 0;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  text-align: left;
  transition: background 0.15s ease;
}
.shx-pp-status-opt:hover { background: var(--yellow-soft); }
.shx-pp-status-swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--ink);
  flex-shrink: 0;
}

.shx-pp-edit-avatar-btn {
  position: absolute;
  bottom: 4px;
  left: 4px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--ink);
  color: #fff;
  border: 2.5px solid var(--paper);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), background 0.2s ease;
}
.shx-pp-edit-avatar-btn:hover {
  background: var(--coral);
  color: var(--ink);
  transform: scale(1.1) rotate(-6deg);
}
.shx-pp-edit-avatar-btn:focus-visible {
  outline: 3px solid var(--blue);
  outline-offset: 3px;
}

/* ── Info ── */
.shx-pp-info {
  flex: 1;
  min-width: 220px;
}
.shx-pp-username-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.shx-pp-username {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.6px;
  color: var(--ink);
  text-shadow: 2px 2px 0 var(--yellow);
}
.shx-pp-edit-btn,
.shx-pp-cancel-btn,
.shx-pp-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  min-height: 36px;
  border: 2px solid var(--ink);
  border-radius: 100px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s ease, background 0.2s ease;
}
.shx-pp-edit-btn,
.shx-pp-cancel-btn {
  background: var(--paper);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.shx-pp-edit-btn:hover,
.shx-pp-cancel-btn:hover {
  background: var(--yellow);
  transform: translate3d(-2px,-2px,0);
  box-shadow: var(--shadow-md);
}
.shx-pp-save-btn {
  background: var(--ink);
  color: #fff;
  box-shadow: 2px 2px 0 var(--yellow);
}
.shx-pp-save-btn:hover {
  transform: translate3d(-2px,-2px,0);
  box-shadow: 3px 3px 0 var(--yellow);
}
.shx-pp-edit-input {
  font-family: inherit;
  font-size: 22px;
  font-weight: 800;
  padding: 8px 14px;
  border: 2.5px solid var(--ink);
  border-radius: 14px;
  outline: none;
  color: var(--ink);
  background: var(--paper);
  box-shadow: var(--shadow-sm);
  width: 100%;
  max-width: 340px;
}
.shx-pp-edit-input:focus {
  box-shadow: var(--shadow-md), 0 0 0 3px rgba(46,127,232,0.35);
}

.shx-pp-email {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-soft);
  margin-bottom: 10px;
  overflow-wrap: anywhere;
}

.shx-login-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  background: var(--mint-soft);
  border: 2px solid var(--ink);
  border-radius: 100px;
  font-size: 11.5px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 12px;
  box-shadow: 1.5px 1.5px 0 var(--ink);
}

.shx-pp-join {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-soft);
  margin-bottom: 18px;
}

/* ── Stats ── */
.shx-pp-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.shx-pp-stat {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 15px;
  background:
    radial-gradient(circle at 90% 10%, rgba(255,255,255,0.75), transparent 42%),
    var(--paper);
  border: 2px solid var(--ink);
  border-radius: 16px;
  box-shadow:
    var(--shadow-sm),
    inset 0 -4px 0 rgba(27, 42, 65, 0.05);
  min-width: 118px;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s ease;
}
.shx-pp-stat:hover {
  transform: translate3d(0,-3px,0) rotate(-1deg);
  box-shadow:
    var(--shadow-md),
    inset 0 -4px 0 rgba(27, 42, 65, 0.05);
}
.shx-pp-stat-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 2px solid var(--ink);
  border-radius: 11px;
  color: var(--ink);
  flex-shrink: 0;
  box-shadow: 1.5px 1.5px 0 var(--ink);
}
.shx-pp-stat-yellow .shx-pp-stat-icon { background: var(--yellow); }
.shx-pp-stat-coral  .shx-pp-stat-icon { background: var(--coral); }
.shx-pp-stat-mint   .shx-pp-stat-icon { background: var(--mint); }

.shx-pp-stat-body { min-width: 0; }
.shx-pp-stat-num {
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  color: var(--ink);
  letter-spacing: -0.3px;
}
.shx-pp-stat-lbl {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-top: 3px;
}

/* ── Avatar editor ── */
.shx-pp-editor {
  background: var(--paper);
  border: var(--border);
  border-radius: 26px;
  box-shadow: var(--shadow-lg);
  padding: 26px;
  margin-bottom: 22px;
  animation: shxSlideUp 0.35s cubic-bezier(.34,1.4,.4,1);
}
@keyframes shxSlideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.shx-pp-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.shx-pp-editor-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.shx-pp-editor-title {
  font-size: 17px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.3px;
}
.shx-pp-unsaved-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--coral);
  border: 2px solid var(--ink);
  animation: shxPulseDot 1.5s ease-in-out infinite;
}
@keyframes shxPulseDot {
  0%,100% { transform: scale(1); opacity: 1; }
  50%     { transform: scale(1.25); opacity: 0.6; }
}
.shx-pp-editor-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.shx-pp-save-avatar-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  min-height: 40px;
  background: var(--ink);
  color: #fff;
  border: 2.5px solid var(--ink);
  border-radius: 100px;
  box-shadow: 2px 2px 0 var(--yellow);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s ease;
}
.shx-pp-save-avatar-btn:hover {
  transform: translate3d(-2px,-2px,0);
  box-shadow: 3px 3px 0 var(--yellow);
}
.shx-pp-close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--paper);
  color: var(--ink);
  border: 2.5px solid var(--ink);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), background 0.2s ease, box-shadow 0.2s ease;
}
.shx-pp-close-btn:hover {
  background: var(--coral);
  transform: rotate(90deg) translate3d(-2px,-2px,0);
  box-shadow: var(--shadow-md);
}

.shx-pp-editor-body {
  display: flex;
  gap: 26px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.shx-pp-avatar-preview {
  width: 160px;
  height: 160px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2.5px solid var(--ink);
  box-shadow: var(--shadow-md);
  transition: background 0.35s ease;
  overflow: visible;
}

.shx-pp-editor-controls { flex: 1; min-width: 220px; }

.shx-pp-editor-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 18px;
}
.shx-pp-editor-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 8px;
  min-height: 44px;
  background: var(--paper);
  color: var(--ink-soft);
  border: 2px solid var(--ink);
  border-radius: 13px;
  box-shadow: var(--shadow-sm);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.shx-pp-editor-tab:hover { transform: translate3d(0,-2px,0); }
.shx-pp-editor-tab.active {
  background: var(--yellow);
  color: var(--ink);
  box-shadow: var(--shadow-md);
  transform: translate3d(-1px,-1px,0);
}

.shx-pp-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.shx-pp-option-btn {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  background: var(--paper);
  border: 2px solid var(--ink);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s ease, background 0.2s ease;
}
.shx-pp-option-btn:hover {
  background: var(--yellow-soft);
  transform: translate3d(-2px,-2px,0);
  box-shadow: var(--shadow-md);
}
.shx-pp-option-btn.active {
  background: var(--yellow);
  box-shadow: var(--shadow-md);
  transform: translate3d(-2px,-2px,0);
}

.shx-pp-color-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2.5px solid var(--ink);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s ease;
}
.shx-pp-color-btn:hover {
  transform: translate3d(-2px,-2px,0) scale(1.06);
  box-shadow: var(--shadow-md);
}
.shx-pp-color-btn.active {
  box-shadow: 0 0 0 3px var(--blue), var(--shadow-md);
  transform: translate3d(-2px,-2px,0) scale(1.1);
}

/* ── Tabs ── */
.shx-pp-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.shx-pp-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  min-height: 44px;
  background: var(--paper);
  color: var(--ink-soft);
  border: 2px solid var(--ink);
  border-radius: 100px;
  box-shadow: var(--shadow-sm);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.shx-pp-tab:hover {
  transform: translate3d(-2px,-2px,0);
  box-shadow: var(--shadow-md);
  background: var(--yellow-soft);
}
.shx-pp-tab.active {
  background: var(--yellow);
  color: var(--ink);
  box-shadow: var(--shadow-md);
  transform: translate3d(-2px,-2px,0);
}

/* ── Content card ── */
.shx-pp-card {
  background: var(--paper);
  border: var(--border);
  border-radius: 26px;
  box-shadow: var(--shadow-lg);
  padding: 26px;
  animation: shxRiseUp 0.4s cubic-bezier(.34,1.4,.4,1) both;
}
@keyframes shxRiseUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.shx-pp-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 2px dashed rgba(27,42,65,0.15);
  font-size: 17px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.3px;
}
/* Hand-painted dot with a subtle crayon texture */
.shx-pp-card-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 30%, #FFB8AB 0%, var(--coral) 60%, #D9503A 100%);
  border: 2px solid var(--ink);
  flex-shrink: 0;
}

.shx-pp-about {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.8;
  font-weight: 600;
  color: var(--ink-soft);
}

/* ── Games grid (favorites) ── */
.shx-pp-games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}
.shx-pp-game-chip {
  padding: 12px 10px;
  text-align: center;
  background: var(--yellow-soft);
  border: 2px solid var(--ink);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  font-size: 12.5px;
  font-weight: 800;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Empty ── */
.shx-pp-empty {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}
.shx-pp-empty-icon {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  background: var(--yellow-soft);
  border: 2.5px solid var(--ink);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  color: var(--ink);
  transform: rotate(-6deg);
}
.shx-pp-empty p {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
}
.shx-pp-browse-btn {
  padding: 11px 22px;
  background: var(--ink);
  color: #fff;
  border: 2.5px solid var(--ink);
  border-radius: 100px;
  box-shadow: 2px 2px 0 var(--yellow);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s ease;
}
.shx-pp-browse-btn:hover {
  transform: translate3d(-2px,-2px,0);
  box-shadow: 3px 3px 0 var(--yellow);
}

/* ── Settings rows ── */
.shx-pp-setting-row {
  padding: 14px 0;
  border-bottom: 1.5px dashed rgba(27,42,65,0.12);
}
.shx-pp-setting-row:last-child { border-bottom: none; padding-bottom: 0; }
.shx-pp-setting-label {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 5px;
}
.shx-pp-setting-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  overflow-wrap: anywhere;
}

/* ── Focus ── */
.shx-pp-page button:focus-visible,
.shx-pp-page input:focus-visible {
  outline: 3px solid var(--blue);
  outline-offset: 3px;
}

/* ── Responsive ── */
@media (max-width: 720px) {
  .shx-pp-nav {
    border-radius: 22px;
    top: 10px;
    margin-top: 14px;
    padding: 8px 12px;
  }
  .shx-pp-wrap { padding: 18px 16px 0; }
  .shx-pp-hero { padding: 22px; border-radius: 24px; }
  .shx-pp-hero-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 22px;
  }
  .shx-pp-info { width: 100%; }
  .shx-pp-username-row { justify-content: center; }
  .shx-pp-username { font-size: 24px; }
  .shx-pp-stats { justify-content: center; }
  .shx-pp-status-menu { left: 50%; transform: translateX(-50%); }
  .shx-pp-editor { padding: 20px; border-radius: 22px; }
  .shx-pp-avatar-preview { width: 130px; height: 130px; }
  .shx-pp-editor-body { justify-content: center; }
  .shx-pp-editor-controls { width: 100%; }
  .shx-pp-card { padding: 20px; border-radius: 22px; }
  .shx-nav-btn span { display: none; }
  .shx-nav-btn { padding: 9px 12px; }
}
@media (max-width: 420px) {
  .shx-pp-wrap { padding: 14px 12px 0; }
  .shx-pp-hero { padding: 18px; }
  .shx-pp-avatar-img { width: 108px; height: 108px; }
  .shx-pp-username { font-size: 22px; }
  .shx-pp-card { padding: 16px; }
  .shx-pp-editor { padding: 16px; }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .shx-pp-hero,
  .shx-pp-editor,
  .shx-pp-card,
  .shx-pp-status-menu,
  .shx-pp-unsaved-dot,
  .shx-crayon-loader span,
  .shx-pp-logo,
  .shx-pp-stat,
  .shx-pp-tab,
  .shx-pp-editor-tab,
  .shx-pp-option-btn,
  .shx-pp-color-btn,
  .shx-nav-btn,
  .shx-pp-close-btn,
  .shx-pp-edit-avatar-btn,
  .shx-pp-status-dot {
    animation: none !important;
    transition: none !important;
  }
}
`;