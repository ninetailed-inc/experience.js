import { Baseline } from './Baseline';
import { Variant } from './Variant';

export type BaselineWithVariants = {
  // The Baseline with Variants here is not resolved to it's props. No type needed.
  baseline: Baseline;
  variants: Variant<Record<string, unknown>>[];
};
