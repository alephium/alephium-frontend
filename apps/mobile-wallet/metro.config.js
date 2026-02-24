// See https://github.com/byCedric/expo-monorepo-example/blob/main/apps/mobile/metro.config.js
const { FileStore } = require('metro-cache')
// See https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
const path = require('path')

const { getSentryExpoConfig } = require('@sentry/react-native/metro')
// const { resolve } = require('metro-resolver')
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

// TODO: Remove this when we update the dependencies
// https://github.com/expo/expo/issues/36375#issuecomment-2845231862
// config.resolver.unstable_enablePackageExports = false

// Force axios to use the browser build in React Native (avoids Node's crypto, http, etc.)
// Axios 1.13+ has a "react-native" export condition but we have package exports disabled above.
// const defaultResolveRequest = config.resolver.resolveRequest
// config.resolver.resolveRequest = (context, moduleName, platform) => {
//   if (moduleName === 'axios') {
//     // Use built-in resolve with context that points to itself to avoid re-entering this custom resolver
//     return resolve(
//       { ...context, resolveRequest: resolve },
//       'axios/dist/browser/axios.cjs',
//       platform
//     )
//   }
//   if (defaultResolveRequest) {
//     return defaultResolveRequest(context, moduleName, platform)
//   }
//   return resolve(context, moduleName, platform)
// }

module.exports = config
