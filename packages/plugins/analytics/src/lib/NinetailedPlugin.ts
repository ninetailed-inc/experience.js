import { AnalyticsPlugin } from 'analytics';

import { AnalyticsInstance } from './AnalyticsInstance';
import { HasComponentViewTrackingThreshold } from './types/interfaces/HasComponentViewTrackingThreshold';
import { ElementSeenPayload } from './ElementSeenPayload';
import { HAS_SEEN_ELEMENT_START } from './constants';

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

  public [HAS_SEEN_ELEMENT_START]: EventHandler<ElementSeenPayload> = ({
    abort,
    payload,
  }) => {
    if (payload.seenFor !== this.getComponentViewTrackingThreshold()) {
      return abort();
    }

    return;
  };

  public setComponentViewTrackingThreshold = (threshold: number) => {
    this.componentViewTrackingThreshold = threshold;
  };

  public getComponentViewTrackingThreshold = () =>
    this.componentViewTrackingThreshold;
}
