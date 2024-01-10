import { Object } from 'ts-toolbelt';

import type { SharedEventProperties } from './SharedEventProperties';
import type { Pageview } from './EventType';
import type { PageviewProperties } from './PageviewProperties';

export type PageviewEvent = Object.Merge<
  SharedEventProperties,
  {
    type: Pageview;
    name?: string;
    properties: PageviewProperties;
  },
  'deep'
>;
