"use strict";
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
var fs = require("fs");
function Storage() {
    this.walletsUrl = new URL('file:///' + process.env.HOME + '/.alf-wallets');
    if (!fs.existsSync(this.walletsUrl)) {
        fs.mkdirSync(this.walletsUrl);
    }
    this.remove = function (name) {
        fs.unlinkSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat'));
    };
    this.load = function (name) {
        var buffer = fs.readFileSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat'));
        if (typeof buffer !== 'undefined') {
            return JSON.parse(buffer.toString());
        }
        return null;
    };
    this.save = function (name, json) {
        var str = JSON.stringify(json);
        var data = new Uint8Array(Buffer.from(str));
        fs.writeFileSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat'), data);
    };
    this.list = function () {
        var xs = [];
        try {
            var files = fs.readdirSync(this.walletsUrl);
            files.forEach(function (file) {
                if (file.endsWith('.dat')) {
                    xs.push(file.substring(0, file.length - 4));
                }
            });
        }
        catch (e) {
            return [];
        }
        return xs;
    };
}
exports.Storage = new Storage();
