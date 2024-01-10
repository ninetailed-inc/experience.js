import { murmur3 } from 'murmurhash-js';

import { Profile } from '../../types/Profile/Profile';
import { ExperienceConfiguration } from '../../types/ExperienceDefinition';

const LOWER_BOUND = 0;
const UPPER_BOUND = 4294967295;

const normalize = (val: number, min: number, max: number): number =>
  (val - min) / (max - min);

const getRandom = (text: string) => {
  const hash = murmur3(text, 0);

  const random = normalize(hash, LOWER_BOUND, UPPER_BOUND);
  return random;
};

export const getTrafficRandom = (
  profile: Profile,
  experience: ExperienceConfiguration<any>
) => getRandom(`traffic-${experience.id}-${profile.stableId}`);

export const getDistributionRandom = (
  profile: Profile,
  experience: ExperienceConfiguration<any>
) => getRandom(`distribution-${experience.id}-${profile.stableId}`);
