import { selectBaselineWithVariants } from './selectBaselineWithVariants';
import {
  Baseline,
  ExperienceConfiguration,
  Reference,
  VariantRef,
} from '../../types/ExperienceDefinition';

export const selectVariants = <TVariant extends Reference>(
  experience: ExperienceConfiguration<TVariant>,
  baseline: Baseline
): (TVariant | VariantRef)[] => {
  const baselineWithVariants = selectBaselineWithVariants(experience, baseline);

  if (!baselineWithVariants) {
    return [];
  }

  return baselineWithVariants.variants;
};
