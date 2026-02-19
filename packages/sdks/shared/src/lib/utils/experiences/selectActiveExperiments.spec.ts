import { generateMock } from '@anatine/zod-mock';
import {
  pickExperimentTraits,
  selectActiveExperiments,
} from './selectActiveExperiments';
import { ExperienceConfiguration } from '../../types/ExperienceDefinition';
import { Profile } from '../../types/Profile/Profile';
import { EXPERIENCE_TRAIT_PREFIX } from './constants';
const profile = { ...generateMock(Profile), audiences: ['audience1'] };
const experiences: ExperienceConfiguration[] = [
  {
    id: 'experience1',
    audience: {
      id: 'audience1',
    },
    trafficAllocation: 1,
    type: 'nt_personalization',
    distribution: [],
    components: [],
  },
  {
    id: 'experience2',
    audience: {
      id: 'audience1',
    },
    trafficAllocation: 1,
    type: 'nt_personalization',
    distribution: [],
    components: [],
  },
];
const experimentTraits = {
  [`${EXPERIENCE_TRAIT_PREFIX}${experiences[0].id}`]: true,
};
describe('selectActiveExperiments', () => {
  describe('pickExperimentTraits', () => {
    it('should return the active experiments for a profile', () => {
      const result = pickExperimentTraits({
        ...profile,
        traits: { ...profile.traits, ...experimentTraits },
      });
      expect(result).toEqual(experimentTraits);
    });
  });
  it('should return the active experiments for a profile', () => {
    const result = selectActiveExperiments(experiences, {
      ...profile,
      traits: { ...profile.traits, ...experimentTraits },
    });
    expect(result).toEqual([experiences[0]]);
  });
});
