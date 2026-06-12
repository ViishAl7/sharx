import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  
  // Step tracking (1: Email, 2: OTP, 3: New Password)
  const [step, setStep] = useState(1);
  
  // Form data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI states
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Password strength
  const passwordStrength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 6) s++;
    if (newPassword.length >= 10) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();
  
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Great"][passwordStrength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#f59e0b", "#3b82f6", "#1e40af"][passwordStrength];
  
  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  
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
  
  // Step 1: Send OTP
  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:5001/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      
      setResendTimer(60);
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:5001/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      
      setResendTimer(60);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:5001/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:5001/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
}

/* ========== ANIMATIONS ========== */
@keyframes fadeScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(40px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
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
  animation: slideInLeft 0.6s ease forwards;
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
  background: linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  width: fit-content;
}

.left-logo:hover {
  transform: scale(1.02);
  opacity: 0.9;
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
  animation: fadeUp 0.8s ease 0.2s forwards;
  opacity: 0;
  animation-fill-mode: forwards;
}

/* ========== RIGHT SIDE ========== */
.right {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  animation: slideInRight 0.6s ease forwards;
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
  animation: fadeScale 0.5s cubic-bezier(0.2,0.9,0.4,1.1) 0.1s forwards;
  opacity: 0;
  animation-fill-mode: forwards;
}

.form-heading {
  font-family: 'Righteous', cursive;
  font-size: 38px;
  line-height: 1.2;
  margin-bottom: 8px;
  color: #1E293B;
}

.form-sub {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 28px;
}

