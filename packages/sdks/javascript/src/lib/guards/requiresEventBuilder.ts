import { RequiresEventBuilder } from '../types/interfaces/RequiresEventBuilder';

export const requiresEventBuilder = (
  plugin: unknown
): plugin is RequiresEventBuilder => {
  return (
    typeof plugin === 'object' &&
    plugin !== null &&
    'setEventBuilder' in plugin &&
    typeof plugin.setEventBuilder === 'function'
  );
};
