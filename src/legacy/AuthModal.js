import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../config";
function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [mode, setMode] = useState(initialMode); // "login" or "signup"
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Signup States
  const [name, setName] = useState("");

  const clearErrors = () => setErrors({});

  // Validation
  const validateLogin = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!email.includes("@")) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!email.includes("@")) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    clearErrors();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      authLogin(data.token);
      onClose();
      navigate("/home");
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;
    clearErrors();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate("/login"); // ya direct login kar sakte ho
      }, 1500);
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-content">
          {success ? (
            <div className="success-screen">
              <div className="success-icon">✓</div>
              <h2>Account Created!</h2>
              <p>Redirecting to login...</p>
            </div>
          ) : (
            <>
              <div className="modal-header">
                <h1>{mode === "login" ? "Welcome back" : "Let's get started"}</h1>
                <p>{mode === "login" ? "Sign in to continue" : "Create your account"}</p>
              </div>

              <div className="social-buttons">
                <button className="social-btn apple" onClick={() => alert("Apple login coming soon")}>
                  <span></span> Continue with Apple
                </button>
                <button className="social-btn google" 
                  onClick={() => window.location.href = "http://localhost:5001/auth/google"}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" width="20"/>
                  Continue with Google
                </button>
                {/* <button className="social-btn microsoft" onClick={() => alert("Microsoft login coming soon")}>
                  <span>🪟</span> Continue with Microsoft
                </button> */}
              </div>

              <div className="divider"><span>OR</span></div>

              <div className="form-fields">
                {mode === "signup" && (
                  <div className="input-group">
                    <label>Your name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); if(errors.name) setErrors({}); }}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <span className="error">{errors.name}</span>}
                  </div>
                )}

                <div className="input-group">
                  <label>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({}); }}
                    placeholder="you@example.com"
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({}); }}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}>
                      {showPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>
              </div>

              {errors.server && <div className="server-error">{errors.server}</div>}

              <button 
                className="primary-btn"
                onClick={mode === "login" ? handleLogin : handleSignup}
                disabled={loading}
              >
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>

              <div className="switch-mode">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <span onClick={() => { setMode("signup"); clearErrors(); }}>Create one →</span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span onClick={() => { setMode("login"); clearErrors(); }}>Sign in →</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .auth-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .auth-modal {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          position: relative;
          animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border: none;
          background: #f1f1f1;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          z-index: 10;
        }

        .modal-close:hover { background: #fee2e2; color: #ef4444; }

        .modal-content {
          padding: 48px 40px 40px;
        }

        .modal-header h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .modal-header p {
          color: #666;
          margin-bottom: 32px;
        }

        .social-buttons button {
          width: 100%;
          padding: 14px;
          margin-bottom: 12px;
          border: 1.5px solid #e5e5e5;
          border-radius: 16px;
          background: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .social-buttons button:hover {
          border-color: #1a1a1a;
          transform: translateY(-1px);
        }

        .divider {
          text-align: center;
          margin: 24px 0;
          color: #888;
          font-size: 13px;
          font-weight: 600;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e5e5;
        }

        .divider span {
          background: white;
          padding: 0 16px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #444;
          font-size: 14px;
        }

        .input-group input {
          width: 100%;
          padding: 16px 18px;
          border: 1.5px solid #ddd;
          border-radius: 16px;
          font-size: 15px;
          outline: none;
        }

        .input-group input:focus {
          border-color: #1a1a1a;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper button {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-weight: 700;
          color: #666;
          cursor: pointer;
        }

        .error {
          color: #ef4444;
          font-size: 13px;
          margin-top: 6px;
          display: block;
        }

        .server-error {
          color: #ef4444;
          text-align: center;
          margin: 12px 0;
          font-weight: 600;
        }

        .primary-btn {
          width: 100%;
          padding: 16px;
          background: #1a1a1a;
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 8px;
        }

        .primary-btn:hover:not(:disabled) {
          background: #333;
          transform: translateY(-2px);
        }

        .switch-mode {
          text-align: center;
          margin-top: 28px;
          color: #666;
        }

        .switch-mode span {
          color: #1a1a1a;
          font-weight: 800;
          cursor: pointer;
        }

        .success-screen {
          text-align: center;
          padding: 40px 20px;
        }

        .success-icon {
          font-size: 70px;
          margin-bottom: 20px;
        }

        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.88) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default AuthModal;