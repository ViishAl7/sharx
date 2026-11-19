"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
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

/* Stable style objects (new objects every render would defeat memo) */
const REVEAL = Array.from({ length: 10 }, (_, i) => ({ "--i": i }));

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 1.5c.5 4.6 2.4 7.6 6 9 .6.3.6 1.2 0 1.5-3.6 1.4-5.5 4.4-6 9-.5-4.6-2.4-7.6-6-9-.6-.3-.6-1.2 0-1.5 3.6-1.4 5.5-4.4 6-9z" />
    </svg>
  );
}

/* memo = typing in the textarea no longer re-renders all the star rows */
const StarRating = memo(function StarRating({
  label,
  name,
  value,
  onChange,
  required = false,
  showHint = false,
  invalid = false,
  errorText = "",
  field,
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
    onChange(name, next);
    event.currentTarget.parentElement
      .querySelectorAll("button")
      [next - 1]?.focus();
  };

  return (
    <fieldset
      className={`feedback-rating ${invalid ? "is-invalid" : ""} ${className}`}
      style={style}
      data-field={field}
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
              onClick={() => onChange(name, star)}
              onKeyDown={handleKeyDown}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setHover(star);
              }}
            >
              <StarIcon />
            </button>
          );
        })}

        {showHint && display > 0 && (
          <span key={display} className="feedback-star-hint" aria-hidden="true">
            {HINTS[display]}
          </span>
        )}
      </div>

      {errorText && (
        <p className="feedback-field-error" role="alert">
          {errorText}
        </p>
      )}
    </fieldset>
  );
});

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
  const [canScroll, setCanScroll] = useState({ top: false, bottom: false });

  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const closeTimer = useRef(null);
  const nudgeTimer = useRef(null);
  const failTimer = useRef(null);
  const abortRef = useRef(null);
  const invalidRef = useRef("");
  invalidRef.current = invalid;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const isDirty =
    Object.values(ratings).some(Boolean) ||
    Boolean(recommendation) ||
    message.trim().length > 0;

  /* Smooth exit, then tell the parent to unmount us */
  const requestClose = useCallback(() => {
    if (loading || closing) return;

    setClosing(true);

    closeTimer.current = setTimeout(
      () => onCloseRef.current?.(),
      prefersReducedMotion() ? 0 : EXIT_MS
    );
  }, [loading, closing]);

  /* Show a soft fade at the edges while there is more to scroll */
  const updateScrollCue = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const top = el.scrollTop > 8;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight > 8;

    setCanScroll((current) =>
      current.top === top && current.bottom === bottom
        ? current
        : { top, bottom }
    );
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    updateScrollCue();

    if (typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(updateScrollCue);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => observer.disconnect();
  }, [updateScrollCue, success]);

  /* Focus, scroll lock and cleanup */
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    dialogRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      clearTimeout(closeTimer.current);
      clearTimeout(nudgeTimer.current);
      clearTimeout(failTimer.current);
      abortRef.current?.abort();

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);

  /* Escape closes the dialog */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  /* Keep Tab inside the dialog */
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

    /* Bring the problem into view, whatever the scroll position */
    clearTimeout(failTimer.current);
    failTimer.current = setTimeout(() => {
      const target = field
        ? dialogRef.current?.querySelector(`[data-field="${field}"]`)
        : dialogRef.current?.querySelector(".feedback-error");

      target?.scrollIntoView({
        block: "center",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }, 60);
  };

  const clearFail = useCallback(() => {
    setError("");
    setInvalid("");
  }, []);

  /* Stable callback so memo'd StarRating rows don't re-render on every keystroke */
  const updateRating = useCallback(
    (key, value) => {
      setRatings((current) => ({ ...current, [key]: value }));
      if (key === "overallRating" && invalidRef.current === "overall") {
        clearFail();
      }
    },
    [clearFail]
  );

  const chooseRecommendation = (value) => {
    setRecommendation(value);
    if (invalid === "recommend") clearFail();
  };

  const handleBackdrop = (event) => {
    if (event.target !== event.currentTarget || loading) return;

    /* Don't throw away typed feedback on a stray click */
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

        <div
          ref={scrollRef}
          className="feedback-scroll"
          onScroll={updateScrollCue}
        >
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

              <span className="feedback-success-tag">Feedback submitted</span>
              <h2 id="feedback-title">Thank you!</h2>
              <p>
                Your feedback was received successfully. It helps us make
                SHARX better, one day at a time.
              </p>
              <button type="button" onClick={requestClose}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="feedback-notice fb-reveal" style={REVEAL[0]}>
                <span className="feedback-notice-icon">
                  <SparkIcon />
                </span>
                You can now share your feedback with us.
              </p>

              <span className="feedback-eyebrow fb-reveal" style={REVEAL[1]}>
                Your voice matters
              </span>

              <h2 id="feedback-title" className="fb-reveal" style={REVEAL[2]}>
                Help us improve SHARX.
              </h2>

              <p className="feedback-description fb-reveal" style={REVEAL[3]}>
                Tell us about your experience. Every response counts.
              </p>

              <StarRating
                label="How would you rate SHARX overall?"
                name="overallRating"
                value={ratings.overallRating}
                onChange={updateRating}
                required
                showHint
                invalid={invalid === "overall"}
                errorText={invalid === "overall" ? error : ""}
                field="overall"
                className="fb-reveal"
                style={REVEAL[4]}
              />

              <div className="feedback-category-grid fb-reveal" style={REVEAL[5]}>
                {CATEGORIES.map(([key, label]) => (
                  <StarRating
                    key={key}
                    label={label}
                    name={key}
                    value={ratings[key]}
                    onChange={updateRating}
                  />
                ))}
              </div>

              <fieldset
                className={`feedback-recommend fb-reveal ${
                  invalid === "recommend" ? "is-invalid" : ""
                }`}
                style={REVEAL[6]}
                data-field="recommend"
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

                {invalid === "recommend" && error && (
                  <p className="feedback-field-error" role="alert">
                    {error}
                  </p>
                )}
              </fieldset>

              <label className="feedback-message fb-reveal" style={REVEAL[7]}>
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

              {error && !invalid && (
                <p key={errorTick} className="feedback-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="feedback-submit fb-reveal"
                style={REVEAL[8]}
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

              <p className="feedback-privacy fb-reveal" style={REVEAL[9]}>
                Your feedback is handled securely.
              </p>
            </form>
          )}
        </div>

        <div
          className={`feedback-fade is-top ${canScroll.top ? "is-visible" : ""}`}
          aria-hidden="true"
        />
        <div
          className={`feedback-fade ${canScroll.bottom ? "is-visible" : ""}`}
          aria-hidden="true"
        />
      </section>
    </div>
  );
}

/* Small confirmation toast, shown by the page after the popup closes */
export function FeedbackToast() {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="feedback-toast" role="status" aria-live="polite">
      <div className="feedback-toast-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <div>
        <strong>Feedback submitted</strong>
        <span>Thank you for helping us improve SHARX.</span>
      </div>
    </div>,
    document.body
  );
}

export default function FeedbackModal({ open, onClose, onSubmitted }) {
  if (!open || typeof document === "undefined") return null;

  /* Remounting on every open resets the form automatically */
  return createPortal(
    <FeedbackDialog onClose={onClose} onSubmitted={onSubmitted} />,
    document.body
  );
}