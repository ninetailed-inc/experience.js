import { Reference } from '@ninetailed/experience.js-shared';

import { hasExperienceSelectionMiddleware } from '../guards/hasExperienceSelectionMiddleware';
import { HasExperienceSelectionMiddleware } from '../types/interfaces/HasExperienceSelectionMiddleware';
import { NinetailedPlugin } from '../types/NinetailedPlugin';

export const selectPluginsHavingExperienceSelectionMiddleware = <
  Variant extends Reference
>(
  plugins: NinetailedPlugin[]
): HasExperienceSelectionMiddleware<Variant>[] => {
  const filteredPlugins: HasExperienceSelectionMiddleware<Variant>[] = [];

  for (const plugin of plugins) {
    if (hasExperienceSelectionMiddleware<Variant>(plugin)) {
      filteredPlugins.push(plugin);
    }
  }

  return filteredPlugins;
};
