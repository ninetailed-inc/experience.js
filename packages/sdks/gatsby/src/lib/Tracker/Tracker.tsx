import React from 'react';
import { useEffect, useRef } from 'react';
import { Location, LocationContext } from '@reach/router';

import { useNinetailed } from '@ninetailed/experience.js-react';

const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const Executor: React.FC<React.PropsWithChildren<LocationContext>> = ({
  location,
}) => {
  const { page } = useNinetailed();
  const previousPathname = usePrevious(location);
  const pathname = location.pathname;

  useEffect(() => {
    if (pathname !== previousPathname) {
      page();
    }
  }, [pathname, previousPathname, page]);

  return null;
};

export const Tracker = () => {
  return <Location>{(location) => <Executor {...location} />}</Location>;
};
