import { HAS_SEEN_ELEMENT } from '@ninetailed/experience.js-plugin-analytics';
import { isInterestedInSeenElements } from './isInterestedInSeenElements';
describe('isInterestedInSeenElements', () => {
  it('should return true if the argument is an object with a function property named HAS_SEEN_ELEMENT', () => {
    const arg = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      [HAS_SEEN_ELEMENT]: () => {},
    };
    expect(isInterestedInSeenElements(arg)).toBe(true);
  });
  it('should return false if the argument is not an object', () => {
    const arg = 1;
    expect(isInterestedInSeenElements(arg)).toBe(false);
  });
  it('should return false if the argument is null', () => {
    const arg = null;
    expect(isInterestedInSeenElements(arg)).toBe(false);
  });
  it('should return false if the argument is an object without a function property named HAS_SEEN_ELEMENT', () => {
    const arg = {};
    expect(isInterestedInSeenElements(arg)).toBe(false);
  });
});
