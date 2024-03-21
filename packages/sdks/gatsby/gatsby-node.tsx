import {
  CreatePagesArgs,
  CreateWebpackConfigArgs,
  PluginOptionsSchemaArgs,
} from 'gatsby';
import { ObjectSchema } from 'gatsby-plugin-utils';
import path from 'path';
import omit from 'lodash/omit';

import {
  NinetailedPluginOptions,
  NinetailedPreviewPluginOptions,
  PluginOptions,
} from './plugin-options';
import { serializePluginOptionFunctions } from './utils/serialize';

export const pluginOptionsSchema = ({
  Joi,
}: PluginOptionsSchemaArgs): ObjectSchema<any> => {
  return Joi.object({
    clientId: Joi.string()
      .required()
      .description("Your organizations' client id.")
      .messages({
        'any.required':
          '"clientId" needs to be specified. Get your clientId from the dashboard.',
      }),
    environment: Joi.string(),
    ninetailedPlugins: Joi.array(),
    useClientSideEvaluation: Joi.boolean().optional().default(false),
    onInitProfileId: Joi.function().optional(),
    onRouteChange: Joi.function().optional(),
  });
};

/**
 * Add the webpack config for loading MDX files
 */
export const onCreateWebpackConfig = (
  { loaders, actions }: CreateWebpackConfigArgs,
  pluginOptions: PluginOptions
) => {
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        path: false,
        crypto: false,
      },
    },
    module: {
      rules: [
        {
          test: /ninetailed-plugins\.js$/,
          include: __dirname,
          use: [
            loaders.js(),
            {
              loader: path.join(__dirname, `loaders`, `ninetailed-plugins`),
              options: {
                ...omit(pluginOptions, ['ninetailedPlugins']),
                plugins: pluginOptions.ninetailedPlugins,
              },
            },
          ],
        },
      ],
    },
  });
};

export const createPages = async ({
  actions,
  store,
  graphql,
}: CreatePagesArgs) => {
  const ninetailedGatsbyPlugin = store
    .getState()
    .flattenedPlugins.find(
      (plugin: { name: string }) =>
        plugin.name === '@ninetailed/experience.js-gatsby'
    );

  if (!ninetailedGatsbyPlugin) {
    return;
  }

  const pluginOptions = ninetailedGatsbyPlugin.pluginOptions || {};
  const { ninetailedPlugins = [] } = pluginOptions;

  const ninetailedPreviewPlugin = ninetailedPlugins.find(
    (plugin: unknown & { name: string }) =>
      plugin.name === '@ninetailed/experience.js-plugin-preview'
  );

  const { setPluginStatus } = actions;

  if (!ninetailedPreviewPlugin) {
    const { serializedOptionFunctions, serializedOptionFunctionNames } =
      serializePluginOptionFunctions(ninetailedGatsbyPlugin.pluginOptions);

    ninetailedGatsbyPlugin.pluginOptions = {
      ...ninetailedGatsbyPlugin.pluginOptions,
      ...serializedOptionFunctions,
      serializedFunctionNames: serializedOptionFunctionNames,
    };

    setPluginStatus(
      { pluginOptions: ninetailedGatsbyPlugin.pluginOptions },
      ninetailedGatsbyPlugin
    );

    return;
  }

  if (
    typeof ninetailedPreviewPlugin.options !== 'object' ||
    typeof ninetailedPreviewPlugin.options.customOptions !== 'object'
  ) {
    throw new Error(
      'CustomOptions not found. CustomOptions are mandatory and need to be set in the preview plugin options.'
    );
  }

  const { audienceQuery, experienceQuery, audienceMapper, experienceMapper } =
    ninetailedPreviewPlugin.options.customOptions;

  const audienceOptionsSet = audienceQuery && audienceMapper;
  const experienceOptionsSet = experienceQuery && experienceMapper;

  const passThroughReturn = {
    errors: null,
    data: null,
  };

  if (!audienceOptionsSet) {
    console.warn(
      'No audience query or mapper found. Please provide both to process audience data.'
    );
  }

  const { errors: audienceErrors, data: audienceData } = audienceOptionsSet
    ? await graphql(audienceQuery)
    : passThroughReturn;

  if (!experienceOptionsSet) {
    console.warn(
      'No experience query or mapper found. Please provide both to process experience data.'
    );
  }

  const { errors: experienceErrors, data: experienceData } =
    experienceOptionsSet ? await graphql(experienceQuery) : passThroughReturn;

  if (audienceErrors) {
    throw new Error(
      'Failed to query audience data. Check query configuration or data retrieval by the source plugin.'
    );
  }
  const audiences = audienceOptionsSet ? audienceMapper(audienceData) : [];

  if (experienceErrors) {
    throw new Error(
      'Failed to query experience data. Check query configuration or data retrieval by the source plugin.'
    );
  }
  const experiences = experienceOptionsSet
    ? experienceMapper(experienceData)
    : [];

  const ninetailedPluginsOverride =
    ninetailedGatsbyPlugin.pluginOptions.ninetailedPlugins.map(
      (plugin: { name: string; options?: NinetailedPluginOptions }) => {
        const pluginOptions = plugin.options;

        if (!pluginOptions) {
          return plugin;
        }

        if (plugin.name === '@ninetailed/experience.js-plugin-preview') {
          const pluginOptions =
            plugin.options as NinetailedPreviewPluginOptions;

          const {
            serializedOptionFunctions,
            serializedOptionFunctionNames,
            serializedCustomOptionFunctions,
            serializedCustomOptionFunctionNames,
          } = serializePluginOptionFunctions(pluginOptions);

          return {
            ...plugin,
            options: {
              ...pluginOptions,
              ...serializedOptionFunctions,
              serializedFunctionNames: serializedOptionFunctionNames,
              customOptions: {
                ...pluginOptions.customOptions,
                ...serializedCustomOptionFunctions,
                serializedFunctionNames: serializedCustomOptionFunctionNames,
              },
              audiences,
              experiences,
            },
          };
        }

        return {
          ...plugin,
          options: {
            ...plugin.options,
          },
        };
      }
    );

  const { serializedOptionFunctions, serializedOptionFunctionNames } =
    serializePluginOptionFunctions(ninetailedGatsbyPlugin.pluginOptions);

  ninetailedGatsbyPlugin.pluginOptions = {
    ...ninetailedGatsbyPlugin.pluginOptions,
    ...serializedOptionFunctions,
    serializedFunctionNames: serializedOptionFunctionNames,
    ninetailedPlugins: ninetailedPluginsOverride,
  };

  setPluginStatus(
    { pluginOptions: ninetailedGatsbyPlugin.pluginOptions },
    ninetailedGatsbyPlugin
  );
};
