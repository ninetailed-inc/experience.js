import { Variant } from '@ninetailed/experience.js-shared';
import { selectVariant } from '@ninetailed/experience.js';

import { useProfile } from './useProfile';

type Options = {
  holdout?: number;
};

export const usePersonalize = <T extends { id: string }>(
  baseline: T,
  variants: Variant<T>[],
  options: Options = { holdout: -1 }
) => {
  const profile = useProfile();

  return selectVariant(baseline, variants, profile, options);
};
