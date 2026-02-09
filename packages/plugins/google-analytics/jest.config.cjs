module.exports = {
  displayName: 'plugins-google-analytics',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2022',
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/plugins/google-analytics',
};
