import { type Profile } from '@ninetailed/experience.js-shared';

import { type ComponentViewEvent } from './ComponentViewEvent';

export type ComponentViewEventBatch = {
  profile: Profile;
  events: ComponentViewEvent[];
};
