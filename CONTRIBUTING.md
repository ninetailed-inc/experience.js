# Contributing to Experience.js

## Folder structure

- `packages/`: Experience.js is a NX monorepo containing Ninetailed SDKs and plugins. You can learn more about monorepo [here](https://nx.dev/getting-started/tutorials/package-based-repo-tutorial) and the packages/ structure.
  - `playgrounds/`: Testing projects to experiment with the SDKs and plugins with common frameworks such as gatsby, next.js, etc.
  - `plugins/`: contains plugins that can be used with the SDKs such as google analytics, preiew plugins, insights, etc.
  - `sdks/`: contains the Software Development Kits (SDKs) for js, node, and different frameworks such as React, Next, Gatsby, etc.
  - `utils/` contains utilities used by the tests, SDKs and plugins
- `tools/`: internal tooling

## Building the Project

After cloning the project to your machine, to install the dependencies, run:

```sh
yarn

yarn prepare
```

To build all the packages, run:

```sh
nx run-many --target=build
```

## Running Unit Tests

To make sure your changes do not break any unit tests or build, run the following:

```sh
nx affected --target=test

nx affected --target=build
```

### Running E2E tests (only for Ninetailed crew)

This step is only possible to be run by Ninetailed members. The CI will run it for you if you don't have access.

```sh
doppler login
doppler secrets download --no-file --format=env --project=experience-js-sdks --config=dev > ./.env
# https://nx.dev/recipes/tips-n-tricks/define-environment-variables
```

## Submitting a PR

Please follow the following guidelines:

- Make sure unit tests pass (`nx affected --target=test`)
- Make sure builds pass (`nx affected --target=build`)
- Make sure you run `nx format`
- Update documentation if needed
- Update your commit message to follow the guidelines below

### Commit Message Guidelines

Please follow the conventional commit convention: https://www.conventionalcommits.org/en/v1.0.0/
