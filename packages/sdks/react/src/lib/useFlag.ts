import { useEffect, useState, useRef } from 'react';
import {
  AllowedVariableType,
  ChangeTypes,
} from '@ninetailed/experience.js-shared';
import { ChangesState } from '@ninetailed/experience.js';
import { isEqual } from 'radash';
import { useNinetailed } from './useNinetailed';

export type FlagResult<T> =
  | { status: 'loading'; value: T; error: null }
  | { status: 'success'; value: T; error: null }
  | { status: 'error'; value: T; error: Error };

export type UseFlagOptions = {
  experienceId?: string;
  variantIndex?: number;
};

/**
 * Custom hook to retrieve a specific feature flag from Ninetailed changes.
 *
 * @param flagKey - The key of the feature flag to retrieve
 * @param defaultValue - The default value to use if the flag is not found
 * @param options - Optional object containing experienceId and variantIndex
 * @returns An object containing the flag value and status information
 */
export function useFlag<T extends AllowedVariableType>(
  flagKey: string,
  defaultValue: T,
  options: UseFlagOptions = {}
): FlagResult<T> {
  const { experienceId, variantIndex } = options;
  const ninetailed = useNinetailed();

  const lastProcessedState = useRef<ChangesState | null>(null);

  const [result, setResult] = useState<FlagResult<T>>({
    value: defaultValue,
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    // Reset state when dependencies change
    setResult({
      value: defaultValue,
      status: 'loading',
      error: null,
    });
    lastProcessedState.current = null;

    const unsubscribe = ninetailed.onChangesChange((changesState) => {
      if (
        lastProcessedState.current &&
        isEqual(lastProcessedState.current, changesState)
      ) {
        return;
      }

      lastProcessedState.current = changesState;

      if (changesState.status === 'loading') {
        // Don't use a function updater here to avoid type issues
        setResult({
          value: defaultValue,
          status: 'loading',
          error: null,
        });
        return;
      }

      if (changesState.status === 'error') {
        setResult({
          value: defaultValue,
          status: 'error',
          error: changesState.error,
        });
        return;
      }

      try {
        let change = null;

        if (experienceId !== undefined && variantIndex !== undefined) {
          change = changesState.changes.find(
            (c) =>
              c.key === flagKey &&
              c.type === ChangeTypes.Variable &&
              c.meta?.experienceId === experienceId &&
              c.meta?.variantIndex === variantIndex
          );
        }

        if (!change && experienceId !== undefined) {
          change = changesState.changes.find(
            (c) =>
              c.key === flagKey &&
              c.type === ChangeTypes.Variable &&
              c.meta?.experienceId === experienceId
          );
        }

        if (!change) {
          change = changesState.changes.find(
            (c) => c.key === flagKey && c.type === ChangeTypes.Variable
          );
        }

        if (change && change.type === ChangeTypes.Variable) {
          const flagValue = change.value as unknown as T;

          setResult({
            value: flagValue,
            status: 'success',
            error: null,
          });
        } else {
          setResult({
            value: defaultValue,
            status: 'success',
            error: null,
          });
        }
      } catch (error) {
        setResult({
          value: defaultValue,
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });

    return unsubscribe;
  }, [ninetailed, flagKey, defaultValue, experienceId, variantIndex]);

  return result;
}
