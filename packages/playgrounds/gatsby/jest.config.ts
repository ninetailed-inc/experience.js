export default {
  displayName: "playgrounds-gatsby",
  preset: "../../../jest.preset.js",
  transform: {
    "^.+\\.[tj]sx?$": [
      "babel-jest",
      { cwd: __dirname, configFile: "./babel-jest.config.json" },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../../coverage/packages/playgrounds/gatsby",
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/__mocks__/cssMock.js",
    "@reach/router": "<rootDir>/__mocks__/moduleMock.js",
  },
  testEnvironment: "jsdom",
}
