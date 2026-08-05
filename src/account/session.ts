import { refreshTokens } from './client.js';
import { loadAccountSession, saveAccountSession } from './store.js';
import type { CampusAccountSession } from './types.js';

const REFRESH_MARGIN_MS = 60_000;

// Auto-refreshes the access token when it's close to expiry, so other
// commands (and future Campus products) can just call this and get a
// live session without dealing with the OAuth token dance themselves.
export async function getValidAccountSession(): Promise<CampusAccountSession | null> {
  const session = loadAccountSession();
  if (!session) return null;
  if (session.accessTokenExpiresAt - Date.now() > REFRESH_MARGIN_MS) return session;

  try {
    const { account, accessToken, refreshToken, expiresIn } = await refreshTokens(session.refreshToken);
    const refreshed: CampusAccountSession = {
      account,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: Date.now() + expiresIn * 1000,
    };
    saveAccountSession(refreshed);
    return refreshed;
  } catch {
    return null; // refresh token expired/revoked — caller must prompt `campus account login`
  }
}
