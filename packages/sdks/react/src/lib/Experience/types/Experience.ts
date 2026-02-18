import type { ComponentType } from 'react';
import type {
  Baseline,
  ExperienceConfiguration,
  Reference,
} from '@ninetailed/experience.js';

export type ExperienceComponent<P> = ComponentType<
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
  component: ComponentType<P>;
  passthroughProps?: PassThroughProps;
};

export type ExperienceLoadingComponent<
  P,
  PassThroughProps extends Partial<P>,
  Variant extends Pick<P, Exclude<keyof P, keyof PassThroughProps>> & Reference
> = ComponentType<ExperienceBaseProps<P, PassThroughProps, Variant>>;

export type ExperienceProps<
  P,
  PassThroughProps extends Partial<P> = Partial<P>,
  Variant extends Pick<P, Exclude<keyof P, keyof PassThroughProps>> &
    Reference = Pick<P, Exclude<keyof P, keyof PassThroughProps>> & Reference
> = ExperienceBaseProps<P, PassThroughProps, Variant> & {
  experiences: ExperienceConfiguration<Variant>[];
  component: ComponentType<P>;
  loadingComponent?: ExperienceLoadingComponent<P, PassThroughProps, Variant>;
  trackClicks?: boolean;
};
