import { Reference } from '@ninetailed/experience.js-shared';

import { HasExperienceSelectionMiddleware } from '../types/interfaces/HasExperienceSelectionMiddleware';

export const hasExperienceSelectionMiddleware = <
  TBaseline extends Reference,
  TVariant extends Reference
>(
  arg: unknown
): arg is HasExperienceSelectionMiddleware<TBaseline, TVariant> => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'getExperienceSelectionMiddleware' in arg &&
    typeof arg.getExperienceSelectionMiddleware === 'function'
  );
};
