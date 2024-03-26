import {
  EventHandler,
  ElementSeenPayload,
  HAS_SEEN_ELEMENT,
} from '@ninetailed/experience.js-plugin-analytics';

export interface InterestedInSeenElements {
  [HAS_SEEN_ELEMENT]: EventHandler<ElementSeenPayload>;
}
