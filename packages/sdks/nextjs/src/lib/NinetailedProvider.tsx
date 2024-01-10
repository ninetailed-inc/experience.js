import React from 'react';
import {
  NinetailedProvider as ReactNinetailedProvider,
  NinetailedProviderProps,
} from '@ninetailed/experience.js-react';

import { Tracker } from './Tracker';

export const NinetailedProvider: React.FC<
  React.PropsWithChildren<NinetailedProviderProps>
> = ({ children, ...props }) => {
  return (
    <ReactNinetailedProvider {...props}>
      <Tracker isFirstPageviewAlreadyTracked={false} />
      {children}
    </ReactNinetailedProvider>
  );
};
