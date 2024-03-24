export {
  NinetailedAnalyticsPlugin,
  type SanitizedElementSeenPayload,
} from './lib/NinetailedAnalyticsPlugin';
export type { Template } from './lib/NinetailedAnalyticsPlugin';

export { ElementSeenPayloadSchema } from './lib/ElementSeenPayload';
export type { ElementSeenPayload } from './lib/ElementSeenPayload';

export { TrackComponentPropertiesSchema } from './lib/TrackingProperties';
export type { TrackComponentProperties } from './lib/TrackingProperties';

export { type EventHandler, NinetailedPlugin } from './lib/NinetailedPlugin';

export { hasComponentViewTrackingThreshold } from './lib/guards/hasComponentViewTrackingThreshold';
export { HasComponentViewTrackingThreshold } from './lib/types/interfaces/HasComponentViewTrackingThreshold';

export * from './lib/constants';
