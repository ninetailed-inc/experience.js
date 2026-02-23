import { allowVariableTypeSchema } from '@ninetailed/experience.js-shared';
import { z } from 'zod';

export type ComponentViewEventComponentType = 'Entry' | 'Variable';
export type ComponentClickEventComponentType = 'Entry' | 'Variable';
export type ComponentHoverEventComponentType = 'Entry' | 'Variable';

// Base schema with shared properties
const BaseElementPayloadSchema = z.object({
  variant: z.object({ id: z.string() }).catchall(z.unknown()),
  variantIndex: z.number(),
});

const BaseElementInteractionPayloadSchema = BaseElementPayloadSchema.extend({
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
  componentType: z.literal('Entry').default('Entry'),
});

// Element specific schema
export const ElementSeenPayloadSchema =
  BaseElementInteractionPayloadSchema.extend({
    seenFor: z.number().optional().default(0),
  });

export type ElementSeenPayload = Omit<
  z.input<typeof ElementSeenPayloadSchema>,
  'element'
> & { element: Element };

export const ElementClickedPayloadSchema = BaseElementInteractionPayloadSchema;

export type ElementClickedPayload = Omit<
  z.input<typeof ElementClickedPayloadSchema>,
  'element'
> & { element: Element };

export const ElementHoveredPayloadSchema =
  BaseElementInteractionPayloadSchema.extend({
    hoverDurationMs: z.number(),
    componentHoverId: z.string(),
  });

export type ElementHoveredPayload = Omit<
  z.input<typeof ElementHoveredPayloadSchema>,
  'element'
> & { element: Element };

// Variable specific schema
export const VariableSeenPayloadSchema = BaseElementPayloadSchema.extend({
  componentType: z.literal('Variable').default('Variable'),
  variable: allowVariableTypeSchema,
  experienceId: z.string().optional(),
});

export type VariableSeenPayload = z.input<typeof VariableSeenPayloadSchema>;
