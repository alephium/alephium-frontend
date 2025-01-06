const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: {
    alephium: './dist/index.js'
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({ filename: '[file].map' }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ],
  resolve: {
    extensions: ['.js'],
    fallback: {
      fs: false,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer/'),
      path: require.resolve('path-browserify')
    }
  },
  output: {
    filename: 'alephium.min.js',
    library: {
      name: 'alephium',
      type: 'umd'
    }
  },
  optimization: {
    minimize: true
  }
}
