import { Variant } from '@ninetailed/experience.js-shared';

import { ProfileState } from './types';

type Options = {
  holdout?: number;
};

type Loading<T> = {
  loading: true;
  variant: Variant<T>;
  audience: { id: 'baseline' };
  isPersonalized: false;
  error: null;
};

type Success<T> = {
  loading: false;
  variant: Variant<T>;
  audience: { id: string };
  isPersonalized: boolean;
  error: null;
};

type Fail<T> = {
  loading: false;
  variant: Variant<T>;
  audience: { id: 'baseline' };
  isPersonalized: false;
  error: Error;
};

type Result<T> = Loading<T> | Success<T> | Fail<T>;

export const selectVariant = <T extends { id: string }>(
  baseline: T,
  variants: Variant<T>[],
  { status, profile, error }: Omit<ProfileState, 'experiences'>,
  options: Options = { holdout: -1 }
): Result<T> => {
  if (status === 'loading') {
    return {
      loading: true,
      variant: { ...baseline, id: 'baseline', audience: { id: 'baseline' } },
      audience: { id: 'baseline' },
      isPersonalized: false,
      error: null,
    };
  }

  if (status === 'error') {
    return {
      loading: false,
      variant: { ...baseline, id: 'baseline', audience: { id: 'baseline' } },
      audience: { id: 'baseline' },
      isPersonalized: false,
      error: error,
    };
  }

  const variant = variants.find((variant) =>
    profile?.audiences?.includes(variant.audience?.id)
  );

  if (variant) {
    if (options?.holdout || -1 > (profile?.random || 0)) {
      return {
        loading: false,
        variant: {
          ...baseline,
          audience: { id: 'baseline' },
        },
        audience: { ...variant.audience, id: variant.audience.id },
        isPersonalized: false,
        error: null,
      };
    }

    return {
      loading: false,
      variant,
      audience: { ...variant.audience, id: variant.audience.id },
      isPersonalized: true,
      error: null,
    };
  }

  /**
   * There was no matching audience found.
   */
  return {
    loading: false,
    variant: { ...baseline, id: 'baseline', audience: { id: 'baseline' } },
    audience: { id: 'baseline' },
    isPersonalized: false,
    error: null,
  };
};
