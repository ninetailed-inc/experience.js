import { useContext } from 'react';
import { NinetailedInstance } from '@ninetailed/experience.js';
import { NinetailedContext } from './NinetailedContext';

export const useNinetailed = (): NinetailedInstance => {
  const ninetailed = useContext(NinetailedContext);

  if (ninetailed === undefined) {
    throw new Error(
      'The component using the the context must be a descendant of the NinetailedProvider'
    );
  }

  return ninetailed;
};
