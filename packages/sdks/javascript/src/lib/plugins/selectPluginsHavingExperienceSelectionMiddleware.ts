import { Reference } from '@ninetailed/experience.js-shared';

import { hasExperienceSelectionMiddleware } from '../guards/hasExperienceSelectionMiddleware';
import { HasExperienceSelectionMiddleware } from '../types/interfaces/HasExperienceSelectionMiddleware';
import { NinetailedPlugin } from '../types/NinetailedPlugin';

export const selectPluginsHavingExperienceSelectionMiddleware = <
  Baseline extends Reference,
  Variant extends Reference
>(
  plugins: NinetailedPlugin[]
): HasExperienceSelectionMiddleware<Baseline, Variant>[] => {
  const filteredPlugins: HasExperienceSelectionMiddleware<Baseline, Variant>[] =
    [];

  for (const plugin of plugins) {
    if (hasExperienceSelectionMiddleware<Baseline, Variant>(plugin)) {
      filteredPlugins.push(plugin);
    }
  }

  return filteredPlugins;
};
