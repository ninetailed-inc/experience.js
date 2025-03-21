// JSON literal types
export type JsonLiteralObject = {
  [key: string]: JsonLiteralValue | JsonLiteralValue[];
};

export type JsonLiteralValue =
  | string
  | number
  | boolean
  | null
  | symbol
  | JsonLiteralValue[]
  | JsonLiteralObject;

// JSON types
export type Json = JsonLiteralValue | { [key: string]: Json } | Json[];

export type JsonObject = { [key: string]: Json };

// Change types
export enum ChangeTypes {
  Variable = 'Variable',
}

interface ChangeBase {
  key: string;
  type: ChangeTypes;
  meta: {
    experienceId: string;
    variantIndex: number;
  };
}

export type AllowedVariableType = string | JsonObject;

export interface VariableChange extends ChangeBase {
  type: ChangeTypes.Variable;
  value: string | JsonObject;
}

// Using union type instead of discriminated union with Zod
export type Change = VariableChange;
