import type {
  ComponentClickEvent,
  ComponentHoverEvent,
  ComponentViewEvent,
  Profile,
} from '@ninetailed/experience.js-shared';

export type ComponentEvent =
  | ComponentViewEvent
  | ComponentClickEvent
  | ComponentHoverEvent;

export type ComponentEventBatch = {
  profile: Profile;
  events: ComponentEvent[];
};
