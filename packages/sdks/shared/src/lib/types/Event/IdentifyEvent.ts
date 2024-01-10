import { Object } from 'ts-toolbelt';

import type { Traits } from '../Profile/Traits';
import type { Identify } from './EventType';
import type { SharedEventProperties } from './SharedEventProperties';

export type IdentifyEvent = Object.Merge<
  SharedEventProperties,
  {
    type: Identify;
    traits: Traits;
  },
  'deep'
>;
