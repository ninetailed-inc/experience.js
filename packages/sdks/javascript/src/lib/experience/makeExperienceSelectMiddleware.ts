import {
  ExperienceConfiguration,
  Profile,
  Reference,
  pipe,
} from '@ninetailed/experience.js-shared';

import { NinetailedPlugin } from '../types/NinetailedPlugin';
import { RemoveOnChangeListener } from '../utils/OnChangeEmitter';
import { selectPluginsHavingOnChangeEmitter } from '../plugins/selectPluginsHavingOnChangeEmitter';
import { selectPluginsHavingExperienceSelectionMiddleware } from '../plugins/selectPluginsHavingExperienceSelectionMiddleware';
import {
  ExperienceSelectionMiddleware,
  ExperienceSelectionMiddlewareArg,
} from '../types/interfaces/HasExperienceSelectionMiddleware';

type MakeExperienceSelectMiddlewareArg<
  Baseline extends Reference,
  Variant extends Reference
> = {
  plugins: NinetailedPlugin[];
  experiences: ExperienceConfiguration<Variant>[];
  baseline: Reference;
  profile: Profile | null;
  onChange: (
    middleware: ExperienceSelectionMiddleware<Baseline, Variant>
  ) => void;
};

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

export const makeExperienceSelectMiddleware = <
  TBaseline extends Reference,
  TVariant extends Reference
>({
  plugins,
  onChange,
  experiences,
  baseline,
  profile,
}: MakeExperienceSelectMiddlewareArg<TBaseline, TVariant>) => {
  let removeChangeListeners: RemoveOnChangeListener[] = [];

  const pluginsHavingChangeEmitters =
    selectPluginsHavingOnChangeEmitter(plugins);

  const prepareMiddleware = () => {
    if (profile === null) {
      return createPassThroughMiddleware<TBaseline, TVariant>();
    }

    const pluginsWithMiddleware =
      selectPluginsHavingExperienceSelectionMiddleware<TBaseline, TVariant>(
        plugins
      );

    const middlewareFunctions = pluginsWithMiddleware.map((plugin) =>
      plugin.getExperienceSelectionMiddleware({ experiences, baseline })
    );

    return pipe(...middlewareFunctions);
  };

  const middleware = prepareMiddleware();

  const addListeners = () => {
    removeChangeListeners = pluginsHavingChangeEmitters.map((plugin) => {
      const listener = () => {
        onChange(middleware);
      };

      return plugin.onChangeEmitter.addListener(listener);
    });
  };

  const removeListeners = () => {
    removeChangeListeners.forEach((listener) => listener());
  };

  return {
    addListeners,
    removeListeners,
    middleware,
  };
};
