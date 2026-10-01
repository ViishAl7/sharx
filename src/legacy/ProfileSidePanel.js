// ProfileSidePanel.js — SHARX · UNIQUE CRAYON EDITION
import { useState, useEffect, useRef, useCallback } from "react";
import {
  useRewards,
  REWARDS_EVENT_LIVE,
} from "../context/RewardContext";
import { createWithdrawal } from "../lib/rewardClient";
import SharxAvatar from "./SharxAvatar";

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const SHAPES = ["square", "star", "circle", "hexagon", "heart"];
const EYES = ["oval", "round", "wink", "sleepy"];
const COLORS = ["#FFD966", "#FF8B7B", "#7BE5B5", "#8FB8FF", "#C7B4FF"];

const SHAPE_LABELS = {
  circle: "Circle",
  square: "Square",
  star: "Star",
  hexagon: "Hexagon",
  heart: "Heart",
};
const EYE_LABELS = {
  oval: "Oval",
  round: "Round",
  wink: "Wink",
  sleepy: "Sleepy",
};

const COLOR_CONFIG = {
  "#FFD966": { bg: "#FFF7DD", blob: "#FFD966", soft: "#FFF6D9" },
  "#FF8B7B": { bg: "#FFEDE8", blob: "#FF8B7B", soft: "#FFE9E4" },
  "#7BE5B5": { bg: "#E3FBF1", blob: "#7BE5B5", soft: "#E2F8EF" },
  "#8FB8FF": { bg: "#E8F0FF", blob: "#8FB8FF", soft: "#D4E5FF" },
  "#C7B4FF": { bg: "#F5EBFF", blob: "#C7B4FF", soft: "#F0E9FF" },
  "#FFB4D4": { bg: "#FFE9F1", blob: "#FFB4D4", soft: "#FFE3EE" },
};

const INK = "#1B2A41";
const YELLOW = "#FFD966";
const CORAL = "#FF8B7B";
const MINT = "#7BE5B5";
const BLUE = "#2E7FE8";
const LILAC = "#C7B4FF";
const PAPER = "#FFFFFF";

const USERNAME_LOCK_MS = 30 * 24 * 60 * 60 * 1000;

/* ═══════════════════════════════════════════
   AVATAR — thin wrapper so existing imports of
   AvatarSVG keep working (same props as before).
   Rendering lives in ./SharxAvatar
═══════════════════════════════════════════ */
export function AvatarSVG({
  shape = "circle",
  eyes = "oval",
  color = "#C7B4FF",
  size = 220,
  flat = false,
  ...rest
}) {
  return (
    <SharxAvatar
      shape={shape}
      eyes={eyes}
      color={color}
      size={size}
      flat={flat}
      {...rest}
    />
  );
}

