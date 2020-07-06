'use strict';

const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const crypto = require('crypto');

const bs58 = require('../lib/bs58');
const keccak = require('../lib/keccakjs');
const utils = require('../lib/utils');
const passwordCrypto = utils.PasswordCrypto();

class Wallet {
  constructor(address, publicKey, privateKey) {
    this.address = address;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  encrypt(password) {
    return passwordCrypto.encrypt(password, JSON.stringify(this));
  }
}

function fromKeyPair(keyPair) {
  let publicKey = keyPair.getPublic('hex');
  let privateKey = keyPair.getSecret('hex');

  const pk = Buffer.from(publicKey, 'hex');
  var hash = new keccak(256);
  hash.update(pk)

  const pkhash = Buffer.from(hash.digest('hex'), 'hex');
  const type = Buffer.from([0]);
  const bytes = Buffer.concat([type, pkhash]);
  const address = bs58.encode(bytes);

  return new Wallet(address, publicKey, privateKey);
}

function walletGenerate() {
  let keyPair = ec.keyFromSecret(crypto.randomBytes(32));
  return fromKeyPair(keyPair);
}

function walletImport(privateKey) {
  let keyPair = ec.keyFromSecret(privateKey);
  return fromKeyPair(keyPair);
}

function walletOpen(password, data) {
  let config = JSON.parse(passwordCrypto.decrypt(password, data));
  return new Wallet(config.address, config.publicKey, config.privateKey);
}

exports.Wallet = Wallet;
exports.generate = walletGenerate;
exports.import = walletImport;
exports.open = walletOpen;
