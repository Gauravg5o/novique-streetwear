import { NextResponse } from 'next/server';
import { socialLoginOrRegister, signAuthToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { provider, email, name, avatar } = body;

    if (!provider || !['google', 'facebook', 'discord'].includes(provider.toLowerCase())) {
      return NextResponse.json({ error: 'Unsupported social provider' }, { status: 400 });
    }

    const result = socialLoginOrRegister(provider.toLowerCase(), { email, name, avatar });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Social login failed' }, { status: 400 });
    }

    const token = await signAuthToken(result.user);

    const response = NextResponse.json({
      success: true,
      user: result.user,
      message: `Signed in successfully with ${provider}!`,
    });

    response.cookies.set('novique_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
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
      response.cookies.delete('admin_token');
    }

    return response;
  } catch (e) {
    console.error('Social login error:', e);
    return NextResponse.json({ error: 'Server error processing social login' }, { status: 500 });
  }
}
