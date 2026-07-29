import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sequentializeByKey } from '../src/concurrency.js';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

test('same-key calls run one at a time, in order', async () => {
  const queues = new Map<string, Promise<void>>();
  const order: string[] = [];
  const first = deferred<void>();

  const callA = sequentializeByKey(queues, 'profile-a', async () => {
    order.push('a-start');
    await first.promise;
    order.push('a-end');
  });
  const callB = sequentializeByKey(queues, 'profile-a', async () => {
    order.push('b-start');
  });

  // B must not have started yet — A holds the "profile-a" slot.
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(order, ['a-start']);

  first.resolve();
  await Promise.all([callA, callB]);
  assert.deepEqual(order, ['a-start', 'a-end', 'b-start']);
});

test('different-key calls run concurrently, not serialized', async () => {
  const queues = new Map<string, Promise<void>>();
  const order: string[] = [];
  const first = deferred<void>();

  const callA = sequentializeByKey(queues, 'profile-a', async () => {
    order.push('a-start');
    await first.promise;
    order.push('a-end');
  });
  const callB = sequentializeByKey(queues, 'profile-b', async () => {
    order.push('b-start');
  });

  await callB;
  // B (a different key) completed without waiting on A.
  assert.deepEqual(order, ['a-start', 'b-start']);

  first.resolve();
  await callA;
});

test('a rejected call does not block the next caller for the same key', async () => {
  const queues = new Map<string, Promise<void>>();

  await assert.rejects(
    sequentializeByKey(queues, 'profile-a', async () => { throw new Error('boom'); }),
    /boom/
  );

  const result = await sequentializeByKey(queues, 'profile-a', async () => 'ok');
  assert.equal(result, 'ok');
});
