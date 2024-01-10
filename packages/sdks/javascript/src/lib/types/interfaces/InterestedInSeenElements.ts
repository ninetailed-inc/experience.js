import { HAS_SEEN_ELEMENT } from '../../constants';
import { ElementSeenPayload } from '../ElementSeenPayload';
import { EventHandler } from '../EventHandler';

export interface InterestedInSeenElements {
  [HAS_SEEN_ELEMENT]: EventHandler<ElementSeenPayload>;
}
