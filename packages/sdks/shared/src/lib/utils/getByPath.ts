const BLOCKED_PATH_SEGMENTS = new Set([
  '__proto__',
  'prototype',
  'constructor',
]);

export const getByPath = <T = unknown>(
  obj: unknown,
  path: string
): T | undefined => {
  // Normalize user-provided paths so accidental whitespace does not change lookup behavior.
  const normalizedPath = path.trim();

  if (!normalizedPath) {
    return undefined;
  }

  const pathSegments = normalizedPath.split('.');

  // Reject malformed paths such as "a..b", ".a", or "a.".
  if (pathSegments.some((segment) => segment.length === 0)) {
    return undefined;
  }

  return pathSegments.reduce<unknown>((acc, key) => {
    if (
      acc === null ||
      typeof acc !== 'object' ||
      // Block prototype-chain traversal segments.
      BLOCKED_PATH_SEGMENTS.has(key) ||
      // Only resolve own properties; do not read inherited properties.
      !Object.prototype.hasOwnProperty.call(acc, key)
    ) {
      return undefined;
    }

    return (acc as Record<string, unknown>)[key];
  }, obj) as T | undefined;
};
