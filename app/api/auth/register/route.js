import { NextResponse } from 'next/server';
import { registerCustomer, signAuthToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    const result = registerCustomer(email, password, name);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Registration failed' }, { status: 400 });
    }

    const token = await signAuthToken(result.user);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: 'Account created successfully! Welcome to Novique.',
    });

    // Set auth cookie
    response.cookies.set('novique_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Make sure admin_token is not set for newly registered user
    response.cookies.delete('admin_token');

    return response;
  } catch (e) {
    console.error('Registration error:', e);
    return NextResponse.json({ error: 'Server registration error' }, { status: 500 });
  }
}
