import { Changes } from './Changes';

const variable = {
  key: 'flag',
  type: 'Variable',
  value: 'on',
  meta: { experienceId: 'exp', variantIndex: 1 },
};

describe('Changes', () => {
  it('keeps Variable changes', () => {
    expect(Changes.parse([variable])).toEqual([variable]);
  });

  it('drops unrecognized change types instead of failing', () => {
    const unknown = [
      { type: 'Experience', key: 'a', meta: {} },
      variable,
      { type: 'Fragment', foo: 'bar' },
      { type: 'SomethingNew' },
    ];
    expect(Changes.parse(unknown)).toEqual([variable]);
  });

  it('still rejects non-array input', () => {
    expect(Changes.safeParse('nope').success).toBe(false);
  });
});
