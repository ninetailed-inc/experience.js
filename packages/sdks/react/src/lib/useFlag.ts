import { useEffect, useState, useRef } from 'react';
import {
  AllowedVariableType,
  ChangeTypes,
  logger,
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
 * @param experienceId - Optional experienceId to filter changes by experience
 * @param variantIndex - Optional variantIndex to filter by specific variant
 * @returns An object containing the flag value and status information
 */
export function useFlag<T extends AllowedVariableType>(
  flagKey: string,
  defaultValue: T,
  experienceId?: string,
  variantIndex?: number
): FlagResult<T> {
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

    function processChanges(changesState: ChangesState) {
      if (
        lastProcessedState.current &&
        isEqual(lastProcessedState.current, changesState)
      ) {
        logger.debug('Change State Did Not Change', changesState);
        return;
      }

      lastProcessedState.current = changesState;

      if (changesState.status === 'loading') {
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
        // Find the change with our flag key and optional experience/variant filters
        const change = changesState.changes.find(
          (change) =>
            change.key === flagKey &&
            change.type === ChangeTypes.Variable &&
            (experienceId
              ? change.meta?.experienceId === experienceId
              : true) &&
            (variantIndex !== undefined
              ? change.meta?.variantIndex === variantIndex
              : true)
        );

        console.log(`Processing flag ${flagKey}:`, { change, changesState });

        if (change && change.type === ChangeTypes.Variable) {
          const flagValue = change.value as unknown as T;
          setResult({
            value: flagValue,
            status: 'success',
            error: null,
          });
        } else {
          // Flag not found or wrong type, use default
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
    }

    // Listen for the custom event from the preview plugin
    const handlePreviewChanges = (event: CustomEvent) => {
      if (event.detail && event.detail.changes) {
        console.log(`Flag ${flagKey}: Received variable change event`);

        const changesState: ChangesState = {
          status: 'success',
          changes: event.detail.changes,
          error: null,
        };

        processChanges(changesState);
      }
    };

    window.addEventListener(
      'ninetailed:variable:change',
      handlePreviewChanges as EventListener
    );

    const unsubscribeChanges = ninetailed.onChangesChange((changesState) => {
      processChanges(changesState);
    });

    return () => {
      unsubscribeChanges();
      window.removeEventListener(
        'ninetailed:variable:change',
        handlePreviewChanges as EventListener
      );
    };
  }, [ninetailed, flagKey, defaultValue, experienceId, variantIndex]);

  return result;
}
