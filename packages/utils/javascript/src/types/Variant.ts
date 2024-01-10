import { z } from 'zod';

export const Variant = z
  .object({
    id: z.string(),
  })
  .catchall(z.unknown());

export type VariantLike = z.input<typeof Variant>;
export type Variant = z.infer<typeof Variant>;
