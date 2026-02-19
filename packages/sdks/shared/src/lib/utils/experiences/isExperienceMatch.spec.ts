import { generateMock } from '@anatine/zod-mock';
import { Profile } from '../../types/Profile/Profile';
import { ExperienceConfiguration } from '../../types/ExperienceDefinition';
import { isExperienceMatch } from './isExperienceMatch';
const profile = { ...generateMock(Profile), audiences: ['audience1'] };
const experience: ExperienceConfiguration = {
  id: 'experience1',
  audience: {
    id: 'audience1',
  },
  trafficAllocation: 1,
  type: 'nt_personalization',
  distribution: [],
  components: [],
};
describe('isExperienceMatch', () => {
  it('should return true if the profile has a matching audience', () => {
    const result = isExperienceMatch({
      experience,
      profile,
    });
    expect(result).toBe(true);
  });
  it('should return false if the profile does not have a matching audience', () => {
    const result = isExperienceMatch({
      experience: { ...experience, audience: { id: 'audience2' } },
      profile,
    });
    expect(result).toBe(false);
  });
  it('should return false if the user is not in an active audience and has no matching audience', () => {
    const result = isExperienceMatch({
      experience,
      profile: { ...profile, audiences: ['audience2'] },
    });
    expect(result).toBe(false);
  });
  it('should return false if the user is not in the traffic allocation range', () => {
    const result = isExperienceMatch({
      experience: { ...experience, trafficAllocation: 0 },
      profile,
    });
    expect(result).toBe(false);
  });
});
