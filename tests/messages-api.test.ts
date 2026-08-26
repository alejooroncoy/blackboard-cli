import assert from 'node:assert/strict';
import test from 'node:test';
import { getCourseConversations, getCourseConversationsPageSet, getMessageCourseSummaries } from '../src/providers/blackboard/api/courses.js';

test('Blackboard Ultra message APIs request the course summary and conversations', async () => {
  let request: { path?: string; config?: any } = {};
  const client = {
    get: async (path: string, config: any) => {
      request = { path, config };
      return { data: { results: [{ id: '_1_1', subject: 'Hola' }], paging: { nextPage: 'next' } } };
    },
  } as any;

  const summary = await getMessageCourseSummaries(client, { limit: 20, offset: 5 });

  assert.equal(request.path, '/learn/api/v1/messages/summary');
  assert.deepEqual(request.config.params, { limit: 20, offset: 5 });
  assert.deepEqual(summary.results, [{ id: '_1_1', subject: 'Hola' }]);
  assert.deepEqual(summary.paging, { nextPage: 'next' });

  await getCourseConversations(client, '_42_1', { limit: 10, offset: 2 });
  assert.equal(request.path, '/learn/api/v1/courses/_42_1/conversations');
  assert.deepEqual(request.config.params, { limit: 10, offset: 2 });
  await assert.rejects(getCourseConversations(client, '../other'), /courseId must look like a Blackboard ID/);
});

test('getCourseConversationsPageSet marks an inbox as truncated after its bounded pages', async () => {
  const client = {
    get: async (path: string) => {
      if (path.endsWith('/conversations')) {
        return { data: { results: [{ id: 'first' }], paging: { nextPage: '/learn/api/v1/courses/_42_1/conversations?offset=100' } } };
      }
      return { data: { results: [{ id: 'second' }], paging: { nextPage: '/learn/api/v1/courses/_42_1/conversations?offset=200' } } };
    },
  } as any;
  const result = await getCourseConversationsPageSet(client, '_42_1', { maxPages: 2 });
  assert.deepEqual(result.results, [{ id: 'first' }, { id: 'second' }]);
  assert.equal(result.truncated, true);
});

test('getCourseConversationsPageSet refuses a page outside the current course endpoint', async () => {
  const client = {
    get: async () => ({ data: { results: [], paging: { nextPage: 'https://evil.example/messages' } } }),
  } as any;
  await assert.rejects(getCourseConversationsPageSet(client, '_42_1'), /unexpected Blackboard conversation page/);
});
