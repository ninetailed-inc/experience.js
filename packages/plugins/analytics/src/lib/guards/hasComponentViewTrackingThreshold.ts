import { NinetailedPlugin } from '../NinetailedPlugin';
import { HasComponentViewTrackingThreshold } from '../types/interfaces/HasComponentViewTrackingThreshold';

export const hasComponentViewTrackingThreshold = (
  arg: NinetailedPlugin
): arg is NinetailedPlugin & HasComponentViewTrackingThreshold => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'getComponentViewTrackingThreshold' in arg &&
    typeof arg['getComponentViewTrackingThreshold'] === 'function'
  );
};
