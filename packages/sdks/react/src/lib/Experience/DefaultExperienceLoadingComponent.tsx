import { useEffect, useState } from 'react';
import type { Reference } from '@ninetailed/experience.js';

import { useNinetailed } from '../useNinetailed';
import type { ExperienceBaseProps } from './types/Experience';

type DefaultExperienceLoadingComponentProps = ExperienceBaseProps<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown> & Reference
> & {
  unhideAfterMs?: number;
};

export const DefaultExperienceLoadingComponent = ({
  component: Component,
  unhideAfterMs = 5000,
  passthroughProps,
  ...baseline
}: DefaultExperienceLoadingComponentProps) => {
  const { logger } = useNinetailed();
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    if (!isHidden) {
      return;
    }

    const timer = setTimeout(() => {
      setIsHidden(false);
      logger.error(
        new Error(
          `The experience was still in loading state after ${unhideAfterMs}ms. That happens when no events are sent to the Ninetailed API. The baseline is now shown instead.`
        )
      );
    }, unhideAfterMs);

    return () => {
      clearTimeout(timer);
    };
  }, [isHidden, logger, unhideAfterMs]);

  if (isHidden) {
    return (
      <div
        // TODO: Confirm if a key is truly needed for this rendering branch
        key="experience-loader-hidden-baseline"
        style={{ visibility: 'hidden', pointerEvents: 'none' }}
        aria-hidden="true"
        // Prevent focus and interaction within the hidden loading subtree.
        inert
      >
        <Component
          {...passthroughProps}
          {...baseline}
          ninetailed={{ isPersonalized: false, audience: { id: 'baseline' } }}
        />
      </div>
    );
  }

  return (
    <Component
      {...passthroughProps}
      {...baseline}
      ninetailed={{ isPersonalized: false, audience: { id: 'baseline' } }}
    />
  );
};
