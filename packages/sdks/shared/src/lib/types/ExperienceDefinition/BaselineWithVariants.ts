import { SerializableObject } from '../SerializableObject/SerializableObject';
import { Baseline } from './Baseline';
import { Reference } from './Reference';
import { VariantRef } from './VariantRef';

export enum ComponentTypeEnum {
  Entry = 'Entry',
  Variable = 'Variable',
}

enum InlineVariableComponentValueTypeEnum {
  String = 'String',
  Object = 'Object',
}

export type EntryReplacement<Variant extends Reference> = {
  type: ComponentTypeEnum.Entry;
  baseline: Baseline;
  variants: (Variant | VariantRef)[];
};

export type InlineVariable = {
  type: ComponentTypeEnum.Variable;
  key: string;
  valueType: InlineVariableComponentValueTypeEnum;
  baseline: { value: string | SerializableObject };
  variants: { value: string | SerializableObject }[];
};
