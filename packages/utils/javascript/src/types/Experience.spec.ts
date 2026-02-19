import { Reference } from '@ninetailed/experience.js-shared';
import { Experience } from './Experience';
describe('Experience Schema Validation', () => {
  it('Should default missing variants to an empty array', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const experience = Experience.parse({
      id: 'experience-without-variants',
      name: 'Experience without variants',
      type: 'nt_experiment',
    });
    expect(experience.variants).toEqual([]);
  });
  it('Should default null variants to an empty array', () => {
    const experience = Experience.parse({
      id: 'experience-with-null-variants',
      name: 'Experience with null variants',
      type: 'nt_experiment',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      variants: null,
    });
    expect(experience.variants).toEqual([]);
  });
  it('Should validate the variants array to contain only element with an id', () => {
    const experience = Experience.parse({
      id: 'experience-with-invalid-variants',
      name: 'Experience with invalid variants',
      type: 'nt_experiment',
      variants: [
        { id: 'valid-variant', foo: 'bar' },
        { key: 'invalid-variant' } as unknown as Reference,
      ],
    });
    expect(experience.variants).toEqual([{ id: 'valid-variant', foo: 'bar' }]);
  });
});
