import fs from 'fs';
import path from 'path';
import os from 'os';
import type { BannerSession } from '../types.js';

const SESSION_DIR = path.join(os.homedir(), '.blackboard-cli');
const SESSION_FILE = path.join(SESSION_DIR, 'banner-session.json');

// Banner's own session, separate from Blackboard's: same identity provider,
// different service. Mixing them in one file means expiring one expires both,
// and they do not expire together.
export function saveSession(session: BannerSession): void {
  if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true, mode: 0o700 });
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), { mode: 0o600 });
}

export function loadSession(): BannerSession | null {
  try {
    if (!fs.existsSync(SESSION_FILE)) return null;
    const session: BannerSession = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    return Date.now() > session.expiresAt ? null : session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
  } catch {}
}

/**
 * JSESSIONID is the one cookie that matters, and it is the easiest to lose:
 * it is scoped to Path=/StudentRegistrationSsb, so any cookie export done
 * against the bare host silently omits it — the list still looks complete
 * (cf_clearance, AWSALB, the Dynatrace ones) and every request quietly
 * redirects to /login/authAjax with an empty body.
 */
export function isSessionValid(session: BannerSession | null): boolean {
  if (!session || Date.now() > session.expiresAt) return false;
  return session.cookies.some((c) => c.name === 'JSESSIONID');
}
