export const unionBy = <T extends { [key: string]: any }>(
  array1: T[],
  array2: T[],
  prop: string
): T[] => {
  return Object.values(
    [...array1, ...array2].reduce((acc, item) => {
      if (!(prop in acc)) {
        acc[item[prop]] = item;
      }

      return acc;
    }, {} as Record<string, any>)
  );
};
