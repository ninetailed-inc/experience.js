import { AnalyticsInstance as _AnalyticsInstance } from 'analytics';

export type AnalyticsInstance = _AnalyticsInstance & {
  dispatch: (event: { type: string; [key: string]: unknown }) => Promise<void>;
};
