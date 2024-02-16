import React, { useState, useEffect, useRef } from 'react';
import { isForwardRef } from 'react-is';
import {
  Baseline,
  ExperienceConfiguration,
  Reference,
} from '@ninetailed/experience.js';

import { useExperience } from './useExperience';
import { useNinetailed } from '../useNinetailed';
import { ComponentMarker } from './ComponentMarker';

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

type DefaultExperienceLoadingComponentProps = ExperienceBaseProps<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown> & Reference
> & {
  unhideAfterMs?: number;
};

export const DefaultExperienceLoadingComponent: React.FC<
  DefaultExperienceLoadingComponentProps
> = ({
  component: Component,
  unhideAfterMs = 5000,
  passthroughProps,
  ...baseline
}) => {
  const { logger } = useNinetailed();

  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(false);
      logger.error(
        new Error(
          `The experience was still in loading state after ${unhideAfterMs}ms. That happens when no events are sent to the Ninetailed API. The baseline is now shown instead.`
        )
      );
    }, unhideAfterMs);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (hidden) {
    return (
      <div key="hide" style={{ opacity: 0 }}>
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

  useEffect(() => {
    const componentElement = componentRef.current;

    if (componentElement && !(componentElement instanceof Element)) {
      const isObject =
        typeof componentElement === 'object' && componentElement !== null;
      const constructorName = isObject
        ? (componentElement as any).constructor.name
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
        audience,
        variant,
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

  const isVariantHidden = 'hidden' in variant && variant.hidden;
  if (isVariantHidden) {
    return (
      <ComponentMarker
        key={`marker-hidden-${experience?.id || 'baseline'}-${variant.id}`}
        ref={componentRef}
        hidden
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
