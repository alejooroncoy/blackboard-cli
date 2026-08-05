import fs from 'fs';
import path from 'path';
import os from 'os';
import type { CampusAccountSession } from './types.js';

const ACCOUNT_DIR = path.join(os.homedir(), '.blackboard-cli');
const ACCOUNT_FILE = path.join(ACCOUNT_DIR, 'account.json');

export function saveAccountSession(session: CampusAccountSession): void {
  if (!fs.existsSync(ACCOUNT_DIR)) {
    fs.mkdirSync(ACCOUNT_DIR, { recursive: true, mode: 0o700 });
  }
  fs.writeFileSync(ACCOUNT_FILE, JSON.stringify(session, null, 2), { mode: 0o600 });
}

export function loadAccountSession(): CampusAccountSession | null {
  try {
    if (!fs.existsSync(ACCOUNT_FILE)) return null;
    return JSON.parse(fs.readFileSync(ACCOUNT_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

export function clearAccountSession(): void {
  try {
    if (fs.existsSync(ACCOUNT_FILE)) fs.unlinkSync(ACCOUNT_FILE);
  } catch {}
}
