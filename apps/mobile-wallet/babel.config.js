module.exports = function (api) {
  const isProduction = api.env('production')
  api.cache.using(() => process.env.NODE_ENV)

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // @formatjs/intl-* polyfills (loaded in shim.ts) ship `static {}` class blocks, which
      // babel-preset-expo does not transform for node_modules. Required since the Expo 55 / RN
      // 0.83 Babel bump or Metro fails to parse them and the JS bundle won't build (white screen).
      '@babel/plugin-transform-class-static-block',
      ...(isProduction ? ['transform-remove-console'] : []),
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '~': './src'
          }
        }
      ]
    ]
  }
}
