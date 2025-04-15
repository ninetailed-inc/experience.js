import { Reference } from '@ninetailed/experience.js';
import { ExperienceMapper } from './ExperienceMapper';

const defaultExperience = {
  id: '123',
  name: 'test',
  description: 'description',
  type: 'nt_personalization' as const,
  config: {
    traffic: 0,
    distribution: [0.5, 0.5],
    components: [
      {
        baseline: {
          id: 'baseline',
        },
        variants: [
          {
            id: 'variant',
            hidden: false,
          },
        ],
      },
    ],
  },
  audience: {
    id: 'audience',
  },
  variants: [],
};

const defaultMappedExperience = {
  audience: { id: 'audience' },
  components: [{ baseline: { id: 'baseline' }, variants: [] }],
  distribution: [
    { end: 0.5, index: 0, start: 0 },
    { end: 1, index: 1, start: 0.5 },
  ],
  id: '123',
  name: 'test',
  description: 'description',
  trafficAllocation: 0,
  type: 'nt_personalization',
};

describe('Experience Mapper', () => {
  it('should map experience to experience', () => {
    const mapped = ExperienceMapper.mapExperience(defaultExperience);

    expect(mapped).toMatchObject(defaultMappedExperience);
  });

  it('Should omit corrupt variants', () => {
    const mapped = ExperienceMapper.mapExperience({
      ...defaultExperience,
      variants: [
        { key: 'this variant has no id' } as unknown as Reference,
        { id: 'variant', foo: 'bar' },
      ],
    });

    expect(mapped.components[0].variants).toStrictEqual([
      { id: 'variant', foo: 'bar' },
    ]);
  });

  it('Should map hidden variants', () => {
    const mapped = ExperienceMapper.mapExperience({
      ...defaultExperience,
      config: {
        ...defaultExperience.config,
        components: [
          {
            baseline: { id: 'baseline' },
            variants: [{ id: 'variant', hidden: true }],
          },
        ],
      },
      variants: [{ id: 'variant', foo: 'bar' }],
    });

    expect(mapped.components[0].variants).toStrictEqual([
      { id: 'variant', hidden: true },
    ]);
  });

  it('should preserve the type of the variants', () => {
    const mapped = ExperienceMapper.mapExperience({
      ...defaultExperience,
      variants: [{ id: 'variant', foo: 'bar' }],
    });

    const variant = mapped.components[0].variants[0];
    if ('foo' in variant) {
      expect(variant.foo).toBe('bar');
    }

    expect(mapped.components[0].variants).toStrictEqual([
      { id: 'variant', foo: 'bar' },
    ]);
  });
});
