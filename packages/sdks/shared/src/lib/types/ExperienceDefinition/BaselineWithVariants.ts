import { z } from 'zod';
import { SerializableObject } from '../SerializableObject/SerializableObject';
import { Baseline } from './Baseline';
import { Reference } from './Reference';
import { VariantRef } from './VariantRef';

export enum ComponentTypeEnum {
  EntryReplacement = 'EntryReplacement',
  InlineVariable = 'InlineVariable',
}

export enum InlineVariableComponentValueTypeEnum {
  String = 'String',
  Object = 'Object',
  Boolean = 'Boolean',
  Number = 'Number',
}

export type EntryReplacement<Variant extends Reference> = {
  type: ComponentTypeEnum.EntryReplacement;
  baseline: Baseline;
  variants: (Variant | VariantRef)[];
};

export const allowVariableTypeSchema = z.union([
  z.string(),
  z.boolean(),
  z.number(),
  SerializableObject,
]);

export type AllowedVariableType = z.infer<typeof allowVariableTypeSchema>;

export const variableVariantSchema = z.object({
  value: allowVariableTypeSchema,
});

type InlineVariableValueType = z.infer<typeof variableVariantSchema>;

export type InlineVariable = {
  type: ComponentTypeEnum.InlineVariable;
  key: string;
  valueType: InlineVariableComponentValueTypeEnum;
  baseline: InlineVariableValueType;
  variants: InlineVariableValueType[];
};
