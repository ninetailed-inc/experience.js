import type {
  ComponentViewEvent,
  Profile,
} from '@ninetailed/experience.js-shared';

export type ComponentViewEventBatch = {
  profile: Profile;
  events: ComponentViewEvent[];
};