/* ═══════════════════════════════════════════
   SHAPE / EYE PREVIEW ICONS
═══════════════════════════════════════════ */
function ShapeIcon({ shape, size = 30 }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const sw = 2.4;
  if (shape === "square")
    return <rect x={s * 0.16} y={s * 0.16} width={s * 0.68} height={s * 0.68} rx={s * 0.12}
      fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />;
  if (shape === "circle")
    return <circle cx={cx} cy={cy} r={s * 0.36} fill="none" stroke="currentColor" strokeWidth={sw} />;
  if (shape === "star") {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? s * 0.44 : s * 0.2;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />;
  }
  if (shape === "hexagon") {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + s * 0.4 * Math.cos(a)},${cy + s * 0.4 * Math.sin(a)}`;
    }).join(" ");
    return <polygon points={pts} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />;
  }
  return (
    <path d={`M ${cx} ${cy + s * 0.3}
      C ${cx - s * 0.5} ${cy + s * 0.04}
        ${cx - s * 0.4} ${cy - s * 0.26}
        ${cx} ${cy - s * 0.05}
      C ${cx + s * 0.4} ${cy - s * 0.26}
        ${cx + s * 0.5} ${cy + s * 0.04}
        ${cx} ${cy + s * 0.3} Z`}
      fill="none" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round" />
  );
}

function EyeIcon({ kind, size = 28 }) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const rx = s * 0.3;
  const ry = s * 0.4;
  const sw = 2;

  if (kind === "oval") {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFF" stroke="currentColor" strokeWidth={sw} />
        <path d={`M ${cx - rx * 0.8} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx * 0.8} ${cy} Z`}
          fill="currentColor" />
      </g>
    );
  }
  if (kind === "round") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={rx * 1.05} fill="#FFF" stroke="currentColor" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={rx * 0.5} fill="currentColor" />
      </g>
    );
  }
  if (kind === "wink") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={rx * 1.05} fill="#FFF" stroke="currentColor" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={rx * 0.5} fill="currentColor" />
        <path d={`M ${cx - rx * 1.5} ${cy} Q ${cx - rx * 1.5} ${cy + ry * 0.9} ${cx - rx * 0.7} ${cy}`}
          stroke="currentColor" strokeWidth={sw} fill="none" strokeLinecap="round" />
        <path d={`M ${cx + rx * 0.7} ${cy} Q ${cx + rx * 1.5} ${cy + ry * 0.9} ${cx + rx * 1.5} ${cy}`}
          stroke="currentColor" strokeWidth={sw} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={cx} cy={cy + ry * 0.15} rx={rx} ry={ry * 0.5}
        fill="#FFF" stroke="currentColor" strokeWidth={sw} />
      <path d={`M ${cx - rx * 0.85} ${cy} Q ${cx} ${cy + ry * 0.5} ${cx + rx * 0.85} ${cy}`}
        fill="currentColor" />
    </g>
  );
}

/* ═══════════════════════════════════════════
   ICONS
═══════════════════════════════════════════ */
const I = {
  Pen: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
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
  ChevL: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="5 12 10 17 19 7" />
    </svg>
  ),
  Lock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={INK}
      strokeWidth="2.4" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  Body: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" />
    </svg>
  ),
  EyeTab: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.3" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="9" ry="6" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  ),
  Palette: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20c1 0 2-1 2-2v-1a2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-11z" />
      <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" />
    </svg>
  ),
  Wallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11.2a2.5 2.5 0 0 1 2.4 1.8L20 10" />
      <path d="M3 7.5v9.5A2.5 2.5 0 0 0 5.5 19.5h13a2.5 2.5 0 0 0 2.5-2.5v-5.5A2.5 2.5 0 0 0 18.5 9H5.5A2.5 2.5 0 0 1 3 7.5Z" />
      <circle cx="16" cy="14" r="1.3" fill="currentColor" />
    </svg>
  ),
  Clock: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Trophy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5 3.5 3.5 0 0 0 6.5 11" />
      <path d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5 3.5 3.5 0 0 1 17.5 11" />
      <path d="M12 13v4M9 20h6M10 17h4" />
    </svg>
  ),
  Coin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 10c0-1 1.3-1.6 3-1.6s3 .6 3 1.6-1.3 1.6-3 1.6-3 .6-3 1.6 1.3 1.6 3 1.6 3-.6 3-1.6" />
    </svg>
  ),
  Send: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  Info: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.01" />
    </svg>
  ),
  Spark: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.6l-1.6-5.4L5 10.6 10.4 9 12 3.5Z" />
    </svg>
  ),
  SparkBig: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.6l-1.6-5.4L5 10.6 10.4 9 12 3.5Z" />
    </svg>
  ),
  Gift: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 12v9H4v-9" />
      <rect x="2.5" y="8.5" width="19" height="3.5" rx="0.8" />
      <path d="M12 8.5V21" />
      <path d="M12 8.5H7.8A2.3 2.3 0 0 1 5.5 6.2 2.2 2.2 0 0 1 7.7 4C10 4 12 6 12 8.5Z" />
      <path d="M12 8.5h4.2a2.3 2.3 0 0 0 2.3-2.3A2.2 2.2 0 0 0 16.3 4C14 4 12 6 12 8.5Z" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   REWARDS PANEL
═══════════════════════════════════════════ */
function RewardSection() {
  const { wallet, activeSession, lastReward, refreshRewards } = useRewards();

  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState("");
  const [withdrawalSuccess, setWithdrawalSuccess] = useState("");

  /* EVENT LOCK — every displayed reward value is forced to a
     safe locked value while the event is not live. */
  const locked = !REWARDS_EVENT_LIVE;

  const qualifiedSeconds = locked
    ? 0
    : Number(activeSession?.qualifiedSeconds || 0);

  const firstHourSeconds = Math.min(qualifiedSeconds, 3600);

  const progress = locked
    ? 0
    : Math.max(0, Math.min(100, (firstHourSeconds / 3600) * 100));

  const remainingSeconds = Math.max(3600 - qualifiedSeconds, 0);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  const balance = locked
    ? 0
    : Number(wallet?.balanceRupees || 0);

  const totalEarned = locked
    ? 0
    : Number(
        wallet?.totalEarnedRupees ||
          wallet?.lifetimeEarnedRupees ||
          0
      );

  const totalWithdrawn = locked
    ? 0
    : Number(
        wallet?.totalWithdrawnRupees ||
          wallet?.lifetimeWithdrawnRupees ||
          0
      );

  const currentSessionHours = locked
    ? "0"
    : (qualifiedSeconds / 3600).toFixed(1);

  const history = locked
    ? []
    : Array.isArray(wallet?.history)
      ? wallet.history
      : [];

  const isValidUpi = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(
    upi.trim()
  );

  async function handleSubmit(event) {
    event.preventDefault();

    /* EVENT LOCK — hard guard. Never let a withdrawal
       request be created while the event is not live. */
    if (!REWARDS_EVENT_LIVE) {
      return;
    }

    setWithdrawalError("");
    setWithdrawalSuccess("");

    const numericAmount = Number(amount);
    const trimmedUpi = upi.trim();

    if (!Number.isFinite(numericAmount) || numericAmount < 10) {
      setWithdrawalError("Minimum withdrawal amount is ₹10.");
      return;
    }
    if (numericAmount > 10000) {
      setWithdrawalError("Maximum withdrawal amount is ₹10,000.");
      return;
    }
    if (!trimmedUpi) {
      setWithdrawalError("Enter your UPI ID.");
      return;
    }
    if (!isValidUpi) {
      setWithdrawalError("Enter a valid UPI ID.");
      return;
    }
    if (numericAmount > balance) {
      setWithdrawalError("Insufficient reward balance.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createWithdrawal({
        amountRupees: numericAmount,
        method: "upi",
        destination: trimmedUpi,
      });
      const withdrawalId = result?.withdrawal?.id;
      setWithdrawalSuccess(
        withdrawalId
          ? `Withdrawal request created: ${withdrawalId}`
          : "Withdrawal request created successfully."
      );
      setAmount("");
      setUpi("");
      await refreshRewards();
    } catch (error) {
      setWithdrawalError(error?.message || "Withdrawal request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    !locked &&
    !submitting &&
    amount &&
    Number(amount) >= 10 &&
    Number(amount) <= balance &&
    upi.trim().length > 0;

  return (
    <div className="shrx-rw">
      {/* ═════ EVENT-LOCK NOTICE ═════ */}
      {locked && (
        <div className="shrx-rw-eventlock" role="status">
          <span className="shrx-rw-eventlock-ic" aria-hidden="true">
            <I.Lock />
          </span>
          <div className="shrx-rw-eventlock-body">
            <span className="shrx-rw-eventlock-eyebrow">
              SHARX REWARDS
            </span>
            <strong className="shrx-rw-eventlock-title">
              The Rewards Event hasn’t started yet.
            </strong>
            <p className="shrx-rw-eventlock-text">
              Earning, reward history and withdrawals will unlock
              automatically when the event goes live.
            </p>
            <span className="shrx-rw-eventlock-badge">
              EVENT NOT LIVE YET
            </span>
          </div>
        </div>
      )}

      <div className="shrx-rw-hero">
        <div className="shrx-rw-hero-left">
          <span className="shrx-rw-eyebrow">
            <span className="shrx-rw-eyebrow-dot" />
            SHARX REWARDS
          </span>

          <div className="shrx-rw-balance">
            <span className="shrx-rw-balance-cur">₹</span>
            <span className="shrx-rw-balance-num">{balance.toFixed(0)}</span>
          </div>

          <p className="shrx-rw-balance-label">Available reward balance</p>
        </div>

        <div className="shrx-rw-hero-coin">
          <I.Coin />
        </div>

        {!locked && lastReward && (
          <div className="shrx-rw-last">
            <span className="shrx-rw-last-ic"><I.Gift /></span>
            <span className="shrx-rw-last-txt">
              +₹{Number(lastReward.amountRupees || 0).toFixed(0)}
            </span>
          </div>
        )}
      </div>

      <div className="shrx-rw-progress-card">
        <div className="shrx-rw-progress-head">
          <span className="shrx-rw-progress-title">
            <span className="shrx-rw-progress-title-ic"><I.Clock /></span>
            Play progress
          </span>
          <span className="shrx-rw-progress-pill">
            {locked
              ? "0 min"
              : !activeSession
                ? "0 min"
                : qualifiedSeconds >= 3600
                  ? "60 min"
                  : `${Math.min(60, Math.floor(qualifiedSeconds / 60))} min`}
          </span>
        </div>

        <div className="shrx-rw-progress-track">
          <div className="shrx-rw-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="shrx-rw-progress-hint">
          {locked
            ? "Rewards are not live yet."
            : !activeSession
              ? "Start a game to begin qualified play tracking."
              : qualifiedSeconds < 3600
                ? `${remainingMinutes} min until your first play reward.`
                : "Your first play reward milestone has been reached."}
        </p>
      </div>

      <div className="shrx-rw-stats">
        <div className="shrx-rw-stat shrx-rw-stat-y">
          <span className="shrx-rw-stat-ic"><I.Trophy /></span>
          <strong className="shrx-rw-stat-val">₹{totalEarned.toFixed(0)}</strong>
          <span className="shrx-rw-stat-lbl">Total earned</span>
        </div>
        <div className="shrx-rw-stat shrx-rw-stat-m">
          <span className="shrx-rw-stat-ic"><I.Clock /></span>
          <strong className="shrx-rw-stat-val">{currentSessionHours}h</strong>
          <span className="shrx-rw-stat-lbl">Session</span>
        </div>
        <div className="shrx-rw-stat shrx-rw-stat-c">
          <span className="shrx-rw-stat-ic"><I.Coin /></span>
          <strong className="shrx-rw-stat-val">₹{totalWithdrawn.toFixed(0)}</strong>
          <span className="shrx-rw-stat-lbl">Withdrawn</span>
        </div>
      </div>

      <div className="shrx-rw-card">
        <div className="shrx-rw-head">
          <h3 className="shrx-rw-head-title">
            <span className="shrx-rw-head-title-ic shrx-rw-head-title-ic-y">
              <I.SparkBig />
            </span>
            Reward history
          </h3>
          {history.length > 0 && (
            <span className="shrx-rw-head-count">{history.length}</span>
          )}
        </div>

        {history.length === 0 ? (
          <div className="shrx-rw-empty">
            <span className="shrx-rw-empty-ic"><I.Gift /></span>
            <strong>
              {locked ? "Reward history locked" : "No rewards yet"}
            </strong>
            <p>
              {locked
                ? "Reward history will appear when the event goes live."
                : "Start playing to earn your first reward."}
            </p>
          </div>
        ) : (
          <ul className="shrx-rw-history">
            {history.slice(0, 5).map((h, i) => {
              const amt = Number(h.amountRupees || 0);
              return (
                <li key={h.id ?? i} className="shrx-rw-history-row">
                  <span className="shrx-rw-history-ic"><I.Spark /></span>
                  <div className="shrx-rw-history-body">
                    <strong>
                      {amt >= 0 ? "+" : ""}₹{Math.abs(amt).toFixed(0)}
                    </strong>
                    <small>
                      {h.createdAt
                        ? new Date(h.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "—"}
                    </small>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form className="shrx-rw-card shrx-rw-form" onSubmit={handleSubmit}>
        <div className="shrx-rw-head">
          <h3 className="shrx-rw-head-title">
            <span className="shrx-rw-head-title-ic shrx-rw-head-title-ic-m">
              <I.Send />
            </span>
            Withdraw rewards
          </h3>
          <span className="shrx-rw-head-badge">
            <I.Lock />
            {locked ? "Locked" : "Min ₹10"}
          </span>
        </div>

        <label className="shrx-rw-label">Amount in ₹</label>
        <div className="shrx-rw-input-wrap">
          <span className="shrx-rw-input-prefix">₹</span>
          <input
            className="shrx-rw-input"
            type="number"
            min="10"
            max={Math.min(10000, balance || 10000)}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={locked ? "Locked" : "10"}
            inputMode="numeric"
            disabled={locked || submitting}
          />
        </div>

        <label className="shrx-rw-label">Payout method</label>
        <div className="shrx-rw-method">
          <span className="shrx-rw-method-pill">UPI</span>
          <span className="shrx-rw-method-hint">
            {locked ? "Available at event start" : "Instant transfer"}
          </span>
        </div>

        <label className="shrx-rw-label">UPI ID</label>
        <input
          className="shrx-rw-input shrx-rw-input-plain"
          type="text"
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
          placeholder={locked ? "Locked" : "yourname@upi"}
          autoComplete="off"
          inputMode="email"
          maxLength={100}
          disabled={locked || submitting}
        />

        <button type="submit" className="shrx-rw-submit" disabled={!canSubmit}>
          <span className="shrx-rw-submit-ic"><I.Send /></span>
          <span>
            {locked
              ? "Locked until event start"
              : submitting
                ? "Submitting…"
                : "Request withdrawal"}
          </span>
        </button>

        {withdrawalError && (
          <p className="shrx-rw-msg shrx-rw-msg-error" role="alert">
            {withdrawalError}
          </p>
        )}
        {withdrawalSuccess && (
          <p className="shrx-rw-msg shrx-rw-msg-success" role="status">
            {withdrawalSuccess}
          </p>
        )}
      </form>

      <div className="shrx-rw-note">
        <span className="shrx-rw-note-ic"><I.Info /></span>
        <p>
          Withdrawal requests are reviewed and processed through the SHARX
          payout system. Creating a request does not mean the payout has
          already been completed.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const STYLES = `
