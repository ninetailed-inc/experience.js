import { z } from 'zod';

export const ElementSeenPayloadSchema = z.object({
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
  variant: z.object({ id: z.string() }).catchall(z.unknown()),
  variantIndex: z.number(),
  seenFor: z.number().optional().default(0),
});

export type ElementSeenPayload = Omit<
  z.input<typeof ElementSeenPayloadSchema>,
  'element'
> & { element: Element };
