/**
 * This is a copy of the IntersectionObserver test helper from the JavaScript SDK.
 * We currently don't have a way to share test helpers between packages without generating a new package that is published to npm.
 */

import { jest, beforeEach, afterEach } from '@jest/globals';

const observerMap = new Map();
const instanceMap = new Map();

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.IntersectionObserver = jest.fn(
    (cb, options: Partial<IntersectionObserverInit> = {}) => {
      const instance = {
        thresholds: Array.isArray(options.threshold)
          ? options.threshold
          : [options.threshold],
        root: options.root,
        rootMargin: options.rootMargin,
        observe: jest.fn((element: Element) => {
          instanceMap.set(element, instance);
          observerMap.set(element, cb);
        }),

        unobserve: jest.fn((element: Element) => {
          instanceMap.delete(element);
          observerMap.delete(element);
        }),

        disconnect: jest.fn(),
      };
      return instance;
    }
  );
});

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.IntersectionObserver.mockReset();
  instanceMap.clear();
  observerMap.clear();
});

export function intersect(element: Element, isIntersecting: boolean) {
  const cb = observerMap.get(element);
  if (cb) {
    cb([
      {
        isIntersecting,
        target: element,
        intersectionRatio: isIntersecting ? 1 : -1,
      },
    ]);
  }
}

export function getObserverOf(element: Element): IntersectionObserver {
  return instanceMap.get(element);
}
