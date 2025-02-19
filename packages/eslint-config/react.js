const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

module.exports = {
  extends: ['plugin:react/jsx-runtime'],
  plugins: ['react', 'react-hooks', 'eslint-plugin-react-compiler'],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-useless-fragment': 'warn',
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'jsx-quotes': [2, 'prefer-double'],
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
    'react-compiler/react-compiler': 'warn'
  },
  parserOptions: {
    project
  },
  globals: {
    React: true,
    JSX: true
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect'
    },
    'import/resolver': {
      typescript: {
        project
      }
    }
  }
}
