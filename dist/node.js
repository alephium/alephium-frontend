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
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var assert = require('bsert');
var Client = require('bcurl').Client;
/**
 * Node Client
 * @extends {bcurl.Client}
 */
var NodeClient = /** @class */ (function (_super) {
    __extends(NodeClient, _super);
    /**
     * Creat a node client.
     * @param {Object?} options
     */
    function NodeClient(options) {
        return _super.call(this, options) || this;
    }
    NodeClient.prototype.blockflowFetch = function (fromTs, toTs) {
        assert(typeof fromTs === 'number');
        assert(typeof toTs === 'number');
        return this.get("/blockflow?fromTs=" + fromTs + "&toTs=" + toTs);
    };
    NodeClient.prototype.getBalance = function (address) {
        assert(typeof address === 'string');
        return this.get("/addresses/" + address + "/balance");
    };
    NodeClient.prototype.getGroup = function (address) {
        assert(typeof address === 'string');
        return this.get("/addresses/" + address + "/group");
    };
    NodeClient.prototype.selfClique = function () {
        console.log('self clique.');
        return this.get('/infos/self-clique');
    };
    NodeClient.prototype.transactionCreate = function (fromKey, toAddress, value, lockTime) {
        assert(typeof fromKey === 'string');
        assert(typeof toAddress === 'string');
        assert(typeof value === 'string');
        var root = "/transactions/build?fromKey=" + fromKey + "&toAddress=" + toAddress + "&value=" + value;
        if (lockTime == null) {
            return this.get(root);
        }
        else {
            return this.get(root + ("&lockTime=" + lockTime));
        }
    };
    NodeClient.prototype.transactionSend = function (tx, signature) {
        assert(typeof tx === 'string');
        assert(typeof signature === 'string');
        return this.post('/transactions/send', {
            'unsignedTx': tx,
            'signature': signature
        });
    };
    return NodeClient;
}(Client));
module.exports = NodeClient;
