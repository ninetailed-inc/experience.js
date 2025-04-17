import {
  Baseline,
  EntryReplacement,
  ComponentTypeEnum,
  ExperienceConfiguration,
  Reference,
} from '../../types/ExperienceDefinition';

export const selectBaselineWithVariants = <TVariant extends Reference>(
  experience: ExperienceConfiguration<TVariant>,
  baseline: Baseline
): EntryReplacement<TVariant> | null => {
  const component = experience.components.find(
    (entryReplacement) =>
      'id' in entryReplacement.baseline &&
      entryReplacement.baseline.id === baseline.id
  );
  return component?.type === ComponentTypeEnum.EntryReplacement
    ? component
    : null;
};
