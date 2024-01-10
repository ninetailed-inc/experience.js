import { AnalyticsInstance } from './AnalyticsInstance';

export type EventHandlerParams<T = unknown> = {
  payload: T;
  instance: AnalyticsInstance;
};
export type EventHandler<T = unknown> = (params: EventHandlerParams<T>) => void;
