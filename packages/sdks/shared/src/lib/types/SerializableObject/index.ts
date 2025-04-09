import { z } from 'zod';

type SerializableValue =
  | string
  | number
  | boolean
  | null
  | SerializableObject
  | SerializableValue[];

export const SerializableValue: z.ZodType<SerializableValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    SerializableObject,
    z.array(SerializableValue),
  ])
);

export type SerializableObject = {
  [key: string]: SerializableValue | SerializableValue[];
};
export const SerializableObject: z.ZodType<SerializableObject> = z.lazy(() =>
  z.record(z.string(), z.union([SerializableValue, z.array(SerializableValue)]))
);
