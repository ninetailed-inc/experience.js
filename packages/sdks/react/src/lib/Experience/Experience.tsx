import { useEffect, useRef } from 'react';
import { isForwardRef } from 'react-is';
import type { Baseline, Reference } from '@ninetailed/experience.js';

import { useExperience } from './useExperience';
import { useNinetailed } from '../useNinetailed';
import { ComponentMarker } from './ComponentMarker';
import { DefaultExperienceLoadingComponent } from './DefaultExperienceLoadingComponent';
import type {
  ExperienceLoadingComponent,
  ExperienceProps,
} from './types/Experience';

export const Experience = <
  P,
  PassThroughProps extends Partial<P> = Partial<P>,
  Variant extends Pick<P, Exclude<keyof P, keyof PassThroughProps>> &
    Reference = Pick<P, Exclude<keyof P, keyof PassThroughProps>> & Reference
>({
  experiences,
  component: Component,
  loadingComponent:
    LoadingComponent = DefaultExperienceLoadingComponent as ExperienceLoadingComponent<
      P,
      PassThroughProps,
      Variant
    >,
  trackClicks,
  trackHovers,
  passthroughProps,
  ...baseline
}: ExperienceProps<P, PassThroughProps, Variant>) => {
  const { observeElement, unobserveElement, logger } = useNinetailed();
  const {
    status,
    hasVariants,
    experience,
    variant,
    variantIndex,
    audience,
    isPersonalized,
  } = useExperience({
    baseline,
    experiences,
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const isComponentForwardRef = isForwardRef(<Component />);

  const componentRef = useRef<Element | null>(null);
  const isVariantHidden = 'hidden' in variant && variant.hidden;

  useEffect(() => {
    const componentElement = componentRef.current;

    if (componentElement && !(componentElement instanceof Element)) {
      const isObject =
        typeof componentElement === 'object' && componentElement !== null;
      const constructorName = isObject
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (componentElement as any).constructor.name
        : '';
      const isConstructorNameNotObject =
        constructorName && constructorName !== 'Object';

      logger.warn(
        `The component ref being in Experience is an invalid element. Expected an Element but got ${typeof componentElement}${
          isConstructorNameNotObject ? ` of type ${constructorName}` : ''
        }. This component won't be observed.`
      );

      return () => {
        // noop
      };
    }

    if (componentElement) {
      observeElement(
        {
          element: componentElement,
          experience,
          componentType: 'Entry',
          audience,
          variant: isVariantHidden
            ? { ...variant, id: `${baseline.id}-hidden` }
            : variant,
          variantIndex,
        },
        { trackClicks, trackHovers }
      );

      return () => {
        if (componentElement) {
          unobserveElement(componentElement);
        }
      };
    }

    return () => {
      // noop
    };
  }, [
    observeElement,
    unobserveElement,
    experience,
    baseline,
    variant,
    variantIndex,
    audience,
    isVariantHidden,
    trackClicks,
    trackHovers,
  ]);

  if (!hasVariants) {
    return (
      <>
        {!isComponentForwardRef && (
          <ComponentMarker
            key={`marker-no-variants-${experience?.id || 'baseline'}-${
              variant.id
            }`}
            ref={componentRef}
          />
        )}
        <Component
          {...passthroughProps}
          {...(baseline as P)}
          key={baseline.id}
          {...(isComponentForwardRef ? { ref: componentRef } : {})}
        />
      </>
    );
  }

  if (status === 'loading') {
    return (
      <LoadingComponent
        {...(baseline as Baseline<P>)}
        key={baseline.id}
        passthroughProps={passthroughProps}
        experiences={experiences}
        component={Component}
      />
    );
  }

  if (isVariantHidden) {
    return (
      <ComponentMarker
        key={`marker-hidden-${experience?.id || 'baseline'}-${variant.id}`}
        ref={componentRef}
      />
    );
  }

  return (
    <>
      {!isComponentForwardRef && (
        <ComponentMarker
          key={`marker-${experience?.id || 'baseline'}-${variant.id}`}
          ref={componentRef}
        />
      )}
      <Component
        {...({ ...passthroughProps, ...variant } as unknown as P)}
        key={`${experience?.id || 'baseline'}-${variant.id}`}
        ninetailed={{
          isPersonalized,
          audience: { id: audience?.id || 'all visitors' },
        }}
        {...(isComponentForwardRef ? { ref: componentRef } : {})}
      />
    </>
  );
};

// Re-export to preserve existing imports from './Experience'.
export type {
  ExperienceProps,
  ExperienceBaseProps,
  ExperienceComponent,
  ExperienceLoadingComponent,
} from './types/Experience';

export { DefaultExperienceLoadingComponent } from './DefaultExperienceLoadingComponent';
