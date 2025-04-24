import {
  ExperienceConfiguration,
  ExperienceType,
  Reference,
} from '@ninetailed/experience.js';
import { logger } from '@ninetailed/experience.js-shared';

import { Experiment } from '../types/Experiment';
import { Experience, ExperienceLike } from '../types/Experience';
import { ExperimentLike } from '../types/Experiment';
import {
  ComponentTypeEnum,
  isEntryReplacementComponent,
  isInlineVariableComponent,
} from '../types/Config';

export class ExperienceMapper {
  static isExperienceEntry<Variant extends Reference>(
    experience: ExperienceLike<Variant>
  ): experience is Experience<Variant> {
    return Experience.safeParse(experience).success;
  }

  static mapExperience<Variant extends Reference>(
    experience: ExperienceLike<Variant>
  ): ExperienceConfiguration<Variant> {
    const parsedExperience = Experience.safeParse(experience);
    if (!parsedExperience.success) {
      logger.warn(
        '[Ninetailed ExperienceMapper]',
        'Error parsing experience',
        parsedExperience.error.format()
      );
      throw new Error(
        `[Ninetailed ExperienceMapper] The Experience Input is not valid. Please filter data first with "ExperienceMapper.isExperienceEntry".\n${JSON.stringify(
          parsedExperience.error.format(),
          null,
          2
        )}`
      );
    }

    const { id, type, name, description, audience, config, variants } =
      parsedExperience.data;
    const { components, traffic, sticky } = config;

    return {
      id,
      type: type as ExperienceType,
      name,
      ...(description ? { description } : {}),
      ...(audience ? { audience } : {}),
      trafficAllocation: traffic,
      distribution: config.distribution.map((percentage, index) => ({
        index,
        start: config.distribution.slice(0, index).reduce((a, b) => a + b, 0),
        end: config.distribution.slice(0, index + 1).reduce((a, b) => a + b, 0),
      })),
      sticky,
      components: components.map((component) => {
        if (isEntryReplacementComponent(component)) {
          // Process EntryReplacement component
          const processedVariants = component.variants
            .map((variantRef) => {
              if (variantRef.hidden) {
                return variantRef;
              }

              const matchingVariant = variants.find(
                (variant) => variant.id === variantRef.id
              );

              return matchingVariant ?? null;
            })
            .filter((variant): variant is Variant => variant !== null);

          return {
            type: ComponentTypeEnum.EntryReplacement,
            baseline: component.baseline,
            variants: processedVariants,
          };
        }
        if (isInlineVariableComponent(component)) {
          return component;
        }
        throw new Error(`Unsupported component type encountered`);
      }),
    };
  }

  static isExperimentEntry<Variant extends Reference>(
    experiment: ExperimentLike<Variant>
  ): experiment is ExperimentLike<Variant> {
    return Experiment.safeParse(experiment).success;
  }

  static mapExperiment<Variant extends Reference>(
    experiment: ExperimentLike<Variant>
  ) {
    return ExperienceMapper.mapExperience(experiment);
  }
}
