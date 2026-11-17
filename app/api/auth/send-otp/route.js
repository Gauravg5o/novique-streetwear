import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/users';
import { createOTP, sendVerificationEmail } from '@/lib/otp';

const ADMIN_EMAIL = 'gauravmishra5621@gmail.com';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const name = (body.name || '').trim();
    const password = (body.password || '').trim();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters long.' }, { status: 400 });
    }

    if (email === ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { error: 'This email is reserved for Store Administration. Please Sign In directly.' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please Sign In instead.' },
        { status: 400 }
      );
    }

    // Create 6-digit OTP and store metadata
    const code = createOTP(email, { name, password });

    // Send email
    const mailResult = await sendVerificationEmail(email, code, name);

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
      needsConfig: mailResult.needsConfig || false,
      // If SMTP is not yet configured, provide helpful hint in dev
      devCode: mailResult.needsConfig ? code : undefined,
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: 'Failed to generate verification code.' }, { status: 500 });
  }
}
