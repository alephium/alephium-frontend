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

import bs58 from './bs58'
import djb2 from '../lib/djb2'

export function addressToGroup(address: string, totalNumberOfGroups: number): number {
  const bytes = bs58.decode(address).slice(1)
  const value = djb2(bytes) | 1
  const hash = toPosInt(xorByte(value))
  const group = hash % totalNumberOfGroups

  return group
}

function xorByte(value: number): number {
  const byte0 = value >> 24
  const byte1 = value >> 16
  const byte2 = value >> 8

  return byte0 ^ byte1 ^ byte2 ^ value
}

export const isAddressValid = (address: string) =>
  !!address && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address) && bs58.decode(address).slice(1).length >= 32

const toPosInt = (byte: number): number => byte & 0xff
