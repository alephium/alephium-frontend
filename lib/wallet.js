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

class StoredState {
  constructor(seed, numberOfAddresses, activeAddressIndex) {
    this.seed = seed.toString('hex');
    this.numberOfAddresses = numberOfAddresses;
    this.activeAddressIndex = activeAddressIndex;
  }
}

class Wallet {
  constructor(seed, address, publicKey, privateKey) {
    this.seed = seed;
    this.address = address;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  encrypt(password) {
    //TODO we currently support only 1 address
    const storedState = new StoredState(this.seed, 1, 0)
    return passwordCrypto.encrypt(password, JSON.stringify(storedState));
  }
}

function fromMnemonic(mnemonic, networkType) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  return fromSeed(seed, networkType);
}

function fromSeed(seed, networkType) {
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
  const address = networkType.concat(bs58.encode(bytes));

  return new Wallet(seed, address, publicKey, privateKey);
}

function walletGenerate(networkType) {
  const mnemonic = bip39.generateMnemonic(256);
  return {
    mnemonic: mnemonic,
    wallet: fromMnemonic(mnemonic, networkType)
  };
}

function walletImport(seedPhrase, networkType) {
  if (!bip39.validateMnemonic(seedPhrase)) { throw new Error('Invalid seed phrase.'); }
  return fromMnemonic(seedPhrase, networkType);
}

async function walletOpen(password, data, networkType) {
  let dataDecrypted = await passwordCrypto.decrypt(password, data);
  let config = JSON.parse(dataDecrypted);

  return fromSeed(Buffer.from(config.seed,'hex'), networkType)
}

exports.Wallet = Wallet;
exports.generate = walletGenerate;
exports.import = walletImport;
exports.open = walletOpen;
exports.fromMnemonic = fromMnemonic;
exports.fromSeed = fromSeed;
