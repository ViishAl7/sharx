"use client";

// src/Pages/SidePanel.js

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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
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

        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Plus Jakarta Sans',sans-serif; }

        /* Overlay fade */
        .pv-overlay {
          position:fixed; inset:0;
          background:rgba(0,0,0,0.5);
          backdrop-filter:blur(12px);
          -webkit-backdrop-filter:blur(12px);
          z-index:999;
          animation:fadeIn .28s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        /* Panel slide in */
        .pv-panel {
          position:fixed; left:0; top:0; bottom:0;
          width:500px;
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          z-index:1000;
          display:flex; align-items:center; justify-content:center;
          overflow:hidden;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.2) inset, 0 20px 60px rgba(0,0,0,0.1);
          border-right: 1px solid rgba(255,255,255,0.2);
          animation:slideIn .42s cubic-bezier(.19,1,.22,1);
          border-radius: 0 40px 40px 0;
        }
        @keyframes slideIn {
          from{transform:translateX(-60px);opacity:0}
          to{transform:translateX(0);opacity:1}
        }

        /* Close button with a subtle grow on hover */
        .pv-close {
          position:absolute; top:22px; right:22px;
          width:42px; height:42px; border-radius:50%;
          background:rgba(255,255,255,0.7);
          border:1px solid rgba(255,255,255,0.8);
          color:#0f172a;
          font-size:16px; font-weight:700;
          cursor:pointer;
          transition:transform .25s cubic-bezier(.2,.9,.4,1.1), background .2s ease;
          z-index:5;
          display:flex; align-items:center; justify-content:center;
        }
        .pv-close:hover {
          transform:scale(1.1) rotate(90deg);
          background:rgba(255,255,255,0.9);
          border-color: rgba(255,255,255,1);
        }
        .pv-close:active { transform:scale(0.96) rotate(90deg); }

        /* Card wrapper — each child fades up on its own explicit delay (set inline) */
        .pv-card {
          width:360px; position:relative; z-index:2;
        }
        .pv-card > * {
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }

        @keyframes fadeUp {
          from { opacity:0; transform: translateY(14px); }
          to { opacity:1; transform: translateY(0); }
        }

        .pv-logo {
          display:flex; align-items:center; justify-content:center;
          margin-bottom:28px;
        }
        .pv-logo img {
          width:140px;
          height:140px;
          object-fit:contain;
          border-radius:30px;
          padding:12px;
        }

        /* Tabs with sliding indicator feel */
        .pv-tabs {
          display:flex; background:rgba(255,255,255,0.4);
          border: 1px solid rgba(255,255,255,0.5);
          padding:5px; border-radius:50px;
          margin-bottom:24px; gap:4px;
        }
        .pv-tab {
          flex:1; height:50px; border:none;
          border-radius:50px; background:transparent;
          color:#334155;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:15px; font-weight:700;
          cursor:pointer;
          transition: background 0.25s ease, color 0.25s ease, transform 0.2s ease;
          letter-spacing:-0.1px;
        }
        .pv-tab.active {
          background:#ffffff;
          color:#0f172a;
          box-shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
          transform: scale(1.02);
        }
        .pv-tab:hover:not(.active) {
          background: rgba(255,255,255,0.5);
          transform: translateY(-1px);
        }

        /* Buttons with hover lift and slight scale */
        .pv-btn {
          width:100%; height:60px;
          border-radius:50px;
          background: rgba(255, 255, 255, 0.55);
          border:1px solid rgba(255,255,255,0.7);
          display:flex; align-items:center; justify-content:center;
          gap:13px; color:#0f172a;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:15px; font-weight:700;
          cursor:pointer; margin-bottom:13px;
          transition: transform 0.25s cubic-bezier(.2,.9,.4,1.1), box-shadow 0.25s ease, background 0.2s ease, border-color 0.2s ease;
          letter-spacing:-0.1px;
          will-change: transform;
        }
        .pv-btn:hover {
          transform: translateY(-3px) scale(1.01);
          background: rgba(255,255,255,0.75);
          border-color: rgba(255,255,255,1);
          box-shadow:0 12px 28px rgba(0,0,0,0.08),0 2px 6px rgba(0,0,0,0.04);
        }
        .pv-btn:active { transform:translateY(0) scale(0.99); }
        .pv-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .pv-btn svg { flex-shrink:0; }

        .pv-input {
          width:100%;
          height:58px;
          border-radius:30px;
          border:1px solid rgba(255,255,255,0.6);
          padding:0 20px;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:15px;
          font-weight:500;
          color:#0f172a;
          background: rgba(255,255,255,0.55);
          margin-bottom:13px;
          outline:none;
          transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
        }
        .pv-input:focus {
          border-color:#6366f1;
          background: rgba(255,255,255,0.8);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .pv-input::placeholder { color:#64748b; }

        /* Spinner */
        .pv-spin {
          width:18px; height:18px;
          border:2.5px solid rgba(15,23,42,0.2);
          border-top-color:#0f172a;
          border-radius:50%;
          animation:spin .65s linear infinite;
          flex-shrink:0;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* Error message with fade in */
        .pv-error {
          font-size:12.5px; font-weight:600;
          color:#ef4444; text-align:center;
          margin-bottom:12px;
          padding:9px 12px;
          background: rgba(255,255,255,0.7);
          border-radius:12px;
          border:1px solid rgba(255,255,255,0.8);
          animation: fadeIn .3s ease;
        }

        /* Footer text */
        .pv-footer {
          margin-top:12px; text-align:center;
          font-size:12.5px; line-height:1.7;
          color:#475569; font-weight:500;
        }
        .pv-footer span {
          color:#0f172a; font-weight:700; cursor:pointer;
          border-bottom:1.5px solid #0f172a; padding-bottom:1px;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .pv-footer span:hover {
          color:#6366f1;
          border-color:#6366f1;
        }

        /* Mobile responsive */
        @media(max-width:700px) {
          .pv-panel { width:100%; border-radius:0; }
          .pv-card  { width:86%; }
          .pv-logo img { width:96px; height:96px; }
        }

      `}</style>

      <div className="pv-overlay" onClick={onClose} />

      <div className="pv-panel">
        <button className="pv-close" onClick={onClose}>✕</button>

        <div className="pv-card">
          {/* Logo */}
          <div className="pv-logo" style={{ animationDelay: "0.06s" }}>
            <img src="/sharx.png" alt="logo" />
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
          <button className="pv-btn" style={{ animationDelay: "0.2s" }} onClick={() => { window.location.href = `${API_BASE}/auth/google`; }}>
            <svg width="22" height="22" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          {/* Microsoft */}
          {/* <button className="pv-btn" onClick={() => { window.location.href = `${API_BASE}/auth/microsoft`; }}>
            <svg width="22" height="22" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Continue with Microsoft
          </button> */}

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
          <button className="pv-btn" style={{ animationDelay: "0.32s" }} onClick={handlePasskey} disabled={passkeyLoading}>
            {passkeyLoading ? (
              <><span className="pv-spin" /> Verifying...</>
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <ellipse cx="12" cy="8.5" rx="3.5" ry="4" stroke="#0f172a" strokeWidth="1.7"/>
                  <path d="M5 20.5c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="#0f172a" strokeWidth="1.7" strokeLinecap="round"/>
                  <path d="M8.5 8.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5" stroke="#0f172a" strokeWidth="1.7" strokeLinecap="round"/>
                  <circle cx="18.5" cy="17.5" r="2.5" fill="#6366f1"/>
                  <path d="M18.5 16v1.5l1 1" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Continue with Passkey
              </>
            )}
          </button>

          {passkeyError && <div className="pv-error" style={{ animationDelay: "0.38s" }}>{passkeyError}</div>}

          <div className="pv-footer" style={{ animationDelay: "0.44s" }}>
            By continuing you agree to our{" "}
<span onClick={() => { onClose(); router.push("/privacy"); }}>Privacy Policy</span>
          </div>
        </div>
      </div>
    </>
  );
}