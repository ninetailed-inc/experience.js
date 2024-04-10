import {
  Baseline,
  BaselineWithVariants,
  ExperienceConfiguration,
  Reference,
} from '../../types/ExperienceDefinition';

export const selectBaselineWithVariants = <TVariant extends Reference>(
  experience: ExperienceConfiguration<TVariant>,
  baseline: Baseline
): BaselineWithVariants<TVariant> | null => {
  return (
    experience.components.find(
      (baselineWithVariants) => baselineWithVariants.baseline.id === baseline.id
    ) ?? null
  );
};
