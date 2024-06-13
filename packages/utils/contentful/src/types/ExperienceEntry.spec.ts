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

  it('Should not accept a null value as variants', () => {
    expect(
      () =>
        ExperienceEntry.parse({
          sys: { id: 'experience' },
          fields: {
            ...experienceEntryWithoutVariants.fields,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            nt_variants: null,
          },
        }).fields.nt_variants
    ).toThrow();
  });

  it('should parse an ExperienceEntry without linkType', () => {
    experienceEntryWithoutLinkType.map((entry) => {
      expect(
        ExperienceEntry.parse(entry as unknown as ExperienceEntryLike)
      ).toMatchSnapshot();
    });
  });

  it('Should not accept invalid variants', () => {
    expect(() =>
      ExperienceEntry.parse({
        sys: { id: 'experience' },
        fields: {
          ...experienceEntryWithoutVariants.fields,
          nt_variants: [
            {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              key: 'invalid-variant',
            },
          ],
        },
      })
    ).toThrow();
  });
});
