import {
  EventHandler,
  ElementClickedPayload,
  HAS_CLICKED_ELEMENT,
} from '@ninetailed/experience.js-plugin-analytics';

export interface InterestedInClickedElements {
  [HAS_CLICKED_ELEMENT]: EventHandler<ElementClickedPayload>;
}
