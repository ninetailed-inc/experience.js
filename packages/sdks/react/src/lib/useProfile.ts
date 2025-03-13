import { useState, useEffect, useRef } from 'react';
import { ProfileState } from '@ninetailed/experience.js';
import { logger } from '@ninetailed/experience.js-shared';
import { isEqual } from 'radash';
import { useNinetailed } from './useNinetailed';

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
export const useProfile = () => {
  // Get the Ninetailed instance
  const ninetailed = useNinetailed();

  // Extract initial state without experiences
  const { experiences, ...profileStateWithoutExperiences } =
    ninetailed.profileState;

  // State to hold the stripped profile state
  const [strippedProfileState, setStrippedProfileState] = useState<
    Omit<ProfileState, 'experiences'> & { loading: boolean }
  >({
    ...profileStateWithoutExperiences,
    loading: ninetailed.profileState.status === 'loading',
  });

  // Reference to track the previous profile state for comparison
  const profileStateRef = useRef(ninetailed.profileState);

  useEffect(() => {
    // Subscribe to profile changes
    const unsubscribe = ninetailed.onProfileChange((changedProfileState) => {
      // Skip update if the profile hasn't actually changed
      // Here we compare the entire profile including experiences and changes
      if (isEqual(changedProfileState, profileStateRef.current)) {
        logger.debug('Profile State Did Not Change', changedProfileState);
        return;
      }

      // Update the ref and log the change
      profileStateRef.current = changedProfileState;
      logger.debug('Profile State Changed', changedProfileState);

      // Extract everything except experiences and update state
      const { experiences, ...profileStateWithoutExperiences } =
        changedProfileState;
      setStrippedProfileState({
        ...profileStateWithoutExperiences,
        loading: changedProfileState.status === 'loading',
      });
    });

    // Clean up subscription when component unmounts
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
        logger.debug('Unsubscribed from profile state changes');
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return strippedProfileState;
};
