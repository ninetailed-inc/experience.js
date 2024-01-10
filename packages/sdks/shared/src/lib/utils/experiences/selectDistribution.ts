import {
  Distribution,
  ExperienceConfiguration,
  Reference,
} from '../../types/ExperienceDefinition';
import { Profile } from '../../types/Profile/Profile';
import { logger } from '../../logger/Logger';
import { getDistributionRandom } from './random';

type SelectDistributionArgs<Variant extends Reference> = {
  experience: ExperienceConfiguration<Variant>;
  profile: Profile;
};

export const selectDistribution = <Variant extends Reference>({
  experience,
  profile,
}: SelectDistributionArgs<Variant>): Distribution => {
  const distributionRandom = getDistributionRandom(profile, experience);

  logger.log(
    `The distribution random factor for experience ${
      experience.id
    } is ${distributionRandom}. It's distribution is set to ${JSON.stringify(
      experience.distribution,
      null,
      2
    )}.`
  );

  const distribution = experience.distribution.find(
    ({ start, end }) => distributionRandom >= start && distributionRandom <= end // this overlaps on one value for each boundary but we just find the first match
  );

  if (!distribution) {
    return { index: 0, start: 0, end: 1 };
  }

  return distribution;
};
