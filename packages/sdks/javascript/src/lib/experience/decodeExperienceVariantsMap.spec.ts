import { decodeExperienceVariantsMap } from './decodeExperienceVariantsMap';

describe('decodeExperienceVariantsMap', () => {
  it('should decode a map of experience variants', () => {
    const decoded = decodeExperienceVariantsMap('a=1,b=2,c=3');

    expect(decoded).toEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it('should return an empty object if the input is empty', () => {
    const decoded = decodeExperienceVariantsMap('');

    expect(decoded).toEqual({});
  });

  it('should return an empty object if the input is invalid', () => {
    const decoded = decodeExperienceVariantsMap('invalid');

    expect(decoded).toEqual({});
  });

  it('should return an empty object if experience id or variant index is missing', () => {
    const decoded = decodeExperienceVariantsMap('a=,=1,=');

    expect(decoded).toEqual({});
  });
});
