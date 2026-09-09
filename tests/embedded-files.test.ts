import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractEmbeddedFiles } from '../src/providers/blackboard/embedded-files.js';
import { attachmentMediaResourceLink, embeddedMediaResourceLink } from '../src/providers/blackboard/resource-links.js';

test('finds a viewer-only Blackboard file when the attachments API is empty', () => {
  const files = extractEmbeddedFiles('<iframe title="SEMANA 01 - 2026-2.pptx" src="/bbcswebdav/pid-1-dt-content-rid-2/xid-3"></iframe>');
  assert.equal(files[0]?.downloadUrl, 'https://aulavirtual.upc.edu.pe/bbcswebdav/pid-1-dt-content-rid-2/xid-3');
});

test('rejects external and non-file links', () => {
  const files = extractEmbeddedFiles('<a href="https://evil.example/bbcswebdav/file">outside</a><a href="/webapps/blackboard/content/listContent.jsp">not a file</a>');
  assert.deepEqual(files, []);
});

test('finds Blackboard video elements embedded in assignment instructions', () => {
  const files = extractEmbeddedFiles('<video title="Self-introduction"><source type="video/mp4" src="/bbcswebdav/pid-7/video.mp4"></video>');
  assert.equal(files.length, 1);
  assert.equal(files[0]?.downloadUrl, 'https://aulavirtual.upc.edu.pe/bbcswebdav/pid-7/video.mp4');
});

test('turns embedded Blackboard media into a resource link', () => {
  const link = embeddedMediaResourceLink({ displayName: 'Self-introduction.mp4', mimeType: 'video/mp4', downloadUrl: 'https://aulavirtual.upc.edu.pe/bbcswebdav/pid-7/video.mp4' });
  assert.equal(link?.type, 'resource_link');
  assert.match(link?.description ?? '', /analizarlo o transcribirlo/);
});

test('resolves an attached video without downloading it', async () => {
  let destroyed = false;
  const client = { get: async () => ({ data: { destroy: () => { destroyed = true; } }, headers: { location: 'https://aulavirtual.upc.edu.pe/bbcswebdav/pid-8/video.mp4' } }) } as any;
  const link = await attachmentMediaResourceLink(client, '_10_1', '_20_1', { id: '_30_1', fileName: 'Video de Adrián.mp4', mimeType: 'video/mp4', size: 5_996_902 });
  assert.equal(destroyed, true);
  assert.deepEqual(link && { type: link.type, name: link.name, mimeType: link.mimeType, size: link.size }, { type: 'resource_link', name: 'Video de Adrián.mp4', mimeType: 'video/mp4', size: 5_996_902 });
});

test('does not resolve ordinary documents as media resource links', async () => {
  const client = { get: async () => { throw new Error('should not fetch'); } } as any;
  assert.equal(await attachmentMediaResourceLink(client, '_10_1', '_20_1', { id: '_30_1', mimeType: 'application/pdf' }), null);
});
