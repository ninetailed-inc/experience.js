import { useContext } from 'react';

import { NinetailedContext } from './NinetailedContext';
import { Reference } from '@ninetailed/experience.js-shared';
import { NinetailedInstance } from '@ninetailed/experience.js';

export const useNinetailed = <
  TBaseline extends Reference = Reference,
  TVariant extends Reference = Reference
>(): NinetailedInstance<TBaseline, TVariant> => {
  const ninetailed = useContext(NinetailedContext);

  if (ninetailed === undefined) {
    throw new Error(
      'The component using the the context must be a descendant of the NinetailedProvider'
    );
  }

  return ninetailed as unknown as NinetailedInstance<TBaseline, TVariant>;
};
