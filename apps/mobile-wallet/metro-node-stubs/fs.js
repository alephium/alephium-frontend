/**
 * Stub for Node's `fs` when bundling `@alephium/web3/dist/src/*` (see metro.config.js).
 * The CJS build pulls `require("fs")` for `Contract.fromArtifactFile` / `Script.fromArtifactFile` only; the mobile
 * wallet does not use those entry points at runtime.
 */
module.exports = {
  promises: {
    readFile: async () => {
      throw new Error(
        'fs is not available in React Native (Contract.fromArtifactFile / Script.fromArtifactFile are unsupported on device)'
      )
    }
  }
}
