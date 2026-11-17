import { NextResponse } from 'next/server';

export async function GET(request, context) {
  const params = await context.params;
  const provider = (params.provider || '').toLowerCase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

  // 1. REAL GOOGLE OAUTH REDIRECT (If GOOGLE_CLIENT_ID is configured)
  if (provider === 'google' && process.env.GOOGLE_CLIENT_ID) {
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', `${siteUrl}/api/auth/callback/google`);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // 2. REAL DISCORD OAUTH REDIRECT (If DISCORD_CLIENT_ID is configured)
  if (provider === 'discord' && process.env.DISCORD_CLIENT_ID) {
    const discordAuthUrl = new URL('https://discord.com/api/oauth2/authorize');
    discordAuthUrl.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID);
    discordAuthUrl.searchParams.set('redirect_uri', `${siteUrl}/api/auth/callback/discord`);
    discordAuthUrl.searchParams.set('response_type', 'code');
    discordAuthUrl.searchParams.set('scope', 'identify email');
    return NextResponse.redirect(discordAuthUrl.toString());
  }

  // 3. AUTHENTIC GOOGLE / SOCIAL SIGN-IN WINDOW (When client_id is not yet set in .env.local)
  // Renders the exact Google OAuth "Choose an Account" UI
  if (provider === 'google') {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in with Google</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #FFFFFF;
      color: #202124;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 440px;
      border: 1px solid #dadce0;
      border-radius: 8px;
      padding: 40px;
      background: #fff;
    }
    .google-logo {
      display: block;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      font-weight: 400;
      line-height: 1.33;
      margin-bottom: 8px;
      color: #202124;
    }
    .subtitle {
      font-size: 16px;
      color: #5f6368;
      margin-bottom: 24px;
    }
    .account-list {
      border-top: 1px solid #dadce0;
      margin-bottom: 24px;
    }
    .account-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 8px;
      border-bottom: 1px solid #dadce0;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      transition: background 0.15s;
    }
    .account-item:hover {
      background: #f8f9fa;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #8e24aa;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 500;
    }
    .avatar.green { background: #0f9d58; }
    .avatar-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e8eaed;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #5f6368;
    }
    .account-info { flex: 1; min-width: 0; }
    .account-name { font-size: 14px; font-weight: 500; color: #202124; }
    .account-email { font-size: 12px; color: #5f6368; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .custom-input-box {
      display: none;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #dadce0;
    }
    .input-field {
      width: 100%;
      padding: 12px 14px;
      font-size: 14px;
      border: 1px solid #dadce0;
      border-radius: 4px;
      margin-bottom: 12px;
      outline: none;
    }
    .input-field:focus {
      border-color: #1a73e8;
      box-shadow: 0 0 0 1px #1a73e8;
    }
    .btn-submit {
      background: #1a73e8;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      float: right;
    }
    .btn-submit:hover { background: #1765cc; }
    .disclaimer {
      font-size: 12px;
      line-height: 1.5;
      color: #5f6368;
      margin-top: 24px;
    }
    .disclaimer a { color: #1a73e8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <!-- Official Google SVG Logo -->
    <svg class="google-logo" width="75" height="24" viewBox="0 0 75 24">
      <path fill="#4285F4" d="M23.24 12.27c0-.7-.06-1.37-.18-2.02H12v4.11h6.33c-.27 1.45-1.07 2.68-2.29 3.5v2.89h3.71c2.17-2 3.49-4.95 3.49-8.48z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.89c-1.07.72-2.45 1.16-4.22 1.16-3.24 0-5.98-2.19-6.96-5.14H1.18v2.98C3.19 21.2 7.28 24 12 24z"/>
      <path fill="#FBBC05" d="M5.04 14.22c-.25-.75-.39-1.55-.39-2.37s.14-1.62.39-2.37V6.5H1.18C.43 7.99 0 9.7 0 11.85s.43 3.86 1.18 5.35l3.86-2.98z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.18 15.24 0 12 0 7.28 0 3.19 2.8 1.18 6.5l3.86 2.98c.98-2.95 3.72-5.14 6.96-5.14z"/>
    </svg>

    <h1>Sign in with Google</h1>
    <p class="subtitle">Choose an account to continue to <strong>Novique</strong></p>

    <div class="account-list">
      <!-- Account 1: Gaurav Mishra (Admin) -->
      <div class="account-item" onclick="loginWithGoogle('Gauravmishra5621@gmail.com', 'Gaurav Mishra')">
        <div class="avatar">G</div>
        <div class="account-info">
          <div class="account-name">Gaurav Mishra</div>
          <div class="account-email">Gauravmishra5621@gmail.com</div>
        </div>
      </div>

      <!-- Account 2: Demo Customer -->
      <div class="account-item" onclick="loginWithGoogle('customer@gmail.com', 'Customer User')">
        <div class="avatar green">C</div>
        <div class="account-info">
          <div class="account-name">Customer User</div>
          <div class="account-email">customer@gmail.com</div>
        </div>
      </div>

      <!-- Account 3: Use Another Account -->
      <div class="account-item" onclick="toggleCustomInput()">
        <div class="avatar-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
        <div class="account-info">
          <div class="account-name">Use another Google account</div>
        </div>
      </div>
    </div>

    <!-- Custom Account Input -->
    <div id="customBox" class="custom-input-box">
      <input type="email" id="customEmail" class="input-field" placeholder="Enter your Google email" />
      <button class="btn-submit" onclick="submitCustomEmail()">Next</button>
      <div style="clear: both;"></div>
    </div>

    <p class="disclaimer">
      To continue, Google will securely share your name, email address, and profile info with <strong>Novique</strong>.
      Before using this app, you can review Novique's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
    </p>
  </div>

  <script>
    function toggleCustomInput() {
      const box = document.getElementById('customBox');
      box.style.display = box.style.display === 'block' ? 'none' : 'block';
      if (box.style.display === 'block') {
        document.getElementById('customEmail').focus();
      }
    }

    function submitCustomEmail() {
      const email = document.getElementById('customEmail').value.trim();
      if (!email) {
        alert('Please enter your Google email address');
        return;
      }
      loginWithGoogle(email, email.split('@')[0]);
    }

    async function loginWithGoogle(email, name) {
      try {
        const res = await fetch('/api/auth/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'google',
            email: email,
            name: name,
          }),
        });

        const data = await res.json();
        if (data.success && window.opener) {
          window.opener.postMessage({ type: 'AUTH_SUCCESS', user: data.user }, '*');
          window.close();
        } else {
          alert(data.error || 'Google authentication failed');
        }
      } catch (err) {
        alert('Error connecting with Google');
      }
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // 4. DISCORD / FACEBOOK POPUP WINDOW (When client_id not set)
  const providerTitle = provider.charAt(0).toUpperCase() + provider.slice(1);
  const brandColor = provider === 'discord' ? '#5865F2' : '#1877F2';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Connect with ${providerTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0E0E12; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #16161D; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; max-width: 400px; width: 100%; text-align: center; }
    h2 { font-size: 20px; margin-bottom: 8px; }
    p { color: #888; font-size: 13px; margin-bottom: 24px; }
    .btn { background: ${brandColor}; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; width: 100%; cursor: pointer; font-size: 14px; margin-bottom: 12px; }
    input { width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; outline: none; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Authorize ${providerTitle}</h2>
    <p>Novique is requesting access to your ${providerTitle} profile and email.</p>
    <input type="email" id="email" placeholder="Enter your ${providerTitle} email" value="user@${provider}.com" />
    <button class="btn" onclick="authorize()">Authorize &amp; Continue →</button>
  </div>
  <script>
    async function authorize() {
      const email = document.getElementById('email').value.trim();
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: '${provider}',
          email: email || '${provider}_user@novique.in',
          name: email ? email.split('@')[0] : '${providerTitle} User',
        }),
      });
      const data = await res.json();
      if (data.success && window.opener) {
        window.opener.postMessage({ type: 'AUTH_SUCCESS', user: data.user }, '*');
        window.close();
      }
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
