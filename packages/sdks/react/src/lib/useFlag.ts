import { useEffect, useState, useRef } from 'react';
import {
  AllowedVariableType,
  ChangeTypes,
  logger,
} from '@ninetailed/experience.js-shared';
import { useNinetailed } from './useNinetailed';
import { ChangesState } from '@ninetailed/experience.js';

export type ChangeStatus = 'loading' | 'success' | 'error';

export interface ChangeResult<T> {
  value: T;
  isLoading: boolean;
  status: ChangeStatus;
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
): ChangeResult<T> {
  const ninetailed = useNinetailed();

  const lastProcessedState = useRef<ChangesState | null>(null);

  const [result, setResult] = useState<ChangeResult<T>>({
    value: defaultValue,
    isLoading: true,
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    const unsubscribe = ninetailed.onChangesChange((changesState) => {
      if (
        lastProcessedState.current &&
        lastProcessedState.current.status === changesState.status &&
        lastProcessedState.current.changes === changesState.changes &&
        lastProcessedState.current.error === changesState.error
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
