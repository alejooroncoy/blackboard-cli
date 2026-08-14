import type { CampusAccount } from './types.js';
import { secureServiceUrl } from '../security/urls.js';

// The hosted "Campus account" service (Google login, OAuth2+PKCE) — same
// backend that serves the MCP connector at mcp.campuscli.com/.well-known/oauth-authorization-server.
export const CAMPUS_ACCOUNT_URL = secureServiceUrl(
  process.env.CAMPUS_ACCOUNT_URL ?? 'https://mcp.campuscli.com',
  'CAMPUS_ACCOUNT_URL',
);

export function buildAuthorizeUrl(input: { redirectUri: string; codeChallenge: string; state: string }): string {
  const url = new URL(`${CAMPUS_ACCOUNT_URL}/v1/auth/google/start`);
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('code_challenge', input.codeChallenge);
  url.searchParams.set('state', input.state);
  return url.toString();
}

export async function exchangeCode(input: { code: string; verifier: string; redirectUri: string }): Promise<{
  account: CampusAccount;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const res = await fetch(`${CAMPUS_ACCOUNT_URL}/v1/auth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: input.code, verifier: input.verifier, redirectUri: input.redirectUri }),
  });
  if (!res.ok) throw new Error(`No se pudo completar el login (${res.status})`);
  return res.json();
}

export async function refreshTokens(refreshToken: string): Promise<{
  account: CampusAccount;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const res = await fetch(`${CAMPUS_ACCOUNT_URL}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error(`No se pudo renovar la sesión de cuenta (${res.status})`);
  return res.json();
}

export async function fetchAccount(accessToken: string): Promise<CampusAccount> {
  const res = await fetch(`${CAMPUS_ACCOUNT_URL}/v1/account`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`No se pudo obtener la cuenta (${res.status})`);
  const data = await res.json();
  return data.account;
}
