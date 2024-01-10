import { useEffect, useMemo, useState } from 'react';
import {
  ExperienceConfiguration,
  Profile,
  Reference,
} from '@ninetailed/experience.js-shared';
import { makeExperienceSelectMiddleware } from '@ninetailed/experience.js';

import { useNinetailed } from '../useNinetailed';

type UseExperienceSelectionMiddlewareArg<Variant extends Reference> = {
  experiences: ExperienceConfiguration<Variant>[];
  baseline: Reference;

  profile: Profile | null;
};

export const useExperienceSelectionMiddleware = <Variant extends Reference>({
  experiences,
  baseline,
  profile,
}: UseExperienceSelectionMiddlewareArg<Variant>) => {
  const { plugins } = useNinetailed();
  const [_, setCurrentTime] = useState(Date.now());

  const { addListeners, removeListeners, middleware } = useMemo(
    () =>
      makeExperienceSelectMiddleware<Variant>({
        plugins,
        experiences,
        baseline,
        profile,
        onChange: () => setCurrentTime(Date.now()),
      }),
    [plugins, experiences, baseline, profile]
  );

  useEffect(() => {
    addListeners();

    return () => {
      removeListeners();
    };
  }, [addListeners, removeListeners]);

  return middleware;
};
