const js = require('@eslint/js')
const stylistic = require('@stylistic/eslint-plugin')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const simpleImportSort = require('eslint-plugin-simple-import-sort')
const turbo = require('eslint-plugin-turbo')
const unusedImports = require('eslint-plugin-unused-imports')
const globals = require('globals')
const tseslint = require('typescript-eslint')

const TS_FILES = ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.tsx']

// Flat-config equivalent of the former `.eslintrc` base config. The `files` scope
// replaces the per-package `--ext .ts(,.tsx)` CLI flags, which no longer exist in
// ESLint 9, so only TypeScript files are linted.
module.exports = tseslint.config({
  files: TS_FILES,
  extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierRecommended],
  plugins: {
    '@stylistic': stylistic,
    'simple-import-sort': simpleImportSort,
    turbo,
    'unused-imports': unusedImports
  },
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node
    }
  },
  // ESLint 9's flat config defaults this to 'warn'; the previous (eslintrc) setup
  // left it off, so keep it off to preserve behavior.
  linterOptions: {
    reportUnusedDisableDirectives: 'off'
  },
  rules: {
    'arrow-body-style': [2, 'as-needed'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // `caughtErrors: 'none'` restores the typescript-eslint v6 default (v8 changed it
    // to 'all'). The rules below are off to preserve the prior rule set: they are new
    // additions to typescript-eslint v8's `recommended` config.
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'no-use-before-define': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'simple-import-sort/imports': 'warn',
    'no-duplicate-imports': 'warn',
    quotes: [1, 'single', { avoidEscape: true }],
    '@stylistic/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none', // 'none' or 'semi' or 'comma'
          requireLast: true
        },
        singleline: {
          delimiter: 'semi', // 'semi' or 'comma'
          requireLast: false
        }
      }
    ],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto'
      }
    ],
    'turbo/no-undeclared-env-vars': 'error'
  }
})
