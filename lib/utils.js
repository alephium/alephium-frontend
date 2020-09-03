'use strict';

const isNode = (typeof process !== 'undefined') &&
  (typeof process.release !== 'undefined') && (process.release.name === 'node');

function rmPadding(buf) {
  var i = 0;
  var len = buf.length - 1;
  while (!buf[i] && !(buf[i + 1] & 0x80) && i < len) {
    i++;
  }
  if (i === 0) {
    return buf;
  }
  return buf.slice(i);
}

exports.signatureEncode = (ec, signature) => {
  var sNormalized = signature.s.toArray();
  if (signature.s.cmp(ec.nh) === 1) {
    sNormalized = ec.n.sub(signature.s).toArrayLike(Uint8Array, 'be', 32)
  }

  const r = rmPadding(signature.r.toArray());
  const s = rmPadding(sNormalized);

  const signature_bytes = r.concat(s);
  return Buffer.from(signature_bytes).toString('hex');
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
