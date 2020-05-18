const passworder = require('browser-passworder');

function PasswordCryptoBrowser() {
  this.encrypt = function(password, data) {
    return passworder.encrypt(password, data);
  };
  this.decrypt = function(password, data) {
    return passworder.decrypt(password, data);
  }
}

function Storage() {
  this.key = 'wallet';

  this.load = function(name) {
    const str = window.localStorage.getItem(this.key + '-' + name);
    if (typeof str !== 'undefined') {
      return JSON.parse(str);
    }
    return null;
  }

  this.save = function(name, json) {
    const str = JSON.stringify(json);
    window.localStorage.setItem(this.key + '-' + name, str);
  };
}

exports.PasswordCrypto = new PasswordCryptoBrowser();
exports.Storage = new Storage();
