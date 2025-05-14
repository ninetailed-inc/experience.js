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

/**
 * Custom hook to retrieve a specific feature flag from Ninetailed changes.
 *
 * @param flagKey - The key of the feature flag to retrieve
 * @param defaultValue - The default value to use if the flag is not found
 * @returns An object containing the flag value and status information
 */
export function useFlag<T extends AllowedVariableType>(
  flagKey: string,
  defaultValue: T
): FlagResult<T> {
  const ninetailed = useNinetailed();

  const lastProcessedState = useRef<ChangesState | null>(null);
  const defaultValueRef = useRef<T>(defaultValue);
  const flagKeyRef = useRef<string>(flagKey);

  const [result, setResult] = useState<FlagResult<T>>({
    value: defaultValue,
    status: 'loading',
    error: null,
  });

  // Effect 1: Track changes to `flagKey` or `defaultValue`
  useEffect(() => {
    if (
      !isEqual(defaultValueRef.current, defaultValue) ||
      flagKeyRef.current !== flagKey
    ) {
      defaultValueRef.current = defaultValue;
      flagKeyRef.current = flagKey;
      setResult({
        value: defaultValue,
        status: 'loading',
        error: null,
      });
      lastProcessedState.current = null;
    }
  }, [flagKey, defaultValue]);

  // Effect 2: Handle Ninetailed changes
  useEffect(() => {
    const unsubscribe = ninetailed.onChangesChange((changesState) => {
      if (
        lastProcessedState.current &&
        isEqual(lastProcessedState.current, changesState)
      ) {
        return;
      }

      lastProcessedState.current = changesState;

      if (changesState.status === 'loading') {
        setResult({
          value: defaultValueRef.current,
          status: 'loading',
          error: null,
        });
        return;
      }

      if (changesState.status === 'error') {
        setResult({
          value: defaultValueRef.current,
          status: 'error',
          error: changesState.error,
        });
        return;
      }

      try {
        const change = changesState.changes.find(
          (change) => change.key === flagKeyRef.current
        );

        if (change && change.type === ChangeTypes.Variable) {
          setResult({
            value: change.value as unknown as T,
            status: 'success',
            error: null,
          });
        } else {
          setResult({
            value: defaultValueRef.current,
            status: 'success',
            error: null,
          });
        }
      } catch (error) {
        setResult({
          value: defaultValueRef.current,
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });

    return unsubscribe;
  }, [ninetailed]);

  return result;
}
