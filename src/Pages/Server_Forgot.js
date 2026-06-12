// ========================
// ADD THESE AT THE TOP of server.js (after existing requires)
// ========================
// require('dotenv').config();
// const { Resend } = require('resend');
// const resend = new Resend(process.env.RESEND_API_KEY);
//
// Also add this Map near the top (after prisma):
// const otpStore = new Map(); // { email: { otp, expiresAt } }
// ========================


// ========================
// FORGOT PASSWORD — SEND OTP
// ========================
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not (security)
      return res.json({ message: "If this email exists, OTP has been sent." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in memory
    otpStore.set(email, { otp, expiresAt });

    // Send email via Resend
    await resend.emails.send({
      from: "Playvora <onboarding@resend.dev>",
      to: email,
      subject: "Your Playvora Password Reset Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#f0f8ff;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f8ff;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(21,101,192,.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#0d47a1 0%,#1565c0 50%,#039be5 100%);padding:36px 40px 32px;">
                      <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:.5px;">Playvora</h1>
                      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,.65);">Password Reset</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0a1929;">Hi ${user.name},</p>
                      <p style="margin:0 0 32px;font-size:15px;color:#7aa0be;line-height:1.65;">
                        We received a request to reset your Playvora password. Use the code below — it expires in <strong style="color:#1565c0;">10 minutes</strong>.
                      </p>

                      <!-- OTP Box -->
                      <div style="background:#e8f4fd;border:2px solid #b3d9f7;border-radius:16px;padding:28px;text-align:center;margin-bottom:32px;">
                        <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#7aa0be;">Your Reset Code</p>
                        <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:12px;color:#1565c0;font-family:'Courier New',monospace;">${otp}</p>
                      </div>

                      <p style="margin:0 0 8px;font-size:13px;color:#7aa0be;line-height:1.65;">
                        If you didn't request this, you can safely ignore this email. Your password won't change.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fbff;border-top:1px solid #e3f2fd;padding:20px 40px;">
                      <p style="margin:0;font-size:12px;color:#b0c4d8;text-align:center;">
                        © 2026 Playvora · This is an automated email, please do not reply.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    res.json({ message: "If this email exists, OTP has been sent." });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to send OTP. Try again." });
  }
});


// ========================
// VERIFY OTP
// ========================
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({ message: "OTP not found. Request a new one." });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP valid — issue a short-lived reset token
    const resetToken = jwt.sign(
      { email, purpose: "reset" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Remove OTP from store
    otpStore.delete(email);

    res.json({ message: "OTP verified", resetToken });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Verification failed." });
  }
});


// ========================
// RESET PASSWORD
// ========================
app.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Reset link expired. Start again." });
    }

    if (decoded.purpose !== "reset") {
      return res.status(400).json({ message: "Invalid reset token." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password reset successful!" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Reset failed." });
  }
});