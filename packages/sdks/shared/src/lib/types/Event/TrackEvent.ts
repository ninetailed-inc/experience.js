import { Object } from 'ts-toolbelt';

import type { Properties } from './Properties';
import type { Track } from './EventType';
import type { SharedEventProperties } from './SharedEventProperties';

export type TrackEvent = Object.Merge<
  SharedEventProperties,
  {
    type: Track;
    event: string;
    properties: Properties;
  },
  'deep'
>;
