import { HAS_SEEN_ELEMENT } from '../constants';
import { InterestedInSeenElements } from '../types/interfaces/InterestedInSeenElements';

export const isInterestedInSeenElements = (
  arg: unknown
): arg is InterestedInSeenElements => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    HAS_SEEN_ELEMENT in arg &&
    typeof arg[HAS_SEEN_ELEMENT] === 'function'
  );
};
