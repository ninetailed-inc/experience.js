import { PAGE_HIDDEN } from '../../constants';
import { EventHandler } from '../EventHandler';

export interface InterestedInHiddenPage {
  [PAGE_HIDDEN]: EventHandler<void>;
}
