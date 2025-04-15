import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { hasChangesModificationMiddleware } from '../guards/hasChangesModificationMiddleware';
import { HasChangesModificationMiddleware } from '../types/interfaces/HasChangesModificationMiddleware';

/**
 * Selects plugins that implement the HasChangesModificationMiddleware interface
 *
 * @param plugins Array of Ninetailed plugins
 * @returns Array of plugins that implement HasChangesModificationMiddleware
 */
export const selectPluginsHavingChangesModificationMiddleware = (
  plugins: NinetailedPlugin[]
): HasChangesModificationMiddleware[] => {
  const filteredPlugins: HasChangesModificationMiddleware[] = [];

  for (const plugin of plugins) {
    if (hasChangesModificationMiddleware(plugin)) {
      filteredPlugins.push(plugin);
    }
  }

  return filteredPlugins;
};
