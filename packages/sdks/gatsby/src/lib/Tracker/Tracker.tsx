import React from 'react';
import { useEffect, useRef } from 'react';
import { Location, LocationContext } from '@reach/router';

import { useNinetailed } from '@ninetailed/experience.js-react';
import { NinetailedInstance } from '@ninetailed/experience.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

type OnRouteChange = (
  routeInfo: { isInitialRoute: boolean; url: string },
  ninetailed: NinetailedInstance
) => void;

type ExecutorProps = LocationContext & {
  onRouteChange?: OnRouteChange;
};

const Executor: React.FC<React.PropsWithChildren<ExecutorProps>> = ({
  location,
  onRouteChange,
}) => {
  const ninetailed = useNinetailed();
  const previousHref = usePrevious(location.href);

  useEffect(() => {
    if (location.href !== previousHref) {
      if (typeof onRouteChange === 'function') {
        onRouteChange(
          { isInitialRoute: !previousHref, url: location.href },
          ninetailed
        );
      } else {
        ninetailed.page();
      }
    }
  }, [location.href, previousHref, ninetailed, onRouteChange]);

  return null;
};

type TrackerProps = {
  onRouteChange?: OnRouteChange;
};

export const Tracker: React.FC<TrackerProps> = ({ onRouteChange }) => {
  return (
    <Location>
      {(location) => <Executor {...location} onRouteChange={onRouteChange} />}
    </Location>
  );
};
