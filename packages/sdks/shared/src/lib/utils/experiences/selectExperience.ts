import {
  ExperienceConfiguration,
  Reference,
} from '../../types/ExperienceDefinition';
import { Profile } from '../../types/Profile/Profile';

import { isExperienceMatch } from './isExperienceMatch';

type SelectExprienceArgs<Variant extends Reference> = {
  experiences: ExperienceConfiguration<Variant>[];
  profile: Profile;
};

export const selectExperience = <Variant extends Reference>({
  experiences,
  profile,
}: SelectExprienceArgs<Variant>): ExperienceConfiguration<Variant> | null => {
  const selectedExperience = experiences.find((experience) =>
    isExperienceMatch({ experience, profile })
  );

  return selectedExperience ?? null;
};
