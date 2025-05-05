import React from 'react';
import { WrapRootElementBrowserArgs } from 'gatsby';
import { Ninetailed } from '@ninetailed/experience.js';
import { NinetailedProvider } from '@ninetailed/experience.js-react';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';

import { Tracker } from './src/lib/Tracker';
import {
  PluginOptions,
  ResolvedPlugin,
  ResolvedPreviewPluginOptions,
} from './plugin-options';

import {
  // ignoring typescipt here is okay, as these type can't be detected properly
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  plugins as ninetailedPlugins,
  // ignoring typescipt here is okay, as these type can't be detected properly
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  options,
  // ignoring typescipt here is okay, as these type can't be detected properly
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
} from './loaders/ninetailed-plugins';
import { deserializePluginOptionFunctions } from './utils/deserialize';

let ninetailed: Ninetailed;

const isSerializedPreviewPlugin = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any | undefined
): options is ResolvedPreviewPluginOptions => {
  return !!(
    options &&
    options.customOptions &&
    options.serializedFunctionNames &&
    options.customOptions.serializedFunctionNames
  );
};

const WrapRootElement: React.FC<React.PropsWithChildren<PluginOptions>> = ({
  children,
}) => {
  const { onRouteChange, ...functions } =
    deserializePluginOptionFunctions(options);

  if (!ninetailed) {
    const resolvedPlugins = ninetailedPlugins.map(
      ({ PluginCtor, options }: ResolvedPlugin) => {
        if (isSerializedPreviewPlugin(options)) {
          const updatedOptions = {
            ...options,
            ...deserializePluginOptionFunctions(options),
            customOptions: {
              ...options.customOptions,
              ...deserializePluginOptionFunctions(options.customOptions),
            },
          };

          return new PluginCtor(updatedOptions);
        }
        if (options) {
          return new PluginCtor(options);
        }
        return new PluginCtor();
      }
    ) as NinetailedPlugin[];

    const {
      clientId,
      environment,
      preview,
      url,
      locale,
      requestTimeout,
      useSDKEvaluation,
    } = options;

    ninetailed = new Ninetailed(
      { clientId, environment, preview },
      {
        url,
        plugins: resolvedPlugins,
        locale,
        requestTimeout,
        useSDKEvaluation,
        ...functions,
      }
    );
  }

  return (
    <NinetailedProvider ninetailed={ninetailed}>
      <Tracker onRouteChange={onRouteChange} />
      {children}
    </NinetailedProvider>
  );
};

export const wrapRootElement = (
  args: WrapRootElementBrowserArgs,
  options: PluginOptions
) => {
  const { element } = args;

  return <WrapRootElement {...options}>{element}</WrapRootElement>;
};
