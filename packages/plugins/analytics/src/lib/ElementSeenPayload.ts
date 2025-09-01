import { allowVariableTypeSchema } from '@ninetailed/experience.js-shared';
import { z } from 'zod';

export type ComponentViewEventComponentType = 'Entry' | 'Variable';

// Base schema with shared properties
const BaseSeenPayloadSchema = z.object({
  componentType: z.union([z.literal('Entry'), z.literal('Variable')]),
  variant: z.object({ id: z.string() }).catchall(z.unknown()),
  variantIndex: z.number(),
});

// Element specific schema
export const ElementSeenPayloadSchema = BaseSeenPayloadSchema.extend({
  element: z.any(),
  experience: z
    .object({
      id: z.string(),
      type: z.union([
        z.literal('nt_experiment'),
        z.literal('nt_personalization'),
      ]),
      name: z.string().optional(),
      description: z.string().optional(),
      sticky: z.boolean().optional().default(false),
    })
    .optional()
    .nullable(),
  audience: z
    .object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    })
    .optional()
    .nullable()
    .default({
      id: 'ALL_VISITORS',
      name: 'All Visitors',
      description:
        'This is the default all visitors audience as no audience was set.',
    }),
  seenFor: z.number().optional().default(0),
});

export type ElementSeenPayload = Omit<
  z.input<typeof ElementSeenPayloadSchema>,
  'element'
> & { element: Element };

// Variable specific schema
export const VariableSeenPayloadSchema = BaseSeenPayloadSchema.extend({
  variable: allowVariableTypeSchema,
  experienceId: z.string().optional(),
});

export type VariableSeenPayload = z.input<typeof VariableSeenPayloadSchema>;
