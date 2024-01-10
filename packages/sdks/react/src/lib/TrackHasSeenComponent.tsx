import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
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
  const { ref, inView } = useInView({ triggerOnce: true });

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
