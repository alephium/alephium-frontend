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

import * as EC from 'elliptic'
import BN from 'bn.js'
import bs58 from './bs58'

import NodeStorage from './storage-node'
import BrowserStorage from './storage-browser'
import { TOTAL_NUMBER_OF_GROUPS } from './constants'
import djb2 from './djb2'

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

const xorByte = (intValue: number) => {
  const byte0 = (intValue >> 24) & 0xff
  const byte1 = (intValue >> 16) & 0xff
  const byte2 = (intValue >> 8) & 0xff
  const byte3 = intValue & 0xff

  return (byte0 ^ byte1 ^ byte2 ^ byte3) & 0xff
}

enum AddressType {
  P2PKH = 0x00,
  P2MPKH = 0x01,
  P2SH = 0x02,
  P2C = 0x03
}

export const groupOfAddress = (address: string): number => {
  const decoded = bs58.decode(address)

  if (decoded.length == 0) throw new Error('Address string is empty')
  const addressType = decoded[0]
  const addressBody = decoded.slice(1)

  if (addressType == AddressType.P2PKH) {
    return groupOfP2pkhAddress(addressBody)
  } else if (addressType == AddressType.P2MPKH) {
    return groupOfP2mpkhAddress(addressBody)
  } else if (addressType == AddressType.P2SH) {
    return groupOfP2shAddress(addressBody)
  } else {
    throw new Error(`Invalid asset address type: ${addressType}`)
  }
}

const groupOfAddressBytes = (bytes: Uint8Array): number => {
  const hint = djb2(bytes) | 1
  const hash = xorByte(hint)
  const group = hash % TOTAL_NUMBER_OF_GROUPS

  return group
}

// Pay to public key hash address
const groupOfP2pkhAddress = (address: Uint8Array): number => {
  if (address.length != 32) {
    throw new Error(`Invalid p2pkh address length: ${address.length}`)
  }

  return groupOfAddressBytes(address)
}

// Pay to multiple public key hash address
const groupOfP2mpkhAddress = (address: Uint8Array): number => {
  if ((address.length - 2) % 32 != 0) {
    throw new Error(`Invalid p2mpkh address length: ${address.length}`)
  }

  return groupOfAddressBytes(address.slice(1, 33))
}

// Pay to script hash address
const groupOfP2shAddress = (address: Uint8Array): number => {
  return groupOfAddressBytes(address)
}

export function tokenIdFromAddress(address: string): string {
  const decoded = bs58.decode(address)

  if (decoded.length == 0) throw new Error('Address string is empty')
  const addressType = decoded[0]
  const addressBody = decoded.slice(1)

  if (addressType == AddressType.P2C) {
    return Buffer.from(addressBody).toString('hex')
  } else {
    throw new Error(`Invalid contract address type: ${addressType}`)
  }
}
