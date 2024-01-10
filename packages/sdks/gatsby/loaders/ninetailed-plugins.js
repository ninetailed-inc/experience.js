const loaderUtils = require(`loader-utils`);

/**
 * Loads a generated file allowing to require given ninetailed plugins.
 * This approach prevents a webpack require context warning in case the plugins are loaded in gatsby-ssr/browser.
 *
 * ```js
 * module.exports = {
 *   plugins: [require('some-plugin'), require('some-other-plugin')]
 * }
 * ```
 */
module.exports = function () {
  const options = loaderUtils.getOptions(this);
  const pluginRequires = !options.plugins
    ? `[]`
    : `[` +
      options.plugins
        .map(
          (plugin) =>
            `{PluginCtor: require("${
              plugin.resolve ? plugin.resolve : plugin
            }").default, options: ${JSON.stringify(plugin.options)}}`
        )
        .join(`,`) +
      `]`;
  return `module.exports = {plugins: ${pluginRequires}, options: ${JSON.stringify(
    options
  )}}`;
};
