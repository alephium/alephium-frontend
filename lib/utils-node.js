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
  this.walletsUrl = new URL('file:///' + process.env.HOME + '/.alf-wallets');

  if (!fs.existsSync(this.walletsUrl)){
    fs.mkdirSync(this.walletsUrl);
  }

  this.remove = function(name) {
    fs.unlinkSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat'));
  }

  this.load = function(name) {
    const buffer = fs.readFileSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat'));
    if (typeof buffer !== 'undefined') {
      return JSON.parse(buffer.toString());
    }
    return null;
  }

  this.save = function(name, json) {
    const str = JSON.stringify(json);
    const data = new Uint8Array(Buffer.from(str));
    fs.writeFileSync(new URL(this.walletsUrl.toString() + '/' + name + '.dat'), data);
  };

  this.list = function() {
    var xs = [];
    try {
      const files = fs.readdirSync(this.walletsUrl)
      files.forEach(function (file) {
        if (file.endsWith('.dat')) {
          xs.push(file.substring(0, file.length - 4));
        }
      })
    } catch(e) {
      return [];
    }

    return xs;
  }
}

exports.PasswordCrypto = new PasswordCryptoNode();
exports.Storage = new Storage();
