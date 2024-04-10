const nrwlConfig = require('@nx/react/plugins/bundle-rollup');
const replace = require('@rollup/plugin-replace');
require('dotenv').config({ path: '../../../.env.local' });

module.exports = (config) => {
  if (!process.env.NX_PACKAGE_VERSION) {
    throw new Error('NX_PACKAGE_VERSION is not set');
  }

  const nxConfig = nrwlConfig(config);
  return {
    ...nxConfig,
    plugins: [
      ...nxConfig.plugins,
      replace({
        "process.env['NX_PACKAGE_VERSION']": JSON.stringify(
          process.env.NX_PACKAGE_VERSION
        ),
        delimiters: ['', ''],
        preventAssignment: true,
      }),
    ],
  };
};
