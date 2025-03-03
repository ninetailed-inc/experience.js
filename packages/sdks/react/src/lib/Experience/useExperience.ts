import {
  ExperienceConfiguration,
  selectHasExperienceVariants,
  Profile,
  Reference,
  VariantRef,
} from '@ninetailed/experience.js';
import { circularJsonStringify } from '@ninetailed/experience.js-shared';

import { useNinetailed } from '../useNinetailed';
import { useEffect, useState } from 'react';

type Load<TBaseline extends Reference> = {
  status: 'loading';
  loading: boolean;
  hasVariants: boolean;
  baseline: TBaseline;
  experience: null;
  variant: TBaseline;
  variantIndex: 0;
  audience: null;
  isPersonalized: boolean;
  profile: null;
  error: null;
};

type Success<TBaseline extends Reference, TVariant extends Reference> = {
  status: 'success';
  loading: boolean;
  hasVariants: boolean;
  baseline: TBaseline;
  experience: ExperienceConfiguration<TVariant> | null;
  variant: TBaseline | TVariant;
  variantIndex: number;
  audience: { id: string } | null;
  isPersonalized: boolean;
  profile: Profile;
  error: null;
};

type Fail<TBaseline extends Reference> = {
  status: 'error';
  loading: boolean;
  hasVariants: boolean;
  baseline: TBaseline;
  experience: null;
  variant: TBaseline;
  variantIndex: 0;
  audience: null;
  isPersonalized: boolean;
  profile: null;
  error: Error;
};

type UseExperienceArgs<
  TBaseline extends Reference,
  TVariant extends Reference
> = {
  baseline: TBaseline;
  experiences: ExperienceConfiguration<TVariant>[];
};

type UseExperienceReturn<
  TBaseline extends Reference,
  TVariant extends Reference
> =
  | Load<TBaseline>
  | Success<TBaseline, TVariant | VariantRef>
  | Fail<TBaseline>;

export const useExperience = <
  TBaseline extends Reference,
  TVariant extends Reference
>({
  baseline,
  experiences,
}: UseExperienceArgs<TBaseline, TVariant>): UseExperienceReturn<
  TBaseline,
  TVariant
> => {
  const ninetailed = useNinetailed<TBaseline, TVariant>();

  const hasVariants = experiences
    .map((experience) => selectHasExperienceVariants(experience, baseline))
    .reduce((acc, curr) => acc || curr, false);

  const [experience, setExperience] = useState<
    UseExperienceReturn<TBaseline, TVariant | VariantRef>
  >({
    hasVariants,
    baseline,
    error: null,
    loading: true,
    status: 'loading',
    experience: null,
    variant: baseline,
    variantIndex: 0,
    audience: null,
    isPersonalized: false,
    profile: null,
  });

  useEffect(() => {
    return ninetailed.onSelectVariant({ baseline, experiences }, (state) => {
      setExperience(state as UseExperienceReturn<TBaseline, TVariant>);
    });
  }, [circularJsonStringify(baseline), circularJsonStringify(experiences)]);

  return experience;
};
