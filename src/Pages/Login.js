import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState("");

  // Bubble Animation Effect
  useEffect(() => {
    const bubbleCount = 15;
    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const size = 15 + Math.random() * 60;
      bubble.style.width = size + 'px';
      bubble.style.height = size + 'px';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.animationDuration = 6 + Math.random() * 10 + 's';
      bubble.style.animationDelay = Math.random() * 10 + 's';
      document.body.appendChild(bubble);
    }
    return () => {
      document.querySelectorAll('.bubble').forEach(b => b.remove());
    };
  }, []);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Required";
    else if (!email.includes("@")) e.email = "Invalid email";
    if (!password) e.password = "Required";
    else if (password.length < 6) e.password = "Min. 6 chars";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      authLogin && authLogin();

      // Get user name from response
      const name = data.user?.name || data.user?.username || email.split('@')[0];
      setUserName(name);
      setShowSuccess(true);

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setErrors({ server: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const clearErr = (f) => {
    if (errors[f]) setErrors(p => { const n = { ...p }; delete n[f]; return n; });
  };

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Righteous&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #F5F7FA;
  font-family: 'Nunito', sans-serif;
  color: #1E293B;
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ========== ANIMATIONS ========== */
@keyframes fadeScale {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-32px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(32px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== BUBBLES BACKGROUND ========== */
.bubble {
  position: fixed;
  background: radial-gradient(circle, rgba(135,206,235,0.15), rgba(74,144,226,0.08));
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  animation: bubbleFloat linear infinite;
}

@keyframes bubbleFloat {
  0% {
    transform: translateY(100vh) scale(0.3);
    opacity: 0;
  }
  20% {
    opacity: 0.5;
  }
  80% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
}

/* ========== PAGE CONTAINER ========== */
.page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  z-index: 1;
}

/* ========== LEFT SIDE ========== */
.left {
  background: linear-gradient(145deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.88) 100%);
  backdrop-filter: blur(10px);
  padding: 60px 70px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: slideInLeft 0.55s ease forwards;
}

.left::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  pointer-events: none;
}

.left::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%);
  pointer-events: none;
}

.left-logo {
  font-family: 'Righteous', cursive;
  font-size: 28px;
  letter-spacing: 1.5px;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: opacity 0.25s ease, transform 0.25s ease;
  width: fit-content;
}

.left-logo:hover {
  transform: scale(1.02);
  opacity: 0.85;
}

.left-title {
  font-family: 'Righteous', cursive;
  font-size: clamp(48px, 6.8vw, 82px);
  line-height: 1.08;
  letter-spacing: 0.6px;
  color: #FFFFFF;
  margin-top: auto;
  position: relative;
  z-index: 1;
  text-shadow: 0 4px 20px rgba(0,0,0,0.2);
  animation: fadeUp 0.7s ease 0.15s forwards;
  opacity: 0;
}

/* ========== RIGHT SIDE ========== */
.right {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  animation: slideInRight 0.55s ease forwards;
}

.form {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 32px;
  padding: 48px 44px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.4);
  animation: fadeScale 0.45s cubic-bezier(0.2,0.9,0.4,1.1) 0.08s forwards;
  opacity: 0;
}

.form-heading {
  font-family: 'Righteous', cursive;
  font-size: 42px;
  line-height: 1.1;
  margin-bottom: 6px;
  color: #1E293B;
}

