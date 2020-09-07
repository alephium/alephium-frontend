'use strict';

const isNode = (typeof process !== 'undefined') &&
  (typeof process.release !== 'undefined') && (process.release.name === 'node');

exports.signatureEncode = (ec, signature) => {
  var sNormalized = signature.s;
  if (signature.s.cmp(ec.nh) === 1) {
    sNormalized = ec.n.sub(signature.s)
  }

  const r = signature.r.toArrayLike(Uint8Array, 'be', 33).slice(1);
  const s = sNormalized.toArrayLike(Uint8Array, 'be', 33).slice(1);

  const xs = new Uint8Array(r.byteLength + s.byteLength);
  xs.set(new Uint8Array(r), 0);
  xs.set(new Uint8Array(s), r.byteLength);
  return Buffer.from(xs).toString('hex');
};

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
