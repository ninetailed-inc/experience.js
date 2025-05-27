import { useEffect, useState, useRef } from 'react';
import {
  AllowedVariableType,
  ChangeTypes,
  ComponentTypeEnum,
} from '@ninetailed/experience.js-shared';
import { ChangesState } from '@ninetailed/experience.js';
import { isEqual } from 'radash';
import { useNinetailed } from './useNinetailed';

export type FlagResult<T> =
  | { status: 'loading'; value: T; error: null }
  | { status: 'success'; value: T; error: null }
  | { status: 'error'; value: T; error: Error };

type ShouldTrackHook = () => boolean;

export enum ComponentViewEventComponentType {
  Entry = 'Entry',
  Variable = 'Variable',
}

/**
 * Hook to access a Ninetailed variable flag with built-in tracking.
 */
export function useFlag<T extends AllowedVariableType>(
  flagKey: string,
  defaultValue: T,
  shouldTrackHook?: ShouldTrackHook
): FlagResult<T> {
  const ninetailed = useNinetailed();

  const lastProcessedState = useRef<ChangesState | null>(null);
  const defaultValueRef = useRef<T>(defaultValue);
  const flagKeyRef = useRef<string>(flagKey);
  const trackedFlagsRef = useRef<Set<string>>(new Set());

  const [result, setResult] = useState<FlagResult<T>>({
    value: defaultValue,
    status: 'loading',
    error: null,
  });

  // Reset state when inputs change
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

  // Handle changes
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

          // Track view once per key unless hook disables it
          const key = flagKeyRef.current;
          const shouldTrack = shouldTrackHook ? shouldTrackHook() : true;

          if (shouldTrack && !trackedFlagsRef.current.has(key)) {
            ninetailed.trackVariableComponentView({
              variable: change.value,
              variant: { id: `Variable-${key}` },
              componentType: ComponentTypeEnum.Variable,
              variantIndex: change.meta.variantIndex,
              experienceId: change.meta.experienceId,
            });
            trackedFlagsRef.current.add(key);
          }
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
  }, [ninetailed, shouldTrackHook]);

  return result;
}
