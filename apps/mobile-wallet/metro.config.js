// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
// See https://github.com/byCedric/expo-monorepo-example/blob/main/apps/mobile/metro.config.js
const { FileStore } = require('metro-cache')

// See https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
const path = require('path')
// Find the project and workspace directories
const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')
const config = getDefaultConfig(projectRoot)

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot]
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules')
]
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
// TODO: Remove this after updating to Expo 50
config.resolver.disableHierarchicalLookup = true

// Use turborepo to restore the cache when possible
config.cacheStores = [new FileStore({ root: path.join(projectRoot, 'node_modules', '.cache', 'metro') })]

module.exports = config
