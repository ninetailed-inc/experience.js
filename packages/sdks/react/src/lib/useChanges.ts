import { useEffect, useState, useRef } from 'react';
import {
  AllowedVariableType,
  ChangeTypes,
} from '@ninetailed/experience.js-shared';
import { useProfile } from './useProfile';

export type ChangeStatus = 'loading' | 'success' | 'error';

export interface ChangeResult<T> {
  value: T;
  isLoading: boolean;
  status: ChangeStatus;
  error: Error | null;
}

/**
 * Custom hook to retrieve a specific feature flag from the Ninetailed profile.
 *
 * @param flagKey - The key of the feature flag to retrieve
 * @param defaultValue - The default value to use if the flag is not found
 * @returns An object containing the flag value and metadata about the request
 */
export function useChanges<T extends AllowedVariableType>(
  flagKey: string,
  defaultValue: T
): ChangeResult<T> {
  // Get the profile state from the useProfile hook
  const profileState = useProfile();

  console.log('useChanges', {
    flagKey,
    defaultValue,
    profileState,
  });

  // Track the last processed profile state to avoid unnecessary updates
  // we are using typeof profileState because profileState has experience omitted
  const lastProcessedState = useRef<typeof profileState | null>(null);

  // Set up state for the flag result
  const [result, setResult] = useState<ChangeResult<T>>({
    value: defaultValue,
    isLoading: profileState.status === 'loading',
    status: profileState.status === 'loading' ? 'loading' : 'success',
    error: null,
  });

  useEffect(() => {
    // Skip processing if the profile state hasn't changed
    if (lastProcessedState.current === profileState) {
      return;
    }

    // Update our reference to the current profile state
    lastProcessedState.current = profileState;

    // Handle loading state
    if (profileState.status === 'loading') {
      setResult((current) => ({
        ...current,
        isLoading: true,
        status: 'loading',
      }));
      return;
    }

    // Handle error state
    if (profileState.status === 'error') {
      setResult({
        value: defaultValue,
        isLoading: false,
        status: 'error',
        error: profileState.error,
      });
      return;
    }

    // Process the flag value
    try {
      // Check if we have changes array in the profile state
      if (profileState.changes && Array.isArray(profileState.changes)) {
        // Find the change with our flag key
        const change = profileState.changes.find(
          (change) => change.key === flagKey
        );

        if (change && change.type === ChangeTypes.Variable) {
          // Flag found with the right type
          const flagValue = change.value as unknown as T;
          console.log('Found flag value', { flagKey, flagValue });
          setResult({
            value: flagValue,
            isLoading: false,
            status: 'success',
            error: null,
          });
        } else {
          // Flag not found or wrong type, use default
          console.log('Flag not found or wrong type, using default', {
            flagKey,
            defaultValue,
          });
          setResult({
            value: defaultValue,
            isLoading: false,
            status: 'success',
            error: null,
          });
        }
      } else {
        // No changes array, use default
        console.log('No changes array, using default', {
          flagKey,
          defaultValue,
        });
        setResult({
          value: defaultValue,
          isLoading: false,
          status: 'success',
          error: null,
        });
      }
    } catch (error) {
      console.log('Error in useChanges', {
        flagKey,
        defaultValue,
        profileState,
        error,
      });
      // Handle any errors during processing
      setResult({
        value: defaultValue,
        isLoading: false,
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [profileState, flagKey, defaultValue]);

  return result;
}
