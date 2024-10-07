import { z } from 'zod';

export const SelectedVariantInfo = z.object({
  experienceId: z.string(),
  variantIndex: z.number(),
  variants: z.record(z.string()),
  sticky: z.boolean().optional().default(false),
});

export type SelectedVariantInfo = z.infer<typeof SelectedVariantInfo>;
