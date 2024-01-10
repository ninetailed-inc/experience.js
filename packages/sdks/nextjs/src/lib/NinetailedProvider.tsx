import React from 'react';
import {
  NinetailedProvider as ReactNinetailedProvider,
  NinetailedProviderProps,
} from '@ninetailed/experience.js-react';

import { OnRouteChange, Tracker } from './Tracker';

export const NinetailedProvider: React.FC<
  React.PropsWithChildren<
    NinetailedProviderProps & { onRouteChange?: OnRouteChange }
  >
> = ({ children, ...props }) => {
  const { onRouteChange, ...providerProps } = props;

  return (
    <ReactNinetailedProvider {...providerProps}>
      <Tracker onRouteChange={onRouteChange} />
      {children}
    </ReactNinetailedProvider>
  );
};
