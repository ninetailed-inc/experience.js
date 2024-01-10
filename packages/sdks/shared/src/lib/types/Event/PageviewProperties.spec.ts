import { PageviewProperties } from './PageviewProperties';

describe('PageviewProperties', () => {
  it('should allow additional keys', () => {
    const { success } = PageviewProperties.safeParse({
      path: 'path',
      query: {},
      referrer: 'referrer',
      search: 'search',
      title: 'title',
      url: 'url',
      category: 'category',
      additionalKey: {},
      anotherAdditionalKey: 'anotherAdditionalKey',
      oneMoreAdditionalKey: [{}, 1, 'a', true, null],
      blub: {
        a: 1,
        b: 'b',
        c: true,
        d: {},
        e: [],
        f: null,
      },
    });

    expect(success).toBe(true);
  });
});
