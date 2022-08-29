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

import { describe, expect, test } from '@jest/globals'

import { attoAlphToFiat } from '../../src/utils/numbers'

describe('numbers module', () => {
  describe('attoAlphToFiat', () => {
    test('when half of an Alph, return a decimal amount', () => {
      expect(attoAlphToFiat(BigInt(1e18 / 2), 1)).toBe(0.5)
    })
    test('when 2 Alph, return a whole amount', () => {
      expect(attoAlphToFiat(BigInt(1e18 * 2), 1)).toBe(2)
    })
    test('when 1 Alph, and 1 fiat dollar, return 1', () => {
      expect(attoAlphToFiat(BigInt(1e18), 1)).toBe(1)
    })
    test('when negative Alph, return negative fiat', () => {
      expect(attoAlphToFiat(-BigInt(1e18), 1)).toBe(-1)
    })
    test('when negative fiat price, return negative fiat', () => {
      expect(attoAlphToFiat(BigInt(1e18), -1)).toBe(-1)
    })
  })
})
