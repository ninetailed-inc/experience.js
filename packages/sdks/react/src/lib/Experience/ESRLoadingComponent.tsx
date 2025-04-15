import React, { PropsWithChildren } from 'react';

import { ExperienceBaseProps } from './Experience';
import { Reference } from '@ninetailed/experience.js';

type ESRContextValue = {
  experienceVariantsMap: Record<string, number>;
};

export const ESRContext = React.createContext<ESRContextValue | undefined>(
  undefined
);

type ESRProviderProps = {
  experienceVariantsMap: Record<string, number>;
};

export const ESRProvider: React.FC<PropsWithChildren<ESRProviderProps>> = ({
  experienceVariantsMap,
  children,
}) => {
  return (
    <ESRContext.Provider value={{ experienceVariantsMap }}>
      {children}
    </ESRContext.Provider>
  );
};

export const useESR = () => {
  const context = React.useContext(ESRContext);

  if (context === undefined) {
    throw new Error(
      'The component using the the context must be a descendant of the ESRProvider'
    );
  }

  return { experienceVariantsMap: context.experienceVariantsMap };
};

export const ESRLoadingComponent = <
  P,
  PassThroughProps extends Partial<P> = Partial<P>,
  Variant extends Pick<P, Exclude<keyof P, keyof PassThroughProps>> &
    Reference = Pick<P, Exclude<keyof P, keyof PassThroughProps>> & Reference
>({
  experiences,
  component: Component,
  passthroughProps,
  ...baseline
}: ExperienceBaseProps<P, PassThroughProps, Variant>) => {
  const { experienceVariantsMap } = useESR();

  const experience = experiences.find((experience) =>
    Object.prototype.hasOwnProperty.call(experienceVariantsMap, experience.id)
  );

  if (!experience) {
    return (
      <Component
        {...passthroughProps}
        {...(baseline as P)}
        ninetailed={{ isPersonalized: false, audience: { id: 'baseline' } }}
      />
    );
  }

  const component = experience.components.find(
    (component) =>
      'id' in component.baseline &&
      component.baseline.id === ('id' in baseline ? baseline.id : undefined)
  );

  if (!component) {
    return (
      <Component
        {...passthroughProps}
        {...(baseline as P)}
        ninetailed={{ isPersonalized: false, audience: { id: 'baseline' } }}
      />
    );
  }

  if (experienceVariantsMap[experience.id] === 0) {
    return (
      <Component
        {...passthroughProps}
        {...(baseline as P)}
        ninetailed={{ isPersonalized: false, audience: { id: 'baseline' } }}
      />
    );
  }

  const variant = component.variants[experienceVariantsMap[experience.id] - 1];

  if (!variant) {
    return (
      <Component
        {...passthroughProps}
        {...(baseline as P)}
        ninetailed={{ isPersonalized: false, audience: { id: 'baseline' } }}
      />
    );
  }

  return (
    <Component
      {...passthroughProps}
      {...(variant as P)}
      ninetailed={{ isPersonalized: false, audience: { id: 'baseline' } }}
    />
  );
};
