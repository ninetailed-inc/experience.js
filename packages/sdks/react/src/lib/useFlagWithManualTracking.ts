import {
  AllowedVariableType,
  Change,
  ChangeTypes,
} from '@ninetailed/experience.js-shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNinetailed } from './useNinetailed';
import { ChangesState } from '@ninetailed/experience.js';
import { isEqual } from 'radash';

export type FlagResult<T> =
  | { status: 'loading'; value: T; error: null }
  | { status: 'success'; value: T; error: null }
  | { status: 'error'; value: T; error: Error };

export type FlagResultWithTracking<T> = [FlagResult<T>, () => void];

type VariableChange = Extract<Change, { type: ChangeTypes.Variable }>;

/**
 * Hook to access a Ninetailed variable flag with manual tracking control.
 */
export function useFlagWithManualTracking<T extends AllowedVariableType>(
  flagKey: string,
  defaultValue: T
): FlagResultWithTracking<T> {
  const ninetailed = useNinetailed();

  const flagKeyRef = useRef(flagKey);
  const defaultValueRef = useRef(defaultValue);
  const lastProcessedState = useRef<ChangesState | null>(null);
  const changeRef = useRef<VariableChange | null>(null);

  const [result, setResult] = useState<FlagResult<T>>({
    value: defaultValue,
    status: 'loading',
    error: null,
  });

  // Reset if inputs change
  useEffect(() => {
    if (
      !isEqual(defaultValueRef.current, defaultValue) ||
      flagKeyRef.current !== flagKey
    ) {
      defaultValueRef.current = defaultValue;
      flagKeyRef.current = flagKey;
      lastProcessedState.current = null;
      changeRef.current = null;

      setResult({
        value: defaultValue,
        status: 'loading',
        error: null,
      });
    }
  }, [flagKey, defaultValue]);

  // Listen for personalization state changes
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

      // Find relevant change for this flag
      const change = changesState.changes.find(
        (c): c is VariableChange =>
          c.key === flagKeyRef.current && c.type === ChangeTypes.Variable
      );

      if (change) {
        changeRef.current = change;

        const rawValue = change.value;

        const actualValue =
          rawValue &&
          typeof rawValue === 'object' &&
          rawValue !== null &&
          'value' in rawValue &&
          typeof (rawValue as Record<string, unknown>)['value'] === 'object'
            ? (rawValue as Record<string, unknown>)['value']
            : rawValue;

        setResult({
          value: actualValue as T,
          status: 'success',
          error: null,
        });
      } else {
        changeRef.current = null;

        setResult({
          value: defaultValueRef.current,
          status: 'success',
          error: null,
        });
      }
    });

    return unsubscribe;
  }, [ninetailed]);

  // Manual tracking function
  const track = useCallback(() => {
    const change = changeRef.current;
    if (!change) return;

    ninetailed.trackVariableComponentView({
      variable: change.value,
      variant: { id: `Variable-${flagKeyRef.current}` },
      componentType: 'Variable',
      variantIndex: change.meta.variantIndex,
      experienceId: change.meta.experienceId,
    });
  }, [ninetailed]);

  return [result, track];
}
