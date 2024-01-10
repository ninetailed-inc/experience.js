import React, { forwardRef, useEffect, useRef } from 'react';

import { useNinetailed } from '../useNinetailed';

export const ComponentMarker = forwardRef((_, ref) => {
  const { logger } = useNinetailed();
  const markerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    /*
    Due to React's limitation on setting !important styles during rendering, we set the display property on the DOM element directly.
    See: https://github.com/facebook/react/issues/1881
    */
    markerRef.current?.style.setProperty('display', 'none', 'important');
  }, []);

  useEffect(() => {
    logger.debug(
      'Using fallback mechanism to detect when experiences are seen. This can lead to inaccurate results. Consider using a forwardRef instead. See: https://docs.ninetailed.io/for-developers/experience-sdk/rendering-experiences#tracking-impressions-of-experiences'
    );
  }, [logger]);

  useEffect(() => {
    if (markerRef.current) {
      const nextSibling = markerRef.current.nextSibling;
      if (ref) {
        if (typeof ref === 'function') {
          ref(nextSibling);
        } else {
          ref.current = nextSibling;
        }
      }
    }
  }, []);

  return (
    <div
      className="nt-cmp-marker"
      style={{ display: 'none' }}
      ref={markerRef}
    />
  );
});
