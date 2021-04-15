// Copyright 2018 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var bip32 = require('bip32');
var bip39 = require('bip39');
var bs58 = require('./bs58');
var blake = require('blakejs');
import * as utils from './utils';
var passwordCrypto = utils.PasswordCrypto();
var StoredState = /** @class */ (function () {
    function StoredState(seed, numberOfAddresses, activeAddressIndex) {
        this.seed = seed.toString('hex');
        this.numberOfAddresses = numberOfAddresses;
        this.activeAddressIndex = activeAddressIndex;
    }
    return StoredState;
}());
var Wallet = /** @class */ (function () {
    function Wallet(seed, address, publicKey, privateKey) {
        this.seed = seed;
        this.address = address;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }
    Wallet.prototype.encrypt = function (password) {
        // TODO we currently support only 1 address
        var storedState = new StoredState(this.seed, 1, 0);
        return passwordCrypto.encrypt(password, JSON.stringify(storedState));
    };
    return Wallet;
}());
function path(networkType) {
    var coinType = '';
    switch (networkType) {
        case 'M':
            coinType = '1234\'';
            break;
        case 'T':
            coinType = '1\'';
            break;
        case 'D':
            coinType = '-1\'';
            break;
    }
    return "m/44'/" + coinType + "/0'/0/0";
}
function fromMnemonic(mnemonic, networkType) {
    var seed = bip39.mnemonicToSeedSync(mnemonic);
    return fromSeed(seed, networkType);
}
function fromSeed(seed, networkType) {
    var masterKey = bip32.fromSeed(seed);
    var keyPair = masterKey.derivePath(path(networkType));
    var publicKey = keyPair.publicKey.toString('hex');
    var privateKey = keyPair.privateKey.toString('hex');
    var context = blake.blake2bInit(32, null);
    blake.blake2bUpdate(context, Buffer.from(publicKey, 'hex'));
    var hash = blake.blake2bFinal(context);
    var pkhash = Buffer.from(hash, 'hex');
    var type = Buffer.from([0]);
    var bytes = Buffer.concat([type, pkhash]);
    var address = networkType.concat(bs58.encode(bytes));
    return new Wallet(seed, address, publicKey, privateKey);
}
function walletGenerate(networkType) {
    var mnemonic = bip39.generateMnemonic(256);
    return {
        mnemonic: mnemonic,
        wallet: fromMnemonic(mnemonic, networkType)
    };
}
function walletImport(seedPhrase, networkType) {
    if (!bip39.validateMnemonic(seedPhrase)) {
        throw new Error('Invalid seed phrase.');
    }
    return fromMnemonic(seedPhrase, networkType);
}
function walletOpen(password, data, networkType) {
    return __awaiter(this, void 0, void 0, function () {
        var dataDecrypted, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, passwordCrypto.decrypt(password, data)];
                case 1:
                    dataDecrypted = _a.sent();
                    config = JSON.parse(dataDecrypted);
                    return [2 /*return*/, fromSeed(Buffer.from(config.seed, 'hex'), networkType)];
            }
        });
    });
}
export { Wallet, walletGenerate as generate, walletImport as import, walletOpen as opan, fromMnemonic, fromSeed };
