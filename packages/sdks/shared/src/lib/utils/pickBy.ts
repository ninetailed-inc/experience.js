// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pickBy = <T extends Record<string, any>>(
  object: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> => {
  return Object.keys(object).reduce((acc, key: keyof T) => {
    if (predicate(object[key], key)) {
      acc[key] = object[key];
    }
    return acc;
  }, {} as Partial<T>);
};
