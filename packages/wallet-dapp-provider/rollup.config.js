import { createRequire } from 'node:module'

import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild, { minify } from 'rollup-plugin-esbuild'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

/**
 * @param {import('rollup').RollupOptions} config
 * @returns {import('rollup').RollupOptions}
 */
const bundle = (config) => ({
  ...config,
  input: 'src/index.ts'
})

/**
 * Plugin used to generate a json containing the UMD code
 * for use with the react-native-webview package
 * @returns {import('rollup').Plugin}
 */
function UMDtoJSON() {
  return {
    name: 'UMDtoJSON',
    renderChunk(code, chunk, options) {
      if (options.format === 'umd') {
        return {
          code: JSON.stringify({ code })
        }
      }
    }
  }
}

export default [
  bundle({
    // minify() must run before UMDtoJSON(): both are renderChunk hooks and esbuild cannot parse the JSON wrapper.
    // Its target must match esbuild()'s so minification cannot raise the syntax floor for older WebViews.
    plugins: [resolve({ preferBuiltins: false }), commonjs(), esbuild(), minify({ target: 'es2020' }), UMDtoJSON()],
    output: [
      {
        file: pkg.main,
        format: 'cjs'
      },
      {
        file: pkg.module,
        format: 'es'
      },
      {
        name: 'AlephiumWalletProvider',
        // This UMD bundle is wrapped as JSON for in-app WebView injection in the mobile wallet. It is not a browser
        // build, so it is intentionally not exposed via package.json's "browser" field/condition. The mobile wallet
        // imports it through the explicit "./lib/provider.umd.json" export subpath instead.
        file: 'lib/provider.umd.json',
        format: 'umd'
      }
    ]
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: pkg.types,
      format: 'es'
    }
  })
]
