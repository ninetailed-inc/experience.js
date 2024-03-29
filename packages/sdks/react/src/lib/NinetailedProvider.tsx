import React, { useMemo } from 'react';
import {
  Ninetailed,
  NinetailedPlugin,
  OnInitProfileId,
  Storage,
} from '@ninetailed/experience.js';
import {
  Profile,
  Locale,
  OnErrorHandler,
  OnLogHandler,
  NinetailedRequestContext,
} from '@ninetailed/experience.js-shared';

import { NinetailedContext } from './NinetailedContext';

export type NinetailedProviderInstantiationProps = {
  clientId: string;
  environment?: string;

  preview?: boolean;
  url?: string;
  plugins?: (NinetailedPlugin | NinetailedPlugin[])[];
  locale?: Locale;
  requestTimeout?: number;
  onLog?: OnLogHandler;
  onError?: OnErrorHandler;
  componentViewTrackingThreshold?: number;
  buildClientContext?: () => NinetailedRequestContext;
  onInitProfileId?: OnInitProfileId;
  storageImpl?: Storage;
};

export type NinetailedProviderProps =
  | NinetailedProviderInstantiationProps
  | { ninetailed: Ninetailed };

export const NinetailedProvider = (
  props: React.PropsWithChildren<NinetailedProviderProps>
) => {
  const ninetailed = useMemo(() => {
    if ('ninetailed' in props) {
      return props.ninetailed;
    }

    const {
      clientId,
      environment,
      preview,
      url,
      locale,
      requestTimeout,
      plugins = [],
      onLog,
      onError,
      buildClientContext,
      onInitProfileId,
      componentViewTrackingThreshold,
      storageImpl,
    } = props;

    return new Ninetailed(
      { clientId, environment, preview },
      {
        url,
        plugins,
        locale,
        requestTimeout,
        onLog,
        onError,
        buildClientContext,
        onInitProfileId,
        componentViewTrackingThreshold,
        storageImpl,
      }
    );
  }, []);

  const { children } = props;

  return (
    <NinetailedContext.Provider value={ninetailed}>
      {children}
    </NinetailedContext.Provider>
  );
};
