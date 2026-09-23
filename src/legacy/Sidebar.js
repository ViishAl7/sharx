"use client";

import React, { memo, useCallback } from "react";
import Image from "next/image";

/* ──────────────────────────────────────────────
   Distinct icon per category.
────────────────────────────────────────────── */
const ICONS = {
  "all games": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.8" />
    </svg>
  ),
  trending: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c.6 2.4 2 3.9 3.6 5.2C17.6 8.9 19 11 19 13.8c0 3.9-3.1 7.2-7 7.2s-7-3.3-7-7.2c0-2.2 1-4.2 2.5-5.7.3 1 1.1 1.9 2 1.9 1.4 0 1.9-1.4 2.5-3.1.3-1 .7-2 1-3.1.2-.6.4-1.2.5-1.8.1-.4.4-.4.5 0Z" />
    </svg>
  ),
  arcade: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="7" width="19" height="12" rx="4" />
      <path d="M7 11v4M5 13h4" />
      <circle cx="16" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="14" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  hypercasual: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  ),
  puzzle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3.5h3.2a1.4 1.4 0 0 1 1.4 1.9 1.7 1.7 0 0 0 2.9 1.7 1.4 1.4 0 0 1 2.4 1v3.4a1.4 1.4 0 0 1-1.9 1.4 1.7 1.7 0 0 0-1.7 2.9 1.4 1.4 0 0 1-1 2.4H11a1.4 1.4 0 0 1-1.4-1.9 1.7 1.7 0 0 0-2.9-1.7 1.4 1.4 0 0 1-2.4-1V10a1.4 1.4 0 0 1 1.9-1.4A1.7 1.7 0 0 0 8 5.7 1.4 1.4 0 0 1 9 3.5Z" />
    </svg>
  ),
  action: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  shooting: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  ),
  sports: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2.5 2.6 2.5 15.4 0 18M3 12h18M5 6.5c3 1.6 11 1.6 14 0M5 17.5c3-1.6 11-1.6 14 0" />
    </svg>
  ),
  girls: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-10-9.2C.5 8.1 2.4 4.5 6 4.1c2-.2 3.6.8 6 3 2.4-2.2 4-3.2 6-3 3.6.4 5.5 4 3 7.7C19.5 16.4 12 21 12 21Z" />
    </svg>
  ),
  clicker: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12.5V5a1.6 1.6 0 0 1 3.2 0v5.3M12.2 10V4a1.6 1.6 0 0 1 3.2 0v6M15.4 10.3V6a1.6 1.6 0 0 1 3.2 0v8c0 4-2.6 7-6.6 7-2.6 0-4.1-1-5.4-2.7L3 13.6c-.6-1 .1-2.4 1.5-2.2 .6.1 1.1.4 1.5 1l1.5 1.9" />
    </svg>
  ),
  racing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h9.5l-1.6 3.6L13.5 11H4" />
      <rect x="4.6" y="4.6" width="1.9" height="1.9" fill="currentColor" stroke="none" />
      <rect x="8.4" y="4.6" width="1.9" height="1.9" fill="currentColor" stroke="none" />
      <rect x="6.5" y="6.5" width="1.9" height="1.9" fill="currentColor" stroke="none" />
      <rect x="10.3" y="6.5" width="1.9" height="1.9" fill="currentColor" stroke="none" />
      <rect x="4.6" y="8.4" width="1.9" height="1.9" fill="currentColor" stroke="none" />
      <rect x="8.4" y="8.4" width="1.9" height="1.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  adventure: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 2 21h20L12 3Z" />
      <path d="m9 21 3-6 3 6M12 9v3" />
    </svg>
  ),
  stickman: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="5" r="2.2" />
      <path d="M12 7.2v7M8 11h8M9 21l3-6 3 6" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.2a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2-2.4 3.6M12 17.2v.1" />
  </svg>
);

const normalizeKey = (label = "") => label.trim().toLowerCase();

const getIconFor = (category) => {
  const key = normalizeKey(category);
  if (key === "all") return ICONS["all games"];
  return ICONS[key] || DEFAULT_ICON;
};

const getDataCat = (category) => {
  const key = normalizeKey(category);
  return key === "all" ? "all" : key.replace(/[^a-z0-9]+/g, "-");
};

/* ─── Memoized item: 15+ items no longer re-render on every Home state change ─── */
const SidebarItem = memo(function SidebarItem({ cat, isOn, onPick }) {
  return (
    <button
      type="button"
      data-cat={getDataCat(cat)}
      className={`sidebar-item ${isOn ? "sidebar-item-on" : ""}`}
      onClick={() => onPick(cat)}
      aria-current={isOn ? "true" : undefined}
    >
      <span className="sidebar-item-icon">{getIconFor(cat)}</span>
      <span className="sidebar-item-label">
        {cat === "All" ? "All Games" : cat}
      </span>
    </button>
  );
});

function Sidebar({
  categories = [],
  activeCategory,
  onSelectCategory,
  open,
  onClose,
}) {
  const handlePick = useCallback(
    (cat) => {
      onSelectCategory(cat);
      onClose?.();
    },
    [onSelectCategory, onClose]
  );

  return (
    <>
      {open && (
        <div
          className="sidebar-scrim"
          role="button"
          aria-label="Close menu"
          tabIndex={0}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClose?.();
          }}
        />
      )}

      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
        aria-label="Game categories"
      >
        <div className="sidebar-brand">
          {/* next/image + explicit width/height = no layout shift (CLS) */}
          <Image
            src="/sharx-logo.webp"
            alt="Sharx"
            width={68}
            height={68}
            priority
            draggable={false}
          />
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l16 16M20 4 4 20" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Categories">
          {categories.map((cat) => (
            <SidebarItem
              key={cat}
              cat={cat}
              isOn={cat === activeCategory}
              onPick={handlePick}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

export default memo(Sidebar);