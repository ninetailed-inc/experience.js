import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { hasOnChangeEmitter } from '../guards/hasOnChangeEmitter';
import { HasOnChangeEmitter } from '../types/interfaces/HasOnChangeEmitter';

export const selectPluginsHavingOnChangeEmitter = (
  plugins: NinetailedPlugin[]
): HasOnChangeEmitter[] => {
  const filteredPlugins: HasOnChangeEmitter[] = [];

  for (const plugin of plugins) {
    if (hasOnChangeEmitter(plugin)) {
      filteredPlugins.push(plugin);
    }
  }

  return filteredPlugins;
};
