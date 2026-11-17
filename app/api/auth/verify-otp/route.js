import { NextResponse } from 'next/server';
import { verifyOTPCode } from '@/lib/otp';
import { registerUser } from '@/lib/users';
import { signAuthToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const code = (body.code || '').trim();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and 6-digit verification code are required.' }, { status: 400 });
    }

    const verification = verifyOTPCode(email, code);
    if (!verification.success) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    const { name, password } = verification.metadata;

    // Register user permanently in data/users.json
    const reg = registerUser(email, password, name);
    if (reg.error) {
      return NextResponse.json({ error: reg.error }, { status: 400 });
    }

    // Sign auth JWT token
    const token = await signAuthToken(reg.user);

    const response = NextResponse.json({
      success: true,
      user: reg.user,
      message: 'Email verified and account created successfully! Welcome to Novique.',
    });

    response.cookies.set('novique_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.delete('admin_token');

    return response;
  } catch (err) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ error: 'Server error during verification.' }, { status: 500 });
  }
}
