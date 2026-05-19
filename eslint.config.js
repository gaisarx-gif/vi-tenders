// Vision-OS — ESLint flat config (ESLint 9 + typescript-eslint 8 + React 19)
// Run with:  npm run lint        (errors only)
//            npm run lint:fix    (auto-fix what's safe)

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.vite/**',
      '*.config.js',
      '*.config.ts',
      'package-lock.json',
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended (non-type-checked is faster; flip to recommendedTypeChecked later)
  ...tseslint.configs.recommended,

  // React + hooks
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: '19.0' },
    },
    rules: {
      // React
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // not needed with new JSX transform
      'react/prop-types': 'off', // we use TypeScript
      'react/no-unescaped-entities': 'warn',

      // TypeScript — pragmatic settings for an in-progress codebase
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',

      // General
      'no-console': 'off', // server uses console; we'll migrate to winston later
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: ['warn', 'always', { null: 'ignore' }],
    },
  },

  // Server-side overrides
  {
    files: ['server/**/*.ts', 'server.ts', 'scripts/**/*.ts', 'test-admin.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // Server doesn't render React
      'react/react-in-jsx-scope': 'off',
    },
  },

  // Test overrides
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'vitest.setup.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
