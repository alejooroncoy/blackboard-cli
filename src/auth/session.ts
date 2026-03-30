import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Session } from '../types/index.js';

const SESSION_DIR = path.join(os.homedir(), '.blackboard-cli');
const SESSION_FILE = path.join(SESSION_DIR, 'session.json');

export function saveSession(session: Session): void {
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true, mode: 0o700 });
  }
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), { mode: 0o600 });
}

export function loadSession(): Session | null {
  try {
    if (!fs.existsSync(SESSION_FILE)) return null;
    const raw = fs.readFileSync(SESSION_FILE, 'utf-8');
    const session: Session = JSON.parse(raw);
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null; // expired
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    if (fs.existsSync(SESSION_FILE)) fs.unlinkSync(SESSION_FILE);
  } catch {}
}

export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;
  if (Date.now() > session.expiresAt) return false;
  // JSESSIONID or BbRouter are sufficient for REST API calls
  const hasCriticalCookies =
    session.cookies.some(c => c.name === 'JSESSIONID') ||
    session.cookies.some(c => c.name === 'BbRouter');
  return hasCriticalCookies;
}
