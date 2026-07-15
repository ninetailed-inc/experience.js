import { getByPath } from './getByPath';

/**
 * Interpolates `{{ key }}` placeholders in `str` with values from `data`.
 *
 * This function is a copy of the radash `template` function
 * https://github.com/rayepps/radash/blob/c378bd1bc401045ed7d8e5e47b275d2159ce43d5/src/string.ts#L118
 *
 * The regex is intentionally hard-coded and not caller-configurable.
 * Using a negated character class `[^}]+` instead of a lazy quantifier
 * ensures O(n) matching and prevents ReDoS on crafted inputs (CWE-1333).
 */
const TEMPLATE_REGEX = /\{\{([^}]+)\}\}/g;

export const template = (str: string, data: Record<string, unknown>) => {
  return Array.from(str.matchAll(TEMPLATE_REGEX)).reduce((acc, match) => {
    return acc.replace(
      match[0],
      getByPath(data, match[1].trim()) ?? 'undefined'
    );
  }, str);
};
