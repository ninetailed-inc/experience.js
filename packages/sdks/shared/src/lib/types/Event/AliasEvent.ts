import type { Alias } from './EventType';
import type { SharedEventProperties } from './SharedEventProperties';

export type AliasEvent = SharedEventProperties & {
  type: Alias;
};
