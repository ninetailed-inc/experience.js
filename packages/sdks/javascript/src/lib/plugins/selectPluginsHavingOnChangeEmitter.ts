import { hasOnChangeEmitter } from '../guards/hasOnChangeEmitter';
import { NinetailedPlugin } from '../types/NinetailedPlugin';
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