.psp-root *, .psp-root *::before, .psp-root *::after { box-sizing: border-box; }

.psp-root {
  font-family: var(--font-comfortaa), 'Comfortaa', system-ui, sans-serif;
  color: ${INK};
  --ink: ${INK};
  --paper: ${PAPER};
  --blue: ${BLUE};
  --yellow: ${YELLOW};
  --coral: ${CORAL};
  --mint: ${MINT};
  --ink-soft: #5A6B82;
}

/* ═══ KEYFRAMES ═══ */
@keyframes psp-slideIn {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
@keyframes psp-slideOut {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(-100%); opacity: 0; }
}
@keyframes psp-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes psp-pop {
  0%   { transform: scale(1) rotate(0deg); }
  35%  { transform: scale(1.16) rotate(-3deg); }
  70%  { transform: scale(0.94) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes psp-bounceIn {
  0%   { transform: translateY(48px) scale(0.88); opacity: 0; }
  55%  { transform: translateY(-8px) scale(1.03); opacity: 1; }
  80%  { transform: translateY(3px) scale(0.99); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes psp-shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(100%); }
}
@keyframes psp-editorEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes shrx-eventlock-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}

/* ═══ Backdrop ═══ */
.psp-backdrop {
  position: fixed; inset: 0;
  background: rgba(27, 42, 65, 0.42);
  z-index: 999;
  animation: psp-fade 0.26s ease;
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
}

/* ═══ Panel ═══ */
.psp-panel {
  position: fixed; top: 0; left: 0; bottom: 0;
  z-index: 1000;
  width: 480px; max-width: 100vw;
  display: flex; flex-direction: column;
  overflow-y: auto; overflow-x: hidden;
  animation: psp-slideIn 0.42s cubic-bezier(0.16, 1, 0.3, 1);
  scrollbar-width: thin;
  background: var(--psp-bg, #F5EBFF);
  border-radius: 0 40px 40px 0;
  isolation: isolate;
  transition: background 0.45s ease;
}
.psp-panel::-webkit-scrollbar { width: 8px; }
.psp-panel::-webkit-scrollbar-thumb { background: rgba(27, 42, 65, 0.18); border-radius: 100px; }
.psp-panel.closing { animation: psp-slideOut 0.22s ease forwards; }

.psp-panelBg {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: 480px; max-width: 100vw;
  z-index: -1;
  pointer-events: none;
  border-radius: 0 40px 40px 0;
  background-image: radial-gradient(circle, rgba(27,42,65,0.045) 1px, transparent 1.3px);
  background-size: 18px 18px;
  opacity: 0.75;
}
@media (max-width: 520px) {
  .psp-panel { width: 100vw; border-radius: 0; }
  .psp-panelBg { width: 100vw; border-radius: 0; }
}

/* ═══ External close ═══ */
.psp-extClose {
  position: fixed; top: 50%; left: 480px;
  transform: translate(-50%, -50%);
  width: 52px; height: 52px; border-radius: 50%;
  background: ${PAPER}; border: 2.5px solid ${INK};
  cursor: pointer; z-index: 1001;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 3px 3px 0 ${INK}; color: ${INK};
  transition: transform 0.25s cubic-bezier(.34,1.4,.4,1), box-shadow 0.25s, opacity 0.2s, background 0.2s;
}
.psp-extClose.hidden {
  opacity: 0;
  pointer-events: none;
  transition: none !important;
}
  .psp-extClose:hover { transform: translate(-50%, -50%) scale(1.1) rotate(-4deg); box-shadow: 5px 5px 0 ${INK}; background: ${YELLOW}; }
.psp-extClose:active { transform: translate(-50%, -50%) scale(0.94); box-shadow: 2px 2px 0 ${INK}; }
@media (max-width: 520px) {
  .psp-extClose { left: auto; right: 14px; top: 14px; transform: none; }
  .psp-extClose:hover { transform: scale(1.1) rotate(-4deg); }
  .psp-extClose:active { transform: scale(0.94); }
}

.psp-root button:focus-visible,
.psp-root input:focus-visible {
  outline: 3px solid ${BLUE};
  outline-offset: 3px;
}

/* ═══ TOP TOOLBAR ═══ */
.psp-toolbar {
  position: relative;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 18px 20px 6px;
  flex-shrink: 0;
}
.psp-tools {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px;
  background: ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 999px;
  box-shadow: 3px 3px 0 ${INK};
}
.psp-tool {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: transparent;
  color: ${INK};
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.28s cubic-bezier(.34,1.4,.4,1);
  flex-shrink: 0;
}
.psp-tool:hover {
  background: ${YELLOW};
  border-color: ${INK};
  transform: translate(-2px, -2px) rotate(-8deg);
  box-shadow: 2px 2px 0 ${INK};
}
.psp-tool:active { transform: translate(0, 0); box-shadow: none; }
.psp-tool.danger:hover { background: ${CORAL}; }
.psp-tool.active {
  background: ${YELLOW};
  border-color: ${INK};
  box-shadow: 2px 2px 0 ${INK};
  transform: translate(-1px, -1px);
}
.psp-tool-divider {
  width: 2px; height: 22px;
  background: rgba(27, 42, 65, 0.18);
  border-radius: 100px;
  margin: 0 2px;
}

/* ═══ HERO — compact ═══ */
.psp-hero {
  position: relative; z-index: 2;
  min-height: 320px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 20px 28px 18px;
  text-align: center; overflow: hidden; flex-shrink: 0;
}
.psp-avatarWrap { position: relative; z-index: 3; line-height: 0; }
.psp-nameBlock {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  margin-top: 12px;
  animation: psp-fade 0.5s 0.2s both ease;
}
.psp-title {
  font-size: 26px; font-weight: 900; letter-spacing: -0.6px;
  margin: 0; color: var(--ink);
  text-shadow: 3px 3px 0 ${YELLOW};
  transform: rotate(-0.8deg);
}
.psp-sub {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px;
  background: ${PAPER};
  border: 2px solid ${INK};
  border-radius: 999px;
  box-shadow: 1.5px 1.5px 0 ${INK};
  font-size: 11px; font-weight: 800;
  color: var(--ink);
}
.psp-sub svg { color: ${INK}; width: 12px; height: 12px; }

/* ═══ EDITOR ═══ */
.psp-editor {
  position: relative; z-index: 10;
  display: flex; flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 0 0 20px;
  animation: psp-editorEnter 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}

.psp-edTop {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 10px;
  padding: 0 20px 4px;
  flex-shrink: 0;
}

.psp-edAction {
  width: 48px; height: 48px; border-radius: 50%;
  border: 2.5px solid var(--ink); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.28s cubic-bezier(.34,1.4,.4,1), box-shadow 0.28s, background 0.2s;
  flex-shrink: 0;
  color: ${INK};
}
.psp-edAction.x {
  background: ${CORAL};
  box-shadow: 3px 3px 0 var(--ink);
}
.psp-edAction.x:hover {
  transform: translate(-3px, -3px) rotate(-8deg) scale(1.05);
  box-shadow: 5px 5px 0 var(--ink);
}
.psp-edAction.x:active { transform: translate(0, 0); box-shadow: 2px 2px 0 var(--ink); }
.psp-edAction.ok {
  background: ${BLUE};
  color: #fff;
  box-shadow: 3px 3px 0 var(--ink);
}
.psp-edAction.ok:hover {
  transform: translate(-3px, -3px) rotate(8deg) scale(1.05);
  box-shadow: 5px 5px 0 var(--ink);
  background: #1D6FD9;
}
.psp-edAction.ok:active { transform: translate(0, 0); box-shadow: 2px 2px 0 var(--ink); }

.psp-edBody {
  flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 24px 12px;
}

.psp-stage {
  position: relative;
  width: 220px;
  height: 220px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.psp-stage .psp-avatarWrap {
  position: relative;
  z-index: 3;
}

.psp-unameBlock {
  width: min(360px, 100%);
  margin-top: 14px;
  display: flex; flex-direction: column; align-items: center;
  animation: psp-fade 0.5s 0.15s ease both;
}
.psp-unameLabel {
  font-size: 10px; font-weight: 900; letter-spacing: 3.5px;
  opacity: 0.7;
  text-transform: uppercase; color: var(--ink);
}
.psp-unameField {
  margin-top: 8px;
  width: 100%; height: 48px;
  border-radius: 24px;
  background: ${PAPER};
  border: 2.5px solid var(--ink);
  display: flex; align-items: center;
  padding: 0 18px; gap: 10px;
  box-shadow: 3px 3px 0 var(--ink);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.psp-unameField:focus-within {
  box-shadow: 3px 3px 0 ${BLUE}, 0 0 0 4px rgba(46,127,232,0.25);
  transform: translate(-1px, -1px);
}
.psp-unameInput {
  flex: 1; border: none; background: transparent; outline: none;
  font: 800 15px/1 var(--font-comfortaa), 'Comfortaa', sans-serif;
  color: var(--ink);
  text-align: center;
}
.psp-unameInput:focus-visible { outline: none; }
.psp-unameInput::placeholder { color: rgba(27,42,65,0.35); }
.psp-unameInput:disabled { opacity: 0.5; cursor: not-allowed; }
.psp-lockNote {
  font-size: 11px; font-weight: 700; opacity: 0.65;
  margin-top: 8px; color: var(--ink);
}

/* ═══ BOTTOM SHEET ═══ */
.psp-sheet {
  background: ${PAPER};
  border-top: 2.5px solid var(--ink);
  border-radius: 32px 32px 0 0;
  padding: 6px 0 20px;
  box-shadow: 0 -6px 24px rgba(27,42,65,0.10);
  flex-shrink: 0;
  position: relative; z-index: 2;
  margin-top: auto;
}
.psp-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 6px 14px 8px;
  gap: 8px;
  border-bottom: 1.8px dashed rgba(27,42,65,0.18);
}
.psp-tab {
  background: ${PAPER};
  border: 2px solid rgba(27,42,65,0.16);
  cursor: pointer;
  padding: 10px 0;
  min-height: 42px;
  border-radius: 14px;
  font: 800 12.5px var(--font-comfortaa), 'Comfortaa', sans-serif;
  color: #5A6B82;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: all 0.28s cubic-bezier(.34,1.4,.4,1);
}
.psp-tab:hover {
  color: ${INK};
  border-color: ${INK};
  transform: translate(-1px, -1px);
  box-shadow: 2px 2px 0 rgba(27,42,65,0.20);
}
.psp-tab.active {
  color: ${INK};
  background: ${YELLOW};
  border-color: ${INK};
  box-shadow: 2px 2px 0 ${INK};
  transform: translate(-1px, -1px);
}

.psp-tabPanel {
  padding: 18px 20px 4px;
  min-height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.psp-pickBtn {
  position: relative;
  background: ${PAPER};
  border: 2.5px solid ${INK};
  cursor: pointer;
  padding: 10px;
  min-width: 52px; min-height: 52px;
  border-radius: 18px;
  transition: transform 0.28s cubic-bezier(.34,1.4,.4,1), box-shadow 0.28s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 0 ${INK};
  color: ${INK};
}
.psp-pickBtn:hover {
  transform: translate3d(-3px, -3px, 0) rotate(-4deg);
  box-shadow: 4px 4px 0 ${INK};
  background: ${YELLOW};
}
.psp-pickBtn:active { transform: translate3d(0,0,0); box-shadow: 2px 2px 0 ${INK}; }
.psp-pickBtn.active {
  background: ${BLUE};
  color: #fff;
  box-shadow: 3px 3px 0 ${INK};
  transform: translate3d(-2px, -2px, 0) rotate(-2deg);
}
.psp-pickBtn.active::after {
  content: '';
  position: absolute;
  top: -8px; right: -8px;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: ${MINT};
  border: 2.5px solid ${INK};
  box-shadow: 1.5px 1.5px 0 ${INK};
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231B2A41' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'><polyline points='5 12 10 17 19 7'/></svg>");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 12px;
  animation: psp-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.psp-colorDot {
  width: 48px; height: 48px;
  border-radius: 50%;
  border: 2.5px solid var(--ink);
  cursor: pointer;
  transition: transform 0.28s cubic-bezier(.34,1.4,.4,1), box-shadow 0.28s;
  box-shadow: 2px 2px 0 var(--ink);
  position: relative;
}
.psp-colorDot:hover {
  transform: translate3d(-3px, -3px, 0) rotate(-8deg);
  box-shadow: 4px 4px 0 var(--ink);
}
.psp-colorDot.active {
  box-shadow: 0 0 0 3px ${BLUE}, 3px 3px 0 var(--ink);
  transform: translate3d(-2px, -2px, 0) scale(1.08);
}
.psp-colorDot.active::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='5 12 10 17 19 7'/></svg>");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 22px;
  filter: drop-shadow(1.5px 1.5px 0 ${INK}) drop-shadow(-1px -1px 0 ${INK}) drop-shadow(1px -1px 0 ${INK}) drop-shadow(-1px 1px 0 ${INK});
  animation: psp-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ═══ REWARDS SECTION ═══ */
.psp-rewardsSection { position: relative; z-index: 5; width: 100%; padding: 0 20px 40px; }
.shrx-rw { display: flex; flex-direction: column; gap: 16px; }

/* ═══ EVENT-LOCK NOTICE ═══ */
.shrx-rw-eventlock {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  background:
    radial-gradient(circle at 100% 0%, rgba(46, 127, 232, 0.14), transparent 55%),
    radial-gradient(circle at 0% 100%, rgba(199, 180, 255, 0.16), transparent 55%),
    ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 22px 26px 20px 24px / 24px 20px 26px 22px;
  box-shadow: 4px 4px 0 ${INK};
  overflow: hidden;
}
.shrx-rw-eventlock-ic {
  position: relative;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  background: ${YELLOW};
  color: ${INK};
  border: 2.5px solid ${INK};
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 2px 2px 0 ${INK};
  flex-shrink: 0;
  animation: shrx-eventlock-pulse 3.2s ease-in-out infinite;
}
.shrx-rw-eventlock-ic svg {
  width: 20px;
  height: 20px;
}
.shrx-rw-eventlock-body {
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.shrx-rw-eventlock-eyebrow {
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #5A6B82;
}
.shrx-rw-eventlock-title {
  font-size: 13.5px;
  font-weight: 900;
  color: ${INK};
  letter-spacing: -0.2px;
  line-height: 1.3;
}
.shrx-rw-eventlock-text {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.55;
  color: #5A6B82;
}
.shrx-rw-eventlock-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 6px;
  margin-top: 6px;
  padding: 5px 11px;
  background: ${INK};
  color: #fff;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  box-shadow: 2px 2px 0 ${YELLOW};
}

.shrx-rw-hero {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 22px 20px;
  background:
    radial-gradient(circle at 88% 20%, rgba(255, 180, 212, 0.45), transparent 42%),
    radial-gradient(circle at 6% 100%, rgba(255, 217, 102, 0.40), transparent 46%),
    linear-gradient(135deg, #FFFDF7 0%, #FFF6D9 100%);
  border: 2.5px solid ${INK};
  border-radius: 24px 20px 26px 22px / 22px 24px 20px 26px;
  box-shadow: 5px 5px 0 ${INK};
  overflow: hidden;
}
.shrx-rw-hero::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(27, 42, 65, 0.05) 1px, transparent 1.3px);
  background-size: 16px 16px;
  opacity: 0.6; pointer-events: none;
}
.shrx-rw-hero-left { position: relative; z-index: 1; min-width: 0; }
.shrx-rw-eyebrow {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 12px 5px 9px;
  background: ${INK}; color: #fff;
  border-radius: 999px;
  font-size: 9.5px; font-weight: 900; letter-spacing: 0.16em;
  text-transform: uppercase;
  box-shadow: 2px 2px 0 ${CORAL};
}
.shrx-rw-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: ${MINT};
}
.shrx-rw-balance {
  display: flex; align-items: baseline; gap: 4px;
  margin-top: 14px; line-height: 1;
}
.shrx-rw-balance-cur { font-size: 24px; font-weight: 900; color: ${INK}; }
.shrx-rw-balance-num {
  font-size: 42px; font-weight: 900; color: ${INK};
  letter-spacing: -2px; line-height: 0.95;
}
.shrx-rw-balance-label {
  margin: 8px 0 0; font-size: 11.5px; font-weight: 700;
  color: #5A6B82;
}
.shrx-rw-hero-coin {
  position: relative; z-index: 1;
  width: 74px; height: 74px;
  display: grid; place-items: center;
  background: ${YELLOW}; color: ${INK};
  border: 2.5px solid ${INK};
  border-radius: 22px 18px 24px 20px / 20px 22px 18px 24px;
  box-shadow: 4px 4px 0 ${INK};
  transform: rotate(-6deg);
  flex-shrink: 0;
}
.shrx-rw-hero-coin svg { width: 38px; height: 38px; }
.shrx-rw-last {
  position: absolute;
  top: 12px; right: 12px;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px 5px 6px;
  background: ${MINT}; color: ${INK};
  border: 2px solid ${INK}; border-radius: 999px;
  box-shadow: 2px 2px 0 ${INK};
  font-size: 11px; font-weight: 900;
  transform: rotate(3deg);
  z-index: 3;
}
.shrx-rw-last-ic {
  width: 18px; height: 18px;
  display: grid; place-items: center;
}
.shrx-rw-last-ic svg { width: 14px; height: 14px; }

.shrx-rw-progress-card {
  position: relative;
  padding: 18px 18px 20px;
  background:
    radial-gradient(circle at 100% 0%, rgba(199, 180, 255, 0.28), transparent 46%),
    ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 22px 26px 20px 24px / 24px 20px 26px 22px;
  box-shadow: 4px 4px 0 ${INK};
}
.shrx-rw-progress-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; margin-bottom: 14px;
}
.shrx-rw-progress-title {
  display: inline-flex; align-items: center; gap: 9px;
  font-size: 13px; font-weight: 800; color: ${INK};
}
.shrx-rw-progress-title-ic {
  width: 26px; height: 26px;
  display: grid; place-items: center;
  background: #C7B4FF; color: ${INK};
  border: 2px solid ${INK};
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 1.5px 1.5px 0 ${INK};
  flex-shrink: 0;
}
.shrx-rw-progress-title-ic svg { width: 14px; height: 14px; }
.shrx-rw-progress-pill {
  padding: 4px 11px;
  background: ${YELLOW};
  border: 2px solid ${INK}; border-radius: 999px;
  box-shadow: 1.5px 1.5px 0 ${INK};
  font-size: 10.5px; font-weight: 900;
  letter-spacing: 0.04em; white-space: nowrap;
}
.shrx-rw-progress-track {
  position: relative; height: 14px;
  background: #FFFDF7;
  border: 2px solid ${INK};
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 2px 0 rgba(27, 42, 65, 0.08);
}
.shrx-rw-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, ${CORAL} 0%, ${YELLOW} 60%, ${MINT} 100%);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.34, 1.4, 0.4, 1);
  min-width: 2px;
  position: relative;
  overflow: hidden;
}
.shrx-rw-progress-fill::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
  animation: psp-shimmer 2.4s ease-in-out infinite;
}
.shrx-rw-progress-hint {
  margin: 12px 0 0;
  font-size: 11.5px; font-weight: 600;
  line-height: 1.55; color: #5A6B82;
}

