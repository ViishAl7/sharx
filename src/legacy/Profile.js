// Profile.js — SHARX · Crayon Edition · Clean · Playful
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";

/* ═══════════════════════════════════════════
   ICONS — crayon line style
═══════════════════════════════════════════ */
const I = {
  Home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 11.5 12 3l9 8.5" />
      <path d="M5.5 10v10h4.5v-5h4v5H18.5V10" />
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Trophy: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5 3.5 3.5 0 0 0 6.5 11" />
      <path d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5 3.5 3.5 0 0 1 17.5 11" />
      <path d="M12 13v4M9 20h6M10 17h4" />
    </svg>
  ),
  Bolt: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13.2 2.1 4.4 14.1h5.6l-1.2 8 9.2-12.1h-5.6l0.8-7.9Z" />
    </svg>
  ),
  Flame: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2.5c.8 3.2 2.5 4.8 4.1 6.3 1.7 1.6 2.9 3.6 2.9 6.2 0 4-3.3 7-7 7s-7-3-7-7c0-2.2.8-4.2 2-5.8" />
      <path d="M12 22c-2 0-3.5-1.5-3.5-3.5 0-1.8 1.5-3 3.5-5 2 2 3.5 3.2 3.5 5 0 2-1.5 3.5-3.5 3.5Z" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.5c.7-4 3.6-6.2 7.5-6.2s6.8 2.2 7.5 6.2" />
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
  Google: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 12h17M12 3.5c2.5 2.7 2.5 14.3 0 17M12 3.5c-2.5 2.7-2.5 14.3 0 17" />
    </svg>
  ),
  Hash: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="5 12 10 17 19 7" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  ),
  Equal: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M5 9h14M5 15h14" />
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   MAIN PROFILE
═══════════════════════════════════════════ */
export default function Profile() {
  const { user, logout, authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((data) => setProfile(data))
      .catch(() => setError("Could not load profile."))
      .finally(() => setLoading(false));
  }, [user, navigate, authLoading]);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const badgeClass = (result) => {
    const r = (result || "").toLowerCase();
    if (r === "win") return "shx-badge shx-badge-win";
    if (r === "loss") return "shx-badge shx-badge-loss";
    return "shx-badge shx-badge-draw";
  };

  const badgeIcon = (result) => {
    const r = (result || "").toLowerCase();
    if (r === "win") return <I.Check />;
    if (r === "loss") return <I.X />;
    return <I.Equal />;
  };

  const wins =
    profile?.matches?.filter((m) => m.result?.toLowerCase() === "win").length ?? 0;
  const losses =
    profile?.matches?.filter((m) => m.result?.toLowerCase() === "loss").length ?? 0;
  const draws =
    profile?.matches?.filter((m) => m.result?.toLowerCase() === "draw").length ?? 0;

  /* ─── Loading ─── */
  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="shx-profile-loading">
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

  /* ─── Error ─── */
  if (error) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="shx-profile-loading">
          <div className="shx-error-badge" aria-hidden="true">!</div>
          <p className="shx-error-text">{error}</p>
          <button
            className="shx-btn shx-btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  /* ─── Ready ─── */
  return (
    <>
      <style>{STYLES}</style>

      <div className="shx-profile">
        <div className="shx-profile-inner">

          {/* ─── Banner ─── */}
          <div className="shx-banner">
            <div className="shx-banner-dots" aria-hidden="true" />
            <div className="shx-banner-blob shx-banner-blob-1" aria-hidden="true" />
            <div className="shx-banner-blob shx-banner-blob-2" aria-hidden="true" />
          </div>

          {/* ─── Header ─── */}
          <div className="shx-header">
            <div className="shx-avatar">
              <span className="shx-avatar-text">{initials}</span>
            </div>

            <div className="shx-header-row">
              <div className="shx-header-info">
                <h1 className="shx-name">{profile.name}</h1>
                <p className="shx-email">{profile.email}</p>
              </div>

              <div className="shx-header-actions">
                <button
                  type="button"
                  className="shx-btn shx-btn-ghost"
                  onClick={() => navigate("/")}
                >
                  <I.Home />
                  <span>Home</span>
                </button>
                <button
                  type="button"
                  className="shx-btn shx-btn-danger"
                  onClick={logout}
                >
                  <I.Logout />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── Stats ─── */}
          <div className="shx-stats">
            <div className="shx-stat shx-stat-yellow">
              <div className="shx-stat-icon">
                <I.Bolt />
              </div>
              <div className="shx-stat-body">
                <div className="shx-stat-label">Total Score</div>
                <div className="shx-stat-val">{profile.score ?? 0}</div>
              </div>
            </div>

            <div className="shx-stat shx-stat-mint">
              <div className="shx-stat-icon">
                <I.Trophy />
              </div>
              <div className="shx-stat-body">
                <div className="shx-stat-label">Matches Played</div>
                <div className="shx-stat-val">{profile.matches?.length ?? 0}</div>
              </div>
            </div>

            <div className="shx-stat shx-stat-coral">
              <div className="shx-stat-icon">
                <I.Flame />
              </div>
              <div className="shx-stat-body">
                <div className="shx-stat-label">Wins</div>
                <div className="shx-stat-val">{wins}</div>
              </div>
            </div>
          </div>

          {/* ─── Cards ─── */}
          <div className="shx-grid">

            {/* Account Info */}
            <div className="shx-card">
              <div className="shx-card-title">
                <span className="shx-card-dot" aria-hidden="true" />
                Account Info
              </div>

              <div className="shx-info-row">
                <span className="shx-info-key">
                  <span className="shx-info-icon"><I.User /></span>
                  Name
                </span>
                <span className="shx-info-val">{profile.name}</span>
              </div>

              <div className="shx-info-row">
                <span className="shx-info-key">
                  <span className="shx-info-icon"><I.Mail /></span>
                  Email
                </span>
                <span className="shx-info-val shx-info-ellipsis">{profile.email}</span>
              </div>

              <div className="shx-info-row">
                <span className="shx-info-key">
                  <span className="shx-info-icon"><I.Google /></span>
                  Login Type
                </span>
                <span className="shx-info-val">{profile.googleId ? "Google" : "Email"}</span>
              </div>

              <div className="shx-info-row shx-info-row-last">
                <span className="shx-info-key">
                  <span className="shx-info-icon"><I.Hash /></span>
                  User ID
                </span>
                <span className="shx-info-val">#{profile.id}</span>
              </div>
            </div>

            {/* Performance */}
            <div className="shx-card">
              <div className="shx-card-title">
                <span className="shx-card-dot" aria-hidden="true" />
                Performance
              </div>

              <div className="shx-info-row">
                <span className="shx-info-key">Total Score</span>
                <span className="shx-info-val shx-info-yellow">{profile.score ?? 0}</span>
              </div>

              <div className="shx-info-row">
                <span className="shx-info-key">Wins</span>
                <span className="shx-info-val shx-info-mint">{wins}</span>
              </div>

              <div className="shx-info-row">
                <span className="shx-info-key">Losses</span>
                <span className="shx-info-val shx-info-coral">{losses}</span>
              </div>

              <div className="shx-info-row shx-info-row-last">
                <span className="shx-info-key">Draws</span>
                <span className="shx-info-val shx-info-slate">{draws}</span>
              </div>
            </div>

            {/* Match History */}
            <div className="shx-card shx-card-full">
              <div className="shx-card-title">
                <span className="shx-card-dot" aria-hidden="true" />
                Match History
              </div>

              {!profile.matches || profile.matches.length === 0 ? (
                <div className="shx-empty">
                  <div className="shx-empty-icon" aria-hidden="true">
                    <I.Calendar />
                  </div>
                  <p>No matches played yet.</p>
                </div>
              ) : (
                <div className="shx-match-list">
                  {profile.matches.map((match, i) => (
                    <div
                      className="shx-match-row"
                      key={match.id ?? i}
                      style={{ animationDelay: `${i * 35}ms` }}
                    >
                      <span className="shx-match-idx">#{i + 1}</span>
                      <span className={badgeClass(match.result)}>
                        <span className="shx-badge-icon" aria-hidden="true">
                          {badgeIcon(match.result)}
                        </span>
                        <span>{match.result}</span>
                      </span>
                      <span className="shx-match-score">{match.score} pts</span>
                      <span className="shx-match-date">{formatDate(match.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
.shx-profile,
.shx-profile-loading {
  --ink: #1B2A41;
  --ink-soft: #5A6B82;
  --ink-mute: #7A8798;
  --cream: #FEFCF7;
  --paper: #FFFFFF;
  --yellow: #FFD966;
  --yellow-soft: #FFF6D9;
  --coral: #FF8B7B;
  --coral-soft: #FFE9E4;
  --mint: #7BE5B5;
  --mint-soft: #E2F8EF;
  --lilac: #C7B4FF;
  --blue: #2E7FE8;

  --border: 2.5px solid var(--ink);
  --shadow-sm: 2px 2px 0 var(--ink);
  --shadow-md: 3px 3px 0 var(--ink);
  --shadow-lg: 4px 4px 0 var(--ink);

  font-family: var(--font-comfortaa), 'Comfortaa', system-ui, sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Loading / Error screen ── */
.shx-profile-loading {
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
.shx-profile-loading::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at center, rgba(27,42,65,0.055) 1.2px, transparent 1.7px);
  background-size: 32px 32px;
  opacity: 0.5;
  pointer-events: none;
}
.shx-profile-loading p {
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
  animation: shxCrayonBounce 0.9s infinite cubic-bezier(.34, 1.4, .4, 1);
}
.shx-crayon-loader span:nth-child(2) { background: var(--coral); animation-delay: .12s; }
.shx-crayon-loader span:nth-child(3) { background: var(--mint);  animation-delay: .24s; }

@keyframes shxCrayonBounce {
  0%, 70%, 100% { transform: translateY(0) rotate(0) scale(1); }
  35%           { transform: translateY(-8px) rotate(-8deg) scale(1.1); }
}

.shx-error-badge {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  background: var(--coral);
  color: var(--ink);
  border: var(--border);
  border-radius: 50%;
  box-shadow: var(--shadow-md);
  font-size: 30px;
  font-weight: 900;
  transform: rotate(-6deg);
  position: relative;
  z-index: 1;
}
.shx-error-text {
  color: var(--ink) !important;
  font-weight: 800 !important;
}

/* ── Layout ── */
.shx-profile {
  min-height: 100vh;
  padding-bottom: 72px;
  background:
    radial-gradient(ellipse 70% 50% at 15% 10%, rgba(255,246,217,0.55), transparent 65%),
    radial-gradient(ellipse 60% 45% at 88% 15%, rgba(226,248,239,0.5), transparent 65%),
    radial-gradient(ellipse 65% 50% at 85% 90%, rgba(240,233,255,0.5), transparent 65%),
    linear-gradient(180deg, #FFFEFB 0%, #FDFAF3 100%);
}
.shx-profile::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle at center, rgba(27,42,65,0.055) 1.2px, transparent 1.7px);
  background-size: 32px 32px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}
.shx-profile-inner {
  position: relative;
  z-index: 1;
  max-width: 980px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Banner ── */
.shx-banner {
  position: relative;
  height: 200px;
  margin: 24px 0 0;
  border: var(--border);
  border-radius: 28px;
  box-shadow: var(--shadow-lg);
  background:
    radial-gradient(circle at 82% 18%, rgba(255,217,102,0.45), transparent 38%),
    radial-gradient(circle at 18% 90%, rgba(123,229,181,0.35), transparent 42%),
    linear-gradient(135deg, #FFF9E4 0%, #FFFDF7 50%, #F2FBED 100%);
  overflow: hidden;
  animation: shxFadeUp 0.5s cubic-bezier(.34, 1.4, .4, 1) both;
}
.shx-banner-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at center, rgba(27,42,65,0.06) 1.3px, transparent 1.8px);
  background-size: 26px 26px;
  opacity: 0.7;
}
.shx-banner-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(48px);
  pointer-events: none;
}
.shx-banner-blob-1 {
  width: 200px; height: 200px;
  top: -60px; right: -40px;
  background: var(--yellow);
  opacity: 0.5;
}
.shx-banner-blob-2 {
  width: 170px; height: 170px;
  bottom: -70px; left: -30px;
  background: var(--mint);
  opacity: 0.4;
}

/* ── Header ── */
.shx-header {
  position: relative;
  animation: shxFadeUp 0.5s ease 0.06s both;
}
.shx-avatar {
  position: relative;
  z-index: 2;
  width: 110px;
  height: 110px;
  margin-top: -55px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--yellow) 0%, var(--coral) 100%);
  border: 3px solid var(--ink);
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  transform: rotate(-3deg);
  transition: transform 0.3s cubic-bezier(.34, 1.4, .4, 1);
}
.shx-avatar:hover {
  transform: rotate(3deg) translateY(-3px);
}
.shx-avatar-text {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: 1px;
  color: var(--ink);
  text-shadow: 2px 2px 0 rgba(255,255,255,0.6);
}
.shx-header-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0 28px;
  flex-wrap: wrap;
}
.shx-header-info { min-width: 0; }
.shx-name {
  margin: 0 0 5px;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.6px;
  color: var(--ink);
  line-height: 1.1;
  text-shadow: 2px 2px 0 var(--yellow);
}
.shx-email {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
  overflow-wrap: anywhere;
}

/* ── Buttons ── */
.shx-header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.shx-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  border: var(--border);
  border-radius: 100px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s cubic-bezier(.34, 1.4, .4, 1),
    box-shadow 0.2s ease,
    background 0.2s ease;
  white-space: nowrap;
}
.shx-btn:focus-visible {
  outline: 3px solid var(--blue);
  outline-offset: 3px;
}
.shx-btn-ghost {
  background: var(--paper);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.shx-btn-ghost:hover {
  background: var(--yellow);
  transform: translate3d(-2px, -2px, 0);
  box-shadow: var(--shadow-md);
}
.shx-btn-ghost:active {
  transform: translate3d(0, 0, 0);
  box-shadow: var(--shadow-sm);
}
.shx-btn-danger {
  background: var(--coral);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.shx-btn-danger:hover {
  background: #FF6B5B;
  transform: translate3d(-2px, -2px, 0);
  box-shadow: var(--shadow-md);
}
.shx-btn-danger:active {
  transform: translate3d(0, 0, 0);
  box-shadow: var(--shadow-sm);
}
.shx-btn-primary {
  background: var(--yellow);
  color: var(--ink);
  box-shadow: var(--shadow-sm);
}
.shx-btn-primary:hover {
  background: var(--coral);
  transform: translate3d(-2px, -2px, 0);
  box-shadow: var(--shadow-md);
}

/* ── Stats ── */
.shx-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 22px;
  animation: shxFadeUp 0.5s ease 0.1s both;
}
.shx-stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--paper);
  border: var(--border);
  border-radius: 22px;
  box-shadow: var(--shadow-md);
  transition: transform 0.25s cubic-bezier(.34, 1.4, .4, 1), box-shadow 0.25s ease;
  overflow: hidden;
}
.shx-stat:hover {
  transform: translate3d(0, -4px, 0) rotate(-1deg);
  box-shadow: var(--shadow-lg);
}
.shx-stat-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 2.5px solid var(--ink);
  border-radius: 14px;
  box-shadow: var(--shadow-sm);
  color: var(--ink);
}
.shx-stat-yellow .shx-stat-icon { background: var(--yellow); }
.shx-stat-mint   .shx-stat-icon { background: var(--mint); }
.shx-stat-coral  .shx-stat-icon { background: var(--coral); }

