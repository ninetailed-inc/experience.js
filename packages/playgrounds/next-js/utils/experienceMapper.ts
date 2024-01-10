import { ExperienceConfiguration } from '@ninetailed/experience.js';
import {
  BaselineWithExperiencesEntry,
  ExperienceMapper,
} from '@ninetailed/experience.js-utils-contentful';

export const experienceMapper = (
  productEntry: BaselineWithExperiencesEntry
): ExperienceConfiguration<any>[] =>
  productEntry.fields.nt_experiences
    .filter(ExperienceMapper.isExperienceEntry)
    .map((experience) =>
      ExperienceMapper.mapCustomExperience(experience, (variant) => ({
        ...variant.fields,
        id: variant.sys.id,
        hidden: false,
      }))
    );
