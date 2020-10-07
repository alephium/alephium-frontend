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

const crypto = require('crypto');

const saltByteLength = 64;
const ivByteLength = 64;
const authTagLength = 16;

function PasswordCrypto() {
  this.encrypt = function(password, dataRaw) {
    const data = Buffer.from(dataRaw, 'utf8');

    const salt = crypto.randomBytes(saltByteLength);
    const derivedKey = keyFromPassword(password, salt);
    const iv = crypto.randomBytes(ivByteLength);
    const cipher = createCipher(derivedKey, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const payload = {
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      encrypted: Buffer.concat([encrypted, authTag]).toString('hex'),
      version: 1
    };

    return JSON.stringify(payload);
  }

  this.decrypt = function(password, payloadRaw) {
    const payload = JSON.parse(payloadRaw);
    const salt = Buffer.from(payload.salt, 'hex');
    const iv = Buffer.from(payload.iv, 'hex');

    const encrypted = Buffer.from(payload.encrypted, 'hex');

    const derivedKey = keyFromPassword(password, salt);
    const decipher = createDecipher(derivedKey, iv);
    const data = encrypted.slice(0, encrypted.length - authTagLength)
    const authTag = encrypted.slice(encrypted.length - authTagLength, encrypted.length)
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  }
}

function createCipher(key, iv) {
  return crypto.createCipheriv('aes-256-gcm', key, iv);
}

function createDecipher(key, iv) {
  return crypto.createDecipheriv('aes-256-gcm', key, iv);
}

function keyFromPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
}

exports.PasswordCrypto = new PasswordCrypto();
