import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json' },
    },
  },
  {
    ignores: [
      "eslint.config.mjs",
      "jest.config.ts",
      "dist",
      "coverage",
      "node_modules",
    ]
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': ["off", { "args": "none" }],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
];