import { EventBuilder } from '../../utils/EventBuilder';

export interface RequiresEventBuilder {
  setEventBuilder(eventBuilder: EventBuilder): void;
}
