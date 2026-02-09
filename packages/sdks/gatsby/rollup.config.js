const nrwlConfig = require('@nx/react/plugins/bundle-rollup');
const path = require('path');

function createEntryFileNames() {
  return (chunkInfo) => {
    /**
     * NX generates a main field in the package.json, in the pattern of `index.cjs.ts`
     * (checkout dist/packages/sdks/gatsby/index.cjs.js & dist/packages/sdks/gatsby/package.json)
     * For index, we need to preserve the [format] then.
     * For the other files: "gatsby-[ssr|node|browser].js" we need to discard the [format] part,
     * otherwise gatsby will not find them.
     */
    if (chunkInfo.name === 'index') {
      return '[name].[format].js';
    }
    return '[name].js';
  };
}

module.exports = (config) => {
  const nxConfig = nrwlConfig(config);
  const outputArray = Array.isArray(nxConfig.output)
    ? nxConfig.output
    : [nxConfig.output];
  const output = outputArray.map((o) => ({
    ...o,
    entryFileNames: createEntryFileNames(),
    chunkFileNames: '[name].js',
  }));

  const baseExternal = nxConfig.external;
  const isNinetailedPlugins = (id) =>
    id.includes('ninetailed-plugins') &&
    (id.includes('loaders') || id.endsWith('ninetailed-plugins.js'));

  return {
    ...nxConfig,
    external(id, ...rest) {
      if (isNinetailedPlugins(id)) return true;
      if (typeof baseExternal === 'function') return baseExternal(id, ...rest);
      if (Array.isArray(baseExternal)) return baseExternal.includes(id);
      return false;
    },
    input: {
      /**
       * Keep the main entry point given by the Nx config from the project.json
       */
      ...nxConfig.input,
      /**
       * loaders/ninetailed-plugins is NOT bundled as an entry; it is externalized so that
       * the consumer's webpack can run the loader on it and replace with { plugins, options }.
       * The loader file is copied to dist via project.json assets.
       */
      /**
       * We define the gatsby config files as distinct entry points since they enclose their own dependencies and functionality and are independent of the main entry point ("index.cjs")
       */
      'gatsby-browser': path.join(__dirname, 'gatsby-browser.tsx'),
      'gatsby-node': path.join(__dirname, 'gatsby-node.tsx'),
      'gatsby-ssr': path.join(__dirname, 'gatsby-ssr.tsx'),
    },
    output,
  };
};
