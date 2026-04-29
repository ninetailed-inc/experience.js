const isObjectLike = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

// A plain object is either an object literal (Object.prototype) or
// an object created with Object.create(null) (null prototype).
// Objects with custom prototypes (Date, Map, Set, class instances, etc.)
// are treated as non-plain.
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!isObjectLike(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const isPlainDeepEqualInternal = (
  a: unknown,
  b: unknown,
  seen: WeakMap<object, object>
): boolean => {
  if (Object.is(a, b)) {
    return true;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }

    return a.every((item, index) =>
      isPlainDeepEqualInternal(item, b[index], seen)
    );
  }

  if (!isObjectLike(a) || !isObjectLike(b)) {
    return false;
  }

  if (seen.get(a) === b) {
    return true;
  }

  seen.set(a, b);

  if (!isPlainObject(a) || !isPlainObject(b)) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      isPlainDeepEqualInternal(a[key], b[key], seen)
  );
};

// Deep equality for plain JSON-like values (primitives, arrays, plain objects).
// Non-plain objects (e.g. Map, Set, Date, RegExp, class instances) are treated
// as unequal unless they are the exact same reference.
export const isPlainDeepEqual = (a: unknown, b: unknown): boolean => {
  return isPlainDeepEqualInternal(a, b, new WeakMap<object, object>());
};
