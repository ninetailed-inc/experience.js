import { z } from 'zod';

export const SelectedVariantInfo = z.object({
  experienceId: z.string(),
  variantIndex: z.number(),
  variants: z.record(z.string()),
});

export type SelectedVariantInfo = z.infer<typeof SelectedVariantInfo>;
