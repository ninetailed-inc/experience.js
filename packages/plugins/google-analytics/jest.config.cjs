module.exports = {
  displayName: 'plugins-google-analytics',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/plugins/google-analytics',
};
