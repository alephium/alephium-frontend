'use strict';

const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const crypto = require('crypto');

const utils = require('../lib/utils');
const passwordCrypto = utils.PasswordCrypto();

class Wallet {
  constructor(address, privateKey) {
    this.address = address;
    this.privateKey = privateKey;
  }

  encrypt(password) {
    return passwordCrypto.encrypt(password, JSON.stringify(this));
  }
}

function walletGenerate() {
  let keyPair = ec.keyFromSecret(crypto.randomBytes(32));
  return new Wallet(keyPair.getPublic('hex'), keyPair.getSecret('hex'));
}

function walletOpen(password, data) {
  let config = JSON.parse(passwordCrypto.decrypt(password, data));
  return new Wallet(config.address, config.privateKey);
}

exports.Wallet = Wallet;
exports.generate = walletGenerate;
exports.open = walletOpen;