import { useState, useEffect } from 'react';
import { useNinetailed } from './useNinetailed';
import { logger } from '@ninetailed/experience.js-shared';

export type CustomFlagStatus = 'loading' | 'success' | 'error';

export interface CustomFlagOptions<T> {
  defaultValue?: T;
  fallback?: T;
}

export interface CustomFlagResult<T> {
  value: T | null;
  isLoading: boolean;
  status: CustomFlagStatus;
  error: Error | null;
}

export function useCustomFlag<T>(
  flagKey: string,
  options: CustomFlagOptions<T> = {}
): CustomFlagResult<T> {
  const { defaultValue, fallback } = options;
  const ninetailed = useNinetailed();
  const [result, setResult] = useState<CustomFlagResult<T>>({
    value: defaultValue || null,
    isLoading: true,
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    console.log(`[useCustomFlag] Initializing hook for flag: ${flagKey}`);

    const unsubscribe = ninetailed.onProfileChange((profileState) => {
      console.log(
        `[useCustomFlag] Profile state changed for flag: ${flagKey}`,
        profileState
      );

      if (profileState.status === 'loading') {
        console.log(`[useCustomFlag] Still loading flag: ${flagKey}`);
        return;
      }

      if (profileState.status === 'error') {
        console.log(
          `[useCustomFlag] Error loading flag: ${flagKey}`,
          profileState.error
        );
        setResult({
          value: fallback !== undefined ? fallback : defaultValue || null,
          isLoading: false,
          status: 'error',
          error: profileState.error,
        });
        return;
      }

      console.log(
        `[useCustomFlag] Profile loaded, looking for flag: ${flagKey}`
      );

      try {
        // Extract custom flag value from the changes array
        let flagValue: T | undefined = undefined;

        // Check if we have changes array in the profile state
        if (profileState.changes && Array.isArray(profileState.changes)) {
          // Find the change with our flag key
          const change = profileState.changes.find(
            (change) => change.key === flagKey
          );

          if (change && change.type === 'Variable') {
            flagValue = change.value as unknown as T;
            console.log(
              `[useCustomFlag] Found flag ${flagKey} with value:`,
              flagValue
            );
          }
        }

        setResult({
          value:
            flagValue !== undefined
              ? flagValue
              : fallback !== undefined
              ? fallback
              : defaultValue || null,
          isLoading: false,
          status: 'success',
          error: null,
        });

        console.log(
          `[useCustomFlag] Flag ${flagKey} processing complete. Final value:`,
          flagValue !== undefined
            ? flagValue
            : fallback !== undefined
            ? fallback
            : defaultValue || null
        );
      } catch (error) {
        console.error(
          `[useCustomFlag] Error extracting flag ${flagKey}:`,
          error
        );
        setResult({
          value: fallback !== undefined ? fallback : defaultValue || null,
          isLoading: false,
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });

    return unsubscribe;
  }, [flagKey, defaultValue, fallback, ninetailed]);

  return result;
}
