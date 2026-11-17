import { NextResponse } from 'next/server';
import { authenticateUser, signAuthToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email || body.username;
    const password = body.password;

    const result = authenticateUser(email, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Invalid credentials' }, { status: 401 });
    }

    const token = await signAuthToken(result.user);

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    // Set cookie
    response.cookies.set('novique_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    if (result.user.role === 'admin') {
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    } else {
      // Clear admin token if a normal customer logs in
      response.cookies.delete('admin_token');
    }

    return response;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ error: 'Server authentication error' }, { status: 500 });
  }
}
