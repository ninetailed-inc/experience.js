import { ExperienceEntryLike } from '../../types/ExperienceEntry';
import { ExperienceMapper } from '../ExperienceMapper';
import { EXPERIENCES } from './ntExperiences';
import { ctfHero } from './ctfHero';

interface IHeroFields {
  headline: string;
}

interface IButtonFields {
  label: string;
}

describe('Contentful Experience Mapper', () => {
  it('should map experiences', () => {
    const experienceConfig = EXPERIENCES.map((experience) => {
      return ExperienceMapper.mapCustomExperience(experience, (variant) => ({
        id: variant.sys.id,
        headline: variant.fields.entryTitle,
        x: variant.fields.desktopImage,
      }));
    });

    expect(experienceConfig).toMatchSnapshot();
  });

  it('mapExperience should not have any undefined values', () => {
    const experienceConfig = EXPERIENCES.map((experience) => {
      return ExperienceMapper.mapExperience(experience);
    });

    expect(experienceConfig[0].description).not.toBeUndefined();
    expect(experienceConfig[0].name).not.toBeUndefined();
    expect(experienceConfig[0].audience?.description).not.toBeUndefined();
    expect(experienceConfig[0].audience?.name).not.toBeUndefined();
  });

  it('mapCustomExperience should not have any undefined values', () => {
    const experienceConfig = EXPERIENCES.map((experience) => {
      return ExperienceMapper.mapCustomExperience(experience, (variant) => ({
        id: variant.sys.id,
        headline: variant.fields.entryTitle,
        x: variant.fields.desktopImage,
      }));
    });

    expect(experienceConfig[0].description).not.toBeUndefined();
    expect(experienceConfig[0].name).not.toBeUndefined();
    expect(experienceConfig[0].audience?.description).not.toBeUndefined();
    expect(experienceConfig[0].audience?.name).not.toBeUndefined();
  });

  it('should map experiences with Variant Interfaces', () => {
    const ntExperiences: ExperienceEntryLike<IHeroFields | IButtonFields>[] =
      [];

    const mapped = ntExperiences
      .filter(ExperienceMapper.isExperienceEntry)
      .map((experience) => ExperienceMapper.mapExperience(experience));
  });

  it('should find experiments', () => {
    const ntExperiences: ExperienceEntryLike<IHeroFields | IButtonFields>[] =
      [];

    const mapped = ntExperiences
      .filter(ExperienceMapper.isExperienceEntry)
      .filter(ExperienceMapper.isExperiment)
      .map((experience) => ExperienceMapper.mapExperience(experience));
  });

  it('should work with autogenerated types from contentful', () => {
    const mapped = (ctfHero.fields.nt_experiences || [])
      .filter((entry) => ExperienceMapper.isExperienceEntry(entry))
      .filter(ExperienceMapper.isExperiment)
      .map((experience) => ExperienceMapper.mapExperience(experience));
  });

  it('Should map experiences with custom mapping function for variants including an async step', async () => {
    const mapped = await Promise.all(
      EXPERIENCES.map((experience) =>
        ExperienceMapper.mapCustomExperienceAsync(
          experience,
          async (variant) => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return {
              id: variant.sys.id,
              headline: variant.fields.entryTitle,
              x: variant.fields.desktopImage,
            };
          }
        )
      )
    );

    mapped.forEach((mappedExperience) => {
      expect(mappedExperience.description).not.toBeUndefined();
      expect(mappedExperience.name).not.toBeUndefined();
      expect(mappedExperience.audience?.description).not.toBeUndefined();
      expect(mappedExperience.audience?.name).not.toBeUndefined();
    });
  });
});
