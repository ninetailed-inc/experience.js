import {
  Baseline,
  BaselineWithVariants,
  ExperienceConfiguration,
  Reference,
} from '../../types/ExperienceDefinition';

export const selectBaselineWithVariants = <Variant extends Reference>(
  experience: ExperienceConfiguration<Variant>,
  baseline: Baseline
): BaselineWithVariants<Variant> | null => {
  return (
    experience.components.find(
      (baselineWithVariants) => baselineWithVariants.baseline.id === baseline.id
    ) ?? null
  );
};
