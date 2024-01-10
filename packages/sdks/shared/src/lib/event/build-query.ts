import type { Query } from '../types/Event/Query';

export const buildQuery = (url: string): Query => {
  const result: Query = {};
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.forEach((value, key) => {
      result[key] = value;
    });
  } catch (error) {
    //noop
  }
  return result;
};
