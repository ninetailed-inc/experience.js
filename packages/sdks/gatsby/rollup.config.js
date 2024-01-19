const nrwlConfig = require('@nx/react/plugins/bundle-rollup');
const path = require('path');
module.exports = (config) => {
  const nxConfig = nrwlConfig(config);
  return {
    ...nxConfig,
    input: {
      /**
       * Keep the main entry point given by the Nx config from the project.json
       */
      ...nxConfig.input,
      /**
       * With the leading path ("loaders/") we define and preserve the folder structure in the output bundle
       */
      'loaders/ninetailed-plugins': path.join(
        __dirname,
        'loaders',
        'ninetailed-plugins.js'
      ),
      /**
       * We define the gatsby config files as distinct entry points since they enclose their own dependencies and functionality and are independent of the main entry point ("index.cjs")
       */
      'gatsby-browser': path.join(__dirname, 'gatsby-browser.tsx'),
      'gatsby-node': path.join(__dirname, 'gatsby-node.tsx'),
      'gatsby-ssr': path.join(__dirname, 'gatsby-ssr.tsx'),
    },
    output: {
      ...nxConfig.output,
      chunkFileNames: '[name].js',
    },
  };
};
