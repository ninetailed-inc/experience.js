import { PROFILE_CHANGE } from '@ninetailed/experience.js-shared';
import { EventHandler } from '@ninetailed/experience.js-plugin-analytics';

import { ProfileChangedPayload } from '../ProfileChangedPayload';

export interface InterestedInProfileChange {
  [PROFILE_CHANGE]: EventHandler<ProfileChangedPayload>;
}
