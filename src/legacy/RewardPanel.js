"use client";

import React, { useState } from "react";
import { createWithdrawal } from "../lib/rewardClient";
import { useRewards } from "../context/RewardContext";

/* ═══════════════════════════════════════════
   ICONS
═══════════════════════════════════════════ */
const CoinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M15 9.5c-.6-1-1.6-1.5-3-1.5-1.7 0-2.8.9-2.8 2.2 0 1.6 1.4 2.1 3 2.5 1.9.5 3.1 1 3.1 2.5 0 1.4-1.3 2.3-3.1 2.3-1.6 0-2.7-.6-3.3-1.7" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const WalletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1H5" />
    <rect x="3" y="7" width="18" height="12" rx="3" />
    <circle cx="17" cy="13" r="1.2" fill="currentColor" />
  </svg>
);

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 12v9H4v-9" />
    <rect x="2.5" y="8.5" width="19" height="3.5" rx="0.8" />
    <path d="M12 8.5V21" />
    <path d="M12 8.5H7.8A2.3 2.3 0 0 1 5.5 6.2 2.2 2.2 0 0 1 7.7 4C10 4 12 6 12 8.5Z" />
    <path d="M12 8.5h4.2a2.3 2.3 0 0 0 2.3-2.3A2.2 2.2 0 0 0 16.3 4C14 4 12 6 12 8.5Z" />
  </svg>
);

const SparkIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5 13.9 9l6.6 1.7-6.6 1.7L12 19l-1.9-6.6L3.5 10.7l6.6-1.7L12 2.5Z" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v.01M12 12v5" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <circle cx="12" cy="16" r="1.2" fill="currentColor" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5 3.5 3.5 0 0 0 6.5 11" />
    <path d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5 3.5 3.5 0 0 1 17.5 11" />
    <path d="M12 13v4M9 20h6M10 17h4" />
  </svg>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function RewardPanel() {
  const {
    wallet,
    activeSession,
    history,
    lastReward,
    refreshRewards,
  } = useRewards();

  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");

  const [withdrawalState, setWithdrawalState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const qualifiedSeconds = activeSession?.qualifiedSeconds || 0;

  const hasEarnedTimeReward =
    Number(wallet?.lifetimeEarnedRupees || 0) > 0;

  const secondsIntoFirstHour = Math.min(qualifiedSeconds, 3600);
  const progress = (secondsIntoFirstHour / 3600) * 100;
  const qualifiedMinutes = Math.floor(qualifiedSeconds / 60);
  const remainingFirstHourSeconds = Math.max(3600 - qualifiedSeconds, 0);

  async function handleWithdraw(event) {
    event.preventDefault();

    const numericAmount = Number(amount);
    const upiId = destination.trim();

    setWithdrawalState({ loading: false, error: "", success: "" });

    if (!Number.isFinite(numericAmount) || numericAmount < 10) {
      setWithdrawalState({
        loading: false,
        error: "Minimum withdrawal amount is ₹10.",
        success: "",
      });
      return;
    }

    if (numericAmount > 10000) {
      setWithdrawalState({
        loading: false,
        error: "Maximum withdrawal amount is ₹10,000.",
        success: "",
      });
      return;
    }

    if (!upiId) {
      setWithdrawalState({
        loading: false,
        error: "Enter your UPI ID.",
        success: "",
      });
      return;
    }

    const upiPattern = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/;

    if (!upiPattern.test(upiId)) {
      setWithdrawalState({
        loading: false,
        error: "Enter a valid UPI ID.",
        success: "",
      });
      return;
    }

    if (Number(wallet?.balanceRupees || 0) < numericAmount) {
      setWithdrawalState({
        loading: false,
        error: "Insufficient reward balance.",
        success: "",
      });
      return;
    }

    setWithdrawalState({ loading: true, error: "", success: "" });

    try {
      const result = await createWithdrawal({
        amountRupees: numericAmount,
        method: "upi",
        destination: upiId,
      });

      const withdrawalId = result?.withdrawal?.id;

      setWithdrawalState({
        loading: false,
        error: "",
        success: withdrawalId
          ? `Withdrawal request created: ${withdrawalId}`
          : "Withdrawal request created successfully.",
      });

      setAmount("");
      setDestination("");
      await refreshRewards();
    } catch (error) {
      setWithdrawalState({
        loading: false,
        error: error?.message || "Withdrawal request failed.",
        success: "",
      });
    }
  }

  return (
    <>
      <style>{STYLES}</style>

      <section className="shrx-rp">
        {/* ═══════ HERO — balance card ═══════ */}
        <div className="shrx-rp-hero">
          <span className="shrx-rp-hero-glow" aria-hidden="true" />

          <div className="shrx-rp-hero-left">
            <span className="shrx-rp-eyebrow">
              <span className="shrx-rp-eyebrow-dot" />
              SHARX REWARDS
            </span>

            <div className="shrx-rp-balance">
              <span className="shrx-rp-balance-cur">₹</span>
              <span className="shrx-rp-balance-num">
                {wallet?.balanceRupees ?? 0}
              </span>
            </div>

            <p className="shrx-rp-balance-label">
              Available reward balance
            </p>
          </div>

          <div className="shrx-rp-hero-coin">
            <CoinIcon />
          </div>

          {lastReward && (
            <div className="shrx-rp-last">
              <span className="shrx-rp-last-ic"><GiftIcon /></span>
              <span className="shrx-rp-last-txt">
                +₹{lastReward.amountRupees}
              </span>
            </div>
          )}
        </div>

        {/* ═══════ PROGRESS CARD ═══════ */}
        <div className="shrx-rp-card shrx-rp-progress-card">
          <div className="shrx-rp-progress-head">
            <span className="shrx-rp-progress-title">
              <span className="shrx-rp-progress-title-ic"><ClockIcon /></span>
              Play progress
            </span>

            <span className="shrx-rp-progress-pill">
              {qualifiedMinutes} min
            </span>
          </div>

          <div className="shrx-rp-progress-track">
            <div
              className="shrx-rp-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="shrx-rp-progress-note">
            {activeSession
              ? hasEarnedTimeReward
                ? "Your one-time play reward has already been claimed."
                : remainingFirstHourSeconds > 0
                  ? `${Math.ceil(remainingFirstHourSeconds / 60)} min until your first play reward`
                  : "Your first play reward is ready to be claimed."
              : hasEarnedTimeReward
                ? "Your one-time play reward has already been claimed."
                : "Start a game to begin qualified play tracking."}
          </p>
        </div>

        {/* ═══════ STATS ═══════ */}
        <div className="shrx-rp-stats">
          <div className="shrx-rp-stat shrx-rp-stat-y">
            <span className="shrx-rp-stat-ic"><TrophyIcon /></span>
            <strong className="shrx-rp-stat-val">
              ₹{wallet?.lifetimeEarnedRupees ?? 0}
            </strong>
            <span className="shrx-rp-stat-lbl">Total earned</span>
          </div>

          <div className="shrx-rp-stat shrx-rp-stat-m">
            <span className="shrx-rp-stat-ic"><ClockIcon /></span>
            <strong className="shrx-rp-stat-val">
              {Math.floor(qualifiedSeconds / 3600)}h
            </strong>
            <span className="shrx-rp-stat-lbl">Session</span>
          </div>

          <div className="shrx-rp-stat shrx-rp-stat-c">
            <span className="shrx-rp-stat-ic"><WalletIcon /></span>
            <strong className="shrx-rp-stat-val">
              ₹{wallet?.lifetimeWithdrawnRupees ?? 0}
            </strong>
            <span className="shrx-rp-stat-lbl">Withdrawn</span>
          </div>
        </div>

        {/* ═══════ LATEST REWARD NOTICE ═══════ */}
        {lastReward && (
          <div className="shrx-rp-notice">
            <span className="shrx-rp-notice-ic"><SparkIcon /></span>
            <div className="shrx-rp-notice-body">
              <strong>Reward earned!</strong>
              <p>You just earned ₹{lastReward.amountRupees}.</p>
            </div>
          </div>
        )}

        {/* ═══════ HISTORY ═══════ */}
        <div className="shrx-rp-card">
          <div className="shrx-rp-head">
            <h3 className="shrx-rp-head-title">
              <span className="shrx-rp-head-title-ic shrx-rp-head-title-ic-y">
                <SparkIcon />
              </span>
              Reward history
            </h3>
            {history.length > 0 && (
              <span className="shrx-rp-head-count">
                {history.length}
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="shrx-rp-empty">
              <span className="shrx-rp-empty-ic"><GiftIcon /></span>
              <strong>No rewards yet</strong>
              <p>Start playing to earn your first reward.</p>
            </div>
          ) : (
            <div className="shrx-rp-history">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="shrx-rp-history-row">
                  <span className="shrx-rp-history-ic">
                    <SparkIcon />
                  </span>
                  <div className="shrx-rp-history-body">
                    <strong>{item.description}</strong>
                    {item.createdAt && (
                      <small>
                        {new Date(item.createdAt).toLocaleString()}
                      </small>
                    )}
                  </div>
                  <strong
                    className={
                      item.amountRupees >= 0
                        ? "shrx-rp-history-amt pos"
                        : "shrx-rp-history-amt neg"
                    }
                  >
                    {item.amountRupees >= 0 ? "+" : ""}₹{item.amountRupees}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════ WITHDRAW FORM ═══════ */}
        <form className="shrx-rp-card shrx-rp-form" onSubmit={handleWithdraw}>
          <div className="shrx-rp-head">
            <h3 className="shrx-rp-head-title">
              <span className="shrx-rp-head-title-ic shrx-rp-head-title-ic-m">
                <SendIcon />
              </span>
              Withdraw rewards
            </h3>
            <span className="shrx-rp-head-badge">
              <LockIcon />
              Min ₹10
            </span>
          </div>

          <label className="shrx-rp-label">Amount in ₹</label>
          <div className="shrx-rp-input-wrap">
            <span className="shrx-rp-input-prefix">₹</span>
            <input
              className="shrx-rp-input"
              type="number"
              min="10"
              max="10000"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10"
              inputMode="numeric"
              disabled={withdrawalState.loading}
            />
          </div>

          <label className="shrx-rp-label">Payout method</label>
          <div className="shrx-rp-method">
            <span className="shrx-rp-method-pill">UPI</span>
            <span className="shrx-rp-method-hint">Instant transfer</span>
          </div>

          <label className="shrx-rp-label">UPI ID</label>
          <input
            className="shrx-rp-input shrx-rp-input-plain"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="yourname@upi"
            autoComplete="off"
            type="text"
            inputMode="email"
            disabled={withdrawalState.loading}
            maxLength={100}
          />

          <button
            type="submit"
            className="shrx-rp-submit"
            disabled={withdrawalState.loading}
          >
            <span className="shrx-rp-submit-ic"><SendIcon /></span>
            <span>
              {withdrawalState.loading
                ? "Submitting..."
                : "Request withdrawal"}
            </span>
          </button>

          {withdrawalState.error && (
            <p className="shrx-rp-msg shrx-rp-msg-error" role="alert">
              {withdrawalState.error}
            </p>
          )}

          {withdrawalState.success && (
            <p className="shrx-rp-msg shrx-rp-msg-success" role="status">
              {withdrawalState.success}
            </p>
          )}
        </form>

        {/* ═══════ PAYOUT NOTE ═══════ */}
        <div className="shrx-rp-note">
          <span className="shrx-rp-note-ic"><InfoIcon /></span>
          <p>
            Withdrawals are processed through the SHARX payout system.
            Creating a withdrawal request does not mean the payout has
            already been completed.
          </p>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const STYLES = `
.shrx-rp {
  --ink: #1B2A41;
  --paper: #FFFFFF;
  --cream: #FFFDF7;
  --yellow: #FFD966;
  --yellow-deep: #F4BE33;
  --yellow-soft: #FFF6D9;
  --coral: #FF8B7B;
  --coral-deep: #F0684F;
  --coral-soft: #FFE9E4;
  --mint: #7BE5B5;
  --mint-deep: #3FCB92;
  --mint-soft: #E2F8EF;
  --blue: #2E7FE8;
  --blue-deep: #1258B8;
  --blue-soft: #D4E5FF;
  --lilac: #C7B4FF;
  --lilac-deep: #9B7EF0;
  --lilac-soft: #F0E9FF;
  --pink: #FFB4D4;
  --pink-soft: #FFECF4;
  font-family: var(--font-comfortaa), 'Comfortaa', system-ui, sans-serif;
  color: var(--ink);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.shrx-rp *, .shrx-rp *::before, .shrx-rp *::after {
  box-sizing: border-box;
}

/* ═══ KEYFRAMES ═══ */
@keyframes shrxRpIn {
  from { opacity: 0; transform: translate3d(0, -18px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes shrxRpShimmer {
  0%   { transform: translateX(-150%) skewX(-20deg); }
  100% { transform: translateX(250%) skewX(-20deg); }
}
@keyframes shrxRpGlow {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50%      { opacity: 0.9; transform: scale(1.08); }
}
@keyframes shrxRpPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.35); opacity: 0.6; }
}
@keyframes shrxRpSparkSpin {
  0%, 100% { transform: rotate(0) scale(1); }
  50%      { transform: rotate(180deg) scale(1.15); }
}

/* ═══ HERO — balance card ═══ */
.shrx-rp-hero {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 24px 22px;
  background:
    radial-gradient(circle at 88% 20%, rgba(255, 180, 212, 0.45), transparent 42%),
    radial-gradient(circle at 6% 100%, rgba(255, 217, 102, 0.40), transparent 46%),
    linear-gradient(135deg, #FFFDF7 0%, #FFF6D9 100%);
  border: 2.5px solid var(--ink);
  border-radius: 24px 20px 26px 22px / 22px 24px 20px 26px;
  box-shadow: 5px 5px 0 var(--ink);
  overflow: hidden;
  animation: shrxRpIn 0.5s cubic-bezier(0.34, 1.4, 0.4, 1) both;
}
.shrx-rp-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(27, 42, 65, 0.05) 1px, transparent 1.3px);
  background-size: 16px 16px;
  opacity: 0.6;
  pointer-events: none;
}
.shrx-rp-hero-glow {
  position: absolute;
  top: 50%;
  right: 40px;
  width: 120px;
  height: 120px;
  margin-top: -60px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 217, 102, 0.55), transparent 70%);
  filter: blur(6px);
  animation: shrxRpGlow 3.5s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
.shrx-rp-hero-left {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.shrx-rp-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px 5px 9px;
  background: var(--ink);
  color: #fff;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  box-shadow: 2px 2px 0 var(--coral);
}
.shrx-rp-eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--mint);
  animation: shrxRpPulse 1.8s ease-in-out infinite;
}

.shrx-rp-balance {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 14px;
  line-height: 1;
}
.shrx-rp-balance-cur {
  font-size: 24px;
  font-weight: 900;
  color: var(--ink);
}
.shrx-rp-balance-num {
  font-size: 42px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -2px;
  line-height: 0.95;
}
.shrx-rp-balance-label {
  margin: 8px 0 0;
  font-size: 11.5px;
  font-weight: 700;
  color: #5A6B82;
}

.shrx-rp-hero-coin {
  position: relative;
  z-index: 1;
  width: 74px;
  height: 74px;
  display: grid;
  place-items: center;
  background: var(--yellow);
  color: var(--ink);
  border: 2.5px solid var(--ink);
  border-radius: 22px 18px 24px 20px / 20px 22px 18px 24px;
  box-shadow: 4px 4px 0 var(--ink);
  transform: rotate(-6deg);
  flex-shrink: 0;
}
.shrx-rp-hero-coin svg { width: 38px; height: 38px; }

.shrx-rp-last {
  position: absolute;
  top: 12px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 6px;
  background: var(--mint);
  color: var(--ink);
  border: 2px solid var(--ink);
  border-radius: 999px;
  box-shadow: 2px 2px 0 var(--ink);
  font-size: 11px;
  font-weight: 900;
  transform: rotate(3deg);
  z-index: 3;
}
.shrx-rp-last-ic {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
}
.shrx-rp-last-ic svg { width: 14px; height: 14px; }

/* ═══ CARD (generic) ═══ */
.shrx-rp-card {
  position: relative;
  background: var(--paper);
  border: 2.5px solid var(--ink);
  border-radius: 22px 26px 20px 24px / 24px 20px 26px 22px;
  box-shadow: 4px 4px 0 var(--ink);
  padding: 18px 18px 20px;
  animation: shrxRpIn 0.5s cubic-bezier(0.34, 1.4, 0.4, 1) both;
  animation-delay: 0.06s;
}

/* ═══ PROGRESS CARD ═══ */
.shrx-rp-progress-card {
  background:
    radial-gradient(circle at 100% 0%, rgba(199, 180, 255, 0.28), transparent 46%),
    var(--paper);
}
.shrx-rp-progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.shrx-rp-progress-title {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
}
.shrx-rp-progress-title-ic {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  background: var(--lilac);
  color: var(--ink);
  border: 2px solid var(--ink);
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 1.5px 1.5px 0 var(--ink);
  flex-shrink: 0;
}
.shrx-rp-progress-title-ic svg { width: 14px; height: 14px; }
.shrx-rp-progress-pill {
  padding: 4px 11px;
  background: var(--yellow);
  border: 2px solid var(--ink);
  border-radius: 999px;
  box-shadow: 1.5px 1.5px 0 var(--ink);
  font-size: 10.5px;
  font-weight: 900;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.shrx-rp-progress-track {
  position: relative;
  height: 14px;
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 2px 0 rgba(27, 42, 65, 0.08);
}
.shrx-rp-progress-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, var(--coral) 0%, var(--yellow) 60%, var(--mint) 100%);
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.34, 1.4, 0.4, 1);
  min-width: 2px;
}
.shrx-rp-progress-fill::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 60px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  animation: shrxRpShimmer 2.5s ease-in-out infinite;
}
.shrx-rp-progress-note {
  margin: 12px 0 0;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.55;
  color: #5A6B82;
}

/* ═══ STATS ═══ */
.shrx-rp-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.shrx-rp-stat {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 12px 12px 14px;
  border: 2.5px solid var(--ink);
  border-radius: 18px 22px 16px 20px / 20px 18px 22px 16px;
  box-shadow: 3px 3px 0 var(--ink);
  min-width: 0;
  animation: shrxRpIn 0.5s cubic-bezier(0.34, 1.4, 0.4, 1) both;
  transition: transform 0.25s cubic-bezier(0.34, 1.4, 0.4, 1);
}
.shrx-rp-stat:nth-child(1) { animation-delay: 0.12s; }
.shrx-rp-stat:nth-child(2) { animation-delay: 0.16s; }
.shrx-rp-stat:nth-child(3) { animation-delay: 0.20s; }
.shrx-rp-stat:hover { transform: translate3d(0, -3px, 0) rotate(-1deg); }

.shrx-rp-stat-y { background: var(--yellow-soft); }
.shrx-rp-stat-m { background: var(--mint-soft); }
.shrx-rp-stat-c { background: var(--coral-soft); }

.shrx-rp-stat-ic {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 2px solid var(--ink);
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 1.5px 1.5px 0 var(--ink);
  flex-shrink: 0;
}
.shrx-rp-stat-y .shrx-rp-stat-ic { background: var(--yellow); }
.shrx-rp-stat-m .shrx-rp-stat-ic { background: var(--mint); }
.shrx-rp-stat-c .shrx-rp-stat-ic { background: var(--coral); color: #fff; }
.shrx-rp-stat-ic svg { width: 15px; height: 15px; }

.shrx-rp-stat-val {
  font-size: 16px;
  font-weight: 900;
  color: var(--ink);
  letter-spacing: -0.5px;
  line-height: 1.1;
  word-break: break-all;
}
.shrx-rp-stat-lbl {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #5A6B82;
  line-height: 1.3;
}

/* ═══ NOTICE ═══ */
.shrx-rp-notice {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 217, 102, 0.55), transparent 55%),
    var(--yellow-soft);
  border: 2.5px solid var(--ink);
  border-radius: 20px 24px 18px 22px / 22px 18px 24px 20px;
  box-shadow: 4px 4px 0 var(--ink);
  animation: shrxRpIn 0.5s cubic-bezier(0.34, 1.4, 0.4, 1) both;
}
.shrx-rp-notice-ic {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  background: var(--yellow);
  color: var(--ink);
  border: 2.5px solid var(--ink);
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 2px 2px 0 var(--ink);
  flex-shrink: 0;
}
.shrx-rp-notice-ic svg { width: 20px; height: 20px; }
.shrx-rp-notice-body strong {
  display: block;
  font-size: 13px;
  font-weight: 900;
  color: var(--ink);
}
.shrx-rp-notice-body p {
  margin: 3px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #5A6B82;
}

/* ═══ SECTION HEAD ═══ */
.shrx-rp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.shrx-rp-head-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.2px;
  color: var(--ink);
}
.shrx-rp-head-title-ic {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 2px solid var(--ink);
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 1.5px 1.5px 0 var(--ink);
  flex-shrink: 0;
}
.shrx-rp-head-title-ic svg { width: 14px; height: 14px; }
.shrx-rp-head-title-ic-y { background: var(--yellow); animation: shrxRpSparkSpin 4s ease-in-out infinite; }
.shrx-rp-head-title-ic-m { background: var(--mint); }

.shrx-rp-head-count {
  padding: 3px 10px;
  background: var(--lilac-soft);
  border: 2px solid var(--ink);
  border-radius: 999px;
  box-shadow: 1.5px 1.5px 0 var(--ink);
  font-size: 10px;
  font-weight: 900;
}
.shrx-rp-head-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--coral-soft);
  border: 2px solid var(--ink);
  border-radius: 999px;
  box-shadow: 1.5px 1.5px 0 var(--ink);
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}
.shrx-rp-head-badge svg { width: 11px; height: 11px; }

/* ═══ EMPTY STATE ═══ */
.shrx-rp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 26px 12px;
  text-align: center;
  border: 2px dashed rgba(27, 42, 65, 0.22);
  border-radius: 18px;
  background: var(--cream);
}
.shrx-rp-empty-ic {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  background: var(--yellow);
  color: var(--ink);
  border: 2.5px solid var(--ink);
  border-radius: 50% 45% 50% 45% / 45% 50% 45% 50%;
  box-shadow: 2px 2px 0 var(--ink);
}
.shrx-rp-empty-ic svg { width: 24px; height: 24px; }
.shrx-rp-empty strong {
  font-size: 13px;
  font-weight: 900;
  color: var(--ink);
}
.shrx-rp-empty p {
  margin: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #5A6B82;
}

/* ═══ HISTORY ═══ */
.shrx-rp-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.shrx-rp-history-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 14px 18px 12px 16px / 16px 14px 18px 12px;
  box-shadow: 2px 2px 0 var(--ink);
}
.shrx-rp-history-ic {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  background: var(--yellow);
  color: var(--ink);
  border: 2px solid var(--ink);
  border-radius: 50%;
  flex-shrink: 0;
}
.shrx-rp-history-ic svg { width: 12px; height: 12px; }
.shrx-rp-history-body {
  min-width: 0;
}
.shrx-rp-history-body strong {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.shrx-rp-history-body small {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  font-weight: 600;
  color: #8A96A8;
}
.shrx-rp-history-amt {
  font-size: 13px;
  font-weight: 900;
  white-space: nowrap;
}
.shrx-rp-history-amt.pos { color: var(--mint-deep); }
.shrx-rp-history-amt.neg { color: var(--coral-deep); }

/* ═══ FORM ═══ */
.shrx-rp-form {
  display: flex;
  flex-direction: column;
}
.shrx-rp-label {
  margin: 0 0 6px;
  font-size: 10.5px;
  font-weight: 900;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: #5A6B82;
}
.shrx-rp-label:not(:first-of-type) {
  margin-top: 14px;
}

.shrx-rp-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--paper);
  border: 2.5px solid var(--ink);
  border-radius: 16px 20px 14px 18px / 18px 16px 20px 14px;
  box-shadow: 2px 2px 0 var(--ink);
  transition: box-shadow 0.2s ease;
}
.shrx-rp-input-wrap:focus-within {
  box-shadow: 3px 3px 0 var(--ink), 0 0 0 3px rgba(46, 127, 232, 0.30);
}
.shrx-rp-input-prefix {
  padding: 0 8px 0 14px;
  font-size: 15px;
  font-weight: 900;
  color: var(--ink);
}
.shrx-rp-input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px 12px 0;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  outline: none;
}
.shrx-rp-input-plain {
  padding: 12px 14px;
  background: var(--paper);
  border: 2.5px solid var(--ink);
  border-radius: 16px 20px 14px 18px / 18px 16px 20px 14px;
  box-shadow: 2px 2px 0 var(--ink);
  transition: box-shadow 0.2s ease;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  outline: none;
}
.shrx-rp-input-plain:focus {
  box-shadow: 3px 3px 0 var(--ink), 0 0 0 3px rgba(46, 127, 232, 0.30);
}
.shrx-rp-input::placeholder { color: #9AA5B5; font-weight: 600; }
.shrx-rp-input:disabled,
.shrx-rp-input-plain:disabled { opacity: 0.6; cursor: not-allowed; }

.shrx-rp-method {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--yellow-soft);
  border: 2.5px solid var(--ink);
  border-radius: 16px 20px 14px 18px / 18px 16px 20px 14px;
  box-shadow: 2px 2px 0 var(--ink);
}
.shrx-rp-method-pill {
  padding: 3px 10px;
  background: var(--ink);
  color: #fff;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
}
.shrx-rp-method-hint {
  font-size: 11px;
  font-weight: 700;
  color: #5A6B82;
}

.shrx-rp-submit {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
  padding: 14px 20px;
  background: var(--ink);
  color: #fff;
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  box-shadow: 4px 4px 0 var(--yellow);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 900;
  letter-spacing: 0.03em;
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.4, 0.4, 1),
    box-shadow 0.2s ease,
    background 0.2s ease;
}
.shrx-rp-submit::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 70px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
  animation: shrxRpShimmer 3s ease-in-out infinite;
  z-index: -1;
}
.shrx-rp-submit-ic {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  background: var(--yellow);
  color: var(--ink);
  border-radius: 50%;
  flex-shrink: 0;
}
.shrx-rp-submit-ic svg { width: 12px; height: 12px; }
@media (hover: hover) and (pointer: fine) {
  .shrx-rp-submit:hover:not(:disabled) {
    transform: translate3d(-2px, -2px, 0);
    box-shadow: 6px 6px 0 var(--yellow);
  }
}
.shrx-rp-submit:active:not(:disabled) {
  transform: translate3d(0, 0, 0);
  box-shadow: 2px 2px 0 var(--yellow);
}
.shrx-rp-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: 2px 2px 0 var(--yellow);
}

.shrx-rp-msg {
  margin: 12px 0 0;
  padding: 10px 12px;
  font-size: 11.5px;
  font-weight: 700;
  border-radius: 12px;
  border: 2px solid var(--ink);
  box-shadow: 2px 2px 0 var(--ink);
}
.shrx-rp-msg-error {
  background: var(--coral-soft);
  color: var(--coral-deep);
}
.shrx-rp-msg-success {
  background: var(--mint-soft);
  color: #1E8A62;
}

.shrx-rp-note {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: var(--blue-soft);
  border: 2px solid var(--ink);
  border-radius: 16px 20px 14px 18px / 18px 16px 20px 14px;
  box-shadow: 2px 2px 0 var(--ink);
}
.shrx-rp-note-ic {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  color: var(--blue-deep);
  flex-shrink: 0;
}
.shrx-rp-note-ic svg { width: 100%; height: 100%; }
.shrx-rp-note p {
  margin: 0;
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.55;
  color: #2A4A7A;
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 400px) {
  .shrx-rp-stats { grid-template-columns: 1fr; }
  .shrx-rp-balance-num { font-size: 36px; }
  .shrx-rp-hero-coin { width: 62px; height: 62px; }
  .shrx-rp-hero-coin svg { width: 32px; height: 32px; }
}

@media (prefers-reduced-motion: reduce) {
  .shrx-rp *, .shrx-rp *::before, .shrx-rp *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;