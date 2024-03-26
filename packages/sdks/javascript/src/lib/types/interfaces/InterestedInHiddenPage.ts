import { PAGE_HIDDEN } from '../../constants';
import { EventHandler } from '@ninetailed/experience.js-plugin-analytics';

export interface InterestedInHiddenPage {
  [PAGE_HIDDEN]: EventHandler<void>;
}
