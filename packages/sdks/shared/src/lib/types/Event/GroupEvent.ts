import type { Group } from './EventType';
import type { SharedEventProperties } from './SharedEventProperties';

export type GroupEvent = SharedEventProperties & {
  type: Group;
};
