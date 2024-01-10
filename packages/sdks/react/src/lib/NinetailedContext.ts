import { createContext } from 'react';
import { NinetailedInstance } from '@ninetailed/experience.js';

export const NinetailedContext = createContext<NinetailedInstance | undefined>(
  undefined
);
