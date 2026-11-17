import nodemailer from 'nodemailer';

// In-memory OTP storage: email -> { code, expiresAt, name, password }
if (!global._otpStore) {
  global._otpStore = new Map();
}

const otpStore = global._otpStore;

export function createOTP(email, metadata = {}) {
  const cleanEmail = email.trim().toLowerCase();
  // 6-digit numeric OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(cleanEmail, {
    code,
    expiresAt,
    ...metadata,
  });

  return code;
}

export function verifyOTPCode(email, inputCode) {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return { success: false, error: 'No verification code found for this email. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (record.code !== inputCode.trim()) {
    return { success: false, error: 'Invalid verification code. Please check your inbox.' };
  }

  // Code verified! Delete record to prevent replay
  otpStore.delete(cleanEmail);
  return { success: true, metadata: record };
}

// Mail transporter configuration
function getTransporter() {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendVerificationEmail(email, code, name = 'Valued Member') {
  const transporter = getTransporter();

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A0A0C; color: #F5F5F0; padding: 40px 20px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #222;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #C6FF3D; color: #000; font-weight: 900; font-size: 20px; padding: 8px 16px; border-radius: 8px; margin-bottom: 12px;">
          NOVIQUE
        </div>
        <h2 style="color: #FFFFFF; font-size: 22px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
          Email Verification
        </h2>
        <p style="color: #888888; font-size: 13px; margin-top: 6px;">
          Verify your email address to complete your Novique account registration.
        </p>
      </div>

      <div style="background-color: #121217; border: 1px solid #333; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="color: #AAAAAA; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">
          Your 6-Digit Verification Code
        </p>
        <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #C6FF3D; font-family: monospace;">
          ${code}
        </div>
        <p style="color: #666666; font-size: 11px; margin-top: 10px;">
          Valid for 10 minutes. Do not share this code with anyone.
        </p>
      </div>

      <p style="color: #777777; font-size: 11px; line-height: 1.5; text-align: center; margin: 0;">
        If you didn't attempt to sign up for Novique, you can safely ignore this email.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Novique Streetwear" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Novique Verification Code: ${code}`,
        text: `Your Novique verification code is ${code}. Valid for 10 minutes.`,
        html,
      });
      return { sent: true };
    } catch (err) {
      console.error('SMTP Mail send error:', err);
      return { sent: false, error: err.message, fallbackCode: code };
    }
  }

  // If SMTP credentials not yet provided in .env.local
  console.log(`\n==================================================`);
  console.log(`[NOVIQUE OTP VERIFICATION]`);
  console.log(`To: ${email}`);
  console.log(`Code: ${code}`);
  console.log(`(Configure SMTP_USER & SMTP_PASS in .env.local for automated email delivery)`);
  console.log(`==================================================\n`);

  return {
    sent: false,
    needsConfig: true,
    code,
  };
}
