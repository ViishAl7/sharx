// src/Pages/ProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useProfile } from '../Context/ProfileContext';

// ─── Constants ─────────────────────────────────────────────────────────────
const BODY_SHAPES = [
  { id: 'circle',  label: 'Circle'  },
  { id: 'square',  label: 'Square'  },
  { id: 'star',    label: 'Star'    },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'heart',   label: 'Heart'   },
];

const EYE_STYLES = [
  { id: 'round',  label: 'Round'  },
  { id: 'oval',   label: 'Oval'   },
  { id: 'sleepy', label: 'Sleepy' },
  { id: 'wink',   label: 'Wink'   },
];

const AVATAR_COLORS = [
  '#34d399', // green
  '#fbbf24', // yellow
  '#f9a8d4', // pink
  '#c084fc', // purple
  '#60a5fa', // blue
  '#fb923c', // orange
];

// ─── AvatarSVG ──────────────────────────────────────────────────────────────
function AvatarSVG({ shape = 'heart', eyes = 'round', color = '#c084fc', size = 120 }) {
  const s  = size;
  const cx = s / 2;
  const cy = s / 2;

  const bodyPath = () => {
    switch (shape) {
      case 'circle':
        return <circle cx={cx} cy={cy} r={s * 0.44} fill={color} />;

      case 'square':
        return (
          <rect
            x={s * 0.08} y={s * 0.08}
            width={s * 0.84} height={s * 0.84}
            rx={s * 0.15}
            fill={color}
          />
        );

      case 'star': {
        const pts = [];
        const n = 5;
        const r1 = s * 0.44;
        const r2 = s * 0.2;
        for (let i = 0; i < n * 2; i++) {
          const r = i % 2 === 0 ? r1 : r2;
          const a = (Math.PI / n) * i - Math.PI / 2;
          pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
        }
        return <polygon points={pts.join(' ')} fill={color} />;
      }

      case 'hexagon': {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          pts.push(`${cx + s * 0.43 * Math.cos(a)},${cy + s * 0.43 * Math.sin(a)}`);
        }
        return <polygon points={pts.join(' ')} fill={color} />;
      }

      case 'heart':
      default: {
        const hx = cx;
        const hy = cy + s * 0.06;
        const r  = s * 0.22;
        return (
          <path
            d={`
              M ${hx} ${hy + s * 0.28}
              C ${hx - s * 0.38} ${hy - s * 0.05},
                ${hx - r * 2.1}  ${hy - s * 0.32},
                ${hx}            ${hy - s * 0.08}
              C ${hx + r * 2.1}  ${hy - s * 0.32},
                ${hx + s * 0.38} ${hy - s * 0.05},
                ${hx}            ${hy + s * 0.28} Z
            `}
            fill={color}
          />
        );
      }
    }
  };

  const eyeNodes = () => {
    const ey  = cy - s * 0.04;
    const ex1 = cx - s * 0.14;
    const ex2 = cx + s * 0.14;
    const er  = s * 0.065;

    switch (eyes) {
      case 'oval':
        return (
          <>
            <ellipse cx={ex1} cy={ey} rx={er * 0.75} ry={er * 1.2} fill="#1a1a2e" />
            <ellipse cx={ex2} cy={ey} rx={er * 0.75} ry={er * 1.2} fill="#1a1a2e" />
          </>
        );

      case 'sleepy':
        return (
          <>
            <path
              d={`M ${ex1 - er} ${ey} Q ${ex1} ${ey + er * 1.2} ${ex1 + er} ${ey}`}
              stroke="#1a1a2e" strokeWidth={s * 0.025} fill="none" strokeLinecap="round"
            />
            <path
              d={`M ${ex2 - er} ${ey} Q ${ex2} ${ey + er * 1.2} ${ex2 + er} ${ey}`}
              stroke="#1a1a2e" strokeWidth={s * 0.025} fill="none" strokeLinecap="round"
            />
          </>
        );

      case 'wink':
        return (
          <>
            <circle cx={ex1} cy={ey} r={er} fill="#1a1a2e" />
            <path
              d={`M ${ex2 - er} ${ey} Q ${ex2} ${ey + er * 1.3} ${ex2 + er} ${ey}`}
              stroke="#1a1a2e" strokeWidth={s * 0.025} fill="none" strokeLinecap="round"
            />
          </>
        );

      case 'round':
      default:
        return (
          <>
            <circle cx={ex1} cy={ey} r={er}                          fill="#1a1a2e" />
            <circle cx={ex2} cy={ey} r={er}                          fill="#1a1a2e" />
            <circle cx={ex1 + er * 0.3} cy={ey - er * 0.3} r={er * 0.3} fill="white" />
            <circle cx={ex2 + er * 0.3} cy={ey - er * 0.3} r={er * 0.3} fill="white" />
          </>
        );
    }
  };

  return (
    <svg
      width={s} height={s}
      viewBox={`0 0 ${s} ${s}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {bodyPath()}
      {eyeNodes()}
    </svg>
  );
}

// ─── ProfilePage ────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate        = useNavigate();
  const { logout }      = useAuth();
  const { profile, updateProfile, updateStatus, isProfileLoading } = useProfile();

  // ── FIX: localAvatar — editor mein sab changes real-time dikhne ke liye ─
  // Context se aa raha profile = source of truth
  // localAvatar = editor ke andar ki live preview state
  const [localAvatar, setLocalAvatar] = useState({
    avatarShape: 'heart',
    avatarEyes:  'round',
    avatarColor: '#c084fc',
  });

  // Sync localAvatar jab profile context se aaye
  useEffect(() => {
    if (profile) {
      setLocalAvatar({
        avatarShape: profile.avatarShape || 'heart',
        avatarEyes:  profile.avatarEyes  || 'round',
        avatarColor: profile.avatarColor || '#c084fc',
      });
    }
  }, [profile]);

  const [isEditing,      setIsEditing]      = useState(false);
  const [editName,       setEditName]       = useState('');
  const [activeTab,      setActiveTab]      = useState('profile');
  const [avatarTab,      setAvatarTab]      = useState('body');
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  // FIX: Track unsaved changes
  const [hasUnsavedAvatar, setHasUnsavedAvatar] = useState(false);

  const statusMenuRef = useRef(null);

  // ── Sync edit name whenever profile loads/changes ─────────────────────
  useEffect(() => {
    if (profile) setEditName(profile.stylishUsername || '');
  }, [profile]);

  // ── Close status menu on outside click ───────────────────────────────
  useEffect(() => {
    if (!showStatusMenu) return;
    const handler = (e) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStatusMenu]);

  // ── Auth guard ────────────────────────────────────────────────────────
  const isLoggedIn = !!localStorage.getItem('token');
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  // ── Loading state ─────────────────────────────────────────────────────
  if (isProfileLoading || !profile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F5F7FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 48, height: 48,
          border: '3px solid rgba(0,0,0,0.1)',
          borderTopColor: '#1E293B',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  const loginBadge = () => {
    switch (profile.loginMethod) {
      case 'google':  return '🔑 Signed in with Google';
      case 'passkey': return '🔐 Signed in with Passkey';
      default:        return '📧 Signed in with Email';
    }
  };

  const statusColor = { online: '#10B981', gaming: '#8B5CF6', away: '#F59E0B' };

  const formatDate = (d) => {
    if (!d) return 'Just joined';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed) updateProfile({ stylishUsername: trimmed });
    setIsEditing(false);
  };

  // FIX: Avatar change — sirf local state update karo, save button pe backend call
  const handleAvatarChange = (key, value) => {
    setLocalAvatar((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedAvatar(true);
  };

  // FIX: Save avatar — tab backend/context ko update karo
  const handleSaveAvatar = () => {
    updateProfile({
      avatarShape: localAvatar.avatarShape,
      avatarEyes:  localAvatar.avatarEyes,
      avatarColor: localAvatar.avatarColor,
    });
    setHasUnsavedAvatar(false);
    setShowAvatarEdit(false);
  };

  // FIX: Cancel avatar edit — local changes discard karo
  const handleCancelAvatar = () => {
    setLocalAvatar({
      avatarShape: profile.avatarShape || 'heart',
      avatarEyes:  profile.avatarEyes  || 'round',
      avatarColor: profile.avatarColor || '#c084fc',
    });
    setHasUnsavedAvatar(false);
    setShowAvatarEdit(false);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── PAGE ── */
        .pp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #F0F4FF 0%, #E8EDF5 100%);
          font-family: 'Inter', sans-serif;
        }

        /* ── NAV ── */
        .pp-nav {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
          padding: 14px 32px;
          position: sticky; top: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pp-nav-logo {
          font-size: 22px; font-weight: 800; color: #1E293B; cursor: pointer;
          user-select: none;
        }
        .pp-nav-btns { display: flex; gap: 10px; }
        .pp-nav-btn {
          padding: 8px 18px; border-radius: 40px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          background: rgba(0,0,0,0.05); color: #334155;
          transition: background 0.2s;
        }
        .pp-nav-btn:hover { background: rgba(0,0,0,0.1); }
        .pp-nav-btn.danger { background: rgba(239,68,68,0.1); color: #EF4444; }
        .pp-nav-btn.danger:hover { background: rgba(239,68,68,0.18); }

        /* ── CONTAINER ── */
        .pp-wrap { max-width: 900px; margin: 0 auto; padding: 40px 20px; }

        /* ── HERO CARD ── */
        .pp-hero {
          background: white;
          border-radius: 40px;
          padding: 40px;
          margin-bottom: 28px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          animation: fadeUp 0.4s ease;
        }
        .pp-hero-inner {
          display: flex; gap: 40px;
          align-items: flex-start; flex-wrap: wrap;
        }

        /* ── AVATAR ── */
        .pp-avatar-wrap { position: relative; flex-shrink: 0; }
        .pp-avatar-img {
          width: 130px; height: 130px;
          border-radius: 50%; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .pp-avatar-img:hover { transform: scale(1.03); }
        .pp-avatar-img img { width: 100%; height: 100%; object-fit: cover; }

        .pp-edit-avatar-btn {
          position: absolute; bottom: 4px; right: 4px;
          width: 32px; height: 32px; border-radius: 50%;
          background: #1E293B; color: white; border: 2px solid white;
          font-size: 13px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: background 0.2s;
        }
        .pp-edit-avatar-btn:hover { background: #334155; }

        .pp-status-dot {
          position: absolute; bottom: 36px; right: 4px;
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid white; cursor: pointer;
          transition: transform 0.15s;
        }
        .pp-status-dot:hover { transform: scale(1.2); }

        .pp-status-menu {
          position: absolute; top: 140px; left: 0;
          background: white; border-radius: 18px; padding: 6px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 50; min-width: 150px;
        }
        .pp-status-opt {
          padding: 10px 14px; border-radius: 12px; cursor: pointer;
          font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          transition: background 0.15s;
        }
        .pp-status-opt:hover { background: #F8FAFC; }

        /* ── INFO ── */
        .pp-info { flex: 1; min-width: 220px; }
        .pp-username-row {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap; margin-bottom: 6px;
        }
        .pp-username { font-size: 32px; font-weight: 800; color: #1E293B; }
        .pp-edit-btn {
          padding: 6px 14px; border-radius: 40px; border: none;
          background: #F1F5F9; color: #475569;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.2s;
        }
        .pp-edit-btn:hover { background: #E2E8F0; }
        .pp-edit-input {
          font-size: 26px; font-weight: 700;
          padding: 6px 14px; border: 2px solid #E2E8F0;
          border-radius: 16px; outline: none;
          font-family: 'Inter', sans-serif; width: 100%;
          transition: border-color 0.2s;
        }
        .pp-edit-input:focus { border-color: #6366F1; }
        .pp-save-btn {
          padding: 8px 20px; background: #1E293B; color: white;
          border: none; border-radius: 40px;
          font-weight: 600; font-size: 13px; cursor: pointer;
          transition: background 0.2s;
        }
        .pp-save-btn:hover { background: #334155; }

        .pp-email   { font-size: 14px; color: #64748B; margin-bottom: 6px; }
        .pp-login-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 40px;
          background: #F0FDF4; color: #16A34A;
          font-size: 12px; font-weight: 600; margin-bottom: 16px;
        }
        .pp-join { font-size: 12px; color: #94A3B8; margin-bottom: 20px; }

        /* ── STATS ── */
        .pp-stats { display: flex; gap: 16px; flex-wrap: wrap; }
        .pp-stat {
          background: #F8FAFC; border-radius: 20px;
          padding: 16px 24px; text-align: center; min-width: 90px;
        }
        .pp-stat-num { font-size: 28px; font-weight: 800; color: #1E293B; }
        .pp-stat-lbl { font-size: 11px; font-weight: 600; color: #94A3B8; margin-top: 4px; }

        /* ── AVATAR EDITOR ── */
        .pp-avatar-editor {
          background: white; border-radius: 32px; padding: 32px;
          margin-bottom: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          animation: fadeUp 0.3s ease;
        }
        .pp-editor-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 24px;
        }
        .pp-editor-title { font-size: 18px; font-weight: 700; color: #1E293B; }
        .pp-editor-actions { display: flex; gap: 8px; align-items: center; }
        .pp-close-btn {
          width: 32px; height: 32px; border-radius: 50%; border: none;
          background: #F1F5F9; color: #64748B; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .pp-close-btn:hover { background: #E2E8F0; }
        .pp-save-avatar-btn {
          padding: 8px 18px; background: #6366F1; color: white;
          border: none; border-radius: 40px;
          font-weight: 700; font-size: 13px; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          font-family: 'Inter', sans-serif;
        }
        .pp-save-avatar-btn:hover { background: #4F46E5; transform: translateY(-1px); }
        .pp-unsaved-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #F59E0B; display: inline-block; margin-left: 4px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        .pp-editor-body {
          display: flex; gap: 32px;
          align-items: flex-start; flex-wrap: wrap;
        }
        .pp-avatar-preview {
          width: 160px; height: 160px; border-radius: 50%;
          background: #F8FAFC; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: background 0.3s;
        }
        .pp-editor-controls { flex: 1; min-width: 200px; }
        .pp-editor-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
        .pp-editor-tab {
          flex: 1; padding: 8px; border-radius: 12px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          background: #F1F5F9; color: #64748B; transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .pp-editor-tab.active { background: #1E293B; color: white; }

        .pp-options { display: flex; gap: 10px; flex-wrap: wrap; }
        .pp-option-btn {
          width: 52px; height: 52px; border-radius: 14px;
          border: 2px solid transparent; background: #F8FAFC; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .pp-option-btn:hover  { border-color: #CBD5E1; transform: scale(1.05); }
        .pp-option-btn.active { border-color: #6366F1; background: #EEF2FF; transform: scale(1.08); }

        .pp-color-btn {
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid transparent; cursor: pointer; transition: all 0.2s;
        }
        .pp-color-btn:hover  { transform: scale(1.1); }
        .pp-color-btn.active { border-color: #1E293B; transform: scale(1.18); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }

        /* ── TABS ── */
        .pp-tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .pp-tab {
          padding: 10px 24px; border-radius: 40px; border: none;
          font-size: 14px; font-weight: 600; cursor: pointer;
          background: white; color: #64748B; transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          font-family: 'Inter', sans-serif;
        }
        .pp-tab.active { background: #1E293B; color: white; }

        /* ── CONTENT CARD ── */
        .pp-card {
          background: white; border-radius: 32px; padding: 32px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          animation: fadeUp 0.4s ease;
        }
        .pp-card-title {
          font-size: 18px; font-weight: 700;
          color: #1E293B; margin-bottom: 20px;
        }
        .pp-empty { text-align: center; padding: 48px; color: #94A3B8; }
        .pp-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .pp-browse-btn {
          margin-top: 16px; padding: 10px 24px; border-radius: 40px;
          border: none; background: #1E293B; color: white;
          font-weight: 600; cursor: pointer; font-size: 14px;
          transition: background 0.2s;
        }
        .pp-browse-btn:hover { background: #334155; }

        .pp-setting-row { margin-bottom: 20px; }
        .pp-setting-label {
          font-weight: 600; color: #1E293B;
          margin-bottom: 4px; font-size: 14px;
        }
        .pp-setting-val { color: #64748B; font-size: 14px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 700px) {
          .pp-hero { padding: 24px; border-radius: 28px; }
          .pp-hero-inner { flex-direction: column; align-items: center; text-align: center; }
          .pp-username-row { justify-content: center; }
          .pp-stats { justify-content: center; }
          .pp-username { font-size: 26px; }
          .pp-avatar-editor { padding: 20px; }
          .pp-status-menu { left: 50%; transform: translateX(-50%); }
        }
      `}</style>

      <div className="pp-page">

        {/* ── NAV ──────────────────────────────────────────────────── */}
        <nav className="pp-nav">
          <div className="pp-nav-logo" onClick={() => navigate('/')}>Sharx</div>
          <div className="pp-nav-btns">
            <button className="pp-nav-btn" onClick={() => navigate('/')}>← Home</button>
            <button
              className="pp-nav-btn danger"
              onClick={() => { logout(); navigate('/'); }}
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="pp-wrap">

          {/* ── HERO ─────────────────────────────────────────────── */}
          <div className="pp-hero">
            <div className="pp-hero-inner">

              {/* Avatar */}
              <div className="pp-avatar-wrap" ref={statusMenuRef}>
                <div className="pp-avatar-img">
                  {profile.avatarType === 'google' && profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.username} />
                  ) : (
                    // FIX: Hero preview bhi localAvatar use karta hai — turant dikhta hai
                    <AvatarSVG
                      shape={localAvatar.avatarShape}
                      eyes={localAvatar.avatarEyes}
                      color={localAvatar.avatarColor}
                      size={130}
                    />
                  )}
                </div>

                {/* Status dot */}
                <div
                  className="pp-status-dot"
                  style={{ backgroundColor: statusColor[profile.status] || '#94A3B8' }}
                  onClick={() => setShowStatusMenu((v) => !v)}
                  title="Change status"
                />

                {/* Status menu */}
                {showStatusMenu && (
                  <div className="pp-status-menu">
                    {[
                      ['online', '🟢', 'Online'],
                      ['gaming', '🎮', 'Gaming'],
                      ['away',   '🌙', 'Away'  ],
                    ].map(([s, ic, lbl]) => (
                      <div
                        key={s}
                        className="pp-status-opt"
                        onClick={() => { updateStatus(s); setShowStatusMenu(false); }}
                      >
                        {ic} {lbl}
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit avatar button (custom only) */}
                {profile.avatarType !== 'google' && (
                  <button
                    className="pp-edit-avatar-btn"
                    onClick={() => setShowAvatarEdit((v) => !v)}
                    title="Customize avatar"
                  >
                    ✎
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="pp-info">
                <div className="pp-username-row">
                  {isEditing ? (
                    <>
                      <input
                        className="pp-edit-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')  handleSaveName();
                          if (e.key === 'Escape') setIsEditing(false);
                        }}
                      />
                      <button className="pp-save-btn" onClick={handleSaveName}>Save</button>
                      <button className="pp-edit-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <div className="pp-username">{profile.stylishUsername}</div>
                      <button className="pp-edit-btn" onClick={() => setIsEditing(true)}>✎ Edit</button>
                    </>
                  )}
                </div>

                <div className="pp-email">{profile.email}</div>
                <div className="pp-login-badge">{loginBadge()}</div>
                <div className="pp-join">📅 Joined {formatDate(profile.joinDate)}</div>

                <div className="pp-stats">
                  <div className="pp-stat">
                    <div className="pp-stat-num">{profile.gamesPlayed || 0}</div>
                    <div className="pp-stat-lbl">GAMES</div>
                  </div>
                  <div className="pp-stat">
                    <div className="pp-stat-num">{(profile.favoriteGames || []).length}</div>
                    <div className="pp-stat-lbl">FAVORITES</div>
                  </div>
                  <div className="pp-stat">
                    <div className="pp-stat-num">🏆</div>
                    <div className="pp-stat-lbl">RANK</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── AVATAR EDITOR ────────────────────────────────────── */}
          {showAvatarEdit && profile.avatarType !== 'google' && (
            <div className="pp-avatar-editor">
              <div className="pp-editor-header">
                <div className="pp-editor-title">
                  Customize Avatar
                  {hasUnsavedAvatar && <span className="pp-unsaved-dot" title="Unsaved changes" />}
                </div>
                <div className="pp-editor-actions">
                  {hasUnsavedAvatar && (
                    <button className="pp-save-avatar-btn" onClick={handleSaveAvatar}>
                      Save Changes
                    </button>
                  )}
                  <button className="pp-close-btn" onClick={handleCancelAvatar}>✕</button>
                </div>
              </div>

              <div className="pp-editor-body">
                {/* FIX: Live preview — localAvatar use karo, turant dikhta hai */}
                <div
                  className="pp-avatar-preview"
                  style={{ background: `${localAvatar.avatarColor}22` }}
                >
                  <AvatarSVG
                    shape={localAvatar.avatarShape}
                    eyes={localAvatar.avatarEyes}
                    color={localAvatar.avatarColor}
                    size={140}
                  />
                </div>

                {/* Controls */}
                <div className="pp-editor-controls">
                  <div className="pp-editor-tabs">
                    {[
                      ['body',  '⬟ Body' ],
                      ['eyes',  '👁 Eyes' ],
                      ['color', '🎨 Color'],
                    ].map(([t, lbl]) => (
                      <button
                        key={t}
                        className={`pp-editor-tab ${avatarTab === t ? 'active' : ''}`}
                        onClick={() => setAvatarTab(t)}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  {/* FIX: Har option click pe localAvatar update hota hai — turant preview mein dikhta hai */}
                  {avatarTab === 'body' && (
                    <div className="pp-options">
                      {BODY_SHAPES.map(({ id }) => (
                        <button
                          key={id}
                          className={`pp-option-btn ${localAvatar.avatarShape === id ? 'active' : ''}`}
                          onClick={() => handleAvatarChange('avatarShape', id)}
                          title={id}
                        >
                          <AvatarSVG
                            shape={id}
                            eyes="round"
                            color={localAvatar.avatarColor}
                            size={34}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {avatarTab === 'eyes' && (
                    <div className="pp-options">
                      {EYE_STYLES.map(({ id }) => (
                        <button
                          key={id}
                          className={`pp-option-btn ${localAvatar.avatarEyes === id ? 'active' : ''}`}
                          onClick={() => handleAvatarChange('avatarEyes', id)}
                          title={id}
                        >
                          <AvatarSVG
                            shape={localAvatar.avatarShape}
                            eyes={id}
                            color={localAvatar.avatarColor}
                            size={34}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {avatarTab === 'color' && (
                    <div className="pp-options">
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c}
                          className={`pp-color-btn ${localAvatar.avatarColor === c ? 'active' : ''}`}
                          style={{ backgroundColor: c }}
                          onClick={() => handleAvatarChange('avatarColor', c)}
                          aria-label={c}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TABS ─────────────────────────────────────────────── */}
          <div className="pp-tabs">
            {[
              ['profile',  'About'       ],
              ['games',    '🎮 Games'    ],
              ['settings', '⚙️ Settings' ],
            ].map(([id, lbl]) => (
              <button
                key={id}
                className={`pp-tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* ── CONTENT ──────────────────────────────────────────── */}
          <div className="pp-card">

            {activeTab === 'profile' && (
              <>
                <div className="pp-card-title">About Me</div>
                <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                  Passionate gamer enjoying the best free online games.<br />
                  Always ready for the next adventure! 🎮✨
                </p>
              </>
            )}

            {activeTab === 'games' && (
              <>
                <div className="pp-card-title">Recently Played</div>
                {(profile.favoriteGames || []).length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: 12,
                  }}>
                    {profile.favoriteGames.map((g, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#F8FAFC', borderRadius: 14,
                          padding: 12, textAlign: 'center',
                          fontSize: 13, color: '#475569',
                        }}
                      >
                        {g}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pp-empty">
                    <div className="pp-empty-icon">🎮</div>
                    <div>No games played yet</div>
                    <button className="pp-browse-btn" onClick={() => navigate('/')}>
                      Browse Games →
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'settings' && (
              <>
                <div className="pp-card-title">Account Settings</div>
                <div className="pp-setting-row">
                  <div className="pp-setting-label">Email Address</div>
                  <div className="pp-setting-val">{profile.email || '—'}</div>
                </div>
                <div className="pp-setting-row">
                  <div className="pp-setting-label">Login Method</div>
                  <div className="pp-setting-val">{loginBadge()}</div>
                </div>
                <div className="pp-setting-row">
                  <div className="pp-setting-label">Member Since</div>
                  <div className="pp-setting-val">{formatDate(profile.joinDate)}</div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}