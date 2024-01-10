import { useContext } from 'react';

import { NinetailedContext } from './NinetailedContext';

export const useNinetailed = () => {
  const ninetailed = useContext(NinetailedContext);

  if (ninetailed === undefined) {
    throw new Error(
      'The component using the the context must be a descendant of the NinetailedProvider'
    );
  }

  return ninetailed;
};
