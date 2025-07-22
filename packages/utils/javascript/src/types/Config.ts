import { Baseline, VariantRef } from '@ninetailed/experience.js';
import { SerializableObject } from '@ninetailed/experience.js-shared';

import { z } from 'zod';

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

export const entryReplacementVariantSchema = z.object({
  id: z.string(),
  hidden: z.boolean().default(false),
});

export const variableVariantSchema = z.object({
  value: z.union([z.string(), SerializableObject]),
});

export const EntryReplacementComponentSchema = z.object({
  type: z.literal(ComponentTypeEnum.EntryReplacement),
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
    component.type === undefined
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

export const ExperienceConfigComponentSchema = z.preprocess((input) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component = input as any;
  if (!component?.type) {
    if ('baseline' in component && 'variants' in component) {
      return { ...component, type: ComponentTypeEnum.EntryReplacement };
    }
  }
  return component;
}, z.discriminatedUnion('type', [EntryReplacementComponentSchema, InlineVariableComponentSchema]));

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
