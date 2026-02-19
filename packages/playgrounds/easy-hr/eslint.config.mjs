import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nxEslintPlugin from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';
import globals from 'globals';

export default [
  {
    ignores: ['**/dist'],
  },
  ...baseConfig,
  ...nxEslintPlugin.configs['flat/react-typescript'],
  ...nextCoreWebVitals,
  { languageOptions: { globals: { ...globals.jest } } },
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': [
        'error',
        'packages/playgrounds/easy-hr/pages',
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
  {
    ignores: ['.next/**/*'],
  },
];
