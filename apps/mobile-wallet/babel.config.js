module.exports = function (api) {
  const isProduction = api.env('production')
  api.cache.using(() => process.env.NODE_ENV)
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ...(isProduction ? ['transform-remove-console'] : []),
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '~': './src'
          }
        },
      ]
    ]
  }
}
