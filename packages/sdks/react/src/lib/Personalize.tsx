import React from 'react';

import { Variant } from './Variant';
import { usePersonalize } from './usePersonalize';
import { TrackHasSeenComponent } from './TrackHasSeenComponent';

export type PersonalizedComponent<P> = React.ComponentType<
  Omit<P, 'id'> & {
    ninetailed?: {
      isPersonalized: boolean;
      audience: { id: string } | { id: 'baseline' };
    };
  }
>;

type Baseline<P> = P & {
  id: string;
};

type PersonalizeProps<P> = Baseline<P> & {
  variants?: Variant<P>[];
  component: PersonalizedComponent<P> | React.ComponentType<P>;
  loadingComponent?: React.ComponentType;
  holdout?: number;
};

export const Personalize = <P extends object>({
  component: Component,
  loadingComponent: LoadingComponent,
  variants = [],
  holdout = -1,
  ...baseline
}: PersonalizeProps<P>) => {
  const { loading, variant, isPersonalized, audience } = usePersonalize<
    Baseline<P>
  >(baseline as Baseline<P>, variants, { holdout });
  const hasVariants = variants.length > 0;

  if (!hasVariants) {
    return (
      <Component
        {...(baseline as Baseline<P>)}
        ninetailed={{ isPersonalized, audience }}
      />
    );
  }

  if (loading) {
    if (LoadingComponent) {
      return <LoadingComponent />;
    }

    return (
      <div key="hide" style={{ opacity: 0 }}>
        <Component {...variant} ninetailed={{ isPersonalized, audience }} />
      </div>
    );
  }

  return (
    <TrackHasSeenComponent
      variant={variant}
      audience={audience}
      isPersonalized={isPersonalized}
    >
      <Component
        {...variant}
        key={`${audience.id}-${variant.id}`}
        ninetailed={{ isPersonalized, audience }}
      />
    </TrackHasSeenComponent>
  );
};
