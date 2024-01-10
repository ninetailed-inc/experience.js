/**
 * Similar to _.throttle but waits for the promise to resolve.
 * There is no "wait time" because you can simply await `Promise.timeout` inside `fn` to wait some time before the next call.
 */
export function asyncThrottle<I, O = void>(fn: (args: I) => Promise<O>) {
  let runningPromise: Promise<O> | undefined;
  let queuedPromise: Promise<O> | undefined;
  let nextArgs!: I;
  return async (args: I) => {
    if (runningPromise) {
      nextArgs = args;
      if (queuedPromise) {
        return queuedPromise;
      } else {
        queuedPromise = runningPromise.then(() => {
          queuedPromise = undefined;
          runningPromise = fn(nextArgs);
          return runningPromise;
        });
        return queuedPromise;
      }
    } else {
      runningPromise = fn(args);
      return runningPromise;
    }
  };
}
