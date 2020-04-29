const passworder = require('browser-passworder');

function PasswordCryptoBrowser() {
  this.encrypt = function(password, data) {
    return passworder.encrypt(password, data);
  };
  this.decrypt = function(password, data) {
    return passworder.decrypt(password, data);
  }
}

exports.PasswordCrypto = new PasswordCryptoBrowser();