import os from 'os';
import path from 'path';
import type { BannerSession, Cookie } from '../types.js';
import { saveSession } from './session.js';
import { launchPersistentContextSafe } from '../../../browser-install.js';

const BASE_URL = 'https://banner.upc.edu.pe';
const ENTRY = `${BASE_URL}/StudentRegistrationSsb/ssb/registrationHistory/registrationHistory`;

// The SAME profile Blackboard uses. Both are SAML service providers behind
// UPC's Azure AD, so the Microsoft session already in this profile authorises
// Banner too — the student logs in once, not once per system.
const PROFILE_DIR = path.join(os.homedir(), '.blackboard-cli', 'browser-profile');

// Banner's JSESSIONID has no explicit expiry; Ellucian's default idle timeout
// is well under an hour, so we assume less than the server does.
const SESSION_TTL_MS = 25 * 60 * 1000;

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class BannerLoginFailed extends Error {
  constructor(reason: string) {
    super(`Banner login failed: ${reason}`);
    this.name = 'BannerLoginFailed';
  }
}

/**
 * Opens Banner in the shared browser profile and harvests its cookies.
 *
 * The browser is used ONCE, for this. Every read afterwards goes over plain
 * HTTP with these cookies — about ten times faster and without keeping a
 * Chromium alive.
 */
export async function bannerLogin(opts: { headless?: boolean } = {}): Promise<BannerSession> {
  const context = await launchPersistentContextSafe(PROFILE_DIR, {
    headless: opts.headless ?? true,
    userAgent: USER_AGENT,
  });

  try {
    const page = await context.newPage();
    await page.goto(ENTRY, { waitUntil: 'networkidle', timeout: 60_000 });

    if (/saml|login|microsoftonline/i.test(page.url())) {
      throw new BannerLoginFailed('SSO did not carry over — run `campus login` first');
    }

    // Ask for cookies on the FULL path, not the host: JSESSIONID is scoped to
    // /StudentRegistrationSsb and a host-only query drops it without error.
    const cookies = (await context.cookies(
      `${BASE_URL}/StudentRegistrationSsb/ssb/`,
    )) as unknown as Cookie[];

    if (!cookies.some((c) => c.name === 'JSESSIONID')) {
      throw new BannerLoginFailed('no JSESSIONID — Banner did not open a session');
    }

    const session: BannerSession = { cookies, expiresAt: Date.now() + SESSION_TTL_MS };
    saveSession(session);
    return session;
  } finally {
    await context.close();
  }
}

/** Returns a usable session, logging in again if the stored one is stale. */
export async function loadOrRefreshBannerSession(): Promise<BannerSession> {
  const { loadSession, isSessionValid } = await import('./session.js');
  const existing = loadSession();
  if (isSessionValid(existing)) return existing!;
  return bannerLogin({ headless: true });
}
