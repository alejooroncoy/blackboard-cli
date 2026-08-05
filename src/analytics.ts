import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const POSTHOG_HOST = (process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com').replace(/\/$/, '');
const POSTHOG_KEY = process.env.POSTHOG_API_KEY ?? 'phc_mVYDii8qujKLxaCagZomJjR4B2Cd53FieYqDyBPe4zGw';
const INSTALL_FILE = path.join(os.homedir(), '.blackboard-cli', 'analytics-id');

function installId(): string {
  try {
    if (fs.existsSync(INSTALL_FILE)) return fs.readFileSync(INSTALL_FILE, 'utf8').trim();
    const id = crypto.randomUUID();
    fs.mkdirSync(path.dirname(INSTALL_FILE), { recursive: true, mode: 0o700 });
    fs.writeFileSync(INSTALL_FILE, id, { mode: 0o600 });
    return id;
  } catch { return crypto.randomUUID(); }
}

/** Best-effort analytics: failures never affect the campus client. */
export function track(event: string, properties: Record<string, unknown> = {}, userId?: string) {
  if (process.env.POSTHOG_DISABLED === '1' || !POSTHOG_KEY) return;
  const distinctId = userId ? `bb:${userId}` : `install:${installId()}`;
  void fetch(`${POSTHOG_HOST}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event,
      distinct_id: distinctId,
      properties: { ...properties, app: 'campus-cli', version: process.env.npm_package_version ?? '1.1.2' },
    }),
  }).catch(() => {});
}

