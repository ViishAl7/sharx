import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { API_BASE } from "../config";

export default function Profile() {
  const { user, logout, authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then((data) => setProfile(data))
      .catch(() => setError("Could not load profile."))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const badgeClass = (result) => {
    const r = (result || "").toLowerCase();
    if (r === "win")  return "badge-win";
    if (r === "loss") return "badge-loss";
    return "badge-draw";
  };

  if (loading) return (
    <div style={css.center}>
      <style>{spinKeyframes}</style>
      <div style={css.spinner} />
      <p style={css.loadText}>Loading profile...</p>
    </div>
  );

  if (error) return (
    <div style={css.center}>
      <p style={css.errorText}>{error}</p>
      <button style={css.retryBtn} onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <>
      <style>{rawCSS}</style>
      <div className="pv-profile">

        {/* Banner */}
        <div className="pv-banner">
          <div className="pv-banner-grid" />
        </div>

        {/* Header */}
        <div className="pv-header-wrap">
          <div className="pv-avatar">{initials}</div>
          <div className="pv-header-row">
            <div>
              <div className="pv-name">{profile.name}</div>
              <div className="pv-email">{profile.email}</div>
            </div>
            <div className="pv-header-actions">
              <button className="pv-btn-ghost" onClick={() => navigate("/")}>Home</button>
              <button className="pv-btn-danger" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="pv-stats-row">
          <div className="pv-stat indigo">
            <div className="pv-stat-label">Total Score</div>
            <div className="pv-stat-val">{profile.score ?? 0}</div>
          </div>
          <div className="pv-stat cyan">
            <div className="pv-stat-label">Matches Played</div>
            <div className="pv-stat-val">{profile.matches?.length ?? 0}</div>
          </div>
          <div className="pv-stat green">
            <div className="pv-stat-label">Wins</div>
            <div className="pv-stat-val">
              {profile.matches?.filter((m) => m.result?.toLowerCase() === "win").length ?? 0}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="pv-grid">

          {/* Account Info */}
          <div className="pv-card">
            <div className="pv-card-title">Account Info</div>
            <div className="pv-info-row">
              <span className="pv-info-key">Name</span>
              <span className="pv-info-val">{profile.name}</span>
            </div>
            <div className="pv-info-row">
              <span className="pv-info-key">Email</span>
              <span className="pv-info-val">{profile.email}</span>
            </div>
            <div className="pv-info-row">
              <span className="pv-info-key">Login Type</span>
              <span className="pv-info-val">{profile.googleId ? "Google" : "Email"}</span>
            </div>
            <div className="pv-info-row pv-info-row-last">
              <span className="pv-info-key">User ID</span>
              <span className="pv-info-val">#{profile.id}</span>
            </div>
          </div>

          {/* Performance */}
          <div className="pv-card">
            <div className="pv-card-title">Performance</div>
            <div className="pv-info-row">
              <span className="pv-info-key">Total Score</span>
              <span className="pv-info-val pv-val-indigo">{profile.score ?? 0}</span>
            </div>
            <div className="pv-info-row">
              <span className="pv-info-key">Wins</span>
              <span className="pv-info-val pv-val-green">
                {profile.matches?.filter((m) => m.result?.toLowerCase() === "win").length ?? 0}
              </span>
            </div>
            <div className="pv-info-row">
              <span className="pv-info-key">Losses</span>
              <span className="pv-info-val pv-val-red">
                {profile.matches?.filter((m) => m.result?.toLowerCase() === "loss").length ?? 0}
              </span>
            </div>
            <div className="pv-info-row pv-info-row-last">
              <span className="pv-info-key">Draws</span>
              <span className="pv-info-val pv-val-slate">
                {profile.matches?.filter((m) => m.result?.toLowerCase() === "draw").length ?? 0}
              </span>
            </div>
          </div>

          {/* Match History */}
          <div className="pv-card pv-card-full">
            <div className="pv-card-title">Match History</div>
            {!profile.matches || profile.matches.length === 0 ? (
              <div className="pv-empty">No matches played yet.</div>
            ) : (
              profile.matches.map((match, i) => (
                <div className="pv-match-row" key={match.id} style={{ animationDelay: `${i * 35}ms` }}>
                  <span className="pv-match-idx">#{i + 1}</span>
                  <span className={`pv-badge ${badgeClass(match.result)}`}>{match.result}</span>
                  <span className="pv-match-score">{match.score} pts</span>
                  <span className="pv-match-date">{formatDate(match.createdAt)}</span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}

const css = {
  center: {
    minHeight: "100vh", background: "#090c12", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
  },
  spinner: {
    width: 34, height: 34, border: "3px solid #1a2235",
    borderTop: "3px solid #6366f1", borderRadius: "50%",
    animation: "pv-spin 0.75s cubic-bezier(0.5, 0.2, 0.5, 0.8) infinite",
  },
  loadText: { color: "#475569", fontSize: 13, fontFamily: "Inter, sans-serif", letterSpacing: "0.2px" },
  errorText: { color: "#f87171", fontSize: 14, fontFamily: "Inter, sans-serif" },
  retryBtn: {
    background: "#141b2b", color: "#94a3b8", border: "1px solid #1e293b",
    padding: "10px 24px", borderRadius: 10, cursor: "pointer", fontSize: 13,
    fontFamily: "Inter, sans-serif", fontWeight: 500, transition: "all 0.2s ease",
  },
};

const spinKeyframes = `@keyframes pv-spin { to { transform: rotate(360deg); } }`;

const rawCSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');

@keyframes pv-spin { to { transform: rotate(360deg); } }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.pv-profile {
  min-height: 100vh;
  background: #090c12;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
  padding-bottom: 64px;
  -webkit-font-smoothing: antialiased;
}

.pv-banner {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #0f172a 0%, #131929 50%, #0d1117 100%);
  position: relative;
  overflow: hidden;
}
.pv-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 100% at 15% 60%, rgba(99,102,241,0.10) 0%, transparent 70%),
    radial-gradient(ellipse 40% 80% at 85% 20%, rgba(6,182,212,0.07) 0%, transparent 70%);
}
.pv-banner-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}

.pv-header-wrap {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 24px;
  animation: fadeUp 0.45s ease both;
}
.pv-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 3px solid #090c12;
  box-shadow: 0 0 0 1px rgba(99,102,241,0.25), 0 8px 32px rgba(0,0,0,0.5);
  margin-top: -44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rajdhani', sans-serif;
  font-size: 30px;
  font-weight: 700;
  color: #818cf8;
  letter-spacing: 1px;
}
.pv-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0 28px;
  flex-wrap: wrap;
  gap: 12px;
}
.pv-name {
  font-family: 'Rajdhani', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.4px;
  line-height: 1.15;
  margin-bottom: 5px;
}
.pv-email { font-size: 13px; color: #475569; }

.pv-header-actions { display: flex; gap: 10px; }

.pv-btn-ghost, .pv-btn-danger {
  background: transparent;
  border: 1px solid #1e293b;
  color: #64748b;
  padding: 9px 18px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}
.pv-btn-ghost:hover { border-color: #334155; color: #94a3b8; }
.pv-btn-danger:hover { border-color: #ef4444; color: #f87171; background: rgba(239,68,68,0.06); }
.pv-btn-ghost:active, .pv-btn-danger:active { transform: scale(0.98); }

.pv-stats-row {
  max-width: 920px;
  margin: 0 auto 24px;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  animation: fadeUp 0.45s ease 0.06s both;
}
.pv-stat {
  background: #0f1623;
  border: 1px solid #1a2235;
  border-radius: 16px;
  padding: 18px 22px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.pv-stat:hover { transform: translateY(-2px); border-color: #253047; }
.pv-stat::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  border-radius: 16px 16px 0 0;
}
.pv-stat.indigo::after { background: linear-gradient(90deg, #6366f1, transparent); }
.pv-stat.cyan::after   { background: linear-gradient(90deg, #06b6d4, transparent); }
.pv-stat.green::after  { background: linear-gradient(90deg, #22c55e, transparent); }
.pv-stat-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #334155;
  margin-bottom: 10px;
}
.pv-stat-val {
  font-family: 'Rajdhani', sans-serif;
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
}
.pv-stat.indigo .pv-stat-val { color: #818cf8; }
.pv-stat.cyan   .pv-stat-val { color: #22d3ee; }
.pv-stat.green  .pv-stat-val { color: #4ade80; }

.pv-grid {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  animation: fadeUp 0.45s ease 0.1s both;
}
.pv-card {
  background: #0f1623;
  border: 1px solid #1a2235;
  border-radius: 18px;
  overflow: hidden;
}
.pv-card-full { grid-column: 1 / -1; }
.pv-card-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #334155;
  padding: 18px 22px 14px;
  border-bottom: 1px solid #131b2a;
}
.pv-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 22px;
  border-bottom: 1px solid #0d1117;
  transition: background 0.15s ease;
}
.pv-info-row:hover { background: rgba(255,255,255,0.015); }
.pv-info-row-last { border-bottom: none; }
.pv-info-key { font-size: 13px; color: #475569; }
.pv-info-val { font-size: 13px; color: #cbd5e1; font-weight: 500; }
.pv-val-indigo { color: #818cf8; font-weight: 600; }
.pv-val-green  { color: #4ade80; }
.pv-val-red    { color: #f87171; }
.pv-val-slate  { color: #94a3b8; }

.pv-match-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 13px 22px;
  border-bottom: 1px solid #0d1117;
  animation: fadeUp 0.35s ease both;
  transition: background 0.15s ease;
}
.pv-match-row:last-child { border-bottom: none; }
.pv-match-row:hover { background: rgba(255,255,255,0.015); }
.pv-match-idx { font-size: 11px; color: #253047; font-weight: 600; width: 28px; flex-shrink: 0; }
.pv-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 6px;
  flex-shrink: 0;
}
.badge-win  { background: rgba(34,197,94,0.1);  color: #4ade80; }
.badge-loss { background: rgba(239,68,68,0.1);  color: #f87171; }
.badge-draw { background: rgba(148,163,184,0.1); color: #94a3b8; }
.pv-match-score {
  font-family: 'Rajdhani', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #e2e8f0;
  flex: 1;
}
.pv-match-date { font-size: 11px; color: #334155; }
.pv-empty { padding: 40px 22px; text-align: center; color: #253047; font-size: 13px; }

@media (max-width: 640px) {
  .pv-stats-row { grid-template-columns: 1fr; }
  .pv-grid { grid-template-columns: 1fr; }
  .pv-card-full { grid-column: 1; }
  .pv-header-row { flex-direction: column; align-items: flex-start; }
  .pv-header-actions { width: 100%; }
  .pv-btn-ghost, .pv-btn-danger { flex: 1; text-align: center; }
}
`;