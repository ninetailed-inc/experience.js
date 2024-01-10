import { generateMock } from '@anatine/zod-mock';
import { Profile } from '../../types/Profile/Profile';
import { selectDistribution } from './selectDistribution';

// this is the profile that will be in the < 50% range -> distributionRandom 0.1082723711403721
const profileControl = { ...generateMock(Profile), stableId: '123' };
// this is the profile that will be in the > 50% range -> distributionRandom 0.6206237130380756
const profileVariant = { ...generateMock(Profile), stableId: '456' };

const experience = {
  id: 'experience1',
  audience: {
    id: 'audience1',
  },
  trafficAllocation: 1,
  type: 'nt_personalization' as const,
  distribution: [
    {
      index: 0,
      start: 0,
      end: 0.5,
    },
    {
      index: 1,
      start: 0.5,
      end: 1,
    },
  ],
  components: [],
};

describe('selectDistribution', () => {
  it('should return the distribution for a profile', () => {
    const controlDistribution = selectDistribution({
      experience,
      profile: profileControl,
    });
    expect(controlDistribution).toEqual(experience.distribution[0]);
    const variantDistribution = selectDistribution({
      experience,
      profile: profileVariant,
    });
    expect(variantDistribution).toEqual(experience.distribution[1]);
  });
});
