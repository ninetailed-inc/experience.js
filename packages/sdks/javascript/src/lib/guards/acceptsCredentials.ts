import { AcceptsCredentials } from '../types/interfaces/AcceptsCredentials';

export const acceptsCredentials = (
  plugin: unknown
): plugin is AcceptsCredentials => {
  return (
    typeof plugin === 'object' &&
    plugin !== null &&
    'setCredentials' in plugin &&
    typeof plugin.setCredentials === 'function'
  );
};
