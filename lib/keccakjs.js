/** This source is under MIT License and come originally from https://github.com/axic/keccakjs **/
try {
  module.exports = require('sha3').SHA3Hash
} catch (err) {
  module.exports = require('./keccakjs-browser')
}
