import { hasExperienceSelectionMiddleware } from './hasExperienceSelectionMiddleware';

describe('hasExperienceSelectionMiddleware', () => {
  it('should return true if the argument has an getExperienceSelectionMiddleware property of type function', () => {
    const arg = {
      getExperienceSelectionMiddleware: () => {
        /* noop */
      },
    };
    expect(hasExperienceSelectionMiddleware(arg)).toBe(true);
  });

  it('should return false if the argument has an getExperienceSelectionMiddleware property of a type that is not a function', () => {
    const arg = {
      getExperienceSelectionMiddleware: {},
    };
    expect(hasExperienceSelectionMiddleware(arg)).toBe(false);
  });

  it('should return false if the argument does not have an getExperienceSelectionMiddleware property', () => {
    const arg = {};
    expect(hasExperienceSelectionMiddleware(arg)).toBe(false);
  });
});
