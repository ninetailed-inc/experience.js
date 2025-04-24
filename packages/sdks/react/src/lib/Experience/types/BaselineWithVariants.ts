import { Baseline } from './Baseline';
import { Variant } from './Variant';

// TODO: Is this used anywhere or needed? if needed then we need to update it to match the rest of the types in the JS SDK
export type BaselineWithVariants = {
  // The Baseline with Variants here is not resolved to it's props. No type needed.
  baseline: Baseline;
  variants: Variant<Record<string, unknown>>[];
};
