import { AnalyticsPlugin } from 'analytics';

import { AnalyticsInstance } from './AnalyticsInstance';
import { HasComponentViewTrackingThreshold } from './types/interfaces/HasComponentViewTrackingThreshold';
import { ElementSeenPayload } from './ElementSeenPayload';
import { HAS_SEEN_ELEMENT } from './constants';

export type EventHandlerParams<T = unknown> = {
  payload: T;
  instance: AnalyticsInstance;
  abort: (reason?: string) => unknown;
};
export type EventHandler<T = unknown> = (params: EventHandlerParams<T>) => void;

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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onHasSeenElement: EventHandler<ElementSeenPayload> = () => {};

  public setComponentViewTrackingThreshold = (threshold: number) => {
    this.componentViewTrackingThreshold = threshold;
  };

  public getComponentViewTrackingThreshold = () =>
    this.componentViewTrackingThreshold;
}
