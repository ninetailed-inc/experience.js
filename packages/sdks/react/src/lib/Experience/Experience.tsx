import React, { useEffect, useRef } from 'react';
import { isForwardRef } from 'react-is';
import {
  Baseline,
  ExperienceConfiguration,
  Reference,
} from '@ninetailed/experience.js';

import { useExperience } from './useExperience';
import { useNinetailed } from '../useNinetailed';
import { ComponentMarker } from './ComponentMarker';
import { DefaultExperienceLoadingComponent } from './DefaultExperienceLoadingComponent';

export type ExperienceComponent<P> = React.ComponentType<
  Omit<P, 'id'> & {
    ninetailed?: {
      isPersonalized: boolean;
      audience: { id: string };
    };
  }
>;

export type ExperienceBaseProps<
  P,
  PassThroughProps extends Partial<P>,
  Variant extends Pick<P, Exclude<keyof P, keyof PassThroughProps>> & Reference
> = Baseline<Pick<P, Exclude<keyof P, keyof PassThroughProps>>> & {
  experiences: ExperienceConfiguration<Variant>[];
  component: React.ComponentType<P>;
  passthroughProps?: PassThroughProps;
};

export type ExperienceLoadingComponent<
  P,
  PassThroughProps extends Partial<P>,
  Variant extends Pick<P, Exclude<keyof P, keyof PassThroughProps>> & Reference
> = React.ComponentType<ExperienceBaseProps<P, PassThroughProps, Variant>>;

export type ExperienceProps<
  P,
  PassThroughProps extends Partial<P> = Partial<P>,
  Variant extends Pick<P, Exclude<keyof P, keyof PassThroughProps>> &
    Reference = Pick<P, Exclude<keyof P, keyof PassThroughProps>> & Reference
> = ExperienceBaseProps<P, PassThroughProps, Variant> & {
  experiences: ExperienceConfiguration<Variant>[];
  component: React.ComponentType<P>;
  loadingComponent?: ExperienceLoadingComponent<P, PassThroughProps, Variant>;
};

// Re-export to preserve existing imports from './Experience'.
export { DefaultExperienceLoadingComponent } from './DefaultExperienceLoadingComponent';

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
      observeElement({
        element: componentElement,
        experience,
        componentType: 'Entry',
        audience,
        variant: isVariantHidden
          ? { ...variant, id: `${baseline.id}-hidden` }
          : variant,
        variantIndex,
      });

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
