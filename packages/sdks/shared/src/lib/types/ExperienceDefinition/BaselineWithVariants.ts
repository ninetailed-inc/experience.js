import { SerializableObject } from '../SerializableObject';
import { Baseline } from './Baseline';
import { Reference } from './Reference';
import { VariantRef } from './VariantRef';

enum ComponentTypeEnum {
  EntryReplacement = 'EntryReplacement',
  InlineVariable = 'InlineVariable',
}

enum InlineVariableComponentValueTypeEnum {
  String = 'String',
  Object = 'Object',
}

export type EntryReplacement<Variant extends Reference> = {
  type: ComponentTypeEnum.EntryReplacement;
  baseline: Baseline;
  variants: (Variant | VariantRef)[];
};

export type InlineVariable = {
  type: ComponentTypeEnum.InlineVariable;
  key: string;
  valueType: InlineVariableComponentValueTypeEnum;
  baseline: { value: string | SerializableObject };
  variants: { value: string | SerializableObject }[];
};
