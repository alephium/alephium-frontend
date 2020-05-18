'use strict';

const isNode = (typeof process !== 'undefined') &&
  (typeof process.release !== 'undefined') && (process.release.name === 'node');

exports.PasswordCrypto = () => {
  if (isNode) {
    const util = require('./utils-node');
    return util.PasswordCrypto;
  } else {
    const util = require('./utils-browser')
    return util.PasswordCrypto;
  }
};

exports.Storage = () => {
  if (isNode) {
    const util = require('./utils-node');
    return util.Storage;
  } else {
    const util = require('./utils-browser')
    return util.Storage;
  }
};
