import { Profile } from '../../types/Profile/Profile';
import {
  ExperienceConfiguration,
  Reference,
} from '../../types/ExperienceDefinition';
import { EXPERIENCE_TRAIT_PREFIX } from './constants';

export const pickExperimentTraits = (profile: Profile) => {
  const experimentTraits: Record<string, boolean> = {};
  for (const key in profile.traits) {
    if (
      key.startsWith(EXPERIENCE_TRAIT_PREFIX) &&
      typeof profile.traits[key] === 'boolean' &&
      profile.traits[key] === true
    ) {
      experimentTraits[key] = profile.traits[key] as boolean;
    }
  }

  return experimentTraits;
};

export const selectActiveExperiments = <Variant extends Reference>(
  experiments: ExperienceConfiguration<Variant>[],
  profile: Profile
) => {
  const experimentTraits = pickExperimentTraits(profile);

  const experimentTraitsIds = Object.keys(experimentTraits).map((id) =>
    id.replace(EXPERIENCE_TRAIT_PREFIX, '')
  );

  const activeExperiments = experiments.filter((experiment) =>
    experimentTraitsIds.includes(experiment.id)
  );

  return activeExperiments;
};
