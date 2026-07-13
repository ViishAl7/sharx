// src/legacy/ProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

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
  '#34d399', '#fbbf24', '#f9a8d4',
  '#c084fc', '#60a5fa', '#fb923c',
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
        const n = 5, r1 = s * 0.44, r2 = s * 0.2;
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
        const hx = cx, hy = cy + s * 0.06, r = s * 0.22;
        return (
          <path
            d={`M ${hx} ${hy + s * 0.28}
              C ${hx - s * 0.38} ${hy - s * 0.05},
                ${hx - r * 2.1}  ${hy - s * 0.32},
                ${hx}            ${hy - s * 0.08}
              C ${hx + r * 2.1}  ${hy - s * 0.32},
                ${hx + s * 0.38} ${hy - s * 0.05},
                ${hx}            ${hy + s * 0.28} Z`}
            fill={color}
          />
        );
      }
    }
  };

  const eyeNodes = () => {
    const ey = cy - s * 0.04;
    const ex1 = cx - s * 0.14, ex2 = cx + s * 0.14;
    const er = s * 0.065;
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
            <path d={`M ${ex1-er} ${ey} Q ${ex1} ${ey+er*1.2} ${ex1+er} ${ey}`} stroke="#1a1a2e" strokeWidth={s*0.025} fill="none" strokeLinecap="round"/>
            <path d={`M ${ex2-er} ${ey} Q ${ex2} ${ey+er*1.2} ${ex2+er} ${ey}`} stroke="#1a1a2e" strokeWidth={s*0.025} fill="none" strokeLinecap="round"/>
          </>
        );
      case 'wink':
        return (
          <>
            <circle cx={ex1} cy={ey} r={er} fill="#1a1a2e" />
            <path d={`M ${ex2-er} ${ey} Q ${ex2} ${ey+er*1.3} ${ex2+er} ${ey}`} stroke="#1a1a2e" strokeWidth={s*0.025} fill="none" strokeLinecap="round"/>
          </>
        );
      case 'round':
      default:
        return (
          <>
            <circle cx={ex1} cy={ey} r={er} fill="#1a1a2e" />
            <circle cx={ex2} cy={ey} r={er} fill="#1a1a2e" />
            <circle cx={ex1+er*0.3} cy={ey-er*0.3} r={er*0.3} fill="white" />
            <circle cx={ex2+er*0.3} cy={ey-er*0.3} r={er*0.3} fill="white" />
          </>
        );
    }
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg">
      {bodyPath()}
      {eyeNodes()}
    </svg>
  );
}

