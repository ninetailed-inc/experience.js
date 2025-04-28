import { get } from 'radash';

/**
 *
 * This function is a copy of the radash `template` function
 * https://github.com/rayepps/radash/blob/c378bd1bc401045ed7d8e5e47b275d2159ce43d5/src/string.ts#L118
 */
export const template = (
  str: string,
  data: Record<string, unknown>,
  regex = /\{\{(.+?)\}\}/g
) => {
  return Array.from(str.matchAll(regex)).reduce((acc, match) => {
    return acc.replace(match[0], get(data, match[1].trim()) ?? 'undefined');
  }, str);
};
