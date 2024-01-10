import { Event } from '../types/Event/Event';
import { PageviewEvent } from '../types/Event/PageviewEvent';
import { TrackEvent } from '../types/Event/TrackEvent';
import { IdentifyEvent } from '../types/Event/IdentifyEvent';
import { ComponentViewEvent } from '../types/Event/ComponentViewEvent';

export const isPageViewEvent = (event: Event): event is PageviewEvent => {
  return event.type === 'page';
};

export const isTrackEvent = (event: Event): event is TrackEvent => {
  return event.type === 'track';
};

export const isIdentifyEvent = (event: Event): event is IdentifyEvent => {
  return event.type === 'identify';
};

export const isComponentViewEvent = (
  event: Event
): event is ComponentViewEvent => {
  return event.type === 'component';
};
