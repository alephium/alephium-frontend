/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import EC from 'elliptic'
import BN from 'bn.js'

import NodeStorage from './storage-node'
import BrowserStorage from './storage-browser'

export const signatureEncode = (ec: EC.ec, signature: EC.ec.Signature) => {
  let sNormalized = signature.s
  if (ec.n && signature.s.cmp(ec.nh) === 1) {
    sNormalized = ec.n.sub(signature.s)
  }

  const r = signature.r.toArrayLike(Buffer, 'be', 33).slice(1)
  const s = sNormalized.toArrayLike(Buffer, 'be', 33).slice(1)

  const xs = new Uint8Array(r.byteLength + s.byteLength)
  xs.set(new Uint8Array(r), 0)
  xs.set(new Uint8Array(s), r.byteLength)
  return Buffer.from(xs).toString('hex')
}

// the signature should be in hex string format for 64 bytes
export const signatureDecode = (ec: EC.ec, signature: string) => {
  if (signature.length !== 128) {
    throw new Error('Invalid signature length')
  }

  const sHex = signature.slice(64, 128)
  const s = new BN(sHex, 'hex')
  if (ec.n && s.cmp(ec.nh) < 1) {
    const decoded = { r: signature.slice(0, 64), s: sHex }
    return decoded
  } else {
    throw new Error('The signature is not normalized')
  }
}

export const getStorage = (): BrowserStorage | NodeStorage => {
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

  return isBrowser ? new BrowserStorage() : new NodeStorage()
}