.shrx-rw-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.shrx-rw-stat {
  position: relative;
  display: flex; flex-direction: column;
  align-items: flex-start; gap: 6px;
  padding: 12px 12px 14px;
  background: ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 18px 22px 16px 20px / 20px 18px 22px 16px;
  box-shadow: 3px 3px 0 ${INK};
  min-width: 0;
}
.shrx-rw-stat-y { background: #FFF6D9; }
.shrx-rw-stat-m { background: #E2F8EF; }
.shrx-rw-stat-c { background: #FFE9E4; }
.shrx-rw-stat-ic {
  width: 30px; height: 30px;
  display: grid; place-items: center;
  border: 2px solid ${INK};
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 1.5px 1.5px 0 ${INK};
  flex-shrink: 0;
}
.shrx-rw-stat-y .shrx-rw-stat-ic { background: ${YELLOW}; }
.shrx-rw-stat-m .shrx-rw-stat-ic { background: ${MINT}; }
.shrx-rw-stat-c .shrx-rw-stat-ic { background: ${CORAL}; color: #fff; }
.shrx-rw-stat-ic svg { width: 15px; height: 15px; }
.shrx-rw-stat-val {
  font-size: 16px; font-weight: 900; color: ${INK};
  letter-spacing: -0.5px; line-height: 1.1;
  word-break: break-all;
}
.shrx-rw-stat-lbl {
  font-size: 9.5px; font-weight: 800;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #5A6B82; line-height: 1.3;
}

.shrx-rw-card {
  position: relative;
  background: ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 22px 26px 20px 24px / 24px 20px 26px 22px;
  box-shadow: 4px 4px 0 ${INK};
  padding: 18px 18px 20px;
}
.shrx-rw-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; margin-bottom: 14px;
}
.shrx-rw-head-title {
  display: inline-flex; align-items: center; gap: 10px;
  margin: 0; font-size: 14px; font-weight: 900;
  letter-spacing: -0.2px; color: ${INK};
}
.shrx-rw-head-title-ic {
  width: 28px; height: 28px;
  display: grid; place-items: center;
  border: 2px solid ${INK};
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 1.5px 1.5px 0 ${INK};
  flex-shrink: 0;
}
.shrx-rw-head-title-ic svg { width: 14px; height: 14px; }
.shrx-rw-head-title-ic-y { background: ${YELLOW}; }
.shrx-rw-head-title-ic-m { background: ${MINT}; }
.shrx-rw-head-count {
  padding: 3px 10px;
  background: #F0E9FF;
  border: 2px solid ${INK}; border-radius: 999px;
  box-shadow: 1.5px 1.5px 0 ${INK};
  font-size: 10px; font-weight: 900;
}
.shrx-rw-head-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  background: #FFE9E4;
  border: 2px solid ${INK}; border-radius: 999px;
  box-shadow: 1.5px 1.5px 0 ${INK};
  font-size: 10px; font-weight: 900;
  white-space: nowrap;
}
.shrx-rw-head-badge svg { width: 11px; height: 11px; }

.shrx-rw-empty {
  display: flex; flex-direction: column;
  align-items: center; gap: 8px;
  padding: 26px 12px; text-align: center;
  border: 2px dashed rgba(27, 42, 65, 0.22);
  border-radius: 18px;
  background: #FFFDF7;
}
.shrx-rw-empty-ic {
  width: 48px; height: 48px;
  display: grid; place-items: center;
  background: ${YELLOW}; color: ${INK};
  border: 2.5px solid ${INK};
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 2px 2px 0 ${INK};
}
.shrx-rw-empty-ic svg { width: 24px; height: 24px; }
.shrx-rw-empty strong {
  font-size: 13px; font-weight: 900; color: ${INK};
}
.shrx-rw-empty p {
  margin: 0; font-size: 11.5px; font-weight: 600; color: #5A6B82;
}

.shrx-rw-history {
  list-style: none; margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.shrx-rw-history-row {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center; gap: 10px;
  padding: 10px 12px;
  background: #FFFDF7;
  border: 2px solid ${INK};
  border-radius: 14px 18px 12px 16px / 16px 14px 18px 12px;
  box-shadow: 2px 2px 0 ${INK};
}
.shrx-rw-history-ic {
  width: 26px; height: 26px;
  display: grid; place-items: center;
  background: ${YELLOW}; color: ${INK};
  border: 2px solid ${INK}; border-radius: 50%;
  flex-shrink: 0;
}
.shrx-rw-history-ic svg { width: 12px; height: 12px; }
.shrx-rw-history-body { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.shrx-rw-history-body strong {
  font-size: 13px; font-weight: 900; color: ${INK};
}
.shrx-rw-history-body small {
  font-size: 10px; font-weight: 600; color: #8A96A8;
}

.shrx-rw-form { display: flex; flex-direction: column; }
.shrx-rw-label {
  margin: 0 0 6px;
  font-size: 10.5px; font-weight: 900;
  letter-spacing: 0.10em; text-transform: uppercase;
  color: #5A6B82;
}
.shrx-rw-label:not(:first-of-type) { margin-top: 14px; }
.shrx-rw-input-wrap {
  position: relative;
  display: flex; align-items: center;
  background: ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 16px 20px 14px 18px / 18px 16px 20px 14px;
  box-shadow: 2px 2px 0 ${INK};
  transition: box-shadow 0.2s ease;
}
.shrx-rw-input-wrap:focus-within {
  box-shadow: 3px 3px 0 ${INK}, 0 0 0 3px rgba(46, 127, 232, 0.30);
}
.shrx-rw-input-prefix {
  padding: 0 8px 0 14px;
  font-size: 15px; font-weight: 900; color: ${INK};
}
.shrx-rw-input {
  flex: 1; min-width: 0;
  padding: 12px 14px 12px 0;
  border: 0; background: transparent;
  font-family: inherit;
  font-size: 14px; font-weight: 800;
  color: ${INK};
  outline: none;
}
.shrx-rw-input-plain {
  padding: 12px 14px;
  background: ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 16px 20px 14px 18px / 18px 16px 20px 14px;
  box-shadow: 2px 2px 0 ${INK};
  transition: box-shadow 0.2s ease;
}
.shrx-rw-input-plain:focus {
  box-shadow: 3px 3px 0 ${INK}, 0 0 0 3px rgba(46, 127, 232, 0.30);
}
.shrx-rw-input::placeholder { color: #9AA5B5; font-weight: 600; }
.shrx-rw-input:disabled,
.shrx-rw-input-plain:disabled { opacity: 0.6; cursor: not-allowed; }

.shrx-rw-method {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: #FFF6D9;
  border: 2.5px solid ${INK};
  border-radius: 16px 20px 14px 18px / 18px 16px 20px 14px;
  box-shadow: 2px 2px 0 ${INK};
}
.shrx-rw-method-pill {
  padding: 3px 10px;
  background: ${INK}; color: #fff;
  border-radius: 999px;
  font-size: 10px; font-weight: 900;
  letter-spacing: 0.08em;
}
.shrx-rw-method-hint {
  font-size: 11px; font-weight: 700; color: #5A6B82;
}

.shrx-rw-submit {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 10px;
  margin-top: 18px;
  padding: 14px 20px;
  background: ${INK}; color: #fff;
  border: 2.5px solid ${INK};
  border-radius: 999px;
  box-shadow: 4px 4px 0 ${YELLOW};
  font-family: inherit;
  font-size: 13.5px; font-weight: 900;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.4, 0.4, 1), box-shadow 0.2s ease;
}
.shrx-rw-submit-ic {
  width: 22px; height: 22px;
  display: grid; place-items: center;
  background: ${YELLOW}; color: ${INK};
  border-radius: 50%;
  flex-shrink: 0;
}
.shrx-rw-submit-ic svg { width: 12px; height: 12px; }
@media (hover: hover) and (pointer: fine) {
  .shrx-rw-submit:hover:not(:disabled) {
    transform: translate3d(-2px, -2px, 0);
    box-shadow: 6px 6px 0 ${YELLOW};
  }
}
.shrx-rw-submit:active:not(:disabled) {
  transform: translate3d(0, 0, 0);
  box-shadow: 2px 2px 0 ${YELLOW};
}
.shrx-rw-submit:disabled {
  opacity: 0.65; cursor: not-allowed;
  box-shadow: 2px 2px 0 ${YELLOW};
}

.shrx-rw-msg {
  margin: 12px 0 0;
  padding: 10px 12px;
  font-size: 11.5px; font-weight: 700;
  border-radius: 12px;
  border: 2px solid ${INK};
  box-shadow: 2px 2px 0 ${INK};
}
.shrx-rw-msg-error {
  background: #FFE9E4;
  color: #F0684F;
}
.shrx-rw-msg-success {
  background: #E2F8EF;
  color: #1E8A62;
}

.shrx-rw-note {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: flex-start; gap: 10px;
  padding: 12px 14px;
  background: #D4E5FF;
  border: 2px solid ${INK};
  border-radius: 16px 20px 14px 18px / 18px 16px 20px 14px;
  box-shadow: 2px 2px 0 ${INK};
}
.shrx-rw-note-ic {
  width: 22px; height: 22px;
  display: grid; place-items: center;
  color: ${BLUE};
  flex-shrink: 0;
}
.shrx-rw-note-ic svg { width: 100%; height: 100%; }
.shrx-rw-note p {
  margin: 0;
  font-size: 10.5px; font-weight: 600;
  line-height: 1.55; color: #2A4A7A;
}

@media (max-width: 400px) {
  .shrx-rw-stats { grid-template-columns: 1fr; }
  .shrx-rw-balance-num { font-size: 36px; }
  .shrx-rw-hero-coin { width: 62px; height: 62px; }
  .shrx-rw-hero-coin svg { width: 32px; height: 32px; }
  .psp-stage { width: 200px; height: 200px; }
}

.psp-modalOverlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(27, 42, 65, 0.45);
  display: flex; align-items: center; justify-content: center;
  animation: psp-fade 0.18s ease;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  padding: 20px;
}
.psp-modal {
  background: ${PAPER};
  border: 2.5px solid ${INK};
  border-radius: 30px;
  padding: 28px 24px 24px;
  width: min(320px, 100%);
  text-align: center;
  animation: psp-bounceIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 5px 5px 0 ${YELLOW}, 5px 5px 0 3px ${INK};
}
.psp-modal h4 { margin: 4px 0 8px; font-size: 20px; font-weight: 900; color: ${INK}; letter-spacing: -0.3px; }
.psp-modal p { margin: 0 0 20px; font-size: 13px; color: #5A6B82; font-weight: 700; line-height: 1.55; }
.psp-modalBtns { display: flex; gap: 10px; }
.psp-modalBtn {
  flex: 1; padding: 13px;
  border: 2.5px solid ${INK}; border-radius: 100px;
  font: 800 14px var(--font-comfortaa), 'Comfortaa', sans-serif;
  cursor: pointer;
  transition: transform 0.16s cubic-bezier(.34,1.4,.4,1), box-shadow 0.16s, background 0.16s;
}
.psp-modalBtn:hover { transform: translate3d(-2px, -2px, 0); box-shadow: 3px 3px 0 ${INK}; }
.psp-modalBtn:active { transform: translate3d(0,0,0); box-shadow: none; }
.psp-modalBtn.cancel { background: ${PAPER}; color: ${INK}; box-shadow: 2px 2px 0 ${INK}; }
.psp-modalBtn.ok { background: ${CORAL}; color: ${INK}; box-shadow: 2px 2px 0 ${INK}; }

@media (prefers-reduced-motion: reduce) {
  .psp-panel, .psp-nameBlock,
  .psp-modal, .psp-editor,
  .shrx-rw-progress-fill::after,
  .shrx-rw-eventlock-ic,
  .psp-pickBtn.active::after, .psp-colorDot.active::after {
    animation: none !important;
    transition: none !important;
  }
}
`;

/* ═══════════════════════════════════════════
   EDITOR
═══════════════════════════════════════════ */
function Editor({ shape, eyes, color, username, locked, onSave, onCancel }) {
  const [s, setS] = useState(shape);
  const [e, setE] = useState(eyes);
  const [c, setC] = useState(color);
  const [n, setN] = useState(username);
  const [tab, setTab] = useState("body");

  return (
    <div className="psp-editor">
      <div className="psp-edTop">
        <button
          type="button"
          className="psp-edAction x"
          onClick={onCancel}
          aria-label="Cancel"
          title="Cancel"
        >
          <I.X />
        </button>
        <button
          type="button"
          className="psp-edAction ok"
          onClick={() => onSave({ shape: s, eyes: e, color: c, name: n })}
          aria-label="Save"
          title="Save changes"
        >
          <I.Check />
        </button>
      </div>

      <div className="psp-edBody">
        <div className="psp-stage">
          <div className="psp-avatarWrap">
            <SharxAvatar shape={s} eyes={e} color={c} size={180} interactive />
          </div>
        </div>

        <div className="psp-unameBlock">
          <div className="psp-unameLabel">Username</div>
          <div className="psp-unameField">
            <input
              className="psp-unameInput"
              value={n}
              onChange={(ev) => setN(ev.target.value)}
              disabled={locked}
              maxLength={16}
              placeholder="Your name"
              autoComplete="off"
              aria-label="Username"
            />
            {locked && <I.Lock />}
          </div>
          {locked && (
            <div className="psp-lockNote">
              Can be changed once every 30 days
            </div>
          )}
        </div>
      </div>

      <div className="psp-sheet">
        <div className="psp-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "body"}
            className={`psp-tab ${tab === "body" ? "active" : ""}`}
            onClick={() => setTab("body")}
          >
            <I.Body /> Body
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "eyes"}
            className={`psp-tab ${tab === "eyes" ? "active" : ""}`}
            onClick={() => setTab("eyes")}
          >
            <I.EyeTab /> Eyes
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "color"}
            className={`psp-tab ${tab === "color" ? "active" : ""}`}
            onClick={() => setTab("color")}
          >
            <I.Palette /> Color
          </button>
        </div>

        <div className="psp-tabPanel">
          {tab === "body" &&
            SHAPES.map((sh) => (
              <button
                key={sh}
                type="button"
                className={`psp-pickBtn ${s === sh ? "active" : ""}`}
                onClick={() => setS(sh)}
                aria-label={SHAPE_LABELS[sh]}
                aria-pressed={s === sh}
                title={SHAPE_LABELS[sh]}
              >
                <svg width="26" height="26" viewBox="0 0 30 30" aria-hidden="true">
                  <ShapeIcon shape={sh} size={30} />
                </svg>
              </button>
            ))}

          {tab === "eyes" &&
            EYES.map((ek) => (
              <button
                key={ek}
                type="button"
                className={`psp-pickBtn ${e === ek ? "active" : ""}`}
                onClick={() => setE(ek)}
                aria-label={EYE_LABELS[ek]}
                aria-pressed={e === ek}
                title={EYE_LABELS[ek]}
              >
                <svg width="24" height="24" viewBox="0 0 28 28" aria-hidden="true">
                  <EyeIcon kind={ek} size={28} />
                </svg>
              </button>
            ))}

          {tab === "color" &&
            COLORS.map((col) => (
              <button
                key={col}
                type="button"
                className={`psp-colorDot ${c === col ? "active" : ""}`}
                style={{ background: col }}
                onClick={() => setC(col)}
                aria-label={`Color ${col}`}
                aria-pressed={c === col}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DEFAULT PROFILE
═══════════════════════════════════════════ */
const DEFAULT_PROFILE = {
  stylishUsername: "Your account",
  avatarShape: "circle",
  avatarEyes: "oval",
  avatarColor: "#C7B4FF",
  loginMethod: "Google",
  usernameChangedAt: null,
};

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function ProfileSidePanel({
  onClose,
  profile: propProfile,
  onUpdateProfile,
  onLogout,
}) {
  const [local, setLocal] = useState(propProfile || DEFAULT_PROFILE);
  const [closing, setClosing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [cheerAt, setCheerAt] = useState(0);

  const panelRef = useRef(null);

  useEffect(() => {
    if (propProfile && !showEditor) setLocal(propProfile);
  }, [propProfile, showEditor]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose?.(), 220);
  }, [onClose]);

  useEffect(() => {
    const h = (ev) => {
      if (showEditor) return;
      if (panelRef.current && !panelRef.current.contains(ev.target)) handleClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [handleClose, showEditor]);

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key !== "Escape") return;
      if (showLogout) setShowLogout(false);
      else if (showEditor) setShowEditor(false);
      else handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showEditor, showLogout, handleClose]);

  const locked =
    !!local.usernameChangedAt &&
    Date.now() - new Date(local.usernameChangedAt).getTime() < USERNAME_LOCK_MS;

  const cfg = COLOR_CONFIG[local.avatarColor] || COLOR_CONFIG["#FFD966"];

  const handleSave = (v) => {
    const nameChanged = v.name && v.name !== local.stylishUsername;
    const updated = {
      ...local,
      avatarShape: v.shape,
      avatarEyes: v.eyes,
      avatarColor: v.color,
      stylishUsername: v.name || local.stylishUsername,
      ...(nameChanged ? { usernameChangedAt: new Date().toISOString() } : {}),
    };
    setLocal(updated);
    onUpdateProfile?.(updated);
    setShowEditor(false);
    setCheerAt(Date.now());
  };

  const handleLogout = () => {
    setShowLogout(false);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
    } catch {}
    handleClose();
    setTimeout(() => {
      if (onLogout) onLogout();
      else window.location.reload();
    }, 250);
  };

  return (
    <div className="psp-root">
      <style>{STYLES}</style>
      <div className="psp-backdrop" />

      <div
        ref={panelRef}
        className={`psp-panel ${closing ? "closing" : ""}`}
        style={{ "--psp-bg": cfg.bg }}
      >
        <div className="psp-panelBg" />

        <div className="psp-toolbar">
          <div className="psp-tools">
            <button
              type="button"
              className={`psp-tool ${showEditor ? "active" : ""}`}
              onClick={() => setShowEditor((v) => !v)}
              aria-label={showEditor ? "Close editor" : "Edit avatar"}
              title={showEditor ? "Close editor" : "Edit avatar"}
            >
              <I.Pen />
            </button>
            <span className="psp-tool-divider" aria-hidden="true" />
            <button
              type="button"
              className="psp-tool danger"
              onClick={() => setShowLogout(true)}
              aria-label="Sign out"
              title="Sign out"
            >
              <I.Logout />
            </button>
          </div>
        </div>

        {!showEditor && (
          <>
            <div className="psp-hero">
              <div className="psp-avatarWrap">
                <SharxAvatar
                  shape={local.avatarShape}
                  eyes={local.avatarEyes}
                  color={local.avatarColor}
                  size={180}
                  interactive
                  cheer={cheerAt}
                />
              </div>
              <div className="psp-nameBlock">
                <h2 className="psp-title">{local.stylishUsername}</h2>
                <p className="psp-sub">
                  <I.Spark />
                  Logged in with {local.loginMethod || "Google"}
                </p>
              </div>
            </div>

            <div className="psp-rewardsSection">
              <RewardSection />
            </div>
          </>
        )}

        {showEditor && (
          <Editor
            shape={local.avatarShape}
            eyes={local.avatarEyes}
            color={local.avatarColor}
            username={local.stylishUsername}
            locked={locked}
            onSave={handleSave}
            onCancel={() => setShowEditor(false)}
          />
        )}
      </div>

      <button
        type="button"
        className={`psp-extClose ${
          showEditor || closing ? "hidden" : ""
        }`}
        onClick={handleClose}
        aria-label="Close panel"
        tabIndex={showEditor ? -1 : 0}
      >
        <I.ChevL />
      </button>

      {showLogout && (
        <div className="psp-modalOverlay" onClick={() => setShowLogout(false)}>
          <div className="psp-modal" onClick={(ev) => ev.stopPropagation()}>
            <h4>Sign out?</h4>
            <p>You'll need to log back in to access your profile.</p>
            <div className="psp-modalBtns">
              <button
                type="button"
                className="psp-modalBtn cancel"
                onClick={() => setShowLogout(false)}
              >
                Stay
              </button>
              <button
                type="button"
                className="psp-modalBtn ok"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PROFILE BUTTON
═══════════════════════════════════════════ */
export function ProfileButton({ profile, onClick }) {
  if (!profile) return null;
  const cfg = COLOR_CONFIG[profile.avatarColor] || COLOR_CONFIG["#FFD966"];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 46,
        height: 46,
        borderRadius: "50%",
        border: `2.5px solid ${INK}`,
        cursor: "pointer",
        background: cfg.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `2px 2px 0 ${INK}`,
        padding: 0,
        overflow: "hidden",
        transition: "transform 0.2s cubic-bezier(.34,1.4,.4,1), box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translate(-2px, -2px) rotate(-4deg)";
        e.currentTarget.style.boxShadow = `3px 3px 0 ${INK}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translate(0, 0)";
        e.currentTarget.style.boxShadow = `2px 2px 0 ${INK}`;
      }}
      aria-label="Open profile"
    >
      <AvatarSVG
        shape={profile.avatarShape}
        eyes={profile.avatarEyes}
        color={profile.avatarColor}
        size={38}
        flat
      />
    </button>
  );
}