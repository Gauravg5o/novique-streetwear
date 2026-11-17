import { NextResponse } from 'next/server';

export async function GET(request, context) {
  const params = await context.params;
  const provider = (params.provider || '').toLowerCase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://novique-streetwear.gauravmishra5621.workers.dev';

  // 1. REAL GOOGLE OAUTH REDIRECT
  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return new Response(
        `<!DOCTYPE html><html><head><title>Google OAuth Setup</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family: -apple-system, sans-serif; background: #0A0A0C; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; margin: 0;"><div style="max-width: 500px; background: #141418; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; text-align: center;"><div style="font-size: 40px; margin-bottom: 16px;">🔴</div><h2 style="font-size: 20px; margin: 0 0 12px 0;">Real Google OAuth Requires Client ID</h2><p style="color: #999; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">To connect real Google Sign In (<code style="color: #C6FF3D;">accounts.google.com</code>), Google requires your official OAuth Client ID from Google Cloud Console.</p><div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; font-size: 12px; text-align: left; margin-bottom: 24px; color: #bbb;"><p style="margin: 0 0 8px 0; font-weight: bold; color: #fff;">Authorized Redirect URI to set in Google Console:</p><code style="color: #C6FF3D; word-break: break-all;">${siteUrl}/api/auth/callback/google</code></div><button onclick="window.close()" style="background: #C6FF3D; color: #000; border: none; font-weight: bold; padding: 12px 24px; border-radius: 999px; cursor: pointer; font-size: 13px;">Close Window</button></div></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', `${siteUrl}/api/auth/callback/google`);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // 2. REAL DISCORD OAUTH REDIRECT
  if (provider === 'discord') {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      return new Response(
        `<!DOCTYPE html><html><head><title>Discord OAuth Setup</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family: -apple-system, sans-serif; background: #0A0A0C; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; margin: 0;"><div style="max-width: 500px; background: #141418; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; text-align: center;"><div style="font-size: 40px; margin-bottom: 16px;">🟣</div><h2 style="font-size: 20px; margin: 0 0 12px 0;">Discord OAuth Requires Client ID</h2><p style="color: #999; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">To connect real Discord Sign In (<code style="color: #5865F2;">discord.com</code>), Discord requires your Application Client ID from Discord Developer Portal.</p><div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; font-size: 12px; text-align: left; margin-bottom: 24px; color: #bbb;"><p style="margin: 0 0 8px 0; font-weight: bold; color: #fff;">Authorized Redirect URI to set in Discord Portal:</p><code style="color: #C6FF3D; word-break: break-all;">${siteUrl}/api/auth/callback/discord</code></div><button onclick="window.close()" style="background: #C6FF3D; color: #000; border: none; font-weight: bold; padding: 12px 24px; border-radius: 999px; cursor: pointer; font-size: 13px;">Close Window</button></div></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize');
    discordAuthUrl.searchParams.set('client_id', clientId);
    discordAuthUrl.searchParams.set('redirect_uri', `${siteUrl}/api/auth/callback/discord`);
    discordAuthUrl.searchParams.set('response_type', 'code');
    discordAuthUrl.searchParams.set('scope', 'identify email');
    return NextResponse.redirect(discordAuthUrl.toString());
  }

  // 3. REAL FACEBOOK OAUTH REDIRECT
  if (provider === 'facebook') {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    if (!clientId) {
      return new Response(
        `<!DOCTYPE html><html><head><title>Facebook OAuth Setup</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family: -apple-system, sans-serif; background: #0A0A0C; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; margin: 0;"><div style="max-width: 500px; background: #141418; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; text-align: center;"><div style="font-size: 40px; margin-bottom: 16px;">🔵</div><h2 style="font-size: 20px; margin: 0 0 12px 0;">Facebook OAuth Requires App ID</h2><p style="color: #999; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">To connect real Facebook Sign In (<code style="color: #1877F2;">facebook.com</code>), Meta requires your App ID from Meta for Developers.</p><div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; font-size: 12px; text-align: left; margin-bottom: 24px; color: #bbb;"><p style="margin: 0 0 8px 0; font-weight: bold; color: #fff;">Authorized Redirect URI to set in Meta Portal:</p><code style="color: #C6FF3D; word-break: break-all;">${siteUrl}/api/auth/callback/facebook</code></div><button onclick="window.close()" style="background: #C6FF3D; color: #000; border: none; font-weight: bold; padding: 12px 24px; border-radius: 999px; cursor: pointer; font-size: 13px;">Close Window</button></div></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    const fbAuthUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    fbAuthUrl.searchParams.set('client_id', clientId);
    fbAuthUrl.searchParams.set('redirect_uri', `${siteUrl}/api/auth/callback/facebook`);
    fbAuthUrl.searchParams.set('scope', 'email,public_profile');
    fbAuthUrl.searchParams.set('response_type', 'code');
    return NextResponse.redirect(fbAuthUrl.toString());
  }

  return NextResponse.redirect(siteUrl);
}
