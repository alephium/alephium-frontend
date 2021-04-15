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
'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this
        }),
      g
    )
    function verb(n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.')
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (!((t = _.trys), (t = t.length > 0 && t[t.length - 1])) && (op[0] === 6 || op[0] === 2)) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
var assert = require('bsert')
var NodeClient = require('../lib/node')
var EC = require('elliptic').ec
var ec = new EC('secp256k1')
var utils = require('../lib/utils')
/**
 * Clique Client
 */
var CliqueClient = /** @class */ (function () {
  /**
   * Creat a node client.
   */
  function CliqueClient(clique) {
    this.clique = clique
    this.clients = []
    for (var _i = 0, _a = clique.nodes; _i < _a.length; _i++) {
      var node = _a[_i]
      var client = new NodeClient({
        host: node.address,
        port: node.restPort
      })
      this.clients.push(client)
    }
  }
  CliqueClient.prototype.execute = function (method, params) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.clients[0].execute(method, params)]
      })
    })
  }
  CliqueClient.prototype.getClientIndex = function (address) {
    return __awaiter(this, void 0, void 0, function () {
      var group
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getGroupIndex(address)]
          case 1:
            group = _a.sent()
            return [2 /*return*/, parseInt(group / this.clique.groupNumPerBroker)]
        }
      })
    })
  }
  CliqueClient.prototype.getGroupIndex = function (address) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.clients[0].getGroup(address)]
          case 1:
            return [2 /*return*/, _a.sent().group]
        }
      })
    })
  }
  CliqueClient.prototype.blockflowFetch = function (fromTs, toTs) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.clients[0].blockflowFetch(fromTs, toTs)]
      })
    })
  }
  CliqueClient.prototype.getBalance = function (address) {
    return __awaiter(this, void 0, void 0, function () {
      var client
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getClientIndex(address)]
          case 1:
            client = _a.sent()
            return [2 /*return*/, this.clients[client].getBalance(address)]
        }
      })
    })
  }
  CliqueClient.prototype.getWebSocket = function (peer_i) {
    var peer = this.clique.peers[peer_i]
    return new WebSocket('ws://' + peer.address + ':' + peer.wsPort + '/events')
  }
  CliqueClient.prototype.transactionCreate = function (fromAddress, fromKey, toAddress, value, lockTime) {
    return __awaiter(this, void 0, void 0, function () {
      var client
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getClientIndex(fromAddress)]
          case 1:
            client = _a.sent()
            return [2 /*return*/, this.clients[client].transactionCreate(fromKey, toAddress, value, lockTime)]
        }
      })
    })
  }
  CliqueClient.prototype.transactionSend = function (fromAddress, tx, signature) {
    return __awaiter(this, void 0, void 0, function () {
      var client
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getClientIndex(fromAddress)]
          case 1:
            client = _a.sent()
            return [2 /*return*/, this.clients[client].transactionSend(tx, signature)]
        }
      })
    })
  }
  CliqueClient.prototype.transactionSign = function (txHash, privateKey) {
    assert(typeof txHash === 'string')
    assert(typeof privateKey === 'string')
    var keyPair = ec.keyFromPrivate(privateKey)
    var signature = keyPair.sign(txHash)
    return utils.signatureEncode(ec, signature)
  }
  return CliqueClient
})()
module.exports = CliqueClient
