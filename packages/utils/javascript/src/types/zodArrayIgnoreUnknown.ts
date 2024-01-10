import { z, ZodTypeAny } from 'zod';

/**
 * Zod helper for parsing arrays and ignore items not specified in the schema
 *
 * @param zodUnion - union of known types
 *
 * @example
 * const binaryArraySchema = arrayIgnoreUnknown(z.union([z.literal('0'), z.literal('1')]))
 * type BinaryArray = z.TypeOf<typeof binaryArraySchema>
 *
 * const binaryArray: BinaryArray = binaryArraySchema.parse(['0', '1', '2', '0'])
 * console.log(binaryArray) // ['0', '1', '0']
 */
export function zodArrayIgnoreUnknown<T extends ZodTypeAny>(zodType: T) {
  const isKnownItem = (item: unknown) => zodType.safeParse(item).success;

  return z.preprocess(
    (val) => toSafeArray(val).filter(isKnownItem),
    z.array(zodType)
  );
}

function toSafeArray(item: unknown): Array<unknown> {
  if (isArray(item)) {
    return item;
  }
  return [item];
}

function isArray<T>(item: unknown): item is Array<T> {
  return Array.isArray(item);
}
