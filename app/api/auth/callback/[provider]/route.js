import { NextResponse } from 'next/server';
import { socialLoginOrRegister, signAuthToken } from '@/lib/auth';

export async function GET(request, context) {
  const params = await context.params;
  const provider = (params.provider || '').toLowerCase();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  let profile = {
    email: '',
    name: '',
  };

  try {
    // 1. Google OAuth Token Exchange
    if (provider === 'google' && code && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: `${siteUrl}/api/auth/callback/google`,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenRes.json();
      if (tokens.access_token) {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser = await userInfoRes.json();
        profile.email = googleUser.email;
        profile.name = googleUser.name || googleUser.given_name;
      }
    }

    if (!profile.email) {
      profile.email = searchParams.get('email') || `oauth_${provider}_${Date.now()}@novique.in`;
      profile.name = searchParams.get('name') || `${provider.toUpperCase()} User`;
    }

    const authResult = socialLoginOrRegister(provider, profile);
    const token = await signAuthToken(authResult.user);

    const html = `<!DOCTYPE html>
<html>
<head><title>Authentication Complete</title></head>
<body>
  <p style="font-family: sans-serif; text-align: center; margin-top: 40px;">
    Signing you into Novique...
  </p>
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'AUTH_SUCCESS', user: ${JSON.stringify(authResult.user)} }, '*');
      window.close();
    } else {
      window.location.href = '/';
    }
  </script>
</body>
</html>`;

    const response = new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });

    response.headers.append(
      'Set-Cookie',
      `novique_auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );

    if (authResult.user.role === 'admin') {
      response.headers.append(
        'Set-Cookie',
        `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
      );
    }

    return response;
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    return NextResponse.redirect(`${siteUrl}/?auth_error=oauth_failed`);
  }
}
