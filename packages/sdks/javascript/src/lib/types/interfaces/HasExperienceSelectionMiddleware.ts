import {
  ExperienceConfiguration,
  Reference,
} from '@ninetailed/experience.js-shared';

export type ExperienceSelectionMiddlewareReturnArg<Variant extends Reference> =
  {
    experience: ExperienceConfiguration<Variant> | null;
    variant: Variant;
    variantIndex: number;
  };

type ExperienceSelectionMiddlewareReturn<Variant extends Reference> = (
  arg: ExperienceSelectionMiddlewareReturnArg<Variant>
) => ExperienceSelectionMiddlewareReturnArg<Variant>;

type ExperienceSelectionMiddlewareArg<Variant extends Reference> = {
  experiences: ExperienceConfiguration<Variant>[];
  baseline: Reference;
};

export type ExperienceSelectionMiddleware<Variant extends Reference> = (
  arg: ExperienceSelectionMiddlewareArg<Variant>
) => ExperienceSelectionMiddlewareReturn<Variant>;

export interface HasExperienceSelectionMiddleware<Variant extends Reference> {
  getExperienceSelectionMiddleware: ExperienceSelectionMiddleware<Variant>;
}
