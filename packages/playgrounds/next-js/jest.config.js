module.exports = {
  displayName: 'playgrounds-next-js',
  preset: '../../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/packages/playgrounds/next-js',
  setupFilesAfterEnv: ['<rootDir>/../../../jest.setup.ts'],
  testEnvironment: 'jsdom',
};
