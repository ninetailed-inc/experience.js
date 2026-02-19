import nxEslintPlugin from '@nx/eslint-plugin';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: [
      '**/dist',
      '**/.next/**',
      '**/eslint.config.mjs',
      'pnpm-lock.yaml',
    ],
  },
  ...nxEslintPlugin.configs['flat/base'],
  ...nxEslintPlugin.configs['flat/typescript'],
  ...nxEslintPlugin.configs['flat/javascript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      'prettier/prettier': ['error'],
    },
  },
];
