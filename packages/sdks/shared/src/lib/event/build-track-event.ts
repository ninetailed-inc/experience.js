import { Object } from 'ts-toolbelt';

import type { TrackEvent } from '../types/Event/TrackEvent';
import type { Properties } from '../types/Event/Properties';
import { buildEvent, BuildEventArgs } from './build-event';

export type BuildTrackEventArgs = Object.Omit<
  Object.Merge<
    BuildEventArgs,
    {
      event: string;
      properties: Properties;
    },
    'deep'
  >,
  'type'
>;

export const buildTrackEvent = (data: BuildTrackEventArgs): TrackEvent => {
  return {
    ...buildEvent({ ...data, type: 'track' }),
    event: data.event,
    properties: data.properties,
  };
};
