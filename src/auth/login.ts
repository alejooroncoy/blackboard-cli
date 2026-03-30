import { chromium } from 'playwright';
import type { Session, Cookie } from '../types/index.js';
import { saveSession } from './session.js';

const BASE_URL = 'https://aulavirtual.upc.edu.pe';
const SAML_URL = `${BASE_URL}/auth-saml/saml/login?apId=_4893_1&redirectUrl=${encodeURIComponent(`${BASE_URL}/ultra`)}`;

// Session duration: 8 hours
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export interface LoginOptions {
  headless?: boolean;
  username?: string;
  password?: string;
  timeout?: number;
}

export async function login(opts: LoginOptions = {}): Promise<Session> {
  const { headless = false, timeout = 120_000 } = opts;

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to UPC Aula Virtual...');
    await page.goto(SAML_URL, { waitUntil: 'networkidle', timeout });

    // Wait for Microsoft login page
    await page.waitForURL(/login\.microsoftonline\.com/, { timeout: 30_000 });

    if (opts.username) {
      await page.fill('input[type="email"], input[name="loginfmt"]', opts.username);
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(1500);
    }

    if (opts.password) {
      await page.waitForSelector('input[type="password"], input[name="passwd"]', { timeout: 15_000 });
      await page.fill('input[type="password"], input[name="passwd"]', opts.password);
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(1500);
    }

    // Handle "Stay signed in?" prompt
    try {
      await page.waitForSelector('#idBtn_Back, #KmsiCheckboxField', { timeout: 8_000 });
      const noBtn = page.locator('#idBtn_Back');
      if (await noBtn.isVisible()) await noBtn.click();
    } catch {}

    // Wait for redirect back to aulavirtual.upc.edu.pe/ultra
    console.log('Waiting for authentication to complete...');
    await page.waitForURL(/aulavirtual\.upc\.edu\.pe\/ultra/, {
      timeout: timeout - 10_000,
    });

    await page.waitForLoadState('networkidle', { timeout: 15_000 });

    // Extract cookies
    const rawCookies = await context.cookies();
    const cookies: Cookie[] = rawCookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      expires: c.expires,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite,
    }));

    // Extract XSRF token from page
    const xsrfToken = await page.evaluate(() => {
      // Try various sources
      const metaXsrf = document.querySelector<HTMLMetaElement>(
        'meta[name="blackboard.platform.security.NonceUtil.nonce"]'
      )?.content;
      if (metaXsrf) return metaXsrf;

      // Try from cookies
      const allCookies = document.cookie.split(';').reduce<Record<string, string>>((acc, c) => {
        const [k, v] = c.trim().split('=');
        acc[k] = v;
        return acc;
      }, {});
      return allCookies['XSRF-TOKEN'] || '';
    });

    // Get nonce from a page that has it
    let nonce = xsrfToken;
    if (!nonce) {
      const loginResp = await page.goto(`${BASE_URL}/webapps/login/`, { waitUntil: 'domcontentloaded' });
      if (loginResp) {
        nonce = await page.evaluate(() => {
          return (
            document.querySelector<HTMLInputElement>(
              'input[name="blackboard.platform.security.NonceUtil.nonce.ajax"]'
            )?.value || ''
          );
        });
        await page.goBack();
      }
    }

    // Get current user info via direct HTTP call with captured cookies
    let userData: any = null;
    try {
      const cookieStrForApi = cookies
        .filter(c => c.domain.includes('aulavirtual.upc.edu.pe'))
        .map(c => `${c.name}=${c.value}`)
        .join('; ');
      const resp = await page.request.get(`${BASE_URL}/learn/api/public/v1/users/me`, {
        headers: { Accept: 'application/json', Cookie: cookieStrForApi },
      });
      if (resp.ok()) userData = await resp.json();
    } catch {}

    const session: Session = {
      cookies,
      xsrfToken: nonce,
      userId: userData?.id,
      userName: userData?.userName,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };

    saveSession(session);
    console.log(`✓ Logged in as ${userData?.userName || 'unknown'}`);

    return session;
  } finally {
    await browser.close();
  }
}
