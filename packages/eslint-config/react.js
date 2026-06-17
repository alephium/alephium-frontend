const react = require('eslint-plugin-react')
const reactCompiler = require('eslint-plugin-react-compiler')
const reactHooks = require('eslint-plugin-react-hooks')
const tseslint = require('typescript-eslint')

const base = require('./base')

// Flat-config equivalent of the former `.eslintrc` React config. Spreads the base
// config and layers on the React rules. The two `react/*-react` rules being turned
// off reproduce `plugin:react/jsx-runtime` (the automatic JSX runtime).
module.exports = tseslint.config(...base, {
  files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.tsx'],
  plugins: {
    react,
    'react-hooks': reactHooks,
    'react-compiler': reactCompiler
  },
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true }
    },
    globals: {
      React: 'readonly',
      JSX: 'readonly'
    }
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-useless-fragment': 'warn',
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'jsx-quotes': [2, 'prefer-double'],
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react-compiler/react-compiler': 'warn'
  }
})