.form-rule {
  height: 4px;
  width: 56px;
  background: linear-gradient(90deg, #1E293B 0%, #64748B 100%);
  border-radius: 4px;
  margin-bottom: 40px;
}

/* ========== FORM FIELDS ========== */
.fields {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-bottom: 32px;
}

.fl {
  position: relative;
}

.fl-label {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  font-weight: 600;
  color: #94A3B8;
  pointer-events: none;
  transition: top 0.22s cubic-bezier(0.2, 0.9, 0.4, 1.1), transform 0.22s cubic-bezier(0.2, 0.9, 0.4, 1.1), color 0.22s ease, background 0.22s ease;
  background: transparent;
  padding: 0 4px;
  z-index: 2;
}

.fl.active .fl-label,
.fl.has-val .fl-label {
  top: 0;
  transform: translateY(-50%) scale(0.82);
  color: #1E293B;
  font-weight: 700;
  background: rgba(255,255,255,0.9);
}

.fl-input {
  width: 100%;
  padding: 22px 18px 10px;
  background: rgba(255,255,255,0.9);
  border: 1.5px solid #E2E8F0;
  border-radius: 18px;
  font-size: 15px;
  font-weight: 500;
  color: #1E293B;
  outline: none;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
  font-family: 'Nunito', sans-serif;
}

.fl-input:focus {
  border-color: #1E293B;
  box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
  background: #FFFFFF;
}

.fl-input.pad-r { padding-right: 75px; }

.fl-show {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #94A3B8;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.fl-show:hover { color: #1E293B; }

.fl-err-row {
  position: absolute;
  bottom: -24px;
  left: 6px;
  font-size: 12px;
  color: #EF4444;
  font-weight: 600;
}

/* ========== BUTTONS ========== */
.btn {
  width: 100%;
  padding: 15px 28px;
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
  transition: transform 0.25s cubic-bezier(0.2,0.9,0.4,1.1), box-shadow 0.25s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.btn:active { transform: translateY(0) scale(0.99); }

.btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ========== DIVIDER ========== */
.divider {
  margin: 28px 0 24px;
  display: flex;
  align-items: center;
  color: #94A3B8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
}

.divider::before {
  background: linear-gradient(90deg, #E2E8F0 0%, transparent 100%);
}

.divider::after {
  background: linear-gradient(90deg, transparent 0%, #E2E8F0 100%);
}

.divider span { padding: 0 14px; }

/* ========== GOOGLE BUTTON ========== */
.g-btn {
  width: 100%;
  padding: 14px 24px;
  background: rgba(255,255,255,0.95);
  border: 1.5px solid #E2E8F0;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: border-color 0.25s ease, background 0.25s ease, transform 0.25s cubic-bezier(0.2,0.9,0.4,1.1), box-shadow 0.25s ease;
  color: #1E293B;
}

.g-btn:hover {
  border-color: #1E293B;
  background: #FFFFFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.g-btn:active {
  transform: translateY(0) scale(0.99);
}

/* ========== FOOTER ========== */
.btm {
  text-align: center;
  margin-top: 28px;
  font-size: 14px;
  color: #64748B;
}

.btm-lnk {
  color: #1E293B;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  text-decoration: none;
  border-bottom: 1.5px solid #1E293B;
}

.btm-lnk:hover {
  opacity: 0.7;
  transform: translateX(2px);
}

/* ========== SUCCESS STATE ========== */
.success-container {
  text-align: center;
  padding: 40px 0;
  animation: fadeScale 0.4s ease;
}

.success-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 36px;
  color: white;
  box-shadow: 0 8px 20px rgba(16,185,129,0.3);
}

.success-title {
  font-family: 'Righteous', cursive;
  font-size: 28px;
  color: #1E293B;
  margin-bottom: 12px;
}

.success-message {
  font-size: 14px;
  color: #64748B;
  line-height: 1.6;
}

/* ========== FORGOT LINK ========== */
.forgot-link {
  text-align: right;
  margin-top: -12px;
  margin-bottom: 8px;
}

.forgot-btn {
  background: none;
  border: none;
  font-family: 'Nunito', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #64748B;
  cursor: pointer;
  transition: color 0.2s ease;
}

.forgot-btn:hover {
  color: #1E293B;
  text-decoration: underline;
}

/* ========== SERVER ERROR ========== */
.server-err {
  color: #EF4444;
  font-size: 13px;
  margin: 12px 0;
  font-weight: 600;
  padding-left: 8px;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 860px) {
  .page { grid-template-columns: 1fr; }
  .left { padding: 40px 32px; min-height: 240px; }
  .left-title { font-size: 42px; margin-top: 40px; }
  .form { padding: 36px 28px; margin: 20px; }
  .form-heading { font-size: 34px; }
}

@media (max-width: 480px) {
  .form { padding: 28px 20px; margin: 16px; }
  .form-heading { font-size: 30px; }
  .fl-input { padding: 20px 14px 10px; }
  .fl-label { left: 14px; font-size: 14px; }
  .btn, .g-btn { padding: 12px 20px; }
}
      `}</style>

      <div className="page">
        <div className="left">
          <div className="left-logo" onClick={() => navigate("/")} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <img src="/sharx.png" alt="Sharx Logo" style={{ height: '43px', width: 'auto' }} />
            <span style={{ fontFamily: "'Righteous', cursive", fontSize: '20px', color: '#fff' }}>Sharx</span>
          </div>
          <div className="left-title">
            Continue <br />
            Your <br />
            Journey.
          </div>
        </div>

        <div className="right">
          <div className="form">
            {showSuccess ? (
              <div className="success-container">
                <div className="success-icon">✓</div>
                <div className="success-title">Welcome back, {userName}!</div>
                <div className="success-message">
                  Login successful.<br />Taking you to home...
                </div>
              </div>
            ) : (
              <>
                <div className="form-heading">Sign in to<br />continue.</div>
                <div className="form-rule" />

                <div className="fields">
                  {/* Email Field */}
                  <div style={{ position: "relative", paddingBottom: errors.email ? "28px" : "0" }}>
                    <div className={`fl ${focused === "email" ? "active" : ""}${email ? " has-val" : ""}`}>
                      <label className="fl-label">Email address</label>
                      <input
                        className="fl-input"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearErr("email"); }}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused("")}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                      />
                      {errors.email && <div className="fl-err-row">{errors.email}</div>}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div style={{ position: "relative", paddingBottom: errors.password ? "28px" : "0" }}>
                    <div className={`fl ${focused === "password" ? "active" : ""}${password ? " has-val" : ""}`}>
                      <label className="fl-label">Password</label>
                      <input
                        className="fl-input pad-r"
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={e => { setPassword(e.target.value); clearErr("password"); }}
                        onFocus={() => setFocused("password")}
                        onBlur={() => setFocused("")}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                      />
                      <button className="fl-show" onClick={() => setShowPass(!showPass)}>
                        {showPass ? "HIDE" : "SHOW"}
                      </button>
                      {errors.password && <div className="fl-err-row">{errors.password}</div>}
                    </div>
                  </div>
                </div>

                <div className="forgot-link">
                  <button className="forgot-btn" onClick={() => navigate("/forgot-password")}>
                    Forgot password?
                  </button>
                </div>

                {errors.server && (
                  <div className="server-err">{errors.server}</div>
                )}

                <button className={`btn ${loading ? "loading" : ""}`} onClick={handleLogin}>
                  {loading ? (
                    <>Signing in <div className="spin" /></>
                  ) : (
                    <>Sign In →</>
                  )}
                </button>

                <div className="divider"><span>OR</span></div>

                <button
                  className="g-btn"
                  onClick={() => {
                    window.location.href = "http://localhost:5001/auth/google";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
                  </svg>
                  Continue with Google
                </button>
                {/* <button
                  className="g-btn"
                  style={{ marginTop: "12px" }}
                  onClick={() => {
                    window.location.href = "http://localhost:5001/auth/microsoft";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                  Continue with Microsoft
                </button> */}

                <div className="btm">
                  Don't have an account?{" "}
                  <span className="btm-lnk" onClick={() => navigate("/signup")}>Create account →</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;