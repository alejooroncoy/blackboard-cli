/**
 * Stops us asking the university the same thing twice.
 *
 * This is the half of "healthy traffic" that costs the student nothing. Pacing
 * makes requests slower; this makes them not happen. An assistant answering
 * "what do I have this week?" calls list_assignments and then get_grades, and
 * both fetch the same gradebook columns; asked about feedback, it fans out over
 * every assignment in the course. Much of that is the identical GET, seconds
 * apart, inside one conversation.
 *
 * Two mechanisms, both invisible:
 *
 * - Coalescing: two identical GETs in flight at once become one request and
 *   share the answer. Always safe, since they would have returned the same
 *   thing anyway.
 * - A short memory: a repeated GET within a few seconds is answered from the
 *   last response. Short on purpose — long enough to cover one conversation,
 *   too short to show a grade that changed while the student was looking.
 *
 * Anything that writes clears the memory, so "did my submission go through?"
 * asked right after submitting never reads a stale answer.
 */

/** Long enough for one exchange, short enough that nothing feels stale. */
export const DEFAULT_TTL_MS = 20_000;
/** A cap so a long session cannot grow this without bound. */
const MAX_ENTRIES = 400;

type Entry = { value: unknown; storedAt: number };

export type ReuseOptions = { ttlMs?: number; now?: () => number };

export class Reuse {
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly memory = new Map<string, Entry>();
  private readonly ttlMs: number;
  private readonly now: () => number;
  /** Counters for tests and for judging whether the ttl is set sensibly. */
  readonly stats = { served: 0, coalesced: 0, fetched: 0 };

  constructor(options: ReuseOptions = {}) {
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    this.now = options.now ?? Date.now;
  }

  /**
   * Returns the answer to `key`, fetching it only if we do not already have it
   * or already have it on the way.
   */
  async get<T>(key: string, fetch: () => Promise<T>): Promise<T> {
    const remembered = this.memory.get(key);
    if (remembered && this.now() - remembered.storedAt < this.ttlMs) {
      this.stats.served += 1;
      return remembered.value as T;
    }

    const pending = this.inFlight.get(key);
    if (pending) {
      this.stats.coalesced += 1;
      return pending as Promise<T>;
    }

    this.stats.fetched += 1;
    const request = fetch()
      .then((value) => {
        this.remember(key, value);
        return value;
      })
      .finally(() => {
        // Cleared whatever happened: a failed request must not be handed to
        // the next caller as if it were an answer.
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, request);
    return request;
  }

  /**
   * Forgets everything.
   *
   * Called on any write, and deliberately not scoped to the course being
   * written: a submission changes attempts, grades, the column and the course
   * summary, and guessing which keys to drop is how a student ends up being
   * told their work was not submitted.
   */
  forget(): void {
    this.memory.clear();
  }

  private remember(key: string, value: unknown): void {
    if (this.memory.size >= MAX_ENTRIES) {
      // Map keeps insertion order, so the first key is the oldest.
      const oldest = this.memory.keys().next().value;
      if (oldest !== undefined) this.memory.delete(oldest);
    }
    this.memory.set(key, { value, storedAt: this.now() });
  }
}

/**
 * One memory per student, shared across their clients.
 *
 * The MCP layer builds a fresh client on every tool call, so a memory owned by
 * the client would be empty exactly when it matters: list_assignments and
 * get_grades are two tool calls, and they read the same gradebook columns.
 * Keyed by student rather than global so that on the hosted relay nobody is
 * ever served another person's answer.
 */
const memories = new Map<string, { reuse: Reuse; lastUsed: number }>();
const MEMORY_IDLE_MS = 10 * 60_000;

export function reuseFor(key: string, now: () => number = Date.now): Reuse {
  const at = now();
  for (const [existing, entry] of memories) {
    if (at - entry.lastUsed > MEMORY_IDLE_MS) memories.delete(existing);
  }
  const found = memories.get(key);
  if (found) {
    found.lastUsed = at;
    return found.reuse;
  }
  const reuse = new Reuse();
  memories.set(key, { reuse, lastUsed: at });
  return reuse;
}

/**
 * Whether a request may be reused at all.
 *
 * Only plain reads. File bytes are excluded because holding them in memory to
 * save a request trades a real problem for a worse one.
 */
export function isReusable(config: {
  method?: string;
  url?: string;
  responseType?: string;
}): boolean {
  const method = (config.method ?? 'get').toLowerCase();
  if (method !== 'get') return false;
  const responseType = config.responseType ?? '';
  if (responseType === 'stream' || responseType === 'arraybuffer' || responseType === 'blob') {
    return false;
  }
  return true;
}

/** Identifies a request, so two spellings of the same query share an answer. */
export function keyFor(config: {
  method?: string;
  baseURL?: string;
  url?: string;
  params?: unknown;
}): string {
  const params = config.params
    ? JSON.stringify(
        Object.entries(config.params as Record<string, unknown>).sort(([a], [b]) =>
          a.localeCompare(b)
        )
      )
    : '';
  return `${(config.method ?? 'get').toLowerCase()} ${config.baseURL ?? ''}${config.url ?? ''} ${params}`;
}
