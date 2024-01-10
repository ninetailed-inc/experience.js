import type { PluginOptions as GatsbyPluginOptions } from 'gatsby';
import type { NinetailedProviderInstantiationProps } from '@ninetailed/experience.js-react';

export type PluginOptions = GatsbyPluginOptions &
  NinetailedProviderInstantiationProps & {
    ninetailedPlugins?: {
      resolve: string;
      options: unknown;
    }[];
  };

export type SerializedFunctions = {
  serializedFunctionNames: string[];
};

type PreviewPluginCustomOptions = {
  audienceQuery: string;
  audienceMapper: string;
  experienceQuery: string;
  experienceMapper: string;
};

export type NinetailedPreviewPluginOptions = Record<string, unknown> & {
  customOptions: PreviewPluginCustomOptions & SerializedFunctions;
};

export type NinetailedPluginOptions =
  | Record<string, unknown>
  | NinetailedPreviewPluginOptions;

export type ResolvedPreviewPluginOptions = Record<string, unknown> &
  SerializedFunctions & {
    customOptions: PreviewPluginCustomOptions & SerializedFunctions;
  };

export type ResolvedPluginOptions =
  | Record<string, unknown>
  | ResolvedPreviewPluginOptions;

export type ResolvedPlugin = {
  PluginCtor: any;
  options?: ResolvedPluginOptions;
};
