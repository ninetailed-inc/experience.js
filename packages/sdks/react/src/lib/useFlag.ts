import { useEffect, useState, useRef } from 'react';
import {
  AllowedVariableType,
  ChangeTypes,
  logger,
} from '@ninetailed/experience.js-shared';
import { ChangesState } from '@ninetailed/experience.js';
import { isEqual } from 'radash';
import { useNinetailed } from './useNinetailed';

export type FlagStatus = 'loading' | 'success' | 'error';

export interface FlagResult<T> {
  value: T;
  isLoading: boolean;
  status: FlagStatus;
  error: Error | null;
}

/**
 * Custom hook to retrieve a specific feature flag from Ninetailed changes.
 *
 * @param flagKey - The key of the feature flag to retrieve
 * @param defaultValue - The default value to use if the flag is not found
 * @returns An object containing the flag value and metadata about the request
 */
export function useFlag<T extends AllowedVariableType>(
  flagKey: string,
  defaultValue: T
): FlagResult<T> {
  const ninetailed = useNinetailed();

  const lastProcessedState = useRef<ChangesState | null>(null);

  const [result, setResult] = useState<FlagResult<T>>({
    value: defaultValue,
    isLoading: true,
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    setResult({
      value: defaultValue,
      isLoading: true,
      status: 'loading',
      error: null,
    });
    lastProcessedState.current = null;

    const unsubscribe = ninetailed.onChangesChange((changesState) => {
      if (
        lastProcessedState.current &&
        isEqual(lastProcessedState.current, changesState)
      ) {
        logger.debug('Change State Did Not Change', changesState);
        return;
      }

      lastProcessedState.current = changesState;

      if (changesState.status === 'loading') {
        setResult((current) => ({
          ...current,
          isLoading: true,
          status: 'loading',
        }));
        return;
      }

      if (changesState.status === 'error') {
        setResult({
          value: defaultValue,
          isLoading: false,
          status: 'error',
          error: changesState.error,
        });
        return;
      }

      try {
        // Find the change with our flag key
        const change = changesState.changes.find(
          (change) => change.key === flagKey
        );

        if (change && change.type === ChangeTypes.Variable) {
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
      } catch (error) {
        setResult({
          value: defaultValue,
          isLoading: false,
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });

    return unsubscribe;
  }, [ninetailed, flagKey, defaultValue]);

  return result;
}