.shx-stat-body { min-width: 0; }
.shx-stat-label {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin-bottom: 6px;
}
.shx-stat-val {
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
  color: var(--ink);
  letter-spacing: -0.5px;
}

/* ── Cards ── */
.shx-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  animation: shxFadeUp 0.5s ease 0.14s both;
}
.shx-card {
  position: relative;
  background: var(--paper);
  border: var(--border);
  border-radius: 22px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}
.shx-card-full { grid-column: 1 / -1; }

.shx-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 22px 14px;
  border-bottom: 2px dashed rgba(27, 42, 65, 0.15);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--ink);
}
.shx-card-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--coral);
  border: 2px solid var(--ink);
  flex-shrink: 0;
}

/* Info rows */
.shx-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  border-bottom: 1.5px dashed rgba(27, 42, 65, 0.1);
  transition: background 0.15s ease;
}
.shx-info-row:hover { background: rgba(255, 217, 102, 0.1); }
.shx-info-row-last { border-bottom: none; }

.shx-info-key {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
  flex-shrink: 0;
}
.shx-info-icon {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  color: var(--ink);
  flex-shrink: 0;
}
.shx-info-val {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  text-align: right;
  overflow-wrap: anywhere;
}
.shx-info-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}
.shx-info-yellow { color: #8B6A00; }
.shx-info-mint   { color: #1A7A55; }
.shx-info-coral  { color: #B23824; }
.shx-info-slate  { color: var(--ink-soft); }

/* ── Matches ── */
.shx-match-list {
  display: flex;
  flex-direction: column;
}
.shx-match-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 22px;
  border-bottom: 1.5px dashed rgba(27, 42, 65, 0.1);
  animation: shxMatchIn 0.35s cubic-bezier(.34, 1.4, .4, 1) both;
  transition: background 0.15s ease;
}
.shx-match-row:last-child { border-bottom: none; }
.shx-match-row:hover { background: rgba(255, 217, 102, 0.1); }

.shx-match-idx {
  font-size: 11px;
  font-weight: 900;
  color: var(--ink-soft);
  width: 34px;
  flex-shrink: 0;
}

.shx-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 2px solid var(--ink);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  flex-shrink: 0;
  box-shadow: 1.5px 1.5px 0 var(--ink);
}
.shx-badge-icon {
  display: grid;
  place-items: center;
  width: 12px;
  height: 12px;
}
.shx-badge-win  { background: var(--mint); color: var(--ink); }
.shx-badge-loss { background: var(--coral); color: var(--ink); }
.shx-badge-draw { background: #D9DEE7; color: var(--ink); }

.shx-match-score {
  font-size: 15px;
  font-weight: 900;
  color: var(--ink);
  flex: 1;
  min-width: 0;
}
.shx-match-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink-soft);
  flex-shrink: 0;
}

