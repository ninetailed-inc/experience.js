import { useState, useEffect, useRef } from 'react';
import { ProfileState } from '@ninetailed/experience.js';
import { logger } from '@ninetailed/experience.js-shared';
import { isEqual } from 'radash';
import { useNinetailed } from './useNinetailed';

type UseProfileHookResult = Omit<ProfileState, 'experiences'> & {
  loading: boolean;
};

function formatProfileForHook(profile: ProfileState): UseProfileHookResult {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { experiences: _, ...profileStateWithoutExperiences } = profile;
  return {
    ...profileStateWithoutExperiences,
    loading: profile.status === 'loading',
  };
}

/**
 * Custom hook that provides access to the Ninetailed profile state
 * with the 'experiences' property removed to prevent unnecessary re-renders.
 *
 * This hook handles profile state changes efficiently by:
 * 1. Only updating state when actual changes occur
 * 2. Removing the large 'experiences' object from the state
 * 3. Properly cleaning up subscriptions when components unmount
 *
 * @returns The profile state without the 'experiences' property
 */
export const useProfile = (): UseProfileHookResult => {
  const ninetailed = useNinetailed();

  const [strippedProfileState, setStrippedProfileState] =
    useState<UseProfileHookResult>(
      formatProfileForHook(ninetailed.profileState)
    );

  // Reference to track the previous profile state for comparison
  const profileStateRef = useRef(ninetailed.profileState);

  useEffect(() => {
    const unsubscribe = ninetailed.onProfileChange((changedProfileState) => {
      // Skip update if the profile hasn't actually changed
      // Here we compare the entire profile including experiences and changes
      if (isEqual(changedProfileState, profileStateRef.current)) {
        logger.debug('Profile State Did Not Change', changedProfileState);
        return;
      }

      profileStateRef.current = changedProfileState;
      logger.debug('Profile State Changed', changedProfileState);

      setStrippedProfileState(formatProfileForHook(changedProfileState));
    });

    // Clean up subscription when component unmounts
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
        logger.debug('Unsubscribed from profile state changes');
      }
    };
  }, []);

  return strippedProfileState;
};
