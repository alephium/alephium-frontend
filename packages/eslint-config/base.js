const js = require('@eslint/js')
const stylistic = require('@stylistic/eslint-plugin')
const importX = require('eslint-plugin-import-x')
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
    'import-x': importX,
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
    // Catch "phantom" dependencies: modules imported but not declared in the
    // package's own package.json. They resolve only because nodeLinker is
    // hoisted (see pnpm-workspace.yaml), so without this the dependency lists
    // silently rot. peerDependencies are allowed (shared libs import them).
    'import-x/no-extraneous-dependencies': ['error', { peerDependencies: true }],
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
    // Options come from .prettierrc.js. Setting them inline here too makes them drift from
    // what `pnpm format` uses.
    'prettier/prettier': 'error',
    'turbo/no-undeclared-env-vars': 'error'
  }
})
