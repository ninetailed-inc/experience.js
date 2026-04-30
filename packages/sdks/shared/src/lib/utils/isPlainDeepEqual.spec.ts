import { isPlainDeepEqual } from './isPlainDeepEqual';

describe('isPlainDeepEqual', () => {
  it('should compare primitive values', () => {
    expect(isPlainDeepEqual('a', 'a')).toBe(true);
    expect(isPlainDeepEqual(1, 1)).toBe(true);
    expect(isPlainDeepEqual(true, true)).toBe(true);
    expect(isPlainDeepEqual('a', 'b')).toBe(false);
    expect(isPlainDeepEqual(1, 2)).toBe(false);
  });

  it('should return false for different primitive types', () => {
    expect(isPlainDeepEqual(1, '1')).toBe(false);
    expect(isPlainDeepEqual('true', true)).toBe(false);
  });

  it('should return false for object vs array', () => {
    expect(isPlainDeepEqual({ value: 1 }, [1])).toBe(false);
  });

  it('should treat NaN as equal', () => {
    expect(isPlainDeepEqual(Number.NaN, Number.NaN)).toBe(true);
  });

  it('should compare null and undefined correctly', () => {
    expect(isPlainDeepEqual(null, null)).toBe(true);
    expect(isPlainDeepEqual(undefined, undefined)).toBe(true);
    expect(isPlainDeepEqual(null, undefined)).toBe(false);
  });

  it('should compare arrays deeply', () => {
    expect(isPlainDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isPlainDeepEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(isPlainDeepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(isPlainDeepEqual([1, 2], [2, 1])).toBe(false);
  });

  it('should compare plain objects deeply', () => {
    expect(
      isPlainDeepEqual(
        { a: 1, b: { c: [1, 2, 3] } },
        { a: 1, b: { c: [1, 2, 3] } }
      )
    ).toBe(true);
  });

  it('should compare deeply nested objects', () => {
    expect(
      isPlainDeepEqual(
        {
          user: {
            profile: {
              settings: {
                locale: 'en',
                timezone: 'UTC',
              },
            },
          },
        },
        {
          user: {
            profile: {
              settings: {
                locale: 'en',
                timezone: 'UTC',
              },
            },
          },
        }
      )
    ).toBe(true);
  });

  it('should return false for different deeply nested objects', () => {
    expect(
      isPlainDeepEqual(
        {
          user: {
            profile: {
              settings: {
                locale: 'en',
                timezone: 'UTC',
              },
            },
          },
        },
        {
          user: {
            profile: {
              settings: {
                locale: 'de',
                timezone: 'UTC',
              },
            },
          },
        }
      )
    ).toBe(false);
  });

  it('should compare nested arrays deeply', () => {
    expect(
      isPlainDeepEqual(
        [
          [1, 2],
          [3, [4, 5]],
        ],
        [
          [1, 2],
          [3, [4, 5]],
        ]
      )
    ).toBe(true);
  });

  it('should return false for different nested arrays', () => {
    expect(
      isPlainDeepEqual(
        [
          [1, 2],
          [3, [4, 5]],
        ],
        [
          [1, 2],
          [3, [4, 6]],
        ]
      )
    ).toBe(false);
  });

  it('should compare nested objects inside arrays deeply', () => {
    expect(
      isPlainDeepEqual(
        [
          { id: 'a', meta: { tags: ['x', 'y'] } },
          { id: 'b', meta: { tags: ['z'] } },
        ],
        [
          { id: 'a', meta: { tags: ['x', 'y'] } },
          { id: 'b', meta: { tags: ['z'] } },
        ]
      )
    ).toBe(true);
  });

  it('should return false for different nested objects inside arrays', () => {
    expect(
      isPlainDeepEqual(
        [
          { id: 'a', meta: { tags: ['x', 'y'] } },
          { id: 'b', meta: { tags: ['z'] } },
        ],
        [
          { id: 'a', meta: { tags: ['x', 'y'] } },
          { id: 'b', meta: { tags: ['zz'] } },
        ]
      )
    ).toBe(false);
  });

  it('should be key-order agnostic for objects', () => {
    expect(isPlainDeepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it('should treat missing keys and undefined keys as different', () => {
    expect(isPlainDeepEqual({ a: undefined }, {})).toBe(false);
  });

  it('should compare objects created with null prototype', () => {
    const a = Object.create(null) as Record<string, unknown>;
    const b = Object.create(null) as Record<string, unknown>;
    a.value = 1;
    b.value = 1;
    expect(isPlainDeepEqual(a, b)).toBe(true);
  });

  describe('non-plain objects', () => {
    it('should treat dates as non-plain objects', () => {
      expect(isPlainDeepEqual(new Date(0), new Date(0))).toBe(false);
    });

    it('should treat maps as non-plain objects', () => {
      expect(isPlainDeepEqual(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(
        false
      );
    });

    it('should treat sets as non-plain objects', () => {
      expect(isPlainDeepEqual(new Set([1, 2]), new Set([1, 2]))).toBe(false);
    });

    it('should treat class instances as non-plain objects', () => {
      class Foo {
        constructor(public value: number) {}
      }

      expect(isPlainDeepEqual(new Foo(1), new Foo(1))).toBe(false);
    });

    it('should treat same non-plain object reference as equal', () => {
      const date = new Date(0);
      expect(isPlainDeepEqual(date, date)).toBe(true);
    });
  });

  it('should support circular references with matching structure', () => {
    const a = { name: 'a' } as Record<string, unknown>;
    const b = { name: 'a' } as Record<string, unknown>;
    a.self = a;
    b.self = b;

    expect(isPlainDeepEqual(a, b)).toBe(true);
  });

  it('should detect mismatched circular structures', () => {
    const a = { name: 'a' } as Record<string, unknown>;
    const b = { name: 'a' } as Record<string, unknown>;
    a.self = a;
    b.self = { name: 'a' };

    expect(isPlainDeepEqual(a, b)).toBe(false);
  });
});
