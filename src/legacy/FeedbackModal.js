"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { COMMUNITY_API_BASE } from "../config";
import "./Feedback.css";

const CATEGORIES = [
  ["designRating", "Design"],
  ["gamesRating", "Games"],
  ["speedRating", "Speed"],
  ["experienceRating", "Overall experience"],
];

const HINTS = [
  "",
  "Needs a lot of work",
  "Could be better",
  "Pretty good",
  "Really good",
  "Loved it!",
];

const RECOMMEND_OPTIONS = [
  ["yes", "Definitely"],
  ["maybe", "Maybe"],
  ["no", "Not yet"],
];

const MAX_MESSAGE = 1500;
const EXIT_MS = 180;
const REQUEST_TIMEOUT_MS = 15000;

const initialRatings = {
  overallRating: 0,
  designRating: 0,
  gamesRating: 0,
  speedRating: 0,
  experienceRating: 0,
};

const CONFETTI = [
  { x: "-62px", y: "-44px", c: "#ffd966" },
  { x: "58px", y: "-52px", c: "#ff9b8f" },
  { x: "-70px", y: "18px", c: "#e4dcff" },
  { x: "72px", y: "14px", c: "#a8f0d0" },
  { x: "-30px", y: "-70px", c: "#a8f0d0" },
  { x: "34px", y: "-68px", c: "#e4dcff" },
];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarRating({
  label,
  value,
  onChange,
  required = false,
  showHint = false,
  invalid = false,
  className = "",
  style,
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  const handleKeyDown = (event) => {
    let next = null;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      next = Math.min(5, value + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      next = Math.max(1, (value || 1) - 1);
    } else if (event.key === "Home") {
      next = 1;
    } else if (event.key === "End") {
      next = 5;
    }

    if (next === null) return;

    event.preventDefault();
    onChange(next);
    event.currentTarget.parentElement
      .querySelectorAll("button")
      [next - 1]?.focus();
  };

  return (
    <fieldset
      className={`feedback-rating ${invalid ? "is-invalid" : ""} ${className}`}
      style={style}
    >
      <legend>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </legend>

      <div
        className="feedback-stars"
        role="radiogroup"
        aria-label={label}
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= value;
          const isPreview = !isActive && star <= hover;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} out of 5 stars`}
              tabIndex={value === star || (!value && star === 1) ? 0 : -1}
              className={
                isActive ? "is-active" : isPreview ? "is-preview" : ""
              }
              onClick={() => onChange(star)}
              onKeyDown={handleKeyDown}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setHover(star);
              }}
            >
              <StarIcon />
            </button>
          );
        })}
      </div>

      {showHint && (
        <span key={display} className="feedback-star-hint" aria-hidden="true">
          {HINTS[display]}
        </span>
      )}
    </fieldset>
  );
}

function FeedbackDialog({ onClose, onSubmitted }) {
  const [ratings, setRatings] = useState(initialRatings);
  const [recommendation, setRecommendation] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorTick, setErrorTick] = useState(0);
  const [invalid, setInvalid] = useState("");
  const [success, setSuccess] = useState(false);
  const [closing, setClosing] = useState(false);
  const [nudge, setNudge] = useState(false);

  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const closeTimer = useRef(null);
  const nudgeTimer = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const isDirty =
    Object.values(ratings).some(Boolean) ||
    Boolean(recommendation) ||
    message.trim().length > 0;

  const requestClose = useCallback(() => {
    if (loading || closing) return;

    setClosing(true);

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    closeTimer.current = setTimeout(
      () => onCloseRef.current?.(),
      reduceMotion ? 0 : EXIT_MS
    );
  }, [loading, closing]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      clearTimeout(closeTimer.current);
      clearTimeout(nudgeTimer.current);
      abortRef.current?.abort();

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  const trapFocus = (event) => {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll(
      'button:not([disabled]):not([tabindex="-1"]), textarea:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const fail = (text, field = "") => {
    setError(text);
    setInvalid(field);
    setErrorTick((tick) => tick + 1);
  };

  const clearFail = () => {
    setError("");
    setInvalid("");
  };

  const updateRating = (key, value) => {
    setRatings((current) => ({ ...current, [key]: value }));
    if (key === "overallRating" && invalid === "overall") clearFail();
  };

  const chooseRecommendation = (value) => {
    setRecommendation(value);
    if (invalid === "recommend") clearFail();
  };

  const handleBackdrop = (event) => {
    if (event.target !== event.currentTarget || loading) return;

    if (success || !isDirty) {
      requestClose();
      return;
    }

    setNudge(true);
    clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => setNudge(false), 450);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (!ratings.overallRating) {
      fail("Please select your overall rating.", "overall");
      return;
    }

    if (!recommendation) {
      fail("Please select your recommendation.", "recommend");
      return;
    }

    clearFail();
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${COMMUNITY_API_BASE}/api/v1/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          ...ratings,
          recommendation,
          message: message.trim(),
          website,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit feedback.");
      }

      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      if (err.name === "AbortError") {
        fail("That took too long. Please try again.");
      } else if (err instanceof TypeError) {
        fail("Can't reach SHARX right now. Check your connection.");
      } else {
        fail(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const reveal = (index) => ({ "--i": index });

  return (
    <div
      className={`feedback-overlay ${closing ? "is-closing" : ""}`}
      onMouseDown={handleBackdrop}
    >
      <section
        ref={dialogRef}
        className={`feedback-modal ${nudge ? "is-nudge" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        tabIndex={-1}
        onKeyDown={trapFocus}
      >
        <button
          className="feedback-close"
          type="button"
          onClick={requestClose}
          disabled={loading}
          aria-label="Close feedback"
        >
          ×
        </button>

        <div className="feedback-scroll">
          {success ? (
            <div className="feedback-success" role="status">
              <div className="feedback-success-visual">
                {CONFETTI.map((piece, index) => (
                  <i
                    key={index}
                    className="feedback-confetti"
                    style={{
                      "--x": piece.x,
                      "--y": piece.y,
                      "--c": piece.c,
                    }}
                  />
                ))}
                <div className="feedback-success-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" />
                  </svg>
                </div>
              </div>

              <h2 id="feedback-title">Thank you!</h2>
              <p>Your feedback helps us make SHARX better, one day at a time.</p>
              <button type="button" onClick={requestClose}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <span className="feedback-eyebrow fb-reveal" style={reveal(0)}>
                Your voice matters
              </span>

              <h2 id="feedback-title" className="fb-reveal" style={reveal(1)}>
                Help us improve SHARX.
              </h2>

              <p className="feedback-description fb-reveal" style={reveal(2)}>
                Tell us about your experience. Every response counts.
              </p>

              <StarRating
                label="How would you rate SHARX overall?"
                value={ratings.overallRating}
                onChange={(value) => updateRating("overallRating", value)}
                required
                showHint
                invalid={invalid === "overall"}
                className="fb-reveal"
                style={reveal(3)}
              />

              <div className="feedback-category-grid fb-reveal" style={reveal(4)}>
                {CATEGORIES.map(([key, label]) => (
                  <StarRating
                    key={key}
                    label={label}
                    value={ratings[key]}
                    onChange={(value) => updateRating(key, value)}
                  />
                ))}
              </div>

              <fieldset
                className={`feedback-recommend fb-reveal ${
                  invalid === "recommend" ? "is-invalid" : ""
                }`}
                style={reveal(5)}
              >
                <legend>Would you recommend SHARX to a friend?</legend>
                <div className="feedback-options" role="radiogroup">
                  {RECOMMEND_OPTIONS.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={recommendation === value}
                      className={recommendation === value ? "is-selected" : ""}
                      onClick={() => chooseRecommendation(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="feedback-message fb-reveal" style={reveal(6)}>
                Anything you'd like us to know? <span>(Optional)</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={MAX_MESSAGE}
                  placeholder="Share your thoughts..."
                  rows={4}
                />
                <small
                  className={message.length > MAX_MESSAGE - 150 ? "is-near" : ""}
                >
                  {message.length}/{MAX_MESSAGE}
                </small>
              </label>

              <div className="feedback-honeypot" aria-hidden="true">
                <label>
                  Website
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                </label>
              </div>

              {error && (
                <p key={errorTick} className="feedback-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="feedback-submit fb-reveal"
                style={reveal(7)}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="feedback-spinner" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  "Send feedback"
                )}
              </button>

              <p className="feedback-privacy fb-reveal" style={reveal(8)}>
                Your feedback is handled securely.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default function FeedbackModal({ open, onClose, onSubmitted }) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <FeedbackDialog onClose={onClose} onSubmitted={onSubmitted} />,
    document.body
  );
}