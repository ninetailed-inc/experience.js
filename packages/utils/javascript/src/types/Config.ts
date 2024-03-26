import { Baseline, VariantRef } from '@ninetailed/experience.js';

import { z } from 'zod';

export const Config = z.object({
  distribution: z.array(z.number()).optional().default([0.5, 0.5]),
  traffic: z.number().optional().default(0),
  components: z
    .array(
      z.object({
        baseline: z.object({
          id: z.string().default(''),
        }),
        variants: z.array(
          z.object({
            id: z.string().default(''),
            hidden: z.boolean().default(false),
          })
        ),
      })
    )
    .optional()
    .default([{ baseline: { id: '' }, variants: [{ id: '', hidden: false }] }]),
  sticky: z.boolean().optional().default(false),
});

export type ConfigLike = z.input<typeof Config>;
export type Config = z.infer<typeof Config>;

export interface BaselineWithVariantRefs {
  baseline: Baseline;
  variants: VariantRef[];
}
