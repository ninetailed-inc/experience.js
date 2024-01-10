import { logger } from '../../logger/Logger';
import { Profile } from '../../types/Profile/Profile';
import {
  Baseline,
  ExperienceConfiguration,
  Reference,
  VariantRef,
} from '../../types/ExperienceDefinition';
import { selectDistribution } from './selectDistribution';
import { selectVariants } from './selectVariants';

type SelectVariantArgs<Variant extends Reference> = {
  baseline: Baseline;
  experience: ExperienceConfiguration<Variant>;
  profile: Profile;
};

export const selectVariant = <Variant extends Reference>({
  baseline,
  experience,
  profile,
}: SelectVariantArgs<Variant>): {
  variant: Variant | VariantRef;
  index: number;
} => {
  const variants = selectVariants(experience, baseline);

  const baselineVariant = { ...baseline, hidden: false };

  if (!variants.length) {
    return { variant: baselineVariant, index: 0 };
  }

  const distribution = selectDistribution({ experience, profile });

  if (!distribution) {
    return { variant: baselineVariant, index: 0 };
  }

  if (distribution.index === 0) {
    return { variant: baselineVariant, index: 0 };
  }

  const selectableVariants = [baselineVariant, ...variants];
  if (selectableVariants.length <= distribution.index) {
    logger.warn(
      "A distribution for a variant was selected but it's metadata could not be found."
    );
    return { variant: baselineVariant, index: 0 };
  }

  const variant = selectableVariants[distribution.index];
  return { variant, index: distribution.index };
};
