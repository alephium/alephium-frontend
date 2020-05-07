const crypto = require('crypto');
const fs = require("fs");

const saltByteLength = 32;
const ivByteLength = 64;

function PasswordCryptoNode() {
  this.encrypt = function(passwordRaw, dataRaw) {
    const password = Buffer.from(passwordRaw, 'utf8');
    const data = Buffer.from(dataRaw, 'utf8');

    const salt = crypto.randomBytes(saltByteLength);
    const derivedKey = keyFromPassword(password, salt);

    const iv = crypto.randomBytes(ivByteLength);
    const cipher = createCipher(derivedKey, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    const payload = {
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      encrypted: encrypted.toString('base64')
    };
    return JSON.stringify(payload);
  }

  this.decrypt = function(passwordRaw, payloadRaw) {
    const password = Buffer.from(passwordRaw, 'utf8');
    const payload = JSON.parse(payloadRaw);
    const salt = Buffer.from(payload.salt, 'base64');
    const iv = Buffer.from(payload.iv, 'base64');
    const encrypted = Buffer.from(payload.encrypted, 'base64');

    const derivedKey = keyFromPassword(password, salt);
    const cipher = createCipher(derivedKey, iv);
    const decrypted = Buffer.concat([cipher.update(encrypted), cipher.final()]);
    return decrypted.toString('utf8');
  }
}

function keyFromPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha512');
}

function createCipher(key, iv) {
  return crypto.createCipheriv('aes-256-gcm', key, iv);
}

function Storage() {
  this.url = new URL('file:///' + process.env.HOME + '/.alf-wallet');

  this.load = function() {
    const buffer = fs.readFileSync(this.url);
    if (typeof buffer !== 'undefined') {
      return JSON.parse(buffer.toString());
    }
    return null;
  }

  this.save = function(json) {
    const str = JSON.stringify(json);
    const data = new Uint8Array(Buffer.from(str));
    fs.writeFileSync(this.url, data);
  };
}

exports.PasswordCrypto = new PasswordCryptoNode();
exports.Storage = new Storage();
