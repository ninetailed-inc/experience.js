import {
  ExperienceEntryLike,
  ExperienceMapper,
} from '@ninetailed/experience.js-utils-contentful';
import product from '../fixtures/contentful/product-with-experiences.json';

export const experiences = (
  product.fields.nt_experiences as unknown as ExperienceEntryLike[]
)
  .filter(ExperienceMapper.isExperienceEntry)
  .map((experience) =>
    ExperienceMapper.mapCustomExperience(experience, (variant) => ({
      ...variant.fields,
      foo: 'bar',
      id: variant.sys.id,
      hidden: false,
    }))
  );

/*console.log("Experiences", experiences);*/
