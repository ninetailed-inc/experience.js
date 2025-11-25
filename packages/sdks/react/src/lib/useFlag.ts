import { useEffect } from 'react';
import { AllowedVariableType } from '@ninetailed/experience.js-shared';
import { useFlagWithManualTracking } from './useFlagWithManualTracking';

export type FlagResult<T> =
  | { status: 'loading'; value: T; error: null }
  | { status: 'success'; value: T; error: null }
  | { status: 'error'; value: T; error: Error };

type UseFlagOptions = {
  /**
   * Type for auto tracking
   *
   * @remarks
   * if this is a function then it should be stable, otherwise tracking will happen more frequently than expected
   */

  shouldAutoTrack?: boolean | (() => boolean);
};

/**
 * Hook to access a Ninetailed variable flag with built-in auto-tracking.
 *
 * @remarks
 * For manual control over tracking behavior, consider using {@link useFlagWithManualTracking}.
 */
export function useFlag<T extends AllowedVariableType>(
  flagKey: string,
  defaultValue: T,
  options: UseFlagOptions = {}
): FlagResult<T> {
  const [result, track] = useFlagWithManualTracking<T>(flagKey, defaultValue);

  useEffect(() => {
    const shouldAutoTrack =
      typeof options.shouldAutoTrack === 'function'
        ? options.shouldAutoTrack()
        : options.shouldAutoTrack !== false;

    if (result.status === 'success' && shouldAutoTrack) {
      track();
    }
  }, [result.status, track, options.shouldAutoTrack]);

  return result;
}
