import { Baseline } from './Baseline';
import { Reference } from './Reference';
import { VariantRef } from './VariantRef';

export type BaselineWithVariants<Variant extends Reference> = {
  baseline: Baseline;
  variants: (Variant | VariantRef)[];
};
