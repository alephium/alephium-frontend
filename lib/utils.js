'use strict';

const isNode = (typeof process !== 'undefined') && 
  (typeof process.release !== 'undefined') && (process.release.name === 'node');

function PasswordCryptoBrowser() {
  const passworder = require('browser-passworder');
  this.encrypt = function(password, data) {
    return passworder.encrypt(password, data);
  };
  this.decrypt = function(password, data) {
    return passworder.decrypt(password, data);
  }
}

function PasswordCryptoNode() {
  const crypto = require('crypto');

  this.iv = Buffer.alloc(16, 0);
  this.encrypt = function(password, data) {
    let key = crypto.createHash('sha256').update(password).digest();
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), this.iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  };
  this.decrypt = function(password, data) {
   let key = crypto.createHash('sha256').update(password).digest();
   let encryptedText = Buffer.from(data, 'hex');
   let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), this.iv);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
  }
}

exports.PasswordCrypto = () => {
  if (isNode) {
    return new PasswordCryptoNode();
  } else {
    return new PasswordCryptoBrowser();
  }
};

