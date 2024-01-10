import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import type { HasComponentViewTrackingThreshold } from '../types/interfaces/HasComponentViewTrackingThreshold';

export const hasComponentViewTrackingThreshold = (
  arg: NinetailedPlugin
): arg is NinetailedPlugin & HasComponentViewTrackingThreshold => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'componentViewTrackingThreshold' in arg &&
    typeof arg['componentViewTrackingThreshold'] === 'number'
  );
};
