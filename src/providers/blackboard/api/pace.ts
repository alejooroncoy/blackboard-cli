/**
 * Keeps our traffic to the university shaped like a person browsing.
 *
 * Nothing here protects us; it protects them. A page listing course contents
 * fans out over its subfolders, and an assistant asked to "download everything
 * from this course" turns that into a burst no human session produces. The
 * cost of being wrong is not a slow response: it is the university blocking the
 * address, and on the hosted relay that address is shared by every student.
 *
 * Two lanes, because the two kinds of request behave differently:
 *
 * - `api` is metadata: small, fast, and a browser does fire several at once
 *   when it opens a course. A handful in parallel is normal traffic.
 * - `file` is downloads: large, slow, and a person clicks them one at a time.
 *   Several concurrent file transfers from one account is the single clearest
 *   sign of automation, so these go strictly one after another with a pause
 *   between them.
 */

/** A browser opens six sockets per host; four stays comfortably under. */
export const API_CONCURRENCY = 4;
/** Downloads are serial. A person does not fetch two files at once. */
export const FILE_CONCURRENCY = 1;
/** Minimum gap between downloads, so a folder of files is not a burst. */
export const FILE_GAP_MS = 350;

export type Lane = 'api' | 'file';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type LaneState = {
  readonly limit: number;
  readonly gapMs: number;
  active: number;
  lastFinishedAt: number;
  /** FIFO, so one caller's work cannot starve another's. */
  waiting: Array<() => void>;
};

function makeLane(limit: number, gapMs: number): LaneState {
  return { limit, gapMs, active: 0, lastFinishedAt: 0, waiting: [] };
}

export class Pace {
  private readonly lanes: Record<Lane, LaneState>;
  private readonly now: () => number;

  constructor(options: { api?: number; file?: number; gapMs?: number; now?: () => number } = {}) {
    this.lanes = {
      api: makeLane(options.api ?? API_CONCURRENCY, 0),
      file: makeLane(options.file ?? FILE_CONCURRENCY, options.gapMs ?? FILE_GAP_MS),
    };
    this.now = options.now ?? Date.now;
  }

  /**
   * Runs `task` once its lane has room.
   *
   * The release is in a `finally` so a failed request still frees its slot: a
   * leaked slot would wedge the lane until the process restarted, and on the
   * file lane, where only one runs at a time, that means no more downloads.
   */
  async run<T>(lane: Lane, task: () => Promise<T>): Promise<T> {
    const state = this.lanes[lane];
    while (state.active >= state.limit) {
      await new Promise<void>((resolve) => state.waiting.push(resolve));
    }
    state.active += 1;
    try {
      // Waiting happens after taking the slot, so the gap is enforced between
      // downloads rather than merely between the moments they were requested.
      const since = this.now() - state.lastFinishedAt;
      if (state.gapMs > 0 && state.lastFinishedAt > 0 && since < state.gapMs) {
        await sleep(state.gapMs - since);
      }
      return await task();
    } finally {
      state.lastFinishedAt = this.now();
      state.active -= 1;
      state.waiting.shift()?.();
    }
  }

  /** For tests and diagnostics. */
  activeIn(lane: Lane): number {
    return this.lanes[lane].active;
  }

  /** Nothing running and nobody queued, so it is safe to discard. */
  isIdle(): boolean {
    return (['api', 'file'] as const).every(
      (lane) => this.lanes[lane].active === 0 && this.lanes[lane].waiting.length === 0
    );
  }
}

/**
 * One pace per student, for processes that serve more than one.
 *
 * The limits describe what a single person's traffic should look like, so a
 * process-wide pace is right in the CLI, where the process is the student, and
 * wrong in the hosted relay, where thirty students share it: with downloads
 * serialised globally, one slow file would stall everyone else's. Keyed here so
 * the shape stays per person no matter who runs it.
 */
const paces = new Map<string, { pace: Pace; lastUsed: number }>();
const PACE_IDLE_MS = 10 * 60_000;

export function paceFor(key: string, now: () => number = Date.now): Pace {
  const at = now();
  // Dropping idle entries on lookup keeps the map bounded without a timer that
  // would hold the process open.
  for (const [existing, entry] of paces) {
    if (at - entry.lastUsed > PACE_IDLE_MS && entry.pace.isIdle()) paces.delete(existing);
  }
  const found = paces.get(key);
  if (found) {
    found.lastUsed = at;
    return found.pace;
  }
  const pace = new Pace();
  paces.set(key, { pace, lastUsed: at });
  return pace;
}

/**
 * Which lane a request belongs to.
 *
 * Detected from the request rather than declared at each call site: a new
 * download helper added later is paced automatically instead of quietly
 * skipping the limit, which is the failure mode that matters.
 */
export function laneFor(config: {
  url?: string;
  responseType?: string;
  method?: string;
}): Lane {
  const responseType = config.responseType ?? '';
  if (responseType === 'stream' || responseType === 'arraybuffer' || responseType === 'blob') {
    return 'file';
  }
  const url = config.url ?? '';
  // Blackboard serves file bytes from these shapes; the rest is metadata.
  if (/\/attachments\/[^/]+\/download/.test(url)) return 'file';
  if (/bbcswebdav/.test(url)) return 'file';
  if (/\/uploads?(\b|\/)/.test(url) && (config.method ?? '').toLowerCase() === 'post') return 'file';
  return 'api';
}
