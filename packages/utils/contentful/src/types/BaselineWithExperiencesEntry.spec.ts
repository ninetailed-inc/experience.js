import { ctfHero } from '../lib/__test__/ctfHero';
import {
  BaselineWithExperiencesEntryLike,
  BaselineWithExperiencesEntrySchema,
} from './BaselineWithExperiencesEntry';
import { IHero, IHeroFields } from './fixtures/contentful';

describe('BaselineWithExperiencesEntry', () => {
  it('should accept the correct types', () => {
    // casting this on purpose to test if the types match
    const data = {} as IHero;

    const fnThatWantsTheCorrectType = (
      baseline: BaselineWithExperiencesEntryLike<IHeroFields>
    ) => {
      return baseline;
    };

    const result = fnThatWantsTheCorrectType(data);

    expect(result).toEqual(data);
  });

  it('should sanitize the entries correctly', () => {
    const result = BaselineWithExperiencesEntrySchema.safeParse(ctfHero);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.fields.nt_experiences).toHaveLength(1);
      expect(
        result.data.fields.nt_experiences[0].fields.nt_variants
      ).toHaveLength(1);

      expect(
        result.data.fields.nt_experiences[0].fields.nt_variants
      ).toMatchSnapshot();
    }
  });
});
