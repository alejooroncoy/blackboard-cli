import { chromium, type BrowserContext } from 'playwright';
import { execFileSync } from 'child_process';

type PersistentContextOptions = Parameters<typeof chromium.launchPersistentContext>[1];

// Both providers (Blackboard, Mi UPC) launch a persistent Chromium context for
// their SSO login flow. New installs (npm install -g, npx, --ignore-scripts,
// or a `postinstall` that silently failed) can end up without the Chromium
// binary Playwright expects — self-heal once instead of surfacing Playwright's
// raw "Executable doesn't exist" wall of text.
let installAttempted = false;
let systemChannelsExhausted = false;

// Playwright can drive an already-installed Chromium-based browser via
// `channel` instead of downloading its own — try the common ones in order.
// There's no way to ask the OS "what's the default browser", and this list
// only helps when the default happens to be Chromium-based (Chrome/Edge);
// Firefox/Safari can't run this Chromium-specific SSO flow either way.
const SYSTEM_CHROMIUM_CHANNELS = ['chrome', 'msedge'] as const;

function isMissingBrowserError(err: any): boolean {
  const msg = err?.message ?? '';
  return msg.includes("Executable doesn't exist") || msg.includes('playwright install');
}

// "Chrome for Testing" (what Playwright downloads) exposes automation
// fingerprints — navigator.webdriver=true, the AutomationControlled blink
// feature — that Microsoft Entra's risk-based conditional access sometimes
// treats as a signal to force an extra identity-verification challenge that
// then fails ("Sorry, we're having trouble verifying your account"). None of
// this bypasses auth — the human still completes the real Microsoft login —
// it just stops the browser from looking like a bot to that risk scoring.
function stealthArgs(existing: string[] = []): string[] {
  return [...existing, '--disable-blink-features=AutomationControlled'];
}

async function applyStealth(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
}

async function doLaunch(profileDir: string, options: PersistentContextOptions): Promise<BrowserContext> {
  const context = await chromium.launchPersistentContext(profileDir, {
    ...options,
    args: stealthArgs(options?.args),
  });
  await applyStealth(context);
  return context;
}

export async function launchPersistentContextSafe(
  profileDir: string,
  options: PersistentContextOptions
): Promise<BrowserContext> {
  // Prefer a Chromium-based browser already installed on this machine —
  // avoids Playwright's ~150MB Chromium download entirely in the common
  // case. The stealth patch (navigator.webdriver) applies the same
  // regardless of which binary is driven, so this doesn't reintroduce the
  // Entra bot-detection problem.
  if (!systemChannelsExhausted && !options?.channel) {
    for (const channel of SYSTEM_CHROMIUM_CHANNELS) {
      try {
        return await doLaunch(profileDir, { ...options, channel });
      } catch {
        // Try the next system channel, then fall through to the bundled
        // Chromium below — any launch failure here (not just "not found")
        // should still leave the bundled fallback a chance to work.
      }
    }
    systemChannelsExhausted = true;
  }

  try {
    return await doLaunch(profileDir, options);
  } catch (err: any) {
    if (!isMissingBrowserError(err) || installAttempted) throw err;
    installAttempted = true;
    console.log('No se encontró Chrome instalado — descargando el Chromium de Playwright (solo la primera vez)...');
    execFileSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit' });
    return await doLaunch(profileDir, options);
  }
}
