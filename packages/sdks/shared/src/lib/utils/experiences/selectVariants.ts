import { selectBaselineWithVariants } from './selectBaselineWithVariants';
import {
  Baseline,
  ExperienceConfiguration,
  Reference,
  VariantRef,
} from '../../types/ExperienceDefinition';

export const selectVariants = <Variant extends Reference>(
  experience: ExperienceConfiguration<Variant>,
  baseline: Baseline
): (Variant | VariantRef)[] => {
  const baselineWithVariants = selectBaselineWithVariants(experience, baseline);

  if (!baselineWithVariants) {
    return [];
  }

  return baselineWithVariants.variants;
};
