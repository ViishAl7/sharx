"use client";

// src/legacy/SidePanel.js — Crayon · Clean · Playful

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "../config";

// ── helpers ──────────────────────────────────────────────
function base64urlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
// ─────────────────────────────────────────────────────────

export default function SidePanel({ mode: initialMode, onClose }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  const [passkeyEmail, setPasskeyEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  // iOS-safe scroll lock
  useEffect(() => {
    const scrollY = window.scrollY || window.pageYOffset;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  // ── PASSKEY REGISTER ────────────────────────────────────
  const handlePasskeyRegister = async () => {
    setPasskeyError("");
    if (!passkeyEmail || !passkeyEmail.includes("@")) {
      setShowEmailInput(true);
      setPasskeyError("Enter your email to register a passkey.");
      return;
    }
    setPasskeyLoading(true);
    try {
      const optRes = await fetch(`${API_BASE}/passkey/register/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: passkeyEmail }),
      });
      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.error || "Could not start passkey registration");
      }
      const options = await optRes.json();
      options.challenge = base64urlToBuffer(options.challenge);
      options.user.id = base64urlToBuffer(options.user.id);
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((c) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        }));
      }
      const credential = await navigator.credentials.create({ publicKey: options });
      const verifyRes = await fetch(`${API_BASE}/passkey/register/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: passkeyEmail,
          id: credential.id,
          rawId: bufferToBase64url(credential.rawId),
          type: credential.type,
          response: {
            clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
            attestationObject: bufferToBase64url(credential.response.attestationObject),
          },
        }),
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || "Passkey registration failed");
      }
      const data = await verifyRes.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onClose();
      } else {
        throw new Error("Registration verified but login failed. Try logging in.");
      }
    } catch (err) {
      setPasskeyError(err.name === "NotAllowedError" ? "Passkey cancelled. Try again." : err.message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  // ── PASSKEY LOGIN ───────────────────────────────────────
  const handlePasskeyLogin = async () => {
    setPasskeyError("");
    setPasskeyLoading(true);
    try {
      const optRes = await fetch(`${API_BASE}/passkey/login/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!optRes.ok) throw new Error("Could not start passkey login");
      const options = await optRes.json();
      options.challenge = base64urlToBuffer(options.challenge);
      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map((c) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        }));
      }
      const assertion = await navigator.credentials.get({ publicKey: options });
      const verifyRes = await fetch(`${API_BASE}/passkey/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: assertion.id,
          rawId: bufferToBase64url(assertion.rawId),
          type: assertion.type,
          response: {
            clientDataJSON: bufferToBase64url(assertion.response.clientDataJSON),
            authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
            signature: bufferToBase64url(assertion.response.signature),
            userHandle: assertion.response.userHandle
              ? bufferToBase64url(assertion.response.userHandle)
              : null,
          },
        }),
      });
      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || "Passkey login failed");
      }
      const data = await verifyRes.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onClose();
      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (err) {
      setPasskeyError(err.name === "NotAllowedError" ? "Passkey cancelled. Try again." : err.message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handlePasskey = () => {
    if (!window.PublicKeyCredential) {
      setPasskeyError("Your browser doesn't support passkeys.");
      return;
    }
    mode === "signup" ? handlePasskeyRegister() : handlePasskeyLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700;800&display=swap');

        /* ── scoped reset ── */
        .pv-panel, .pv-panel *, .pv-panel *::before, .pv-panel *::after {
          margin: 0; padding: 0; box-sizing: border-box;
        }

        /* ── tokens ── */
        .pv-root {
          --ink: #1B2A41;
          --ink-soft: #5A6B82;
          --ink-mute: #98A6B8;
          --blue: #2E7FE8;
          --yellow: #FFD966;
          --coral: #FF8B7B;
          --mint: #7BE5B5;
          --lilac: #C7B4FF;
          --paper: #FFFDF7;
          --cream: #FDFAF3;
          --border: 1.5px solid var(--ink);
          --shadow-sm: 2px 2px 0 var(--ink);
          --shadow-md: 3px 3px 0 var(--ink);
          --shadow-lg: 4px 4px 0 var(--ink);
          font-family: 'Comfortaa', sans-serif;
          color: var(--ink);
        }

        /* ═══════════════════════════════════════════
           Overlay
        ═══════════════════════════════════════════ */
        .pv-overlay {
          position: fixed; inset: 0;
          background: rgba(27, 42, 65, 0.42);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 1001;
          animation: pv-fadeIn 0.28s ease;
        }
        @keyframes pv-fadeIn { from { opacity: 0 } to { opacity: 1 } }

        /* ═══════════════════════════════════════════
           Panel — soft crayon pastel aurora
        ═══════════════════════════════════════════ */
        .pv-panel {
          position: fixed; left: 0; top: 0; bottom: 0;
          width: 500px; max-width: 100vw;
          background:
            radial-gradient(ellipse 60% 45% at 15% 12%, rgba(255, 224, 218, 0.65), transparent 65%),
            radial-gradient(ellipse 55% 45% at 85% 20%, rgba(212, 233, 255, 0.6), transparent 65%),
            radial-gradient(ellipse 70% 50% at 50% 88%, rgba(234, 224, 255, 0.5), transparent 70%),
            linear-gradient(160deg, #FFF9F5 0%, #F8FAFF 50%, #FBF8F2 100%);
          z-index: 1002;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          animation: pv-slideIn 0.42s cubic-bezier(.19,1,.22,1);
          border-radius: 0 32px 32px 0;
        }
        @keyframes pv-slideIn {
          from { transform: translateX(-60px); opacity: 0 }
          to   { transform: translateX(0); opacity: 1 }
        }

        /* crayon dots overlay */
        .pv-panel::before {
          content: "";
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 0 0, rgba(46, 127, 232, 0.4) 1.3px, transparent 1.9px),
            radial-gradient(circle at 0 0, rgba(255, 139, 123, 0.32) 1.3px, transparent 1.9px),
            radial-gradient(circle at 0 0, rgba(199, 180, 255, 0.4) 1.3px, transparent 1.9px);
          background-size: 32px 32px, 48px 48px, 64px 64px;
          background-position: 0 0, 16px 20px, 24px 12px;
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }

        /* floating blob */
        .pv-panel::after {
          content: "";
          position: absolute;
          top: -60px; right: -60px;
          width: 240px; height: 240px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 206, 84, 0.35), transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        /* ═══════════════════════════════════════════
           Close button — crayon pill
        ═══════════════════════════════════════════ */
        .pv-close {
          position: absolute; top: 22px; right: 22px;
          width: 42px; height: 42px; border-radius: 50%;
          background: var(--paper);
          border: var(--border);
          color: var(--ink);
          font-size: 15px; font-weight: 800;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform 0.24s cubic-bezier(.34,1.4,.4,1), box-shadow 0.24s, background 0.24s;
          z-index: 5;
          display: flex; align-items: center; justify-content: center;
          line-height: 1;
        }
        .pv-close:hover {
          transform: translate3d(-2px, -2px, 0) rotate(90deg);
          background: var(--yellow);
          box-shadow: var(--shadow-md);
        }
        .pv-close:active {
          transform: translate3d(0, 0, 0) rotate(90deg);
          box-shadow: var(--shadow-sm);
        }

        /* ═══════════════════════════════════════════
           Card
        ═══════════════════════════════════════════ */
        .pv-card {
          width: 360px; max-width: 90%;
          position: relative; z-index: 2;
        }
        .pv-card > * {
          opacity: 0;
          animation: pv-fadeUp 0.5s cubic-bezier(.34,1.3,.4,1) forwards;
        }
        @keyframes pv-fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Logo — plain, no circle */
        .pv-logo {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .pv-logo img {
          width: 96px;
          height: 96px;
          object-fit: contain;
        }

        /* ═══════════════════════════════════════════
           Tabs — crayon pill
        ═══════════════════════════════════════════ */
        .pv-tabs {
          display: flex;
          background: var(--paper);
          border: var(--border);
          padding: 5px;
          border-radius: 100px;
          margin-bottom: 20px;
          gap: 4px;
          box-shadow: var(--shadow-sm);
        }
        .pv-tab {
          flex: 1; height: 46px; border: none;
          border-radius: 100px;
          background: transparent;
          color: var(--ink-soft);
          font-family: 'Comfortaa', sans-serif;
          font-size: 14px; font-weight: 800;
          cursor: pointer;
          transition: background 0.24s ease, color 0.24s ease, transform 0.22s cubic-bezier(.34,1.4,.4,1);
          letter-spacing: -0.1px;
        }
        .pv-tab.active {
          background: var(--blue);
          color: #fff;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
          transform: scale(1.02);
        }
        .pv-tab:hover:not(.active) {
          background: var(--yellow);
          color: var(--ink);
          transform: translateY(-1px);
        }

        /* ═══════════════════════════════════════════
           Buttons — crayon card style
        ═══════════════════════════════════════════ */
        .pv-btn {
          width: 100%; height: 56px;
          border-radius: 100px;
          background: var(--paper);
          border: var(--border);
          display: flex; align-items: center; justify-content: center;
          gap: 12px;
          color: var(--ink);
          font-family: 'Comfortaa', sans-serif;
          font-size: 14.5px; font-weight: 800;
          cursor: pointer;
          margin-bottom: 12px;
          box-shadow: var(--shadow-sm);
          transition: transform 0.24s cubic-bezier(.34,1.4,.4,1), box-shadow 0.24s, background 0.24s;
          letter-spacing: -0.1px;
          will-change: transform;
        }
        .pv-btn:hover {
          background: var(--yellow);
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
        }
        .pv-btn:active {
          transform: translate3d(0, 0, 0);
          box-shadow: var(--shadow-sm);
        }
        .pv-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow: var(--shadow-sm);
        }
        .pv-btn svg { flex-shrink: 0; }

        /* ═══════════════════════════════════════════
           Input — crayon pill
        ═══════════════════════════════════════════ */
        .pv-input {
          width: 100%; height: 54px;
          border-radius: 100px;
          border: var(--border);
          padding: 0 20px;
          font-family: 'Comfortaa', sans-serif;
          font-size: 14px; font-weight: 600;
          color: var(--ink);
          background: var(--paper);
          margin-bottom: 12px;
          outline: none;
          box-shadow: var(--shadow-sm);
          transition: transform 0.22s cubic-bezier(.34,1.4,.4,1), box-shadow 0.22s, background 0.22s;
        }
        .pv-input:focus {
          background: #fff;
          transform: translate3d(-2px, -2px, 0);
          box-shadow: var(--shadow-md);
        }
        .pv-input::placeholder { color: var(--ink-mute); font-weight: 600; }

        /* ═══════════════════════════════════════════
           Spinner
        ═══════════════════════════════════════════ */
        .pv-spin {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(27, 42, 65, 0.2);
          border-top-color: var(--ink);
          border-radius: 50%;
          animation: pv-spin 0.65s linear infinite;
          flex-shrink: 0;
        }
        @keyframes pv-spin { to { transform: rotate(360deg) } }

        /* ═══════════════════════════════════════════
           Error — crayon card
        ═══════════════════════════════════════════ */
        .pv-error {
          font-size: 12.5px; font-weight: 700;
          color: var(--ink);
          text-align: center;
          margin-bottom: 12px;
          padding: 10px 14px;
          background: var(--coral);
          border: var(--border);
          border-radius: 100px;
          box-shadow: var(--shadow-sm);
          animation: pv-fadeUp 0.3s ease;
          font-family: 'Comfortaa', sans-serif;
        }

        /* ═══════════════════════════════════════════
           Footer — crayon link
        ═══════════════════════════════════════════ */
        .pv-footer {
          margin-top: 14px; text-align: center;
          font-size: 12.5px; line-height: 1.7;
          color: var(--ink-soft); font-weight: 700;
          font-family: 'Comfortaa', sans-serif;
        }
        .pv-footer span {
          color: var(--ink); font-weight: 800; cursor: pointer;
          border-bottom: 2px solid var(--blue);
          padding-bottom: 1px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .pv-footer span:hover {
          color: var(--blue);
          border-color: var(--lilac);
        }

        /* ═══════════════════════════════════════════
           Mobile
        ═══════════════════════════════════════════ */
        @media (max-width: 700px) {
          .pv-panel { width: 100%; border-radius: 0; }
          .pv-card  { width: 86%; }
          .pv-logo img { width: 84px; height: 84px; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="pv-root">
        <div className="pv-overlay" onClick={onClose} />

        <div className="pv-panel">
          <button className="pv-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="pv-card">
            {/* Logo — plain, no border */}
            <div className="pv-logo" style={{ animationDelay: "0.06s" }}>
              <img src="/sharx-logo.webp" alt="logo" />
            </div>

            {/* Tabs */}
            <div className="pv-tabs" style={{ animationDelay: "0.13s" }}>
              <button
                className={`pv-tab ${mode === "signup" ? "active" : ""}`}
                onClick={() => { setMode("signup"); setPasskeyError(""); setShowEmailInput(false); setPasskeyEmail(""); }}
              >
                Register
              </button>
              <button
                className={`pv-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setPasskeyError(""); setShowEmailInput(false); setPasskeyEmail(""); }}
              >
                Login
              </button>
            </div>

            {/* Google */}
            <button
              className="pv-btn"
              style={{ animationDelay: "0.2s" }}
              onClick={() => { window.location.href = `${API_BASE}/auth/google`; }}
            >
              <svg width="22" height="22" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            {/* Email input for passkey register */}
            {mode === "signup" && showEmailInput && (
              <input
                className="pv-input"
                style={{ animationDelay: "0.26s" }}
                type="email"
                placeholder="Enter your email"
                value={passkeyEmail}
                onChange={(e) => { setPasskeyEmail(e.target.value); setPasskeyError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handlePasskeyRegister(); }}
                autoFocus
              />
            )}

            {/* Passkey */}
            <button
              className="pv-btn"
              style={{ animationDelay: "0.32s" }}
              onClick={handlePasskey}
              disabled={passkeyLoading}
            >
              {passkeyLoading ? (
                <><span className="pv-spin" /> Verifying...</>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <ellipse cx="12" cy="8.5" rx="3.5" ry="4" stroke="#1B2A41" strokeWidth="1.7"/>
                    <path d="M5 20.5c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="#1B2A41" strokeWidth="1.7" strokeLinecap="round"/>
                    <path d="M8.5 8.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5" stroke="#1B2A41" strokeWidth="1.7" strokeLinecap="round"/>
                    <circle cx="18.5" cy="17.5" r="2.5" fill="#2E7FE8"/>
                    <path d="M18.5 16v1.5l1 1" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Continue with Passkey
                </>
              )}
            </button>

            {passkeyError && (
              <div className="pv-error" style={{ animationDelay: "0.38s" }}>{passkeyError}</div>
            )}

            <div className="pv-footer" style={{ animationDelay: "0.44s" }}>
              By continuing you agree to our{" "}
              <span onClick={() => { onClose(); router.push("/privacy"); }}>Privacy Policy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}