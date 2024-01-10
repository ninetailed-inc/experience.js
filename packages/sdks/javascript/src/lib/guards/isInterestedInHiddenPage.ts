import { PAGE_HIDDEN } from '../constants';
import { InterestedInHiddenPage } from '../types/interfaces/InterestedInHiddenPage';

export const isInterestedInHiddenPage = (
  arg: unknown
): arg is InterestedInHiddenPage => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    PAGE_HIDDEN in arg &&
    typeof arg[PAGE_HIDDEN] === 'function'
  );
};
