"use client";

import React, { useState, useEffect, useMemo } from "react";

/* ─── EASTER EGG ─── */
const EasterEggModal = React.memo(function EasterEggModal({ gameCount, onClose }) {
  const confettiColors = useMemo(() => ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"], []);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 2 + Math.random(),
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    }));
    setConfetti(pieces);
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose, confettiColors]);

  return (
    <div className="easter-egg-modal">
      {confetti.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            animation: `confetti ${p.duration}s linear forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div className="easter-egg-content">
        <div className="easter-egg-emoji">🎮</div>
        <div className="easter-egg-title">Sharx UNLOCKED!</div>
        <div className="easter-egg-text">
          You've discovered the secret! True gaming enthusiast!
        </div>
        <div className="easter-egg-stats">
          <div className="easter-egg-stat">
            <div className="easter-egg-stat-num">∞</div>
            <div className="easter-egg-stat-label">Fun Awaits</div>
          </div>
          <div className="easter-egg-stat">
            <div className="easter-egg-stat-num">{gameCount}+</div>
            <div className="easter-egg-stat-label">Games</div>
          </div>
          <div className="easter-egg-stat">
            <div className="easter-egg-stat-num">Free</div>
            <div className="easter-egg-stat-label">Always</div>
          </div>
        </div>
        <button className="easter-egg-button" onClick={onClose}>
          Continue Playing
        </button>
      </div>
    </div>
  );
});

export default EasterEggModal;