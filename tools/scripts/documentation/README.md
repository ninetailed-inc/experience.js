# Generating documentation

In this repository, we use a `README` generation script (`generate-documentation.ts`) to maintain standardization and essence across all project `README.md` files within our publishable package directories (`packages/sdks` and `packages/plugins`).

This script replaces content within `<!--Insert template begin-->` and `<!--Insert template end-->` markers of each `README.md` file, with a specific template content defined in `README-content.tmpl.md`.

It also replaces content within `<!--Insert badges begin-->` and `<!--Insert badges end-->` markers of each `README.md` file, with a list of badges from badge.io defined in `README-npm-badges.tmpl.md`.

## How to Use the Script

You can run this script using Node.js. Here's how:

1. Install dependencies.

```sh
yarn
```

2. Run the script using `npm run generate:doc`.

```sh
yarn generate:doc
```

This script will do the following:

- Find all `README.md` files in `packages/sdks` and `packages/plugins`.
- Read and store the content from `README-content.tmpl.md`.
- Read and store the content from `README-npm-badges.tmpl.md`.
- Insert template content into each of the `README.md` files.
