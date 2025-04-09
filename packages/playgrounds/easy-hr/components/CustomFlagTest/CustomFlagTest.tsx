import React, { ReactNode, useEffect, useState } from 'react';
import { AllowedVariableType } from '@ninetailed/experience.js-shared';
import { useFlag, UseFlagOptions } from '@ninetailed/experience.js-next';

type FlagRenderProps<T extends AllowedVariableType> = {
  value: T;
  status: 'loading' | 'success' | 'error';
  error: Error | null;
};

type CustomFlagProps<T extends AllowedVariableType> = {
  flagKey: string;
  defaultValue: T;
  options?: UseFlagOptions;
  children: (props: FlagRenderProps<T>) => ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
};

/**
 * CustomFlag component that uses the useFlag hook to retrieve feature flags and
 * reacts to changes from both the normal Ninetailed SDK and the Preview widget.
 */
export function CustomFlag<T extends AllowedVariableType>({
  flagKey,
  defaultValue,
  options = {},
  children,
  fallback = null,
  loadingComponent = null,
  errorComponent = null,
}: CustomFlagProps<T>): React.ReactElement | null {
  // Get flag value from the useFlag hook
  const flagResult = useFlag<T>(flagKey, defaultValue, options);

  // State to track if we're in preview mode
  const [_, setIsInPreview] = useState(false);

  // State to track the direct preview value (if available)
  const [previewValue, setPreviewValue] = useState<T | null>(null);

  // Combined state that prioritizes preview values over normal flag values
  const [finalState, setFinalState] = useState<any>(flagResult);

  // Effect to detect preview mode and subscribe to preview changes
  useEffect(() => {
    // Check if we're in preview mode by looking for the preview plugin
    const hasPreviewPlugin = !!(
      typeof window !== 'undefined' && window.ninetailed?.plugins?.preview
    );

    setIsInPreview(hasPreviewPlugin);

    if (!hasPreviewPlugin) return;

    // Get the preview plugin instance
    const previewPlugin = window.ninetailed?.plugins?.preview;

    // Function to check for and get preview values
    const checkForPreviewValues = () => {
      // Skip if not in preview or no experienceId
      if (!previewPlugin || !options.experienceId) return;

      // Check if this variable is overridden in the preview
      const isOverridden = previewPlugin.isVariableOverridden(
        options.experienceId,
        flagKey
      );

      if (isOverridden) {
        // Get the preview value
        const value = previewPlugin.getVariableValue(
          options.experienceId,
          flagKey,
          options.variantIndex ?? 0
        ) as T;

        // Update our preview value
        setPreviewValue(value);
      } else {
        // Clear preview value if not overridden
        setPreviewValue(null);
      }
    };

    // Check for preview values immediately
    checkForPreviewValues();

    // Set up listener for changes in the preview
    const intervalId = setInterval(checkForPreviewValues, 200);

    return () => {
      clearInterval(intervalId);
    };
  }, [options.experienceId, options.variantIndex, flagKey]);

  // Effect to combine flag result with preview value
  useEffect(() => {
    if (previewValue !== null) {
      // If we have a preview value, prioritize it
      setFinalState({
        status: 'success',
        value: previewValue,
        error: null,
      });
    } else {
      // Otherwise, use the normal flag result
      setFinalState(flagResult);
    }
  }, [flagResult, previewValue]);

  // Handle loading state
  if (finalState.status === 'loading' && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  // Handle error state
  if (finalState.status === 'error' && errorComponent) {
    return <>{errorComponent}</>;
  }

  // If it's an error or loading without specific components, show fallback
  if (
    (finalState.status === 'error' || finalState.status === 'loading') &&
    fallback !== null
  ) {
    return <>{fallback}</>;
  }

  // Render the children with the combined flag value and status
  return <>{children(finalState)}</>;
}

// Add TypeScript declarations for global ninetailed object
declare global {
  interface Window {
    ninetailed?: {
      plugins?: {
        preview?: {
          isVariableOverridden: (experienceId: string, key: string) => boolean;
          getVariableValue: (
            experienceId: string,
            key: string,
            variantIndex: number
          ) => AllowedVariableType;
          experienceVariantIndexes: Record<string, number>;
        };
      };
    };
  }
}
