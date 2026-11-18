"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FeedbackModal from "./FeedbackModal";
import "./Feedback.css";

/*
  Opens the feedback popup automatically when the website loads.

  - Not shown again once the person has submitted feedback (localStorage).
  - If they just close it, it stays away for the rest of that visit (sessionStorage).
  - A floating "Feedback" button lets them open it any time.
  - After a successful submit, a toast confirms it once the popup closes.
*/

const DONE_KEY = "sharx_feedback_done";
const SEEN_KEY = "sharx_feedback_seen";
const OPEN_DELAY_MS = 1200;
const TOAST_MS = 4700;

const readFlag = (store, key) => {
  try {
    return window[store].getItem(key) === "1";
  } catch {
    return false;
  }
};

const writeFlag = (store, key) => {
  try {
    window[store].setItem(key, "1");
  } catch {
    /* storage can be blocked, that is fine */
  }
};

function SuccessToast() {
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

/*
  Props
  - delay:      ms to wait after load before opening (default 1200)
  - alwaysShow: ignore the "already submitted / already closed" memory.
                Use true while testing so it opens on EVERY reload.
  Tip: opening your site with  ?feedback=1  at the end of the URL
  also forces the popup open, whatever is saved in the browser.
*/
export default function FeedbackLauncher({
  delay = OPEN_DELAY_MS,
  alwaysShow = false,
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);

  const submittedRef = useRef(false);
  const toastTimer = useRef(null);

  /* Auto-open shortly after the site loads */
  useEffect(() => {
    let forced = alwaysShow;

    try {
      forced =
        forced ||
        new URLSearchParams(window.location.search).get("feedback") === "1";
    } catch {
      /* ignore */
    }

    if (!forced) {
      if (readFlag("localStorage", DONE_KEY)) return undefined;
      if (readFlag("sessionStorage", SEEN_KEY)) return undefined;
    }

    const timer = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(timer);
  }, [delay, alwaysShow]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleClose = useCallback(() => {
    setOpen(false);
    writeFlag("sessionStorage", SEEN_KEY);

    /* Confirm the submit after the popup is gone */
    if (submittedRef.current) {
      submittedRef.current = false;
      setToast(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(false), TOAST_MS);
    }
  }, []);

  const handleSubmitted = useCallback(() => {
    submittedRef.current = true;
    writeFlag("localStorage", DONE_KEY);
  }, []);

  return (
    <>
      {!open && (
        <button
          type="button"
          className="feedback-floating-button"
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true">★</span>
          Feedback
        </button>
      )}

      <FeedbackModal
        open={open}
        onClose={handleClose}
        onSubmitted={handleSubmitted}
      />

      {toast && <SuccessToast />}
    </>
  );
}