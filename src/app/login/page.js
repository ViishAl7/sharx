
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCommunityAuth } from "../../context/CommunityAuthContext";

export default function LoginPage() {
  const { login } = useCommunityAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function getDestination() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    if (
      next &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      !next.startsWith("/login") &&
      !next.startsWith("/auth/callback")
    ) {
      return next;
    }

    return "/community";
  }

  async function submit(e) {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await login({ email: email.trim(), password });
      router.replace(getDestination());
    } catch (err) {
      setError(err?.message || "Unable to log in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="community-login">
      <style jsx global>{`
        .community-login {
          --bg: #080912;
          --card: #111321;
          --border: rgba(255, 255, 255, 0.09);
          --muted: #9296aa;
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--bg);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          position: relative;
          overflow: hidden;
          font-family: Arial, Helvetica, sans-serif;
        }

        .community-login *,
        .community-login *::before,
        .community-login *::after {
          box-sizing: border-box;
        }

        .community-login::before {
          content: "";
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(
            circle,
            rgba(111, 76, 255, 0.17),
            transparent 68%
          );
          top: -300px;
          left: -180px;
          pointer-events: none;
        }

        .community-login::after {
          content: "";
          position: absolute;
          width: 550px;
          height: 550px;
          background: radial-gradient(
            circle,
            rgba(43, 126, 255, 0.12),
            transparent 68%
          );
          bottom: -300px;
          right: -180px;
          pointer-events: none;
        }

        .community-login .login-shell {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 430px;
          animation: login-enter 0.5s ease both;
        }

        .community-login .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 34px;
          text-decoration: none;
          color: white;
        }

        .community-login .brand-mark {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #7657ff, #477cff);
          font-size: 20px;
          font-weight: 900;
          box-shadow: 0 5px 24px rgba(104, 91, 255, 0.3);
        }

        .community-login .brand-name {
          font-size: 23px;
          font-weight: 850;
          letter-spacing: 2px;
        }

        .community-login .brand-name span {
          color: #8b75ff;
        }

        .community-login .login-card {
          background: rgba(17, 19, 33, 0.88);
          border: 1px solid var(--border);
          border-radius: 22px;
          padding: 38px 34px;
          box-shadow: 0 25px 90px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(20px);
        }

        .community-login .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid rgba(139, 117, 255, 0.2);
          background: rgba(139, 117, 255, 0.08);
          color: #b5a7ff;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .community-login .eyebrow-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9279ff;
          box-shadow: 0 0 10px #9279ff;
        }

        .community-login h1 {
          font-size: 30px;
          line-height: 1.2;
          letter-spacing: -1px;
          margin: 22px 0 9px;
          font-weight: 800;
        }

        .community-login .subtitle {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.7;
          margin: 0 0 29px;
        }

        .community-login .field {
          margin-bottom: 19px;
        }

        .community-login .field label {
          display: block;
          font-size: 12px;
          color: #d6d8e5;
          font-weight: 650;
          margin-bottom: 9px;
        }

        .community-login .input-wrap {
          position: relative;
        }

        .community-login input {
          width: 100%;
          height: 49px;
          padding: 0 15px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.035);
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .community-login input::placeholder {
          color: #686d82;
        }

        .community-login input:focus {
          border-color: #8068ff;
          background: rgba(128, 104, 255, 0.055);
          box-shadow: 0 0 0 3px rgba(128, 104, 255, 0.1);
        }

        .community-login .password-input {
          padding-right: 72px;
        }

        .community-login .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: none;
          color: #a5a8ba;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          padding: 7px;
        }

        .community-login .toggle-password:hover {
          color: white;
        }

        .community-login .error-message {
          border: 1px solid rgba(255, 86, 105, 0.25);
          background: rgba(255, 86, 105, 0.08);
          color: #ff9ba8;
          padding: 12px 13px;
          border-radius: 9px;
          font-size: 12px;
          line-height: 1.5;
          margin: 0 0 17px;
        }

        .community-login .submit-button {
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 10px;
          margin-top: 5px;
          background: linear-gradient(110deg, #7657ff, #527cff);
          color: white;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(102, 91, 255, 0.2);
          transition: transform 0.2s, filter 0.2s, opacity 0.2s;
        }

        .community-login .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .community-login .submit-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .community-login .signup-line {
          text-align: center;
          color: var(--muted);
          font-size: 13px;
          margin: 25px 0 0;
        }

        .community-login .signup-line a {
          color: #a99aff;
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;
        }

        .community-login .signup-line a:hover {
          color: white;
        }

        .community-login .back-link {
          display: block;
          width: fit-content;
          margin: 25px auto 0;
          color: #85899d;
          text-decoration: none;
          font-size: 12px;
          transition: color 0.2s;
        }

        .community-login .back-link:hover {
          color: white;
        }

        .community-login .footer-note {
          text-align: center;
          color: #64697d;
          font-size: 11px;
          margin-top: 27px;
        }

        @keyframes login-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .community-login {
            padding: 24px 16px;
          }

          .community-login .login-card {
            padding: 30px 23px;
            border-radius: 18px;
          }

          .community-login h1 {
            font-size: 27px;
          }

          .community-login .brand {
            margin-bottom: 26px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .community-login .login-shell {
            animation: none;
          }

          .community-login * {
            transition: none !important;
          }
        }
      `}</style>

      <div className="login-shell">
        <Link href="/community" className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-name">
            SHARX<span>.</span>
          </span>
        </Link>

        <section className="login-card">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            COMMUNITY ACCESS
          </div>

          <h1>Welcome back.</h1>
          <p className="subtitle">
            Your community is waiting. Sign in to continue where you left off.
          </p>

          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="community-email">Email address</label>
              <input
                id="community-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="community-password">Password</label>
              <div className="input-wrap">
                <input
                  id="community-password"
                  className="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={busy}
            >
              {busy ? "Signing you in..." : "Sign in to Community"}
            </button>
          </form>

          <p className="signup-line">
            New to SHARX?
            <Link href="/signup">Create an account</Link>
          </p>
        </section>

        <Link href="/community" className="back-link">
          ← Back to Community
        </Link>

        <p className="footer-note">
          SHARX COMMUNITY · BUILT FOR THE COMMUNITY
        </p>
      </div>
    </main>
  );
}