.form-rule {
  height: 4px;
  width: 56px;
  background: linear-gradient(90deg, #1E293B 0%, #64748B 100%);
  border-radius: 4px;
  margin-bottom: 32px;
}

/* ========== FORM FIELDS ========== */
.field-group {
  position: relative;
  margin-bottom: 28px;
}

.field-label {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  font-weight: 600;
  color: #94A3B8;
  pointer-events: none;
  transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  background: transparent;
  padding: 0 4px;
  z-index: 2;
}

.field-group.focused .field-label,
.field-group.has-value .field-label {
  top: 0;
  transform: translateY(-50%) scale(0.82);
  color: #1E293B;
  font-weight: 700;
  background: rgba(255,255,255,0.9);
}

.field-input {
  width: 100%;
  padding: 22px 18px 10px;
  background: rgba(255,255,255,0.9);
  border: 1.5px solid #E2E8F0;
  border-radius: 18px;
  font-size: 15px;
  font-weight: 500;
  color: #1E293B;
  outline: none;
  transition: all 0.25s ease;
  font-family: 'Nunito', sans-serif;
}

.field-input:focus {
  border-color: #1E293B;
  box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
  background: #FFFFFF;
}

.field-input.pad-r {
  padding-right: 75px;
}

/* OTP Input - Special styling */
.otp-input {
  text-align: center;
  letter-spacing: 8px;
  font-size: 28px;
  font-weight: 700;
  font-family: monospace;
}

/* Show/Hide button */
.show-btn {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 11px;
  font-weight: 800;
  color: #94A3B8;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.2s ease;
}

.show-btn:hover {
  color: #1E293B;
}

/* Password Strength */
.strength {
  margin-top: 12px;
}

.strength-bars {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.strength-bar {
  flex: 1;
  height: 5px;
  background: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 4px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

.strength-fill.on {
  transform: scaleX(1);
}

.strength-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Resend OTP */
.resend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 20px;
}

.resend-text {
  font-size: 12px;
  color: #64748B;
}

.resend-btn {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 800;
  color: #1E293B;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.resend-btn:hover:not(:disabled) {
  text-decoration: underline;
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
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

/* ========== BACK BUTTON ========== */
.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #64748B;
  cursor: pointer;
  margin-bottom: 24px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  color: #1E293B;
  transform: translateX(-3px);
}

/* ========== ERROR & SUCCESS ========== */
.error-box {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #EF4444;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeScale 0.2s ease;
}

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
  margin-bottom: 24px;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 860px) {
  .page { grid-template-columns: 1fr; }
  .left { padding: 40px 32px; min-height: 260px; }
  .left-title { font-size: 42px; margin-top: 40px; }
  .form { padding: 36px 28px; margin: 20px; }
  .form-heading { font-size: 32px; }
}

@media (max-width: 480px) {
  .form { padding: 28px 20px; margin: 16px; }
  .form-heading { font-size: 28px; }
  .field-input { padding: 20px 14px 10px; }
  .field-label { left: 14px; font-size: 14px; }
  .btn { padding: 12px 20px; }
  .otp-input { letter-spacing: 4px; font-size: 22px; }
}
      `}</style>

      <div className="page">
        {/* LEFT SIDE */}
        <div className="left">
          <div className="left-logo" onClick={() => navigate("/")}>Playvora</div>
          <div className="left-title">
            Reset<br />
            Your<br />
            Password.
          </div>
        </div>

        {/* RIGHT SIDE - 3 STEP FLOW */}
        <div className="right">
          <div className="form">
            {success ? (
              // SUCCESS STATE
              <div className="success-container">
                <div className="success-icon">✓</div>
                <div className="success-title">Password Reset!</div>
                <div className="success-message">
                  Your password has been reset successfully.<br />
                  Redirecting you to login...
                </div>
                <button className="btn" onClick={() => navigate("/login")}>
                  Go to Login →
                </button>
              </div>
            ) : (
              <>
                {/* STEP 1: EMAIL */}
                {step === 1 && (
                  <>
                    <button className="back-btn" onClick={() => navigate("/login")}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                      Back to Login
                    </button>

                    <div className="form-heading">Forgot<br />Password?</div>
                    <div className="form-sub">Enter your email and we'll send you a 6-digit code to reset your password.</div>

                    <div className={`field-group ${focused === "email" ? "focused" : ""} ${email ? "has-value" : ""}`}>
                      <label className="field-label">Email address</label>
                      <input
                        className="field-input"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused("")}
                        onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                      />
                    </div>

                    {error && (
                      <div className="error-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                      </div>
                    )}

                    <button className="btn" onClick={handleSendOTP} disabled={loading}>
                      {loading ? (
                        <>Sending Code <div className="spin" /></>
                      ) : (
                        <>Send Reset Code →</>
                      )}
                    </button>
                  </>
                )}

                {/* STEP 2: OTP VERIFICATION */}
                {step === 2 && (
                  <>
                    <button className="back-btn" onClick={() => setStep(1)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                      Back to Email
                    </button>

                    <div className="form-heading">Enter Code</div>
                    <div className="form-sub">We've sent a 6-digit verification code to <strong>{email}</strong></div>

                    <div className={`field-group ${focused === "otp" ? "focused" : ""} ${otp ? "has-value" : ""}`}>
                      <label className="field-label">6-digit code</label>
                      <input
                        className="field-input otp-input"
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        onFocus={() => setFocused("otp")}
                        onBlur={() => setFocused("")}
                        onKeyDown={e => e.key === "Enter" && handleVerifyOTP()}
                      />
                    </div>

                    <div className="resend-row">
                      <span className="resend-text">
                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive the code?"}
                      </span>
                      <button 
                        className="resend-btn" 
                        onClick={handleResendOTP} 
                        disabled={resendTimer > 0 || loading}
                      >
                        Resend Code
                      </button>
                    </div>

                    {error && (
                      <div className="error-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                      </div>
                    )}

                    <button className="btn" onClick={handleVerifyOTP} disabled={loading}>
                      {loading ? (
                        <>Verifying <div className="spin" /></>
                      ) : (
                        <>Verify & Continue →</>
                      )}
                    </button>
                  </>
                )}

                {/* STEP 3: NEW PASSWORD */}
                {step === 3 && (
                  <>
                    <button className="back-btn" onClick={() => setStep(2)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                      Back to Code
                    </button>

                    <div className="form-heading">New Password</div>
                    <div className="form-sub">Create a strong password for your account</div>

                    <div className={`field-group ${focused === "newPassword" ? "focused" : ""} ${newPassword ? "has-value" : ""}`}>
                      <label className="field-label">New password</label>
                      <input
                        className="field-input pad-r"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        onFocus={() => setFocused("newPassword")}
                        onBlur={() => setFocused("")}
                      />
                      <button className="show-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? "HIDE" : "SHOW"}
                      </button>
                    </div>

                    {newPassword.length > 0 && (
                      <div className="strength">
                        <div className="strength-bars">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div className="strength-bar" key={i}>
                              <div
                                className={`strength-fill ${passwordStrength >= i ? "on" : ""}`}
                                style={{ background: passwordStrength >= i ? strengthColor : "transparent" }}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</div>
                      </div>
                    )}

                    <div className={`field-group ${focused === "confirmPassword" ? "focused" : ""} ${confirmPassword ? "has-value" : ""}`}>
                      <label className="field-label">Confirm password</label>
                      <input
                        className="field-input pad-r"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocused("confirmPassword")}
                        onBlur={() => setFocused("")}
                        onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                      />
                    </div>

                    {error && (
                      <div className="error-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {error}
                      </div>
                    )}

                    <button className="btn" onClick={handleResetPassword} disabled={loading}>
                      {loading ? (
                        <>Resetting <div className="spin" /></>
                      ) : (
                        <>Reset Password →</>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;