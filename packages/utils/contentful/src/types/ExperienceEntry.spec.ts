import { ExperienceEntry, ExperienceEntryLike } from './ExperienceEntry';
import { experienceEntryWithoutVariants } from './fixtures/experienceEntryWithoutVariants';
import { experienceEntryWithoutLinkType } from './fixtures/experienceEntryWithoutLinkType';

describe('ExperienceEntry', () => {
  it('should parse an ExperienceEntry without variants', () => {
    expect(
      ExperienceEntry.parse(
        experienceEntryWithoutVariants as unknown as ExperienceEntryLike
      ).fields.nt_variants
    ).toEqual([]);
  });

  it('should parse an ExperienceEntry without linkType', () => {
    experienceEntryWithoutLinkType.map((entry) => {
      expect(
        ExperienceEntry.parse(entry as unknown as ExperienceEntryLike)
      ).toMatchSnapshot();
    });
  });
});
