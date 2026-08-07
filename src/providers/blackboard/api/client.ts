import axios, { AxiosInstance, AxiosError } from 'axios';
import type { Session } from '../types.js';
import { laneFor, paceFor } from './pace.js';
import { Reuse, isReusable, keyFor, reuseFor } from './reuse.js';

const BASE_URL = 'https://aulavirtual.upc.edu.pe';

export type ClientOptions = {
  /**
   * Identifies whose traffic this is, for processes serving several students.
   *
   * The CLI leaves it out: one process is one person. The hosted relay passes
   * the student's key so that one person's downloads never queue behind
   * another's, while each person still looks like a single browser.
   */
  paceKey?: string;
  /**
   * Shared short-term memory of GET responses.
   *
   * Passed in when several clients serve the same person, so rebuilding the
   * client does not throw away what we just asked. Defaults to a private one.
   */
  reuse?: Reuse;
};

export function createClient(session: Session, options: ClientOptions = {}): AxiosInstance {
  // Build cookie header string
  const cookieStr = session.cookies
    .filter((c) => {
      const domain = c.domain.replace(/^\./, '');
      return 'aulavirtual.upc.edu.pe'.endsWith(domain) || domain === 'aulavirtual.upc.edu.pe';
    })
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const client = axios.create({
    baseURL: BASE_URL,
    headers: {
      Cookie: cookieStr,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(session.xsrfToken ? { 'X-Blackboard-XSRF': session.xsrfToken } : {}),
    },
    withCredentials: true,
  });

  // Pacing goes on the adapter rather than on interceptors because the slot has
  // to come back however the request ends. An interceptor pair would have to
  // match each response to its request by hand, and any request that never
  // settled would hold its slot until the process exited.
  const pace = paceFor(options.paceKey ?? 'local');
  const key = options.paceKey ?? 'local';
  const reuse = options.reuse ?? reuseFor(key);
  const base = axios.getAdapter(client.defaults.adapter);
  client.defaults.adapter = (config) => {
    const send = () => pace.run(laneFor(config), () => base(config));
    if (!isReusable(config)) {
      // A write invalidates everything we remember before it runs, so a reader
      // racing the write cannot repopulate the memory with the old answer.
      reuse.forget();
      return send();
    }
    // Reuse sits in front of pacing on purpose: an answer we already have costs
    // the university nothing and should not wait behind anyone's queue.
    return reuse.get(keyFor(config), send);
  };

  // Intercept 401 to give a helpful message
  client.interceptors.response.use(
    (r) => r,
    (err: AxiosError) => {
      if (err.response?.status === 401) {
        const e = new Error('Session expired. Run: campus login');
        (e as any).code = 'SESSION_EXPIRED';
        throw e;
      }
      throw err;
    }
  );

  return client;
}
