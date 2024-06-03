const nrwlConfig = require('@nx/react/plugins/bundle-rollup');
const withPackageVersion = require('../../../withPackageVersion');

module.exports = (config) => {
  return withPackageVersion(nrwlConfig(config));
};
