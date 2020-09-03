'use strict';

const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const crypto = require('crypto');
const bip32 = require('bip32');
const bip39 = require('bip39');

const bs58 = require('../lib/bs58');
const blake = require('blakejs')
const utils = require('../lib/utils');
const passwordCrypto = utils.PasswordCrypto();

const path = "m/44'/1234'/0'/0/0"

class Wallet {
  constructor(address, publicKey, privateKey, mnemonic) {
    this.address = address;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.mnemonic = mnemonic;
  }

  encrypt(password) {
    return passwordCrypto.encrypt(password, JSON.stringify(this));
  }
}

function fromMnemonic(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  return fromSeed(seed, mnemonic);
}

function fromSeed(seed, mnemonic) {
  const masterKey = bip32.fromSeed(seed);
  const keyPair = masterKey.derivePath(path);

  const publicKey = keyPair.publicKey.toString('hex');
  const privateKey = keyPair.privateKey.toString('hex');

  const context = blake.blake2bInit(32, null);
  blake.blake2bUpdate(context, Buffer.from(publicKey, 'hex'));
  const hash = blake.blake2bFinal(context);

  const pkhash = Buffer.from(hash, 'hex');
  const type = Buffer.from([0]);
  const bytes = Buffer.concat([type, pkhash]);
  const address = bs58.encode(bytes);

  return new Wallet(address, publicKey, privateKey, mnemonic);
}

function walletGenerate() {
  const mnemonic = bip39.generateMnemonic(256);
  return fromMnemonic(mnemonic);
}

function walletImport(seedPhrase) {
  if (!bip39.validateMnemonic(seedPhrase)) { throw new Error('Invalid seed phrase.'); }
  return fromMnemonic(seedPhrase);
}

async function walletOpen(password, data) {
  let dataDecrypted = await passwordCrypto.decrypt(password, data);
  let config = JSON.parse(dataDecrypted);
  return new Wallet(config.address, config.publicKey, config.privateKey, config.mnemonic);
}

exports.Wallet = Wallet;
exports.generate = walletGenerate;
exports.import = walletImport;
exports.open = walletOpen;
exports.fromMnemonic = fromMnemonic;
exports.fromSeed = fromSeed;