// ─── ProfilePage ────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate   = useNavigate();
  const { logout } = useAuth();
  const { profile, updateProfile, updateStatus, isProfileLoading } = useProfile();

  const [localAvatar, setLocalAvatar] = useState({
    avatarShape: 'heart',
    avatarEyes:  'round',
    avatarColor: '#c084fc',
  });

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
  const [hasUnsavedAvatar, setHasUnsavedAvatar] = useState(false);

  const statusMenuRef = useRef(null);

  useEffect(() => {
    if (profile) setEditName(profile.stylishUsername || '');
  }, [profile]);

  useEffect(() => {
    if (!showStatusMenu) return;
    const handler = (e) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target))
        setShowStatusMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showStatusMenu]);

  const isLoggedIn = !!localStorage.getItem('token');
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  if (isProfileLoading || !profile) {
    return (
      <div style={{
        minHeight:'100vh', background:'linear-gradient(135deg,#F0F4FF,#E8EDF5)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{
          width:44, height:44,
          border:'3px solid rgba(0,0,0,0.08)',
          borderTopColor:'#1E293B',
          borderRadius:'50%',
          animation:'spin 0.7s linear infinite',
        }}/>
      </div>
    );
  }

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
    return new Date(d).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
  };

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed) updateProfile({ stylishUsername: trimmed });
    setIsEditing(false);
  };

  const handleAvatarChange = (key, value) => {
    setLocalAvatar(prev => ({ ...prev, [key]: value }));
    setHasUnsavedAvatar(true);
  };

  const handleSaveAvatar = () => {
    updateProfile({
      avatarShape: localAvatar.avatarShape,
      avatarEyes:  localAvatar.avatarEyes,
      avatarColor: localAvatar.avatarColor,
    });
    setHasUnsavedAvatar(false);
    setShowAvatarEdit(false);
  };

  const handleCancelAvatar = () => {
    setLocalAvatar({
      avatarShape: profile.avatarShape || 'heart',
      avatarEyes:  profile.avatarEyes  || 'round',
      avatarColor: profile.avatarColor || '#c084fc',
    });
    setHasUnsavedAvatar(false);
    setShowAvatarEdit(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');

        /* ══════════════════════════════════════════
           GLOBAL — No blue tap highlight
        ══════════════════════════════════════════ */
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0; padding: 0;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
          outline: none !important;
        }
        input, textarea {
          -webkit-user-select: text !important;
          user-select: text !important;
        }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

        .pp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #F0F4FF 0%, #E8EDF5 100%);
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ══════════════════════════════════════════
           FIX: NAV — Back & Logout side by side, NOT overlapping save
        ══════════════════════════════════════════ */
        .pp-nav {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          padding: 12px 24px;
          position: sticky; top: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
        }
        .pp-nav-logo {
          font-size: 20px; font-weight: 800; color: #1E293B; cursor: pointer;
        }
        .pp-nav-btns {
          display: flex; gap: 8px; align-items: center;
          /* ✅ FIX: buttons always stay right, never overlap save */
          flex-shrink: 0;
        }
        .pp-nav-btn {
          padding: 8px 16px; border-radius: 40px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer;
          background: rgba(0,0,0,0.05); color: #334155;
          transition: background 0.2s ease, transform 0.15s ease;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
        }
        .pp-nav-btn:hover { background: rgba(0,0,0,0.09); transform: translateY(-1px); }
        .pp-nav-btn:active { transform: translateY(0) scale(0.97); }
        .pp-nav-btn.danger { background: rgba(239,68,68,0.08); color: #EF4444; }
        .pp-nav-btn.danger:hover { background: rgba(239,68,68,0.15); }

        .pp-wrap { max-width: 860px; margin: 0 auto; padding: 36px 20px; }

        /* ══ HERO CARD ══ */
        .pp-hero {
          background: white;
          border-radius: 36px;
          padding: 36px;
          margin-bottom: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          animation: fadeUp 0.4s ease;
        }
        .pp-hero-inner {
          display: flex; gap: 36px;
          align-items: flex-start; flex-wrap: wrap;
        }

        /* ══ AVATAR ══ */
        .pp-avatar-wrap { position: relative; flex-shrink: 0; }
        .pp-avatar-img {
          width: 120px; height: 120px;
          border-radius: 50%; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 18px rgba(0,0,0,0.09);
          transition: transform 0.25s cubic-bezier(0.2,0.9,0.4,1.1);
        }
        .pp-avatar-img:hover { transform: scale(1.03); }
        .pp-avatar-img img { width: 100%; height: 100%; object-fit: cover; }

        .pp-edit-avatar-btn {
          position: absolute; bottom: 4px; right: 4px;
          width: 30px; height: 30px; border-radius: 50%;
          background: #1E293B; color: white; border: 2px solid white;
          font-size: 13px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          transition: background 0.2s, transform 0.15s;
        }
        .pp-edit-avatar-btn:hover { background: #334155; transform: scale(1.1); }

        .pp-status-dot {
          position: absolute; bottom: 34px; right: 4px;
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid white; cursor: pointer;
          transition: transform 0.15s;
        }
        .pp-status-dot:hover { transform: scale(1.2); }

        .pp-status-menu {
          position: absolute; top: 128px; left: 0;
          background: white; border-radius: 16px; padding: 5px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          z-index: 50; min-width: 145px;
        }
        .pp-status-opt {
          padding: 9px 13px; border-radius: 11px; cursor: pointer;
          font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 7px;
          transition: background 0.15s;
        }
        .pp-status-opt:hover { background: #F8FAFC; }

        /* ══ INFO ══ */
        .pp-info { flex: 1; min-width: 200px; }
        .pp-username-row {
          display: flex; align-items: center; gap: 10px;
          flex-wrap: wrap; margin-bottom: 6px;
        }
        .pp-username { font-size: 28px; font-weight: 800; color: #1E293B; }
        .pp-edit-btn {
          padding: 5px 12px; border-radius: 40px; border: none;
          background: #F1F5F9; color: #475569;
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }
        .pp-edit-btn:hover { background: #E2E8F0; transform: translateY(-1px); }
        .pp-edit-input {
          font-size: 22px; font-weight: 700;
          padding: 6px 12px; border: 2px solid #E2E8F0;
          border-radius: 14px; outline: none;
          font-family: 'Inter', sans-serif; width: 100%;
          transition: border-color 0.2s;
        }
        .pp-edit-input:focus { border-color: #6366F1; }
        .pp-save-btn {
          padding: 7px 18px; background: #1E293B; color: white;
          border: none; border-radius: 40px;
          font-weight: 600; font-size: 13px; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .pp-save-btn:hover { background: #334155; transform: translateY(-1px); }

        .pp-email   { font-size: 14px; color: #64748B; margin-bottom: 5px; }
        .pp-login-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 40px;
          background: #F0FDF4; color: #16A34A;
          font-size: 12px; font-weight: 600; margin-bottom: 14px;
        }
        .pp-join { font-size: 12px; color: #94A3B8; margin-bottom: 18px; }

        .pp-stats { display: flex; gap: 12px; flex-wrap: wrap; }
        .pp-stat {
          background: #F8FAFC; border-radius: 18px;
          padding: 14px 20px; text-align: center; min-width: 82px;
        }
        .pp-stat-num { font-size: 26px; font-weight: 800; color: #1E293B; }
        .pp-stat-lbl { font-size: 10px; font-weight: 600; color: #94A3B8; margin-top: 3px; }

        /* ══════════════════════════════════════════
           FIX: AVATAR EDITOR — Save button proper position, no overlap
        ══════════════════════════════════════════ */
        .pp-avatar-editor {
          background: white; border-radius: 28px; padding: 28px;
          margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          animation: slideUp 0.3s ease;
        }
        .pp-editor-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 22px;
          flex-wrap: wrap; gap: 10px;
        }
        .pp-editor-title-row {
          display: flex; align-items: center; gap: 8px;
        }
        .pp-editor-title { font-size: 17px; font-weight: 700; color: #1E293B; }
        .pp-unsaved-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #F59E0B; display: inline-block;
          animation: pulse 1.5s ease-in-out infinite;
        }
        /* ✅ FIX: Action buttons in a row, clearly separated */
        .pp-editor-actions {
          display: flex; gap: 8px; align-items: center;
          flex-shrink: 0; /* Don't shrink */
        }
        .pp-save-avatar-btn {
          padding: 8px 18px; background: #6366F1; color: white;
          border: none; border-radius: 40px;
          font-weight: 700; font-size: 13px; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
        }
        .pp-save-avatar-btn:hover { background: #4F46E5; transform: translateY(-1px); }
        .pp-close-btn {
          width: 32px; height: 32px; border-radius: 50%; border: none;
          background: #F1F5F9; color: #64748B; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .pp-close-btn:hover { background: #FEE2E2; color: #EF4444; transform: scale(1.1); }

        .pp-editor-body {
          display: flex; gap: 28px;
          align-items: flex-start; flex-wrap: wrap;
        }
        .pp-avatar-preview {
          width: 150px; height: 150px; border-radius: 50%;
          background: #F8FAFC; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 18px rgba(0,0,0,0.07);
          transition: background 0.3s;
        }
        .pp-editor-controls { flex: 1; min-width: 190px; }
        .pp-editor-tabs { display: flex; gap: 6px; margin-bottom: 18px; }
        .pp-editor-tab {
          flex: 1; padding: 7px; border-radius: 11px; border: none;
          font-size: 12px; font-weight: 600; cursor: pointer;
          background: #F1F5F9; color: #64748B; transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .pp-editor-tab.active { background: #1E293B; color: white; }

        .pp-options { display: flex; gap: 9px; flex-wrap: wrap; }
        .pp-option-btn {
          width: 50px; height: 50px; border-radius: 13px;
          border: 2px solid transparent; background: #F8FAFC; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s;
        }
        .pp-option-btn:hover  { border-color: #CBD5E1; transform: scale(1.04); }
        .pp-option-btn.active { border-color: #6366F1; background: #EEF2FF; transform: scale(1.07); }

        .pp-color-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 3px solid transparent; cursor: pointer; transition: all 0.18s;
        }
        .pp-color-btn:hover  { transform: scale(1.1); }
        .pp-color-btn.active { border-color: #1E293B; transform: scale(1.18); box-shadow: 0 2px 8px rgba(0,0,0,0.18); }

        /* ══ TABS ══ */
        .pp-tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
        .pp-tab {
          padding: 9px 22px; border-radius: 40px; border: none;
          font-size: 14px; font-weight: 600; cursor: pointer;
          background: white; color: #64748B; transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          font-family: 'Inter', sans-serif;
        }
        .pp-tab.active { background: #1E293B; color: white; }

        /* ══ CONTENT CARD ══ */
        .pp-card {
          background: white; border-radius: 28px; padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          animation: fadeUp 0.35s ease;
        }
        .pp-card-title {
          font-size: 17px; font-weight: 700;
          color: #1E293B; margin-bottom: 18px;
        }
        .pp-empty { text-align: center; padding: 44px; color: #94A3B8; }
        .pp-empty-icon { font-size: 44px; margin-bottom: 14px; }
        .pp-browse-btn {
          margin-top: 14px; padding: 9px 22px; border-radius: 40px;
          border: none; background: #1E293B; color: white;
          font-weight: 600; cursor: pointer; font-size: 14px;
          transition: background 0.2s, transform 0.15s;
        }
        .pp-browse-btn:hover { background: #334155; transform: translateY(-1px); }

        .pp-setting-row { padding: 14px 0; border-bottom: 1px solid #F1F5F9; }
        .pp-setting-row:last-child { border-bottom: none; padding-bottom: 0; }
        .pp-setting-label { font-weight: 600; color: #1E293B; margin-bottom: 4px; font-size: 14px; }
        .pp-setting-val   { color: #64748B; font-size: 14px; }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 640px) {
          .pp-wrap { padding: 24px 16px; }
          .pp-hero { padding: 22px; border-radius: 24px; }
          .pp-hero-inner { flex-direction: column; align-items: center; text-align: center; }
          .pp-username-row { justify-content: center; }
          .pp-stats { justify-content: center; }
          .pp-username { font-size: 24px; }
          .pp-avatar-editor { padding: 18px; border-radius: 20px; }
          .pp-status-menu { left: 50%; transform: translateX(-50%); }
          .pp-nav { padding: 10px 16px; }
          .pp-nav-btn { padding: 7px 13px; font-size: 12px; }
        }
      `}</style>

      <div className="pp-page">

        {/* ── NAV ──────────────────────────────────────────────────── */}
        <nav className="pp-nav">
          <div className="pp-nav-logo" onClick={() => navigate('/')}>Sharx</div>
          <div className="pp-nav-btns">
            {/* ✅ FIX: Both buttons side by side, always visible */}
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
                    <AvatarSVG
                      shape={localAvatar.avatarShape}
                      eyes={localAvatar.avatarEyes}
                      color={localAvatar.avatarColor}
                      size={120}
                    />
                  )}
                </div>

                {/* Status dot */}
                <div
                  className="pp-status-dot"
                  style={{ backgroundColor: statusColor[profile.status] || '#94A3B8' }}
                  onClick={() => setShowStatusMenu(v => !v)}
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

                {/* Edit avatar button */}
                {profile.avatarType !== 'google' && (
                  <button
                    className="pp-edit-avatar-btn"
                    onClick={() => setShowAvatarEdit(v => !v)}
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
                        onChange={e => setEditName(e.target.value)}
                        autoFocus
                        onKeyDown={e => {
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
              {/* ✅ FIX: Header row — title left, [Save Changes] [✕] right — no overlap */}
              <div className="pp-editor-header">
                <div className="pp-editor-title-row">
                  <span className="pp-editor-title">Customize Avatar</span>
                  {hasUnsavedAvatar && <span className="pp-unsaved-dot" title="Unsaved changes" />}
                </div>
                <div className="pp-editor-actions">
                  {hasUnsavedAvatar && (
                    <button className="pp-save-avatar-btn" onClick={handleSaveAvatar}>
                      Save Changes
                    </button>
                  )}
                  {/* ✅ This close/back button is always last, clearly after save */}
                  <button className="pp-close-btn" onClick={handleCancelAvatar} title="Cancel">✕</button>
                </div>
              </div>

              <div className="pp-editor-body">
                <div
                  className="pp-avatar-preview"
                  style={{ background: `${localAvatar.avatarColor}22` }}
                >
                  <AvatarSVG
                    shape={localAvatar.avatarShape}
                    eyes={localAvatar.avatarEyes}
                    color={localAvatar.avatarColor}
                    size={130}
                  />
                </div>

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
                      >{lbl}</button>
                    ))}
                  </div>

                  {avatarTab === 'body' && (
                    <div className="pp-options">
                      {BODY_SHAPES.map(({ id }) => (
                        <button
                          key={id}
                          className={`pp-option-btn ${localAvatar.avatarShape === id ? 'active' : ''}`}
                          onClick={() => handleAvatarChange('avatarShape', id)}
                          title={id}
                        >
                          <AvatarSVG shape={id} eyes="round" color={localAvatar.avatarColor} size={32} />
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
                          <AvatarSVG shape={localAvatar.avatarShape} eyes={id} color={localAvatar.avatarColor} size={32} />
                        </button>
                      ))}
                    </div>
                  )}

                  {avatarTab === 'color' && (
                    <div className="pp-options">
                      {AVATAR_COLORS.map(c => (
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
              ['profile',  'About'      ],
              ['games',    '🎮 Games'   ],
              ['settings', '⚙️ Settings'],
            ].map(([id, lbl]) => (
              <button
                key={id}
                className={`pp-tab ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id)}
              >{lbl}</button>
            ))}
          </div>

          {/* ── CONTENT ──────────────────────────────────────────── */}
          <div className="pp-card">
            {activeTab === 'profile' && (
              <>
                <div className="pp-card-title">About Me</div>
                <p style={{ color:'#64748B', lineHeight:1.7 }}>
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
                    display:'grid',
                    gridTemplateColumns:'repeat(auto-fill, minmax(100px, 1fr))',
                    gap:10,
                  }}>
                    {profile.favoriteGames.map((g, i) => (
                      <div key={i} style={{
                        background:'#F8FAFC', borderRadius:12,
                        padding:'10px 8px', textAlign:'center',
                        fontSize:13, color:'#475569',
                      }}>{g}</div>
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