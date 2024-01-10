import { z } from 'zod';

type JsonLiteralObject = {
  [key: string]: JsonLiteralValue | JsonLiteralValue[];
};
type JsonLiteralValue =
  | string
  | number
  | boolean
  | null
  | symbol
  | JsonLiteralValue[]
  | JsonLiteralObject;

export const JsonLiteral: z.ZodType<JsonLiteralValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.symbol(),
    z.array(JsonLiteral),
    JsonLiteralObject,
  ])
);

export const JsonLiteralObject: z.ZodType<JsonLiteralValue> = z.record(
  z.string(),
  z.union([JsonLiteral, z.array(JsonLiteral)])
);

type JsonLiteral = z.infer<typeof JsonLiteral>;

export type Json = JsonLiteral | { [key: string]: Json } | Json[];
export const Json: z.ZodType<Json> = z.lazy(() =>
  z.union([JsonLiteral, z.array(Json), z.record(Json)])
);

export type JsonObject = { [key: string]: Json };
export const JsonObject: z.ZodType<JsonObject> = z.record(Json);
