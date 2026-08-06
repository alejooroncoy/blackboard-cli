import axios, { AxiosInstance, AxiosError } from 'axios';
import type { BannerSession } from '../types.js';

const BASE_URL = 'https://banner.upc.edu.pe';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export function createBannerClient(session: BannerSession): AxiosInstance {
  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      Cookie: session.cookies.map((c) => `${c.name}=${c.value}`).join('; '),
      // Banner answers these endpoints with JSON only when it believes the
      // caller is the page's own JavaScript; without the header it serves a
      // redirect to the login shell.
      'X-Requested-With': 'XMLHttpRequest',
      Referer: `${BASE_URL}/StudentRegistrationSsb/ssb/registrationHistory/registrationHistory`,
      // Cloudflare's clearance cookie is issued against this exact agent.
      'User-Agent': USER_AGENT,
      Accept: 'application/json, text/plain, */*',
    },
    // A lost session shows up as a 302 to /login/authAjax, not a 401. Without
    // this, axios follows it and hands back an empty 200 that looks like "the
    // student has no courses" — the failure mode that cost the most time here.
    maxRedirects: 0,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  client.interceptors.response.use(
    (r) => r,
    (err: AxiosError) => {
      const status = err.response?.status;
      const location = String(err.response?.headers?.location ?? '');
      if (status === 302 || status === 401 || /login/i.test(location)) {
        const e = new Error('Banner session expired. Run: campus login');
        (e as any).code = 'SESSION_EXPIRED';
        throw e;
      }
      throw err;
    },
  );

  return client;
}
