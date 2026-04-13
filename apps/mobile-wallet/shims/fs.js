// Empty shim for Node's fs module.
// @alephium/web3's contract.ts has a dynamic import('fs') for file-based
// contract loading. Metro resolves all imports statically, so we need this
// shim. The code path is never actually called in React Native.
module.exports = {}
