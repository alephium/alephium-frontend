// See https://github.com/byCedric/expo-monorepo-example/blob/main/apps/mobile/metro.config.js
const { FileStore } = require('metro-cache')
// See https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
const path = require('path')

const { getSentryExpoConfig } = require('@sentry/react-native/metro')
// Find the project and workspace directories
const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')
const config = getSentryExpoConfig(projectRoot)

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot]
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules')
]

// Use turborepo to restore the cache when possible
config.cacheStores = [new FileStore({ root: path.join(projectRoot, 'node_modules', '.cache', 'metro') })]

config.transformer.minifierConfig = {
  compress: {
    // The option below removes all console logs statements in production.
    drop_console: true
  }
}

module.exports = config
