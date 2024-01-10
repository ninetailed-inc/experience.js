import {
  ExperienceConfiguration,
  Reference,
  VariantRef,
} from '@ninetailed/experience.js-shared';

export type ExperienceSelectionMiddlewareArg<
  TBaseline extends Reference,
  TVariant extends Reference
> = {
  experience: ExperienceConfiguration<TVariant> | null;
  variant: TBaseline | TVariant | VariantRef;
  variantIndex: number;
};

export type ExperienceSelectionMiddleware<
  TBaseline extends Reference,
  TVariant extends Reference
> = (
  arg: ExperienceSelectionMiddlewareArg<TBaseline, TVariant>
) => ExperienceSelectionMiddlewareArg<TBaseline, TVariant>;

type BuildExperienceSelectionMiddlewareArg<TVariant extends Reference> = {
  experiences: ExperienceConfiguration<TVariant>[];
  baseline: Reference;
};

export type BuildExperienceSelectionMiddleware<
  TBaseline extends Reference,
  TVariant extends Reference
> = (
  arg: BuildExperienceSelectionMiddlewareArg<TVariant>
) => ExperienceSelectionMiddleware<TBaseline, TVariant>;

export interface HasExperienceSelectionMiddleware<
  TBaseline extends Reference,
  TVariant extends Reference
> {
  getExperienceSelectionMiddleware: BuildExperienceSelectionMiddleware<
    TBaseline,
    TVariant
  >;
}
