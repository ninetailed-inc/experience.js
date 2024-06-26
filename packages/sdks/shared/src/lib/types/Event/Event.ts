import type { PageviewEvent } from './PageviewEvent';
import type { TrackEvent } from './TrackEvent';
import type { IdentifyEvent } from './IdentifyEvent';
import type { ScreenEvent } from './ScreenEvent';
import type { GroupEvent } from './GroupEvent';
import type { AliasEvent } from './AliasEvent';
import type { ComponentViewEvent } from './ComponentViewEvent';

export type Event =
  | PageviewEvent
  | TrackEvent
  | IdentifyEvent
  | ScreenEvent
  | GroupEvent
  | AliasEvent
  | ComponentViewEvent;
