import { createServer } from 'node:http';
import { randomBytes, createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { buildAuthorizeUrl, exchangeCode } from './client.js';
import type { CampusAccountSession } from './types.js';

const CALLBACK_TIMEOUT_MS = 5 * 60_000;

function openBrowser(url: string) {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  execFile(command, [url], () => {});
}

function callbackPage(input: { title: string; message: string; ok: boolean }): string {
  const accent = input.ok ? '#087f5b' : '#e31837';
  const iconPath = input.ok
    ? '<path d="M20 6L9 17l-5-5" stroke="#087f5b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<path d="M18 6L6 18M6 6l12 12" stroke="#e31837" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>campus-cli</title>
<style>
  :root { --ink: #102a3a; --muted: #506d7f; --line: #d4e1e6; --canvas: #f4f8f8; --paper: #ffffff; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: var(--canvas); color: var(--ink);
    font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .card {
    width: min(92vw, 420px); padding: 40px 32px; border: 1px solid var(--line); border-radius: 16px;
    background: var(--paper); box-shadow: 0 24px 54px rgba(16, 42, 58, .08); text-align: center;
  }
  .icon {
    width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; display: grid; place-items: center;
    background: ${input.ok ? '#d9f1e8' : '#fbe3e7'};
  }
  h1 { font-size: 19px; margin: 0 0 8px; }
  p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }
  .brand { margin-top: 28px; font-size: 12px; color: var(--muted); letter-spacing: .02em; }
  .brand b { color: var(--ink); }
</style>
</head>
<body>
  <div class="card">
    <div class="icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none">${iconPath}</svg></div>
    <h1>${input.title}</h1>
    <p>${input.message}</p>
    <div class="brand"><b>campus-cli</b> · puedes cerrar esta pestaña</div>
  </div>
</body>
</html>`;
}

function pkcePair() {
  const verifier = randomBytes(64).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

// Loopback (127.0.0.1) redirect, like `gh auth login`/`gcloud auth login`: a
// throwaway local HTTP server catches Google's redirect after Campus account
// consent, so no browser extension or custom URL scheme is needed.
export async function loginWithCampusAccount(): Promise<CampusAccountSession> {
  const { verifier, challenge } = pkcePair();
  const state = randomBytes(24).toString('hex');

  const { code, redirectUri } = await new Promise<{ code: string; redirectUri: string }>((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
      }
      const receivedState = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      const receivedCode = url.searchParams.get('code');

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(
        error
          ? callbackPage({ ok: false, title: 'Login cancelado', message: 'No se completó el inicio de sesión. Puedes cerrar esta pestaña y volver a la terminal.' })
          : callbackPage({ ok: true, title: '¡Listo!', message: 'Tu cuenta Campus quedó conectada. Puedes cerrar esta pestaña y volver a la terminal.' }),
      );

      clearTimeout(timeout);
      server.close();
      if (error) return reject(new Error(`Login cancelado: ${error}`));
      if (receivedState !== state) return reject(new Error('El estado de OAuth no coincide (posible ataque CSRF)'));
      if (!receivedCode) return reject(new Error('Google no devolvió un código de autorización'));
      resolve({ code: receivedCode, redirectUri: currentRedirectUri });
    });

    const timeout = setTimeout(() => {
      server.close();
      reject(new Error('Tiempo de espera agotado esperando el login en el navegador'));
    }, CALLBACK_TIMEOUT_MS);

    let currentRedirectUri = '';
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      currentRedirectUri = `http://127.0.0.1:${port}/callback`;
      openBrowser(buildAuthorizeUrl({ redirectUri: currentRedirectUri, codeChallenge: challenge, state }));
    });
  });

  const { account, accessToken, refreshToken, expiresIn } = await exchangeCode({ code, verifier, redirectUri });
  return {
    account,
    accessToken,
    refreshToken,
    accessTokenExpiresAt: Date.now() + expiresIn * 1000,
  };
}
