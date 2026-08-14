import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform, type Readable } from 'node:stream';

export const MAX_DOWNLOAD_BYTES = 100 * 1024 * 1024;
export const MAX_DOWNLOAD_ROOT_BYTES = 500 * 1024 * 1024;
let reservedDownloadBytes = 0;

export function downloadRoot(): string {
  return path.resolve(
    process.env.CAMPUS_DOWNLOAD_DIR ?? path.join(os.homedir(), 'Downloads', 'campus-cli'),
  );
}

function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
}

/**
 * MCP callers may choose a subdirectory, but never an arbitrary location on the
 * machine. The root itself is controlled by the person who launches Campus via
 * CAMPUS_DOWNLOAD_DIR, not by course content or a tool-calling model.
 */
export function resolveDownloadDir(subdirectory?: string): string {
  const root = downloadRoot();
  if (subdirectory && path.isAbsolute(subdirectory)) {
    throw new Error(`outputDir must be relative to the Campus download directory: ${root}`);
  }

  if (fs.existsSync(root) && fs.lstatSync(root).isSymbolicLink()) {
    throw new Error(`Refusing to use a symbolic link as the Campus download directory: ${root}`);
  }
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  fs.chmodSync(root, 0o700);

  const requested = path.resolve(root, subdirectory ?? '.');
  if (!isInside(root, requested)) {
    throw new Error(`Refusing to write outside the Campus download directory: ${root}`);
  }
  fs.mkdirSync(requested, { recursive: true, mode: 0o700 });

  // A lexical containment check is not enough when an intermediate directory
  // is a symlink. Compare canonical paths after mkdir to close that escape.
  const realRoot = fs.realpathSync(root);
  const realRequested = fs.realpathSync(requested);
  if (!isInside(realRoot, realRequested)) {
    throw new Error(`Refusing to follow an output directory symlink outside: ${realRoot}`);
  }
  return realRequested;
}

export function safeNewFilePath(dir: string, name: string): string {
  const base = path.basename(name);
  if (!base || base === '.' || base === '..') {
    throw new Error(`Refusing to write an unsafe filename: ${name}`);
  }
  return path.join(dir, base);
}

function treeBytes(directory: string): number {
  let total = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) total += treeBytes(item);
    else if (entry.isFile()) total += fs.statSync(item).size;
    if (total > MAX_DOWNLOAD_ROOT_BYTES) break;
  }
  return total;
}

/** Write a response stream once, without following symlinks or overwriting. */
export async function writeLimitedDownload(
  input: Readable,
  destination: string,
  maxBytes = MAX_DOWNLOAD_BYTES,
  quota?: { root: string; maxBytes?: number },
): Promise<number> {
  let reservation = 0;
  if (quota) {
    const quotaRoot = fs.realpathSync(quota.root);
    const quotaLimit = quota.maxBytes ?? MAX_DOWNLOAD_ROOT_BYTES;
    const canonicalDestination = path.join(
      fs.realpathSync(path.dirname(destination)),
      path.basename(destination),
    );
    if (!isInside(quotaRoot, canonicalDestination)) {
      throw new Error(`Download destination is outside its quota root: ${quotaRoot}`);
    }
    const available = quotaLimit - treeBytes(quotaRoot) - reservedDownloadBytes;
    reservation = Math.min(maxBytes, Math.max(0, available));
    if (reservation <= 0) {
      throw new Error(`Campus download directory reached its ${quotaLimit}-byte quota`);
    }
    reservedDownloadBytes += reservation;
    maxBytes = reservation;
  }

  // Opening first with wx makes the destination exclusive and gives pipeline a
  // descriptor that cannot be swapped for a symlink between checks and write.
  let fd: number;
  try {
    fd = fs.openSync(destination, 'wx', 0o600);
  } catch (error) {
    reservedDownloadBytes -= reservation;
    throw error;
  }
  let bytes = 0;
  const limiter = new Transform({
    transform(chunk: Buffer | string, encoding, callback) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
      bytes += buffer.byteLength;
      if (bytes > maxBytes) {
        callback(new Error(`Download exceeds the ${maxBytes}-byte safety limit`));
        return;
      }
      callback(null, buffer);
    },
  });

  try {
    await pipeline(input, limiter, fs.createWriteStream(destination, { fd, autoClose: true }));
    return bytes;
  } catch (error) {
    try { fs.closeSync(fd); } catch {}
    try { fs.unlinkSync(destination); } catch {}
    throw error;
  } finally {
    reservedDownloadBytes -= reservation;
  }
}
