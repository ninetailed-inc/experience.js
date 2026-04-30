import { Profile } from '@ninetailed/experience.js';
import { generateSelectors, selectValueFromProfile } from './helpers';
describe('MergeTag helpers', () => {
  describe('generateSelectors', () => {
    it('should create all combinations for deep paths', () => {
      expect(generateSelectors('a_b_c')).toEqual(['a_b_c', 'a.b_c', 'a.b.c']);
    });
    it('should keep sub paths with dot notation', () => {
      expect(generateSelectors('a.b_c')).toEqual(['a.b_c', 'a.b.c']);
      expect(generateSelectors('a.b_c.d')).toEqual(['a.b_c.d', 'a.b.c.d']);
      expect(generateSelectors('a_b_c.d')).toEqual([
        'a_b_c.d',
        'a.b_c.d',
        'a.b.c.d',
      ]);
    });
  });
  describe('selectValueFromProfile', () => {
    const profile: Profile = {
      id: '',
      stableId: '',
      random: 0,
      audiences: [],
      traits: {
        firstname: 'John',
        nested: {
          foo: 'bar',
          baz: { qux: 'grml' },
          baz_qux: 'quux',
        },
        non_nested: 123,
      },
      location: {},
      session: {
        id: '1a2b3c4d5e6f7g8h9i0j',
        isReturningVisitor: false,
        landingPage: {
          url: '',
          referrer: '',
          query: {},
          search: '',
          path: '',
        },
        count: 2,
        activeSessionLength: 12,
        averageSessionLength: 43,
      },
    };
    it('should return undefined if no value is found', () => {
      expect(selectValueFromProfile(profile, 'a.b.c')).toBeNull();
    });
    it('should return the value if found', () => {
      expect(selectValueFromProfile(profile, 'traits.firstname')).toEqual(
        'John'
      );
      expect(selectValueFromProfile(profile, 'traits_firstname')).toEqual(
        'John'
      );
      expect(selectValueFromProfile(profile, 'traits.nested.foo')).toEqual(
        'bar'
      );
      expect(selectValueFromProfile(profile, 'traits_nested.baz_qux')).toEqual(
        'quux'
      );
      expect(selectValueFromProfile(profile, 'traits_nested.baz.qux')).toEqual(
        'grml'
      );
      expect(selectValueFromProfile(profile, 'traits.non_nested')).toEqual(123);
    });

    describe('current truthy selector matching in selectValueFromProfile', () => {
      // Reference: selectValueFromProfile in ./helpers.ts
      const profileWithFalsyValues: Profile = {
        ...profile,
        traits: {
          ...profile.traits,
          empty: '',
          disabled: false,
          visits: 0,
        },
      };

      it('should return null for empty string values', () => {
        expect(
          selectValueFromProfile(profileWithFalsyValues, 'traits.empty')
        ).toBeNull();
      });

      it('should return null for false values', () => {
        expect(
          selectValueFromProfile(profileWithFalsyValues, 'traits.disabled')
        ).toBeNull();
      });

      it('should return null for zero values', () => {
        expect(
          selectValueFromProfile(profileWithFalsyValues, 'traits.visits')
        ).toBeNull();
      });

      it('should prefer selectors earlier in generated selector order', () => {
        const profileWithConflictingValues = {
          ...profile,
          traits_nested: {
            baz_qux: 'flat-priority',
          },
          traits: {
            ...profile.traits,
            nested: {
              foo: 'bar',
              baz_qux: 'quux',
              baz: {
                qux: 'deep-second',
              },
            },
          },
        } as unknown as Profile;

        expect(
          selectValueFromProfile(
            profileWithConflictingValues,
            'traits_nested.baz_qux'
          )
        ).toEqual('flat-priority');
      });
    });
  });
});
