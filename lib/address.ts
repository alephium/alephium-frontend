// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import bs58 from '../lib/bs58'
import { djb2 } from '../lib/djb2'

export function addressToGroup(address: string): number {
  let bytes = bs58.decode(address).slice(1)
  let value = djb2(bytes) | 1
  let hash = toPosInt(xorByte(value))
  let group = hash % 4
  return group
}

function xorByte(value: number): number {
  var byte0 = value >> 24
  var byte1 = value >> 16
  var byte2 = value >> 8
  return byte0 ^ byte1 ^ byte2 ^ value
}

function toPosInt(byte: number): number  {
  return byte & 0xff
}
