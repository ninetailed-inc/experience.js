export {
  NinetailedAnalyticsPlugin,
  type SanitizedElementSeenPayload,
  type SanitizedVariableSeenPayload,
} from './lib/NinetailedAnalyticsPlugin';
export type { Template } from './lib/NinetailedAnalyticsPlugin';

export {
  ElementClickedPayloadSchema,
  ElementHoveredPayloadSchema,
  ElementSeenPayloadSchema,
  VariableSeenPayloadSchema,
} from './lib/ElementPayload';
export type {
  ComponentClickEventComponentType,
  ComponentHoverEventComponentType,
  ComponentViewEventComponentType,
  ElementClickedPayload,
  ElementHoveredPayload,
  ElementSeenPayload,
  VariableSeenPayload,
} from './lib/ElementPayload';

export { TrackComponentPropertiesSchema } from './lib/TrackingProperties';
export type { TrackComponentProperties } from './lib/TrackingProperties';

export { type EventHandler, NinetailedPlugin } from './lib/NinetailedPlugin';

export { hasComponentViewTrackingThreshold } from './lib/guards/hasComponentViewTrackingThreshold';
export { type HasComponentViewTrackingThreshold } from './lib/types/interfaces/HasComponentViewTrackingThreshold';

export * from './lib/constants';
