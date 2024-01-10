import { useState, useEffect, useRef } from 'react';
import { ProfileState } from '@ninetailed/experience.js';
import { logger } from '@ninetailed/experience.js-shared';
import { isEqual } from 'radash';

import { useNinetailed } from './useNinetailed';

export const useProfile = () => {
  const ninetailed = useNinetailed();
  const [profileState, setProfileState] = useState<ProfileState>(
    ninetailed.profileState
  );
  const profileStateRef = useRef({});

  /**
   * This effect compares the old and new profile state before updating it.
   * We use a ref to avoid an infinite loop which can happen when an empty profile state was updated with no changes.
   * This behaviour occurred as the validation handling on the error property was not set properly in the "CreateProfile" and "UpdateProfile" endpoint types.
   * Furthermore, it was also observed, that it "only" occurred when the preview plugin was used in parallel.
   */
  useEffect(() => {
    ninetailed.onProfileChange((profileState) => {
      if (isEqual(profileState, profileStateRef.current)) {
        logger.debug('Profile State Did Not Change', profileState);
        return;
      } else {
        setProfileState(profileState);
        profileStateRef.current = profileState;
        logger.debug('Profile State Changed', profileState);
      }
    });
  }, []);

  const { experiences, ...profileStateWithoutExperiences } = profileState;

  return {
    ...profileStateWithoutExperiences,
    loading: profileState.status === 'loading',
  };
};
