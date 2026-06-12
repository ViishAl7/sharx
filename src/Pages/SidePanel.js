// src/Pages/SidePanel.js

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");

  // ✅ FIX: Email state for passkey registration
  const [passkeyEmail, setPasskeyEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── PASSKEY REGISTER ────────────────────────────────────
  const handlePasskeyRegister = async () => {
    setPasskeyError("");

    // ✅ FIX: Show email input first if not filled
    if (!passkeyEmail || !passkeyEmail.includes("@")) {
      setShowEmailInput(true);
      setPasskeyError("Enter your email to register a passkey.");
      return;
    }

    setPasskeyLoading(true);
    try {
      // 1. Get registration options — ✅ FIX: send email in body
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

      // 2. Convert challenge + user.id from base64url → ArrayBuffer
      options.challenge = base64urlToBuffer(options.challenge);
      options.user.id  = base64urlToBuffer(options.user.id);
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((c) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        }));
      }

      // 3. Trigger browser passkey prompt
      const credential = await navigator.credentials.create({ publicKey: options });

      // 4. Send result to backend — ✅ FIX: include email + credential fields
      const verifyRes = await fetch(`${API_BASE}/passkey/register/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: passkeyEmail,
          id:    credential.id,
          rawId: bufferToBase64url(credential.rawId),
          type:  credential.type,
          response: {
            clientDataJSON:    bufferToBase64url(credential.response.clientDataJSON),
            attestationObject: bufferToBase64url(credential.response.attestationObject),
          },
        }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || "Passkey registration failed");
      }

      const data = await verifyRes.json();
      // ✅ FIX: backend now returns token + user
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onClose();
      } else {
        throw new Error("Registration verified but login failed. Try logging in.");
      }
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setPasskeyError("Passkey cancelled. Try again.");
      } else {
        setPasskeyError(err.message || "Something went wrong");
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  // ── PASSKEY LOGIN ───────────────────────────────────────
  const handlePasskeyLogin = async () => {
    setPasskeyError("");
    setPasskeyLoading(true);
    try {
      // 1. Get auth options — ✅ FIX: no email needed (discoverable credentials)
      //    Browser will show all saved passkeys for this site automatically
      const optRes = await fetch(`${API_BASE}/passkey/login/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!optRes.ok) throw new Error("Could not start passkey login");
      const options = await optRes.json();

      // 2. Convert challenge → ArrayBuffer
      options.challenge = base64urlToBuffer(options.challenge);
      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map((c) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        }));
      }

      // 3. Browser shows passkey picker — user selects their passkey
      const assertion = await navigator.credentials.get({ publicKey: options });

      // 4. Send to backend — ✅ FIX: no email in body, backend extracts from userHandle
      const verifyRes = await fetch(`${API_BASE}/passkey/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id:    assertion.id,
          rawId: bufferToBase64url(assertion.rawId),
          type:  assertion.type,
          response: {
            clientDataJSON:    bufferToBase64url(assertion.response.clientDataJSON),
            authenticatorData: bufferToBase64url(assertion.response.authenticatorData),
            signature:         bufferToBase64url(assertion.response.signature),
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
      // ✅ FIX: backend now returns token + user
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onClose();
      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setPasskeyError("Passkey cancelled. Try again.");
      } else {
        setPasskeyError(err.message || "Something went wrong");
      }
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

        .pv-overlay {
          position:fixed; inset:0;
          background:rgba(8,14,30,0.52);
          backdrop-filter:blur(10px);
          -webkit-backdrop-filter:blur(10px);
          z-index:999;
          animation:fadeIn .28s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .pv-panel {
          position:fixed; left:0; top:0; bottom:0;
          width:500px;
          background:linear-gradient(160deg,#ffffff 0%,#f5f8ff 100%);
          z-index:1000;
          display:flex; align-items:center; justify-content:center;
          overflow:hidden;
          box-shadow:2px 0 80px rgba(0,0,0,0.16);
          animation:slideIn .42s cubic-bezier(.19,1,.22,1);
        }
        @keyframes slideIn {
          from{transform:translateX(-60px);opacity:0}
          to{transform:translateX(0);opacity:1}
        }

        .shape {
          position:absolute; border-radius:50%;
          filter:blur(90px); opacity:.45; pointer-events:none;
        }
        .shape1 { width:280px;height:280px;background:#bfdbfe;top:-80px;left:-80px; }
        .shape2 { width:300px;height:300px;background:#ede9fe;bottom:-120px;right:-100px; }
        .shape3 { width:200px;height:200px;background:#d1fae5;bottom:140px;left:60px;opacity:.35; }

        .pv-close {
          position:absolute; top:22px; right:22px;
          width:42px; height:42px; border-radius:50%;
          background:rgba(241,245,249,0.9);
          backdrop-filter:blur(4px);
          border:none; color:#334155;
          font-size:16px; font-weight:700;
          cursor:pointer;
          transition:transform .3s ease,background .2s ease;
          z-index:5;
          display:flex; align-items:center; justify-content:center;
        }
        .pv-close:hover { transform:rotate(90deg); background:#e2e8f0; }

        .pv-card {
          width:360px; position:relative; z-index:2;
          animation:cardFade .5s ease;
        }
        @keyframes cardFade {
          from{opacity:0;transform:translateY(22px)}
          to{opacity:1;transform:translateY(0)}
        }

        .pv-logo {
          display:flex; align-items:center; justify-content:center;
          margin-bottom:32px;
        }
        .pv-logo img {
          width:112px; height:112px;
          object-fit:contain; border-radius:30px;
          padding:12px;
        }

        .pv-tabs {
          display:flex; background:#eef2f7;
          padding:5px; border-radius:20px;
          margin-bottom:24px; gap:4px;
        }
        .pv-tab {
          flex:1; height:50px; border:none;
          border-radius:15px; background:transparent;
          color:#94a3b8;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:15px; font-weight:700;
          cursor:pointer; transition:all .25s ease;
          letter-spacing:-0.1px;
        }
        .pv-tab.active {
          background:#ffffff; color:#0f172a;
          box-shadow:0 1px 3px rgba(0,0,0,0.08),0 4px 12px rgba(0,0,0,0.05);
        }

        .pv-btn {
          width:100%; height:64px;
          border-radius:18px; background:#ffffff;
          border:1.5px solid #e8edf4;
          display:flex; align-items:center; justify-content:center;
          gap:13px; color:#0f172a;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:16px; font-weight:700;
          cursor:pointer; margin-bottom:13px;
          transition:all .25s cubic-bezier(.2,.9,.4,1.1);
          box-shadow:0 2px 8px rgba(0,0,0,0.04);
          letter-spacing:-0.1px;
        }
        .pv-btn:hover {
          transform:translateY(-2px);
          border-color:#c8d5e8;
          box-shadow:0 8px 20px rgba(0,0,0,0.07),0 2px 6px rgba(0,0,0,0.04);
        }
        .pv-btn:active { transform:translateY(0); box-shadow:0 2px 8px rgba(0,0,0,0.04); }
        .pv-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
        .pv-btn svg { flex-shrink:0; }

        /* ✅ Email input for passkey register */
        .pv-input {
          width:100%;
          height:54px;
          border-radius:16px;
          border:1.5px solid #e8edf4;
          padding:0 16px;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:15px;
          font-weight:500;
          color:#0f172a;
          background:#ffffff;
          margin-bottom:13px;
          outline:none;
          transition:border-color .2s;
        }
        .pv-input:focus { border-color:#6366f1; }
        .pv-input::placeholder { color:#cbd5e1; }

        .pv-spin {
          width:18px; height:18px;
          border:2.5px solid rgba(255,255,255,0.3);
          border-top-color:#fff;
          border-radius:50%;
          animation:spin .65s linear infinite;
          flex-shrink:0;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        .pv-or {
          display:flex; align-items:center; gap:10px;
          margin:2px 0 13px;
          font-size:11.5px; font-weight:700;
          color:#cbd5e1; letter-spacing:1.2px;
          text-transform:uppercase;
        }
        .pv-or::before,.pv-or::after {
          content:''; flex:1; height:1px; background:#e8edf4;
        }

        .pv-error {
          font-size:12.5px; font-weight:600;
          color:#ef4444; text-align:center;
          margin-bottom:12px;
          padding:9px 12px;
          background:#fef2f2;
          border-radius:12px;
          border:1px solid #fecaca;
        }

        .pv-footer {
          margin-top:12px; text-align:center;
          font-size:12.5px; line-height:1.7;
          color:#94a3b8; font-weight:500;
        }
        .pv-footer span {
          color:#475569; font-weight:700; cursor:pointer;
          border-bottom:1.5px solid #cbd5e1; padding-bottom:1px;
          transition:color .18s,border-color .18s;
        }
        .pv-footer span:hover { color:#0f172a; border-color:#0f172a; }

        @media(max-width:700px) {
          .pv-panel { width:100%; }
          .pv-card  { width:86%; }
          .pv-logo img { width:96px; height:96px; }
        }

      `}</style>

      <div className="pv-overlay" onClick={onClose} />

      <div className="pv-panel">

        <div className="shape shape1" />
        <div className="shape shape2" />
        <div className="shape shape3" />

        <button className="pv-close" onClick={onClose}>✕</button>

        <div className="pv-card">

          <div className="pv-logo">
            <img src="/playvora.png" alt="logo" />
          </div>

          <div className="pv-tabs">
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
          <button className="pv-btn" onClick={() => { window.location.href = `${API_BASE}/auth/google`; }}>
            <svg width="22" height="22" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          {/* Microsoft */}
          <button className="pv-btn" onClick={() => { window.location.href = `${API_BASE}/auth/microsoft`; }}>
            <svg width="22" height="22" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Continue with Microsoft
          </button>

          {/* ✅ FIX: Email input shown when registering via passkey */}
          {mode === "signup" && showEmailInput && (
            <input
              className="pv-input"
              type="email"
              placeholder="Enter your email"
              value={passkeyEmail}
              onChange={(e) => { setPasskeyEmail(e.target.value); setPasskeyError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handlePasskeyRegister(); }}
              autoFocus
            />
          )}

          {/* Passkey */}
          <button className="pv-btn" onClick={handlePasskey} disabled={passkeyLoading}>
            {passkeyLoading ? (
              <><span className="pv-spin" style={{borderColor:"rgba(15,23,42,0.2)",borderTopColor:"#0f172a"}} /> Verifying...</>
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

          {passkeyError && <div className="pv-error">{passkeyError}</div>}

          <div className="pv-footer">
            By continuing you agree to our{" "}
            <span onClick={() => { onClose(); navigate("/privacy"); }}>Privacy Policy</span>
          </div>

        </div>
      </div>
    </>
  );
}