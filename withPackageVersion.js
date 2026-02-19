const path = require('path');

const replace = require('@rollup/plugin-replace');

require('dotenv').config({
  path: path.join(__dirname, '.env.local'),
});

const withPackageVersion = (config) => {
  if (!process.env.NX_PUBLIC_PACKAGE_VERSION) {
    throw new Error('NX_PUBLIC_PACKAGE_VERSION is not set');
  }

  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      replace({
        "process.env['NX_PUBLIC_PACKAGE_VERSION']": JSON.stringify(
          process.env.NX_PUBLIC_PACKAGE_VERSION
        ),
        delimiters: ['', ''],
        preventAssignment: true,
      }),
    ],
  };
};

module.exports = withPackageVersion;
