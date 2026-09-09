const BLACKBOARD_ORIGIN = 'https://aulavirtual.upc.edu.pe';

export type EmbeddedFile = {
  type: 'embedded';
  displayName: string;
  mimeType: string;
  downloadUrl: string;
};

function attribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match?.[2];
}

function fileNameFromUrl(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || 'archivo adjunto');
  } catch {
    return 'archivo adjunto';
  }
}

function mediaSubtypeFromUrl(url: URL): string | undefined {
  const extension = url.pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  const subtypes: Record<string, string> = {
    aac: 'aac', flac: 'flac', m4a: 'mp4', mp3: 'mpeg', oga: 'ogg', ogg: 'ogg', wav: 'wav', weba: 'webm',
    m4v: 'mp4', mov: 'quicktime', mp4: 'mp4', ogv: 'ogg', webm: 'webm',
  };
  return extension ? subtypes[extension] : undefined;
}

function mediaCategoryFromUrl(url: URL): 'audio' | 'video' | undefined {
  const extension = url.pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (extension && ['aac', 'flac', 'm4a', 'mp3', 'oga', 'ogg', 'wav', 'weba'].includes(extension)) return 'audio';
  if (extension && ['m4v', 'mov', 'mp4', 'ogv', 'webm'].includes(extension)) return 'video';
  return undefined;
}

/** Blackboard's document viewer can render a file even when it is not exposed
 * by the REST attachments endpoint. */
export function extractEmbeddedFiles(body: string): EmbeddedFile[] {
  const seen = new Set<string>();
  const files: EmbeddedFile[] = [];

  for (const match of body.matchAll(/<(?:a|iframe|embed|object|audio|video|source)\b[^>]*>/gi)) {
    const tag = match[0];
    const href = attribute(tag, 'href') ?? attribute(tag, 'src') ?? attribute(tag, 'data');
    const rawMetadata = attribute(tag, 'data-bbfile');
    let metadata: Record<string, unknown> = {};
    if (rawMetadata) {
      try {
        metadata = JSON.parse(rawMetadata.replace(/&quot;/g, '"'));
      } catch {
        // Blackboard occasionally supplies malformed metadata; try the URL.
      }
    }

    const candidates = [
      href?.replace(/&amp;/g, '&'),
      typeof metadata.resourceUrl === 'string' ? metadata.resourceUrl : undefined,
    ].filter((candidate): candidate is string => Boolean(candidate));
    let url: URL | undefined;
    for (const candidate of candidates) {
      try {
        const parsed = new URL(candidate, BLACKBOARD_ORIGIN);
        if (parsed.protocol === 'https:' && parsed.origin === BLACKBOARD_ORIGIN && parsed.pathname.startsWith('/bbcswebdav/')) {
          url = parsed;
          break;
        }
      } catch {
        // Try another candidate.
      }
    }
    if (!url || seen.has(url.href)) continue;
    seen.add(url.href);
    const mediaElement = tag.match(/^<\s*(audio|video)\b/i)?.[1]?.toLowerCase() as 'audio' | 'video' | undefined;
    const mediaCategory = mediaElement ?? mediaCategoryFromUrl(url);
    const urlMimeType = mediaCategory ? `${mediaCategory}/${mediaSubtypeFromUrl(url) ?? '*'}` : undefined;

    files.push({
      type: 'embedded',
      displayName: typeof metadata.displayName === 'string'
        ? metadata.displayName
        : typeof metadata.linkName === 'string'
          ? metadata.linkName
          : attribute(tag, 'title') ?? attribute(tag, 'aria-label') ?? fileNameFromUrl(url.href),
      mimeType: typeof metadata.mimeType === 'string'
        ? metadata.mimeType
        : attribute(tag, 'type') ?? urlMimeType ?? 'application/octet-stream',
      downloadUrl: url.href,
    });
  }

  return files;
}
