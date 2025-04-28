import React from 'react';
import { WrapRootElementNodeArgs } from 'gatsby';
import { NinetailedProvider } from '@ninetailed/experience.js-react';

import { PluginOptions } from './plugin-options';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { plugins as ninetailedPlugins } from './loaders/ninetailed-plugins';

export const wrapRootElement = (
  args: WrapRootElementNodeArgs,
  options: PluginOptions
) => {
  const resolvedPlugins = ninetailedPlugins.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ PluginCtor, options }: { PluginCtor: any; options: any }) =>
      new PluginCtor(options)
  );
  const { element } = args;

  return (
    <NinetailedProvider {...options} plugins={resolvedPlugins}>
      {element}
    </NinetailedProvider>
  );
};
