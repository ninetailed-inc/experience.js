import { Baseline, VariantRef } from '@ninetailed/experience.js';

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

export enum ComponentTypeEnum {
  EntryReplacement = 'EntryReplacement',
  InlineVariable = 'InlineVariable',
}

export enum InlineVariableComponentValueTypeEnum {
  String = 'String',
  Object = 'Object',
}

export const entryReplacementVariantSchema = z.object({
  id: z.string(),
});

export const variableVariantSchema = z.object({
  value: z.union([z.string(), SerializableObject]),
});

export const EntryReplacementComponentSchema = z.object({
  type: z.literal(ComponentTypeEnum.EntryReplacement).optional(), // [components-migration] TODO: to become mandatory once migration is finalized
  baseline: entryReplacementVariantSchema,
  variants: z.array(entryReplacementVariantSchema),
});

export type EntryReplacementComponent = z.infer<
  typeof EntryReplacementComponentSchema
>;

export type TExperienceConfigComponentSchema = z.infer<
  typeof ExperienceConfigComponentSchema
>;

export function isEntryReplacementComponent(
  component: TExperienceConfigComponentSchema
): component is EntryReplacementComponent {
  return (
    component.type === ComponentTypeEnum.EntryReplacement ||
    component.type === undefined // TODO: to be removed once migration is finalized
  );
}

export const InlineVariableComponentSchema = z.object({
  type: z.literal(ComponentTypeEnum.InlineVariable),
  key: z.string(),
  valueType: z.nativeEnum(InlineVariableComponentValueTypeEnum),
  baseline: variableVariantSchema,
  variants: z.array(variableVariantSchema),
});

export type InlineVariableComponent = z.infer<
  typeof InlineVariableComponentSchema
>;

export function isInlineVariableComponent(
  component: TExperienceConfigComponentSchema
): component is InlineVariableComponent {
  return component.type === ComponentTypeEnum.InlineVariable;
}
export const ExperienceConfigComponentSchema = z.union([
  EntryReplacementComponentSchema,
  InlineVariableComponentSchema,
]);

export const Config = z.object({
  distribution: z.array(z.number()).optional().default([0.5, 0.5]),
  traffic: z.number().optional().default(0),
  components: z
    .array(ExperienceConfigComponentSchema)
    .optional()
    .default([
      {
        type: ComponentTypeEnum.EntryReplacement,
        baseline: { id: '' },
        variants: [{ id: '' }],
      },
    ]),
  sticky: z.boolean().optional().default(false),
});

export type ConfigLike = z.input<typeof Config>;
export type Config = z.infer<typeof Config>;

export interface BaselineWithVariantRefs {
  baseline: Baseline;
  variants: VariantRef[];
}
