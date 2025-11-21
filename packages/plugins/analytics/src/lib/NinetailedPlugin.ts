import { AnalyticsPlugin } from 'analytics';

import { AnalyticsInstance } from './AnalyticsInstance';
import { HasComponentViewTrackingThreshold } from './types/interfaces/HasComponentViewTrackingThreshold';
import { ElementSeenPayload, VariableSeenPayload } from './ElementSeenPayload';
import { HAS_SEEN_ELEMENT, HAS_SEEN_VARIABLE } from './constants';

export type EventHandlerParams<Payload = unknown> = {
  payload: Payload;
  instance: AnalyticsInstance;
  abort: (reason?: string) => unknown;
};

type PayloadMetaProperties = {
  /**
   * A randomly generated UUID that identifies the event.
   */
  rid: string;
  /**
   * A timestamp representing when the event was dispatched.
   */
  ts: string;
};

type PayloadPrivateProperties = {
  originalAction: string;
};

/**
 * Represents the `payload` object of an event dispatched by the analytics library.
 */
type Payload<CustomPayload> = CustomPayload & {
  /** 
    This object is automatically injected by the analytics library when events are dispatched.
    
    Note: When compairing two payloads, make sure the `meta` object is not included. 
    Its properties will be different even for events that are otherwise identical.
  */
  meta: PayloadMetaProperties;
  /**
   * This object is automatically injected by the analytics library when events are dispatched.
   *
   * Note: When compairing two payloads, make sure the `_` object is not included.
   * It's meant for internal use inside the analytics library only, and its properties should not affect event equality.
   */
  _: PayloadPrivateProperties;
};

export type EventHandler<CustomPayload = unknown> = (
  params: EventHandlerParams<Payload<CustomPayload>>
) => void;

export abstract class NinetailedPlugin
  implements AnalyticsPlugin, HasComponentViewTrackingThreshold
{
  [x: string]: unknown;

  private componentViewTrackingThreshold = 0;

  public abstract readonly name: string;

  public [HAS_SEEN_ELEMENT]: EventHandler<ElementSeenPayload> = (event) => {
    if (event.payload.seenFor !== this.getComponentViewTrackingThreshold()) {
      return;
    }

    this.onHasSeenElement(event);
  };

  public [HAS_SEEN_VARIABLE]: EventHandler<VariableSeenPayload> = (event) => {
    this.onHasSeenVariable(event);
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onHasSeenElement: EventHandler<ElementSeenPayload> = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onHasSeenVariable: EventHandler<VariableSeenPayload> = () => {};

  public setComponentViewTrackingThreshold = (threshold: number) => {
    this.componentViewTrackingThreshold = threshold;
  };

  public getComponentViewTrackingThreshold = () =>
    this.componentViewTrackingThreshold;
}
