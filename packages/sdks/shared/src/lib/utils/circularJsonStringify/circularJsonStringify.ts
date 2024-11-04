import { decycle } from './cycle';

export const circularJsonStringify = (value: unknown) => {
  return JSON.stringify(decycle(value));
};
