import {
  ExperienceConfiguration,
  Profile,
  Reference,
  pipe,
} from '@ninetailed/experience.js-shared';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';

import { RemoveOnChangeListener } from '../utils/OnChangeEmitter';
import { selectPluginsHavingOnChangeEmitter } from '../plugins/selectPluginsHavingOnChangeEmitter';
import { selectPluginsHavingExperienceSelectionMiddleware } from '../plugins/selectPluginsHavingExperienceSelectionMiddleware';
import {
  ExperienceSelectionMiddleware,
  ExperienceSelectionMiddlewareArg,
} from '../types/interfaces/HasExperienceSelectionMiddleware';

/**
 * Args for creating an experience selection middleware
 */

type CreateExperienceSelectionMiddlewareArg<
  Baseline extends Reference,
  Variant extends Reference
> = {
  plugins: NinetailedPlugin[];
  experiences: ExperienceConfiguration<Variant>[];
  baseline: Baseline;
  profile: Profile | null;
};

type MakeExperienceSelectMiddlewareArg<
  Baseline extends Reference,
  Variant extends Reference
> = CreateExperienceSelectionMiddlewareArg<Baseline, Variant> & {
  onChange: (
    middleware: ExperienceSelectionMiddleware<Baseline, Variant>
  ) => void;
};

/**
 * Result of creating an experience selection middleware
 */
interface ExperienceSelectMiddlewareResult<
  Baseline extends Reference,
  Variant extends Reference
> {
  addListeners: () => void;
  removeListeners: () => void;
  middleware: ExperienceSelectionMiddleware<Baseline, Variant>;
}

const createPassThroughMiddleware = <
  Baseline extends Reference,
  Variant extends Reference
>() => {
  return ({
    experience,
    variant,
    variantIndex,
  }: ExperienceSelectionMiddlewareArg<Baseline, Variant>) => {
    return { experience, variant, variantIndex };
  };
};

function createExperienceSelectionMiddleware<
  Baseline extends Reference,
  Variant extends Reference
>({
  plugins,
  experiences,
  baseline,
  profile,
}: CreateExperienceSelectionMiddlewareArg<
  Baseline,
  Variant
>): ExperienceSelectionMiddleware<Baseline, Variant> {
  if (profile === null) {
    return createPassThroughMiddleware<Baseline, Variant>();
  }

  const pluginsWithMiddleware =
    selectPluginsHavingExperienceSelectionMiddleware<Baseline, Variant>(
      plugins
    );

  const middlewareFunctions: ExperienceSelectionMiddleware<
    Baseline,
    Variant
  >[] = [];

  for (const plugin of pluginsWithMiddleware) {
    const middleware = plugin.getExperienceSelectionMiddleware({
      experiences,
      baseline,
    });

    if (middleware !== undefined) {
      middlewareFunctions.push(middleware);
    }
  }

  return pipe(...middlewareFunctions);
}

export const makeExperienceSelectMiddleware = <
  Baseline extends Reference,
  Variant extends Reference
>({
  plugins,
  onChange,
  experiences,
  baseline,
  profile,
}: MakeExperienceSelectMiddlewareArg<
  Baseline,
  Variant
>): ExperienceSelectMiddlewareResult<Baseline, Variant> => {
  let removeChangeListeners: RemoveOnChangeListener[] = [];

  const pluginsHavingChangeEmitters =
    selectPluginsHavingOnChangeEmitter(plugins);

  const middleware = createExperienceSelectionMiddleware<Baseline, Variant>({
    plugins,
    experiences,
    baseline,
    profile,
  });

  const addListeners = () => {
    removeChangeListeners = pluginsHavingChangeEmitters.map((plugin) => {
      const listener = () => {
        onChange(middleware);
      };

      return plugin.onChangeEmitter.addListener(listener);
    });
  };

  // WARNING: This specific implementation using forEach is required.
  // DO NOT replace with for...of or other loop constructs as they will break functionality.
  // The exact reason is uncertain but appears related to how callbacks are invoked.
  const removeListeners = () => {
    removeChangeListeners.forEach((removeListener) => removeListener());
  };

  return {
    addListeners,
    removeListeners,
    middleware,
  };
};
