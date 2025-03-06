import { useEffect, useState, useRef } from 'react';
import { AllowedVariableType } from '@ninetailed/experience.js-shared';
import { useProfile } from './useProfile';

export type CustomFlagStatus = 'loading' | 'success' | 'error';

export interface CustomFlagResult<T> {
  value: T;
  isLoading: boolean;
  status: CustomFlagStatus;
  error: Error | null;
}

/**
 * Custom hook to retrieve a specific feature flag from the Ninetailed profile.
 *
 * @param flagKey - The key of the feature flag to retrieve
 * @param defaultValue - The default value to use if the flag is not found
 * @returns An object containing the flag value and metadata about the request
 */
export function useCustomFlag<T extends AllowedVariableType>(
  flagKey: string,
  defaultValue: T
): CustomFlagResult<T> {
  // Get the profile state from the useProfile hook
  const profileState = useProfile();

  // Track the last processed profile state to avoid unnecessary updates
  // we are using typeof profileState because profileState has experience omitted
  const lastProcessedState = useRef<typeof profileState | null>(null);

  // Set up state for the flag result
  const [result, setResult] = useState<CustomFlagResult<T>>({
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

        if (change && change.type === 'Variable') {
          // Flag found with the right type
          const flagValue = change.value as unknown as T;
          setResult({
            value: flagValue,
            isLoading: false,
            status: 'success',
            error: null,
          });
        } else {
          // Flag not found or wrong type, use default
          setResult({
            value: defaultValue,
            isLoading: false,
            status: 'success',
            error: null,
          });
        }
      } else {
        // No changes array, use default
        setResult({
          value: defaultValue,
          isLoading: false,
          status: 'success',
          error: null,
        });
      }
    } catch (error) {
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
