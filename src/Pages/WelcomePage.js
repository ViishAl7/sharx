// src/Components/WelcomePage.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DURATION = 3000;

export default function WelcomePage({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady]       = useState(false);

  useEffect(() => {
    const start = Date.now();
    const tick  = () => {
      const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
      else           setReady(true);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #fff7ed 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Righteous&display=swap');

        @keyframes blobA {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-20px) scale(1.05); }
          66%      { transform: translate(-20px,15px) scale(0.97); }
        }
        @keyframes blobB {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-25px,20px) scale(1.04); }
          66%      { transform: translate(20px,-15px) scale(0.98); }
        }
        @keyframes blobC {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(15px,25px) scale(1.06); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        .wv-btn {
          background: #1a2e44;
          color: #fff;
          border: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          padding: 14px 48px;
          border-radius: 100px;
          letter-spacing: 0.3px;
          box-shadow: 0 8px 28px rgba(26,46,68,0.22);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .wv-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -80%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
          transform: skewX(-18deg);
          animation: shimmer 2.4s ease-in-out infinite;
        }
        .wv-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(26,46,68,0.3);
        }
        .wv-btn:active { transform: scale(0.97); }
      `}</style>

      {/* ── blobs ── */}
      <div style={{
        position: 'absolute', width: 480, height: 480,
        top: '-12%', left: '-10%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'blobA 12s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 420, height: 420,
        bottom: '-14%', right: '-8%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'blobB 15s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 320, height: 320,
        top: '35%', right: '8%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'blobC 10s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 280, height: 280,
        bottom: '10%', left: '8%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.11) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'blobA 18s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      {/* ── CONTENT ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center',
        padding: '0 32px',
        maxWidth: 560,
      }}>

        {/* eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55 }}
          style={{
            fontSize: 11, fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#9CA3AF',
            margin: '0 0 20px',
          }}
        >
          Welcome to
        </motion.p>

        {/* brand */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Righteous', cursive",
            fontSize: 'clamp(52px, 10vw, 88px)',
            color: '#1a2e44',
            margin: '0 0 20px',
            lineHeight: 1,
            letterSpacing: '-1px',
          }}
        >
          Playvora
        </motion.h1>

        {/* animated underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: 3, borderRadius: 100,
            background: 'linear-gradient(90deg, #6366F1, #A855F7, #EC4899, #F59E0B)',
            maxWidth: 180,
            margin: '0 auto 28px',
            transformOrigin: 'left center',
          }}
        />

        {/* tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.55 }}
          style={{
            fontSize: 'clamp(15px, 2.5vw, 18px)',
            fontWeight: 500,
            color: '#475569',
            lineHeight: 1.65,
            margin: '0 0 48px',
          }}
        >
          Your favourite free games — no downloads,
          <br />no fuss. Just open and play.
        </motion.p>

        {/* progress bar + button */}
        <AnimatePresence mode="wait">
          {!ready ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {/* track */}
              <div style={{
                height: 5, borderRadius: 100,
                background: 'rgba(26,46,68,0.07)',
                maxWidth: 240, margin: '0 auto 14px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 100,
                  background: 'linear-gradient(90deg, #6366F1, #A855F7, #EC4899)',
                  backgroundSize: '300% 100%',
                  animation: 'shimmer 1.6s linear infinite',
                  width: `${progress}%`,
                  transition: 'width 0.08s linear',
                }} />
              </div>
              <p style={{
                fontSize: 11, fontWeight: 600,
                color: '#94A3B8',
                margin: 0, letterSpacing: '0.5px',
              }}>
                Loading games... {Math.round(progress)}%
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="enter"
              initial={{ opacity: 0, y: 14, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
            >
              <button className="wv-btn" onClick={onComplete}>
                Enter Playvora →
              </button>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: 11, fontWeight: 600,
                  color: '#CBD5E1', margin: 0,
                  letterSpacing: '0.4px',
                }}
              >
                100+ free games · no account needed
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}