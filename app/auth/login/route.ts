import { NextRequest, NextResponse } from 'next/server';

const KEYCLOAK_SIGN_IN_PATH = '/api/auth/signin/keycloak';
const DEFAULT_CALLBACK_URL = '/admin';

/**
 * NextAuth maps `error` to `nextauth[1]` (provider id) on GET /api/auth/signin/{provider}
 * when `pages.signIn` is customized. That yields `error=keycloak`, not a real failure.
 * @see node_modules/next-auth/next/index.js (error: query.error ?? nextauth[1])
 */
const NEXTAUTH_PROVIDER_ID_FALSE_ERROR = 'keycloak';

const KNOWN_AUTH_ERRORS = new Set([
  'OAuthSignin',
  'OAuthCallback',
  'OAuthCreateAccount',
  'OAuthAccountNotLinked',
  'Callback',
  'AccessDenied',
  'Configuration',
  'Verification',
  'SessionRequired',
  'CredentialsSignin',
  'EmailSignin',
]);

function isRealAuthError(error: string | null): boolean {
  if (!error || error === NEXTAUTH_PROVIDER_ID_FALSE_ERROR) return false;
  return KNOWN_AUTH_ERRORS.has(error) || error.length > 20;
}

async function fetchCsrfToken(request: NextRequest): Promise<string | null> {
  const csrfUrl = new URL('/api/auth/csrf', request.url);
  const cookie = request.headers.get('cookie') ?? '';

  const response = await fetch(csrfUrl, {
    headers: cookie ? { cookie } : undefined,
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { csrfToken?: string };
  return data.csrfToken ?? null;
}

function buildKeycloakSignInPostHtml(
  origin: string,
  csrfToken: string,
  callbackUrl: string,
): string {
  const action = `${origin}${KEYCLOAK_SIGN_IN_PATH}`;
  const escapedCallback = callbackUrl
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
  const escapedCsrf = csrfToken.replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signing in | E-Shop Admin</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, sans-serif;
      background: #090d16;
      color: #f8fafc;
    }
  </style>
</head>
<body>
  <p>Redirecting to Keycloak…</p>
  <form id="keycloak-signin" method="POST" action="${action}">
    <input type="hidden" name="csrfToken" value="${escapedCsrf}" />
    <input type="hidden" name="callbackUrl" value="${escapedCallback}" />
  </form>
  <script>document.getElementById('keycloak-signin').submit();</script>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get('error');
  const callbackUrl =
    request.nextUrl.searchParams.get('callbackUrl') || DEFAULT_CALLBACK_URL;

  // Real OAuth failures only — ignore NextAuth's provider-id false positive on GET sign-in.
  if (isRealAuthError(error)) {
    const cleanLoginUrl = new URL(request.nextUrl.pathname, request.url);
    cleanLoginUrl.searchParams.set('callbackUrl', callbackUrl);
    const retryUrl = cleanLoginUrl.pathname + cleanLoginUrl.search;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign-in Failed | E-Shop Admin</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

    :root {
      --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --bg-dark: #090d16;
      --card-bg: rgba(15, 23, 42, 0.65);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-border-top: rgba(255, 255, 255, 0.15);
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --accent-emerald-start: #10b981;
      --accent-emerald-end: #059669;
      --accent-emerald-glow: rgba(16, 185, 129, 0.3);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg-dark);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
      padding: 1.5rem;
    }

    /* Animated Mesh Gradients */
    .mesh-gradient {
      position: absolute;
      inset: 0;
      z-index: 1;
      overflow: hidden;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.35;
      mix-blend-mode: screen;
      animation: float 20s infinite alternate ease-in-out;
    }

    .orb-1 {
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, rgba(99, 102, 241, 0) 70%);
      top: -10%;
      left: -10%;
      animation-duration: 25s;
    }

    .orb-2 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.7) 0%, rgba(16, 185, 129, 0) 70%);
      bottom: -15%;
      right: -10%;
      animation-duration: 30s;
      animation-delay: -5s;
    }

    .orb-3 {
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(236, 72, 153, 0) 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-duration: 22s;
      animation-delay: -10s;
    }

    @keyframes float {
      0% {
        transform: translate(0, 0) scale(1);
      }
      50% {
        transform: translate(40px, -60px) scale(1.15);
      }
      100% {
        transform: translate(-20px, 30px) scale(0.9);
      }
    }

    /* Glassmorphism Card Container */
    .container {
      width: 100%;
      max-width: 440px;
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-top: 1px solid var(--card-border-top);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      backdrop-filter: blur(24px) saturate(160%);
      -webkit-backdrop-filter: blur(24px) saturate(160%);
      z-index: 10;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.05);
      animation: card-enter 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    @keyframes card-enter {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.96);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Header styling */
    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      color: #ef4444;
      animation: pulse-red 2s infinite ease-in-out;
    }

    @keyframes pulse-red {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
      }
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #ffffff 40%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .error-code {
      font-family: monospace;
      font-size: 0.85rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 0.25rem 0.6rem;
      color: #94a3b8;
      margin-bottom: 1.5rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    p.description {
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    /* Diagnostics panel */
    .diagnostics {
      width: 100%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: left;
      margin-bottom: 2.25rem;
    }

    .diagnostics-title {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #cbd5e1;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .diagnostics-list {
      list-style-type: none;
    }

    .diagnostics-item {
      font-size: 0.85rem;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 0.5rem;
      padding-left: 1.25rem;
      position: relative;
    }

    .diagnostics-item::before {
      content: "•";
      position: absolute;
      left: 0.25rem;
      color: #ef4444;
      font-weight: bold;
    }

    /* Elastic Enter Emerald Button */
    .btn-primary {
      width: 100%;
      background: linear-gradient(135deg, var(--accent-emerald-start) 0%, var(--accent-emerald-end) 100%);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 0.875rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px var(--accent-emerald-glow);
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                  box-shadow 0.3s ease, 
                  filter 0.2s ease;
      position: relative;
      overflow: hidden;
      outline: none;
    }

    .btn-primary:hover {
      transform: scale(1.035) translateY(-2px);
      box-shadow: 0 8px 22px var(--accent-emerald-glow);
      filter: brightness(1.05);
    }

    .btn-primary:active {
      transform: scale(0.98) translateY(0);
    }

    .btn-primary:focus-visible {
      outline: 2px solid #34d399;
      outline-offset: 2px;
    }

    .btn-secondary {
      margin-top: 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-decoration: none;
      transition: color 0.2s ease;
      cursor: pointer;
    }

    .btn-secondary:hover {
      color: var(--text-primary);
      text-decoration: underline;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  </style>
</head>
<body>
  <a href="#content" class="sr-only">Skip to main content</a>
  
  <div class="mesh-gradient" aria-hidden="true">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>

  <main class="container" id="content">
    <div class="icon-wrapper" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
        <line x1="12" y1="2" x2="12" y2="12"></line>
      </svg>
    </div>

    <h1>Sign-in Failed</h1>
    <div class="error-code" aria-label="Error type">${error} Error</div>

    <p class="description">
      We encountered a connection issue while attempting to authenticate with Keycloak. The Single Sign-On (SSO) service might be temporarily offline or misconfigured.
    </p>

    <div class="diagnostics">
      <div class="diagnostics-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ef4444;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Troubleshooting</span>
      </div>
      <ul class="diagnostics-list">
        <li class="diagnostics-item">Verify if the Keycloak server is running at localhost:8080.</li>
        <li class="diagnostics-item">Check if the realm "eshop-admin" exists and client is active.</li>
        <li class="diagnostics-item">Ensure the redirect URIs in Keycloak match port 3001.</li>
      </ul>
    </div>

    <a href="${retryUrl}" class="btn-primary" role="button">
      <span>Re-authenticate</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 12h14"></path>
        <path d="m12 5 7 7-7 7"></path>
      </svg>
    </a>

    <a href="/admin" class="btn-secondary">Return to Admin Panel</a>
  </main>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  const csrfToken = await fetchCsrfToken(request);
  if (!csrfToken) {
    return new NextResponse(
      'Authentication service is unavailable. Ensure NextAuth is configured and try again.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

  const origin = new URL(request.url).origin;
  const html = buildKeycloakSignInPostHtml(origin, csrfToken, callbackUrl);

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

