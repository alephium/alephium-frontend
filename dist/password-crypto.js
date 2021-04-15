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
import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from 'crypto';
var saltByteLength = 64;
var ivByteLength = 64;
var authTagLength = 16;
function PasswordCrypto() {
    this.encrypt = function (password, dataRaw) {
        var data = Buffer.from(dataRaw, 'utf8');
        var salt = randomBytes(saltByteLength);
        var derivedKey = keyFromPassword(password, salt);
        var iv = randomBytes(ivByteLength);
        var cipher = createCipher(derivedKey, iv);
        var encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        var authTag = cipher.getAuthTag();
        var payload = {
            salt: salt.toString('hex'),
            iv: iv.toString('hex'),
            encrypted: Buffer.concat([encrypted, authTag]).toString('hex'),
            version: 1
        };
        return JSON.stringify(payload);
    };
    this.decrypt = function (password, payloadRaw) {
        var payload = JSON.parse(payloadRaw);
        var salt = Buffer.from(payload.salt, 'hex');
        var iv = Buffer.from(payload.iv, 'hex');
        var encrypted = Buffer.from(payload.encrypted, 'hex');
        var derivedKey = keyFromPassword(password, salt);
        var decipher = createDecipher(derivedKey, iv);
        var data = encrypted.slice(0, encrypted.length - authTagLength);
        var authTag = encrypted.slice(encrypted.length - authTagLength, encrypted.length);
        decipher.setAuthTag(authTag);
        var decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
        return decrypted.toString('utf8');
    };
}
function createCipher(key, iv) {
    return createCipheriv('aes-256-gcm', key, iv);
}
function createDecipher(key, iv) {
    return createDecipheriv('aes-256-gcm', key, iv);
}
function keyFromPassword(password, salt) {
    return pbkdf2Sync(password, salt, 10000, 32, 'sha256');
}
var _PasswordCrypto = new PasswordCrypto();
export { _PasswordCrypto as PasswordCrypto };
