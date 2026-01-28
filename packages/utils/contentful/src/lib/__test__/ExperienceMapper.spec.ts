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
  const EXPERIENCE = EXPERIENCES[0];

  // An Experience entry that has the same nt_experience_id as its sys.id
  // In real scenarios, this is the default behavior when creating a new Experience entry in Contentful
  const EXPERIENCE_WITH_SAME_NT_EXPERIENCE_ID = {
    ...EXPERIENCES[0],
    fields: {
      ...EXPERIENCES[0].fields,
      nt_experience_id: EXPERIENCES[0].sys.id,
    },
  };

  // An Experience entry that has a different nt_experience_id than its sys.id
  // In real scenarios, this would be created in Contentful by the user duplicating an existing Experience entry and regenerating its nt_experience_id field in the UI
  const EXPERIENCE_WITH_DIFFERENT_NT_EXPERIENCE_ID = {
    ...EXPERIENCE,
    fields: {
      ...EXPERIENCE.fields,
      nt_experience_id: 'a42f5cde-1234-5678-9101-abcdef123456',
    },
  };

  describe('mapCustomExperience', () => {
    it('should map experiences with a custom mapping function', () => {
      const experienceConfig = EXPERIENCES.map((experience) => {
        return ExperienceMapper.mapCustomExperience(experience, (variant) => ({
          id: variant.sys.id,
          headline: variant.fields.entryTitle,
          x: variant.fields.desktopImage,
        }));
      });

      expect(experienceConfig).toMatchSnapshot();
    });

    it('should not return any undefined values', () => {
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

    it(`should map an experience's nt_experience_id to id`, () => {
      /**
       * Testing an experience with the same nt_experience_id as its sys.id
       */

      const mappedExperiencesSameId = [
        EXPERIENCE_WITH_SAME_NT_EXPERIENCE_ID,
      ].map((experience) =>
        ExperienceMapper.mapCustomExperience(experience, (variant) => ({
          id: variant.sys.id,
          headline: variant.fields.entryTitle,
          x: variant.fields.desktopImage,
        }))
      );

      expect(mappedExperiencesSameId.length).toBe(1);
      expect(mappedExperiencesSameId[0].id).toBe(EXPERIENCE.sys.id);
      expect(mappedExperiencesSameId[0].id).toBe(
        EXPERIENCE_WITH_SAME_NT_EXPERIENCE_ID.fields.nt_experience_id
      );

      /**
       * Testing an experience with a different nt_experience_id than its sys.id
       */

      const mappedExperiencesDifferentId = [
        EXPERIENCE_WITH_DIFFERENT_NT_EXPERIENCE_ID,
      ].map((experience) =>
        ExperienceMapper.mapCustomExperience(experience, (variant) => ({
          id: variant.sys.id,
          headline: variant.fields.entryTitle,
          x: variant.fields.desktopImage,
        }))
      );

      expect(mappedExperiencesDifferentId.length).toBe(1);
      expect(mappedExperiencesDifferentId[0].id).toBe(
        'a42f5cde-1234-5678-9101-abcdef123456'
      );
    });
  });

  describe('mapCustomExperienceAsync', () => {
    it('should map experiences with custom mapping function for variants including an async step', async () => {
      const mapped = await Promise.all(
        EXPERIENCES.map((experience) =>
          ExperienceMapper.mapCustomExperienceAsync(
            experience,
            async (variant) => {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              return {
                id: variant.sys.id,
                headline: variant.fields.entryTitle,
                image: variant.fields.desktopImage,
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
        mappedExperience.components.forEach((component) => {
          component.variants.forEach((variant) => {
            expect('id' in variant).toBe(true);

            if ('headline' in variant) {
              expect(variant.headline).not.toBeUndefined();
              expect(variant.image).not.toBeUndefined();
            }
          });
        });
      });
    });
  });

  describe('mapExperience', () => {
    it('should not return any undefined values', () => {
      const experienceConfig = EXPERIENCES.map((experience) => {
        return ExperienceMapper.mapExperience(experience);
      });

      expect(experienceConfig[0].description).not.toBeUndefined();
      expect(experienceConfig[0].name).not.toBeUndefined();
      expect(experienceConfig[0].audience?.description).not.toBeUndefined();
      expect(experienceConfig[0].audience?.name).not.toBeUndefined();
    });

    // FIXME: Nothing is being asserted in this case
    it('should work with autogenerated types from contentful', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mapped = (
        (ctfHero.fields.nt_experiences ||
          []) as unknown as ExperienceEntryLike[]
      )
        .filter((entry) => ExperienceMapper.isExperienceEntry(entry))
        .filter(ExperienceMapper.isExperiment)
        .map((experience) => ExperienceMapper.mapExperience(experience));
    });

    // FIXME: Nothing is being asserted in this case
    it('should map experiences with Variant Interfaces', () => {
      const ntExperiences: ExperienceEntryLike<IHeroFields | IButtonFields>[] =
        [];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mapped = ntExperiences
        .filter(ExperienceMapper.isExperienceEntry)
        .map((experience) => ExperienceMapper.mapExperience(experience));
    });

    it(`should map an experience's nt_experience_id to id`, () => {
      /**
       * Testing an experience with the same nt_experience_id as its sys.id
       */

      const mappedExperiencesSameId = [
        EXPERIENCE_WITH_SAME_NT_EXPERIENCE_ID,
      ].map(ExperienceMapper.mapExperience);

      expect(mappedExperiencesSameId.length).toBe(1);
      expect(mappedExperiencesSameId[0].id).toBe(EXPERIENCE.sys.id);
      expect(mappedExperiencesSameId[0].id).toBe(
        EXPERIENCE_WITH_SAME_NT_EXPERIENCE_ID.fields.nt_experience_id
      );

      /**
       * Testing an experience with a different nt_experience_id than its sys.id
       */

      const mappedExperiencesDifferentId = [
        EXPERIENCE_WITH_DIFFERENT_NT_EXPERIENCE_ID,
      ].map(ExperienceMapper.mapExperience);

      expect(mappedExperiencesDifferentId.length).toBe(1);
      expect(mappedExperiencesDifferentId[0].id).toBe(
        'a42f5cde-1234-5678-9101-abcdef123456'
      );
    });
  });

  describe('isExperiment', () => {
    // FIXME: Nothing is being asserted in this case
    it('should find experiments', () => {
      const ntExperiences: ExperienceEntryLike<IHeroFields | IButtonFields>[] =
        [];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mapped = ntExperiences
        .filter(ExperienceMapper.isExperienceEntry)
        .filter(ExperienceMapper.isExperiment)
        .map((experience) => ExperienceMapper.mapExperience(experience));
    });
  });
});
