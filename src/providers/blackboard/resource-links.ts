import type { AxiosInstance } from 'axios';
import { assertBlackboardFileUrl } from './api/client.js';

export type BlackboardAttachment = {
  id: string;
  fileName?: string;
  displayName?: string;
  mimeType?: string;
  size?: number;
};

export type MediaResourceLink = {
  type: 'resource_link';
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  size?: number;
};

export function isMediaMimeType(mimeType?: string): boolean {
  return /^(?:audio|video)\//i.test(mimeType ?? '');
}

export function embeddedMediaResourceLink(file: { displayName: string; mimeType: string; downloadUrl: string }): MediaResourceLink | null {
  if (!isMediaMimeType(file.mimeType)) return null;
  assertBlackboardFileUrl(file.downloadUrl);
  return {
    type: 'resource_link', uri: file.downloadUrl, name: file.displayName, mimeType: file.mimeType,
    description: 'Recurso multimedia de Blackboard. Si el cliente admite este formato, puede analizarlo o transcribirlo; si no, use blackboard_download_attachment con los metadatos devueltos por la herramienta.',
  };
}

/** Resolves the authenticated attachment endpoint to a short-lived, file-scoped
 * URL. The stream is destroyed immediately: listing must not download media. */
export async function attachmentMediaResourceLink(
  client: AxiosInstance, courseId: string, contentId: string, attachment: BlackboardAttachment,
): Promise<MediaResourceLink | null> {
  if (!isMediaMimeType(attachment.mimeType) || !/^_\d+_\d+$/.test(attachment.id)) return null;
  const response = await client.get(
    `/learn/api/public/v1/courses/${courseId}/contents/${contentId}/attachments/${attachment.id}/download`,
    { responseType: 'stream', maxRedirects: 0, validateStatus: (status) => status >= 200 && status < 400, headers: { Accept: '*/*' } },
  );
  response.data?.destroy?.();
  const location = response.headers.location as string | undefined;
  if (!location) return null;
  assertBlackboardFileUrl(location);
  return {
    type: 'resource_link', uri: location,
    name: attachment.fileName ?? attachment.displayName ?? 'Recurso multimedia de Blackboard',
    mimeType: attachment.mimeType!,
    ...(typeof attachment.size === 'number' && Number.isFinite(attachment.size) ? { size: attachment.size } : {}),
    description: 'Recurso multimedia de Blackboard. Si el cliente admite este formato, puede analizarlo o transcribirlo; si no, use blackboard_download_attachment con los metadatos devueltos por la herramienta.',
  };
}
