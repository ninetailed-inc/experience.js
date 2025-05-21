import type { Profile } from '../../types/Profile/Profile';
import { ExperienceConfiguration } from '../../types/ExperienceDefinition';
import { logger } from '../../logger/Logger';
import { getTrafficRandom } from './random';

type IsExperienceMatchArgs = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  experience: ExperienceConfiguration<any>;
  profile: Profile;
};

export const isExperienceMatch = ({
  experience,
  profile,
}: IsExperienceMatchArgs): boolean => {
  const trafficRandom = getTrafficRandom(profile, experience);

  logger.info(
    `The traffic random factor for experience ${experience.id} is ${trafficRandom}. It's traffic allocation is set to ${experience.trafficAllocation}.`
  );

  const isInTrafficRange = experience.trafficAllocation > trafficRandom;
  const matchesAudience =
    !experience.audience || profile.audiences.includes(experience.audience.id);

  logger.info(
    `Is the profile in traffic allocation range? ${
      isInTrafficRange ? 'yes' : 'no'
    }.\n
      Does the profile match the audience of the experience? ${
        matchesAudience ? 'yes' : 'no'
      }.\n`
  );

  return isInTrafficRange && matchesAudience;
};
