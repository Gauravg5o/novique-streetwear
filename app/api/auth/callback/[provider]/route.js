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

    // 2. Discord OAuth Token Exchange
    if (provider === 'discord' && code && process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${siteUrl}/api/auth/callback/discord`,
        }),
      });
      const tokens = await tokenRes.json();
      if (tokens.access_token) {
        const userRes = await fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const discordUser = await userRes.json();
        profile.email = discordUser.email || `${discordUser.username}@discord.novique.in`;
        profile.name = discordUser.global_name || discordUser.username;
      }
    }

    // 3. Facebook OAuth Token Exchange
    if (provider === 'facebook' && code && process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
      const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      tokenUrl.searchParams.set('client_id', process.env.FACEBOOK_CLIENT_ID);
      tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_CLIENT_SECRET);
      tokenUrl.searchParams.set('redirect_uri', `${siteUrl}/api/auth/callback/facebook`);
      tokenUrl.searchParams.set('code', code);
      const tokenRes = await fetch(tokenUrl.toString());
      const tokens = await tokenRes.json();
      if (tokens.access_token) {
        const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokens.access_token}`);
        const fbUser = await userRes.json();
        profile.email = fbUser.email || `fb_${fbUser.id}@facebook.novique.in`;
        profile.name = fbUser.name;
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
