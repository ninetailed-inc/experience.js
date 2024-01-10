import {
  Baseline,
  ExperienceConfiguration,
  selectHasExperienceVariants,
  selectExperience,
  selectExperienceVariant,
  Profile,
  Reference,
  VariantRef,
} from '@ninetailed/experience.js';

import { useProfile } from '../useProfile';
import { useExperienceSelectionMiddleware } from './useExperienceSelectionMiddleware';

type Load<Variant extends Reference> = {
  status: 'loading';
  loading: boolean;
  hasVariants: boolean;
  baseline: Baseline;
  experience: null;
  variant: Variant;
  variantIndex: 0;
  audience: null;
  isPersonalized: boolean;
  profile: null;
  error: null;
};

type Success<Variant extends Reference> = {
  status: 'success';
  loading: boolean;
  hasVariants: boolean;
  baseline: Baseline;
  experience: ExperienceConfiguration<Variant> | null;
  variant: Variant;
  variantIndex: number;
  audience: { id: string } | null;
  isPersonalized: boolean;
  profile: Profile;
  error: null;
};

type Fail<Variant extends Reference> = {
  status: 'error';
  loading: boolean;
  hasVariants: boolean;
  baseline: Baseline;
  experience: null;
  variant: Variant;
  variantIndex: 0;
  audience: null;
  isPersonalized: boolean;
  profile: null;
  error: Error;
};

type UseExperienceArgs<Variant extends Reference> = {
  baseline: Baseline;
  experiences: ExperienceConfiguration<Variant>[];
};

type UseExperienceResponse<Variant extends Reference> =
  | Load<Variant | VariantRef>
  | Success<Variant | VariantRef>
  | Fail<Variant | VariantRef>;

export const useExperience = <Variant extends Reference>({
  baseline,
  experiences,
}: UseExperienceArgs<Variant>): UseExperienceResponse<Variant> => {
  const profileState = useProfile();

  const hasVariants = experiences
    .map((experience) => selectHasExperienceVariants(experience, baseline))
    .reduce((acc, curr) => acc || curr, false);

  const { status, profile } = profileState;

  const experienceSelectionMiddleware = useExperienceSelectionMiddleware({
    experiences,
    baseline,
    profile,
  });

  const overrideResult = ({
    experience: originalExperience,
    variant: originalVariant,
    variantIndex: originalVariantIndex,
    ...other
  }: UseExperienceResponse<Variant>): UseExperienceResponse<Variant> => {
    const { experience, variant, variantIndex } = experienceSelectionMiddleware(
      {
        experience: originalExperience,
        variant: originalVariant,
        variantIndex: originalVariantIndex,
      }
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return {
      ...other,
      audience: experience?.audience ? experience.audience : null,
      experience,
      variant,
      variantIndex,
    };
  };

  const baseReturn = {
    ...profileState,
    hasVariants,
    baseline,
  };
  const emptyReturn = {
    ...baseReturn,
    experience: null,
    variant: baseline,
    variantIndex: 0,
    audience: null,
    isPersonalized: false,
    profile: null,
  };

  if (status === 'loading') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return overrideResult(emptyReturn);
  }

  if (status === 'error') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return overrideResult(emptyReturn);
  }

  if (!profile) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return overrideResult(emptyReturn);
  }

  const experience = selectExperience({
    experiences,
    profile,
  });

  if (!experience) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return overrideResult({ ...emptyReturn, profile });
  }

  const { variant, index } = selectExperienceVariant({
    baseline,
    experience,
    profile,
  });

  return overrideResult({
    ...baseReturn,
    status: 'success',
    loading: false,
    error: null,
    experience,
    variant,
    variantIndex: index,
    audience: experience.audience ? experience.audience : null,
    profile,
    isPersonalized: true,
  });
};
