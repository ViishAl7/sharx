"use client";

import React, { memo, useCallback } from "react";
import Image from "next/image";

/* ─────────────────────────────────────────────
   ICON WRAPPER
   Every icon gets the same SVG shell so stroke
   style, caps, joins and sizing stay consistent.
───────────────────────────────────────────── */
const wrap = (children) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <g className="crayon-under" transform="translate(0.7 0.8)">
      {children}
    </g>
    <g className="crayon-main">{children}</g>
  </svg>
);

/* ─────────────────────────────────────────────
   ICON SET — clean line-style, premium geometry
───────────────────────────────────────────── */
const ICONS = {
  /* All Games → 4 rounded squares (grid) */
  "all games": wrap(
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2.2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.2" />
    </>
  ),

  /* Trending → flame */
  trending: wrap(
    <>
      <path d="M12 2.5c.8 3.2 2.5 4.8 4.1 6.3 1.7 1.6 2.9 3.6 2.9 6.2 0 4-3.3 7-7 7s-7-3-7-7c0-2.2.8-4.2 2-5.8" />
      <path d="M12 22c-2 0-3.5-1.5-3.5-3.5 0-1.8 1.5-3 3.5-5 2 2 3.5 3.2 3.5 5 0 2-1.5 3.5-3.5 3.5Z" />
    </>
  ),

  /* Arcade → game controller */
  arcade: wrap(
    <>
      <rect x="2.5" y="7" width="19" height="12" rx="4.5" />
      <path d="M7 10.5v5M4.5 13h5" />
      <circle cx="16" cy="11.5" r="1.1" />
      <circle cx="18.5" cy="14" r="1.1" />
    </>
  ),

  /* Hypercasual → spark / sun */
  hypercasual: wrap(
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.4" />
    </>
  ),

  /* Puzzle → puzzle piece */
  puzzle: wrap(
    <path d="M9 3.4h3.4a1.5 1.5 0 0 1 1.4 2 1.8 1.8 0 0 0 3 1.8 1.5 1.5 0 0 1 2.5 1v3.4a1.5 1.5 0 0 1-2 1.4 1.8 1.8 0 0 0-1.7 3 1.5 1.5 0 0 1-1 2.5H11a1.5 1.5 0 0 1-1.4-2 1.8 1.8 0 0 0-3-1.8 1.5 1.5 0 0 1-2.5-1v-3.4a1.5 1.5 0 0 1 2-1.4A1.8 1.8 0 0 0 8 5.7 1.5 1.5 0 0 1 9 3.4Z" />
  ),

  /* Action → lightning bolt */
  action: wrap(
    <path d="M13.2 2.1 4.4 14.1h5.6l-1.2 8 9.2-12.1h-5.6l0.8-7.9Z" />
  ),

  /* Shooting → target crosshair */
  shooting: wrap(
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
    </>
  ),

  /* Sports → trophy */
  sports: wrap(
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5 3.5 3.5 0 0 0 6.5 11" />
      <path d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5 3.5 3.5 0 0 1 17.5 11" />
      <path d="M12 13v4M9 20h6M10 17h4" />
    </>
  ),

  /* Girls → elegant user profile */
  girls: wrap(
    <>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M4.5 20.5c.7-4 3.6-6.2 7.5-6.2s6.8 2.2 7.5 6.2" />
    </>
  ),

  /* Clicker → hand + cursor */
  clicker: wrap(
    <>
      <path d="M9 12.5V5a1.6 1.6 0 0 1 3.2 0v5.3" />
      <path d="M12.2 10V4a1.6 1.6 0 0 1 3.2 0v6" />
      <path d="M15.4 10.3V6a1.6 1.6 0 0 1 3.2 0v8c0 4-2.6 7-6.6 7-2.6 0-4.1-1-5.4-2.7L3 13.6c-.6-1 .1-2.4 1.5-2.2.6.1 1.1.4 1.5 1l1.5 1.9" />
    </>
  ),

  /* Racing → steering wheel */
  racing: wrap(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </>
  ),

  /* Multiplayer → two users */
  multiplayer: wrap(
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.5 20c.6-3.6 3.2-5.6 6.5-5.6s5.9 2 6.5 5.6" />
      <circle cx="17.5" cy="9.5" r="2.6" />
      <path d="M15.4 14.7c2.9.2 5.3 2.1 5.9 5.3" />
    </>
  ),

  /* Adventure → compass */
  adventure: wrap(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.4 8.6 13 13l-4.4 2.4L11 11l4.4-2.4Z" />
    </>
  ),

  /* Stickman → walker */
  stickman: wrap(
    <>
      <circle cx="12" cy="5" r="2.2" />
      <path d="M12 7.2v7M8 11h8M9 21l3-6 3 6" />
    </>
  ),

  /* AI → robot head */
  ai: wrap(
    <>
      <rect x="5" y="6" width="14" height="12" rx="3" />
      <path d="M12 3v3M12 18v3" />
      <circle cx="9.5" cy="11.5" r="1" />
      <circle cx="14.5" cy="11.5" r="1" />
      <path d="M9.5 15h5" />
    </>
  ),

  /* Cooking → pot with steam */
  cooking: wrap(
    <>
      <path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z" />
      <path d="M2 12h2M20 12h2" />
      <path d="M9 4c.5.6.5 1.4 0 2M12 3.5c.5.6.5 1.4 0 2M15 4c.5.6.5 1.4 0 2" />
    </>
  ),

  /* Horror → ghost face */
  horror: wrap(
    <>
      <path d="M12 3c-4.4 0-8 3.6-8 8v7l2-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4v-7c0-4.4-3.6-8-8-8Z" />
      <circle cx="9" cy="11" r="1" />
      <circle cx="15" cy="11" r="1" />
      <path d="M9.5 15h5" />
    </>
  ),

  /* Football / Soccer → ball with pentagon */
  football: wrap(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7.5 3.4 2.5-1.3 4h-4.2l-1.3-4L12 7.5Z" />
      <path d="M12 3.2v3.3M4 9l3.3 1.8M20 9l-3.3 1.8M7.2 19l3.4-4.3M16.8 19l-3.4-4.3" />
    </>
  ),

  /* Simulator → monitor with controls */
  simulator: wrap(
    <>
      <rect x="3" y="4" width="18" height="13" rx="2.5" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 10h2M11 10h2M15 10h2M12 7v6" />
    </>
  ),

  /* Bike → motorcycle */
  bike: wrap(
    <>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17 9 8h5l3 9M9 8l1.5-3H13" />
    </>
  ),

  /* Casual → smiley */
  casual: wrap(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14c1 1.5 2.2 2.2 3.5 2.2s2.5-.7 3.5-2.2" />
      <circle cx="9" cy="9.5" r="0.9" />
      <circle cx="15" cy="9.5" r="0.9" />
    </>
  ),

  /* 2 Player → two players side by side */
  "2 player": wrap(
    <>
      <circle cx="8" cy="9" r="2.8" />
      <circle cx="16" cy="9" r="2.8" />
      <path d="M2.5 20c.5-3.2 2.8-5 5.5-5s5 1.8 5.5 5M12.5 20c.5-3.2 2.8-5 5.5-5s5 1.8 5.5 5" />
    </>
  ),

  /* Racing Car → car silhouette */
  car: wrap(
    <>
      <path d="M3 14v-3l2-5h14l2 5v3" />
      <path d="M3 14h18v4h-2v-2H5v2H3v-4Z" />
      <circle cx="7" cy="17" r="1.4" />
      <circle cx="17" cy="17" r="1.4" />
    </>
  ),

  /* Dress Up → hanger */
  dressup: wrap(
    <>
      <path d="M12 4a2 2 0 1 0-2 2c0 1 .8 1.4 2 2" />
      <path d="M12 8 3.5 14.5a1.5 1.5 0 0 0 .8 2.7h15.4a1.5 1.5 0 0 0 .8-2.7L12 8Z" />
    </>
  ),

  /* Bubble → bubbles */
  bubble: wrap(
    <>
      <circle cx="10" cy="11" r="5.5" />
      <circle cx="17" cy="16.5" r="3" />
      <path d="M8 9.5c.5-.6 1.2-.9 1.8-.8" />
    </>
  ),

  /* Match 3 → three gems */
  match3: wrap(
    <>
      <path d="M6 5l3 3-3 3-3-3 3-3Z" />
      <path d="M15 6l3 3-3 3-3-3 3-3Z" />
      <path d="M10.5 15l3 3-3 3-3-3 3-3Z" />
    </>
  ),
};

