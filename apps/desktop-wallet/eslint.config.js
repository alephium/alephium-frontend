const pluginQuery = require('@tanstack/eslint-plugin-query')
const react = require('@alephium/eslint-config/react')

module.exports = [
  ...react,
  ...pluginQuery.configs['flat/recommended'],
  { ignores: ['build/**', 'dist/**', 'dist-electron/**', 'coverage/**'] }
]
