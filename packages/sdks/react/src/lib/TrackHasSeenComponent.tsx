import React, { useEffect, useState, useRef } from 'react';
import { isBrowser } from '@ninetailed/experience.js-shared';

import { useNinetailed } from './useNinetailed';
import { Variant } from './Variant';

type TrackHasSeenComponentProps = {
  variant: Variant<any>;
  audience: { id: string };
  isPersonalized: boolean;
};

export const TrackHasSeenComponent: React.FC<
  React.PropsWithChildren<TrackHasSeenComponentProps>
> = ({ children, variant, audience, isPersonalized }) => {
  const ninetailed = useNinetailed();
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);

        // Disconnect the observer since we only want to track
        // the first time the component is seen
        observer.disconnect();
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isBrowser() && inView) {
      ninetailed.trackHasSeenComponent({
        variant,
        audience,
        isPersonalized,
      });
    }
  }, [inView]);
  return (
    <>
      <div ref={ref} />
      {children}
    </>
  );
};
