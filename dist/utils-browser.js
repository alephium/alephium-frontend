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
function Storage() {
    this.key = 'wallet';
    this.remove = function (name) {
        window.localStorage.removeItem(this.key + '-' + name);
    };
    this.load = function (name) {
        var str = window.localStorage.getItem(this.key + '-' + name);
        if (typeof str !== 'undefined') {
            return JSON.parse(str);
        }
        return null;
    };
    this.save = function (name, json) {
        var str = JSON.stringify(json);
        window.localStorage.setItem(this.key + '-' + name, str);
    };
    this.list = function () {
        var prefixLen = this.key.length + 1;
        var xs = [];
        for (var i = 0, len = localStorage.length; i < len; ++i) {
            var key = localStorage.key(i);
            if (key.startsWith(this.key)) {
                xs.push(key.substring(prefixLen));
            }
        }
        return xs;
    };
}
exports.Storage = new Storage();
