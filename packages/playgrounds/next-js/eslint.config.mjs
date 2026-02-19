import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nxEslintPlugin from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';
import globals from 'globals';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['**/dist'],
  },
  ...baseConfig,
  ...nxEslintPlugin.configs['flat/react-typescript'],
  ...nextCoreWebVitals,
  { languageOptions: { globals: { ...globals.jest } } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': [
        'error',
        'packages/playgrounds/next-js/pages',
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  ...compat
    .config({
      plugins: ['jest'],
      extends: [
        'plugin:testing-library/react',
        'plugin:jest-dom/recommended',
        'plugin:jest/recommended',
      ],
      settings: {
        jest: {
          version: 27,
        },
      },
    })
    .map((config) => ({
      ...config,
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      rules: {
        ...config.rules,
      },
    })),
  {
    ignores: ['**/.next/**'],
  },
];
