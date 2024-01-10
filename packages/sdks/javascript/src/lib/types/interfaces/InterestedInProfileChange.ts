import { PROFILE_CHANGE, Profile } from '@ninetailed/experience.js-shared';

import { EventHandler } from '../EventHandler';
import { ProfileChangedPayload } from '../ProfileChangedPayload';

export interface InterestedInProfileChange {
  [PROFILE_CHANGE]: EventHandler<ProfileChangedPayload>;
}