/* ── Empty ── */
.shx-empty {
  padding: 48px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
}
.shx-empty-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  background: var(--yellow-soft);
  border: 2.5px solid var(--ink);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
  color: var(--ink);
  transform: rotate(-6deg);
}
.shx-empty p {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
}

/* ── Keyframes ── */
@keyframes shxFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shxMatchIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Responsive ── */
@media (max-width: 780px) {
  .shx-profile-inner { padding: 0 16px; }
  .shx-banner { height: 160px; border-radius: 22px; }
  .shx-avatar { width: 96px; height: 96px; margin-top: -48px; }
  .shx-avatar-text { font-size: 34px; }
  .shx-name { font-size: 24px; }
  .shx-stats { grid-template-columns: 1fr; gap: 12px; }
  .shx-grid { grid-template-columns: 1fr; gap: 14px; }
  .shx-card-full { grid-column: 1; }
  .shx-header-row { align-items: flex-start; }
  .shx-header-actions { width: 100%; }
  .shx-header-actions .shx-btn { flex: 1; }
}

@media (max-width: 480px) {
  .shx-profile-inner { padding: 0 12px; }
  .shx-banner { height: 130px; margin-top: 16px; }
  .shx-avatar { width: 84px; height: 84px; margin-top: -42px; }
  .shx-avatar-text { font-size: 28px; }
  .shx-name { font-size: 22px; }
  .shx-email { font-size: 12px; }
  .shx-stat-val { font-size: 26px; }
  .shx-stat-icon { width: 42px; height: 42px; }
  .shx-info-row { padding: 12px 16px; }
  .shx-card-title { padding: 14px 16px 12px; }
  .shx-match-row { padding: 11px 16px; gap: 10px; flex-wrap: wrap; }
  .shx-match-date { font-size: 11px; }
  .shx-info-ellipsis { max-width: 55%; }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .shx-banner,
  .shx-header,
  .shx-stats,
  .shx-grid,
  .shx-match-row,
  .shx-crayon-loader span,
  .shx-avatar {
    animation: none !important;
    transition: none !important;
  }
}
`;

export { STYLES as ProfileStyles };