module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'turbo'
  ],
  plugins: ['@typescript-eslint', 'prettier', 'unused-imports', 'simple-import-sort'],
  rules: {
    'arrow-body-style': [2, 'as-needed'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'no-use-before-define': 'off',
    'unused-imports/no-unused-imports-ts': 'warn',
    'simple-import-sort/imports': 'warn',
    'no-duplicate-imports': 'warn',
    quotes: [1, 'single', { avoidEscape: true }],
    '@typescript-eslint/member-delimiter-style': [
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
  },
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true
  }
}
