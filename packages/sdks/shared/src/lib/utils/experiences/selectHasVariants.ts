import { selectVariants } from './selectVariants';
import {
  Baseline,
  ExperienceConfiguration,
  Reference,
} from '../../types/ExperienceDefinition';

export const selectHasVariants = <Variant extends Reference>(
  experience: ExperienceConfiguration<Variant>,
  baseline: Baseline
) => {
  const variants = selectVariants(experience, baseline);

  return variants.length > 0;
};
