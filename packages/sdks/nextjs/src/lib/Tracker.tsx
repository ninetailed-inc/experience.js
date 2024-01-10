import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { logger } from '@ninetailed/experience.js-shared';
import { useNinetailed } from '@ninetailed/experience.js-react';

type TrackerProps = {
  isFirstPageviewAlreadyTracked: boolean;
};

export const Tracker: React.FC<React.PropsWithChildren<TrackerProps>> = ({
  isFirstPageviewAlreadyTracked,
}) => {
  const router = useRouter();
  const { page } = useNinetailed();
  const lastFiredPageRef = useRef(
    isFirstPageviewAlreadyTracked ? 'tracked' : 'none'
  );

  useEffect(() => {
    logger.debug(
      'Ninetailed Next.js Tracker',
      'The useEffect hook to listen for route changes got called. On instantiation the last fired page is:',
      lastFiredPageRef.current
    );

    const handleRouteChange = (url: string) => {
      const isPageAlreadyTracked =
        lastFiredPageRef.current === url ||
        lastFiredPageRef.current === 'tracked';
      logger.debug(
        'Ninetailed Next.js Tracker',
        'Handle route change got called.',
        {
          url,
          lastFiredPageUrl: lastFiredPageRef.current,
          isPageAlreadyTracked,
        }
      );

      if (!isPageAlreadyTracked) {
        logger.debug(
          'Ninetailed Next.js Tracker',
          'Page is not tracked yet, calling the ninetailed.page function.'
        );
        page();
        logger.debug(
          'Ninetailed Next.js Tracker',
          'Page got tracked, setting the last fired page to the current url.',
          url
        );
        lastFiredPageRef.current = url;
      }
    };

    handleRouteChange(router.asPath);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      logger.debug(
        'Ninetailed Next.js Tracker',
        'Removing the route change listener, as the useEffect hook got unmounted.'
      );
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  return null;
};