/* Fallback icon when a category has no match */
const DEFAULT_ICON = wrap(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.2a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2-2.4 3.6M12 17.2v.1" />
  </>
);

/* ─────────────────────────────────────────────
   KEY MAPPING / ALIASES
───────────────────────────────────────────── */
const normalizeKey = (label = "") =>
  String(label).trim().toLowerCase();

const ALIASES = {
  /* core */
  all: "all games",
  "all games": "all games",
  trending: "trending",

  /* hyper */
  hyper: "hypercasual",
  "hyper casual": "hypercasual",
  "hyper-casual": "hypercasual",
  hypercasual: "hypercasual",

  /* people */
  girl: "girls",
  girls: "girls",
  dressup: "dressup",
  "dress up": "dressup",
  "dress-up": "dressup",
  fashion: "dressup",

  /* shooting */
  shooting: "shooting",
  shooter: "shooting",
  shoot: "shooting",
  gun: "shooting",

  /* sports */
  sport: "sports",
  sports: "sports",
  football: "football",
  soccer: "football",
  "soccer ball": "football",

  /* multiplayer */
  multiplayer: "multiplayer",
  multi: "multiplayer",
  multi_player: "multiplayer",
  "multi player": "multiplayer",
  "two player": "2 player",
  "2 player": "2 player",
  "2player": "2 player",
  "2-player": "2 player",
  duo: "2 player",
  co_op: "multiplayer",
  "co-op": "multiplayer",
  coop: "multiplayer",

  /* vehicles */
  bike: "bike",
  moto: "bike",
  motorcycle: "bike",
  car: "car",
  cars: "car",
  driving: "car",

  /* racing */
  racing: "racing",
  race: "racing",

  /* clicker */
  clicker: "clicker",
  click: "clicker",
  idle: "clicker",
  "idle game": "clicker",

  /* horror */
  horror: "horror",
  scary: "horror",
  zombie: "horror",

  /* sim */
  simulator: "simulator",
  sim: "simulator",
  simulation: "simulator",

  /* food */
  cooking: "cooking",
  food: "cooking",
  restaurant: "cooking",

  /* casual */
  casual: "casual",

  /* ai */
  ai: "ai",
  "artificial intelligence": "ai",
  "a.i.": "ai",

  /* gameplay genres */
  action: "action",
  adventure: "adventure",
  arcade: "arcade",
  puzzle: "puzzle",
  stickman: "stickman",

  /* puzzle sub-genres */
  bubble: "bubble",
  "bubble shooter": "bubble",
  bubbles: "bubble",
  match3: "match3",
  "match 3": "match3",
  "match-3": "match3",
  match: "match3",
  gems: "match3",
};

const getIconFor = (category) => {
  const key = normalizeKey(category);
  const mapped = ALIASES[key] || key;
  return ICONS[mapped] || DEFAULT_ICON;
};

const getDataCat = (category) => {
  const key = normalizeKey(category);
  return key === "all" ? "all" : key.replace(/[^a-z0-9]+/g, "-");
};

/* ─────────────────────────────────────────────
   SIDEBAR ITEM
   Clean — no squiggle line, just icon + label.
   Active state = yellow pill from CSS.
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
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
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onClose?.();
          }}
        />
      )}

      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
        aria-label="Game categories"
      >
        <div className="sidebar-brand">
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
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