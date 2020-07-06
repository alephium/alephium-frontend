/** This source is under MIT License and come originally from https://github.com/cryptocoinjs/bs58 **/
const basex = require('base-x')
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

module.exports = basex(ALPHABET)
