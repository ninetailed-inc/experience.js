import type { Screen } from './EventType';
import type { SharedEventProperties } from './SharedEventProperties';

export type ScreenEvent = SharedEventProperties & {
  type: Screen;
};
