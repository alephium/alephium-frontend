// See https://github.com/byCedric/expo-monorepo-example/blob/main/apps/mobile/metro.config.js
const { FileStore } = require('metro-cache')
// See https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
const path = require('path')

const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const { resolve } = require('metro-resolver')
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

// 1) Use WalletConnect's ESM build so it prefers global WebSocket.
// 2) Resolve 'ws' to its browser stub so the Node ws (and its http/https/net/tls/url deps) are never loaded.
//    The ESM build still has require("ws") in a fallback; in RN global WebSocket exists so that path isn't used.
const defaultResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@walletconnect/jsonrpc-ws-connection') {
    return resolve(
      { ...context, resolveRequest: resolve },
      '@walletconnect/jsonrpc-ws-connection/dist/index.es.js',
      platform
    )
  }
  if (moduleName === 'ws') {
    return resolve({ ...context, resolveRequest: resolve }, 'ws/browser.js', platform)
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform)
  }
  return resolve(context, moduleName, platform)
}

// Polyfill Node core modules used by other deps (e.g. axios, crypto). Not needed for ws when aliased above.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('react-native-quick-crypto'),
  stream: require.resolve('readable-stream'),
  events: require.resolve('events')
}

module.exports = config
