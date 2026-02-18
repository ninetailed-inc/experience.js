import type {
  ComponentClickEvent,
  ComponentViewEvent,
  Profile,
} from '@ninetailed/experience.js-shared';

export type ComponentEvent = ComponentViewEvent | ComponentClickEvent;

export type ComponentEventBatch = {
  profile: Profile;
  events: ComponentEvent[];
};
