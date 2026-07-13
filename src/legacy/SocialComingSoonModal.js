"use client";

import React, { useCallback, useEffect } from "react";

/* ════════════════════════════════════════════════════════════
   SOCIAL "COMING SOON" MODAL
   Shown when the footer Instagram / YouTube icons are clicked,
   since neither channel exists yet.
════════════════════════════════════════════════════════════ */
const SOCIAL_INFO = {
  instagram: {
    label: "Instagram",
    tagline: "Sneak peeks, behind-the-scenes & more 📸",
    message:
      "We're getting things ready! Our Instagram page will be launching soon. Stay tuned for exciting updates and be among the first to follow us!",
    gradient: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  youtube: {
    label: "YouTube",
    tagline: "Tutorials, gameplay & fun videos 🎬",
    message:
      "Our channel is in the works! We're gearing up to bring you awesome videos soon. Subscribe as soon as we're live and never miss an upload!",
    gradient: "linear-gradient(135deg, #ff0000, #cc0000)",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
};

// NOTE: this <style jsx global>-free inline <style> block only mounts when
// the modal itself mounts (it's inside this lazy chunk), so it no longer
// costs anything in the initial bundle.
const SocialComingSoonModal = React.memo(function SocialComingSoonModal({ platform, onClose }) {
  const info = SOCIAL_INFO[platform];

  const handleBgClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!info) return null;

  return (
    <div className="scs-bg" onClick={handleBgClick}>
      <style>{`
        @keyframes scsIn { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes scsFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scsPulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
        .scs-bg {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: scsFade .2s ease;
        }
        .scs-card {
          width: 100%; max-width: 360px;
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.35);
          animation: scsIn .25s cubic-bezier(.2,.9,.3,1.2);
        }
        .scs-head { padding: 28px 20px 22px; text-align: center; position: relative; }
        .scs-close {
          position: absolute; top: 10px; right: 12px;
          background: rgba(255,255,255,0.25);
          border: none; color: #fff;
          width: 28px; height: 28px; border-radius: 50%;
          cursor: pointer; font-size: 15px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
        }
        .scs-close:hover { background: rgba(255,255,255,0.4); }
        .scs-icon-wrap {
          width: 56px; height: 56px; border-radius: 50%;
          background: rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }
        .scs-title { color: #fff; font-size: 17px; font-weight: 700; margin: 0; }
        .scs-body { padding: 20px 22px 24px; text-align: center; }
        .scs-text { color: #475569; font-size: 14px; line-height: 1.6; margin: 0; }
        .scs-tagline { color: #0f172a; font-size: 14px; font-weight: 700; margin: 0 0 8px; }
        .scs-tag {
          margin-top: 14px; display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; color: #94a3b8; font-weight: 600;
          letter-spacing: .3px; text-transform: uppercase;
        }
        .scs-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: scsPulse 1.4s ease infinite; }
        .scs-btn {
          margin-top: 18px; width: 100%; border: none; border-radius: 10px;
          background: #0f172a; color: #fff; font-size: 14px; font-weight: 600;
          padding: 11px 0; cursor: pointer;
        }
        .scs-btn:hover { background: #1e293b; }
      `}</style>
      <div className="scs-card">
        <div className="scs-head" style={{ background: info.gradient }}>
          <button className="scs-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          <div className="scs-icon-wrap">{info.icon}</div>
          <p className="scs-title">{info.label}</p>
        </div>
        <div className="scs-body">
          {info.tagline && <p className="scs-tagline">{info.tagline}</p>}
          <p className="scs-text">{info.message}</p>
          <div className="scs-tag">
            <span className="scs-dot" />
            Launching soon
          </div>
          <button className="scs-btn" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
});

export default SocialComingSoonModal;