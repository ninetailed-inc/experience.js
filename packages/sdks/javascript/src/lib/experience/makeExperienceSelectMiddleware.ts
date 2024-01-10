import {
  ExperienceConfiguration,
  Profile,
  Reference,
  VariantRef,
  pipe,
} from '@ninetailed/experience.js-shared';

import { NinetailedPlugin } from '../types/NinetailedPlugin';
import { RemoveOnChangeListener } from '../utils/OnChangeEmitter';
import { selectPluginsHavingOnChangeEmitter } from '../plugins/selectPluginsHavingOnChangeEmitter';
import { selectPluginsHavingExperienceSelectionMiddleware } from '../plugins/selectPluginsHavingExperienceSelectionMiddleware';
import { ExperienceSelectionMiddlewareReturnArg } from '../types/interfaces/HasExperienceSelectionMiddleware';

type MakeExperienceSelectMiddlewareArg<Variant extends Reference> = {
  plugins: NinetailedPlugin[];
  experiences: ExperienceConfiguration<Variant>[];
  baseline: Reference;
  profile: Profile | null;
  onChange: () => void;
};

const createPassThroughMiddleware = <Variant extends Reference>() => {
  return ({
    experience,
    variant,
    variantIndex,
  }: ExperienceSelectionMiddlewareReturnArg<Variant>) => {
    return { experience, variant, variantIndex };
  };
};

export const makeExperienceSelectMiddleware = <Variant extends Reference>({
  plugins,
  onChange,
  experiences,
  baseline,
  profile,
}: MakeExperienceSelectMiddlewareArg<Variant>) => {
  let removeChangeListeners: RemoveOnChangeListener[] = [];

  const pluginsHavingChangeEmitters =
    selectPluginsHavingOnChangeEmitter(plugins);

  const prepareMiddleware = () => {
    if (profile === null) {
      return createPassThroughMiddleware<Variant | VariantRef>();
    }

    const pluginsWithMiddleware =
      selectPluginsHavingExperienceSelectionMiddleware<Variant | VariantRef>(
        plugins
      );

    const middlewareFunctions = pluginsWithMiddleware.map((plugin) =>
      plugin.getExperienceSelectionMiddleware({ experiences, baseline })
    );

    return pipe(...middlewareFunctions);
  };

  const addListeners = () => {
    removeChangeListeners = pluginsHavingChangeEmitters.map((plugin) => {
      const listener = () => {
        onChange();
      };

      return plugin.onChangeEmitter.addListener(listener);
    });
  };

  const removeListeners = () => {
    removeChangeListeners.forEach((listener) => listener());
  };

  const middleware = prepareMiddleware();

  return {
    addListeners,
    removeListeners,
    middleware,
  };
};
