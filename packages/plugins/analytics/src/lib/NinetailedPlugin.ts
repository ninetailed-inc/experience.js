import { AnalyticsPlugin } from 'analytics';

import { AnalyticsInstance } from './AnalyticsInstance';

export type EventHandlerParams<T = unknown> = {
  payload: T;
  instance: AnalyticsInstance;
};
export type EventHandler<T = unknown> = (params: EventHandlerParams<T>) => void;

export abstract class NinetailedPlugin implements AnalyticsPlugin {
  [x: string]: unknown;

  public abstract readonly name: string;
}
