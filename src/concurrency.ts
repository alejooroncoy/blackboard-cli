// Serializes async work sharing the same key so concurrent callers await the
// same in-flight call instead of racing separate ones, while callers using a
// different key still run concurrently. One caller's rejection never blocks
// the next caller for that key.
export function sequentializeByKey<T>(
  queues: Map<string, Promise<void>>,
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();
  const result = previous.then(fn, fn);
  queues.set(key, result.then(() => undefined, () => undefined));
  return result;
}
