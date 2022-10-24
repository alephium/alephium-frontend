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

import rewire from 'rewire'
import {
  formatAmountForDisplay,
  convertAlphToSet,
  convertSetToAlph,
  addApostrophes,
  produceZeros,
  convertSetToFiat,
  formatFiatAmountForDisplay
} from '../lib/numbers'

const alph = (amount: bigint) => {
  return amount * BigInt('1000000000000000000')
}

const minDigits = 3

it('Should abbreviate amount', () => {
  expect(formatAmountForDisplay(alph(BigInt(-1)))).toEqual('???'),
    expect(formatAmountForDisplay(BigInt(0))).toEqual('0.00'),
    expect(formatAmountForDisplay(BigInt(1))).toEqual('0.00'),
    expect(formatAmountForDisplay(BigInt(100000))).toEqual('0.00'),
    expect(formatAmountForDisplay(BigInt(900000000000))).toEqual('0.00'),
    expect(formatAmountForDisplay(BigInt(4000000000000))).toEqual('0.00'),
    expect(formatAmountForDisplay(BigInt(5000000000000))).toEqual('0.00001'),
    expect(formatAmountForDisplay(BigInt(6000000000000))).toEqual('0.00001'),
    expect(formatAmountForDisplay(BigInt(2000000000000000))).toEqual('0.002'),
    expect(formatAmountForDisplay(BigInt('20000000000000000'))).toEqual('0.02'),
    expect(formatAmountForDisplay(BigInt('200000000000000000'))).toEqual('0.20'),
    expect(formatAmountForDisplay(BigInt('2000000000000000000'))).toEqual('2.00'),
    expect(formatAmountForDisplay(alph(BigInt(1230)))).toEqual("1'230.00"),
    expect(formatAmountForDisplay(alph(BigInt(1230000)))).toEqual('1.23M'),
    expect(formatAmountForDisplay(alph(BigInt(1000000)))).toEqual('1.00M'),
    expect(formatAmountForDisplay(alph(BigInt(1234000)))).toEqual('1.23M'),
    expect(formatAmountForDisplay(alph(BigInt(1230000000)))).toEqual('1.23B'),
    expect(formatAmountForDisplay(alph(BigInt(1235000000)))).toEqual('1.24B'),
    expect(formatAmountForDisplay(alph(BigInt(1230000000000)))).toEqual('1.23T'),
    expect(formatAmountForDisplay(alph(BigInt(1237000000000)))).toEqual('1.24T'),
    expect(formatAmountForDisplay(alph(BigInt(1230000000000000)))).toEqual('1230.00T'),
    expect(formatAmountForDisplay(alph(BigInt(1)))).toEqual('1.00')
})

it('Should keep full amount precision', () => {
  expect(formatAmountForDisplay(alph(BigInt(-1)))).toEqual('???'),
    expect(formatAmountForDisplay(BigInt(0), true)).toEqual('0.00'),
    expect(formatAmountForDisplay(BigInt(1), true)).toEqual('0.000000000000000001'),
    expect(formatAmountForDisplay(BigInt(100001), true)).toEqual('0.000000000000100001'),
    expect(formatAmountForDisplay(BigInt(1000000000), true)).toEqual('0.000000001'),
    expect(formatAmountForDisplay(BigInt(1000000001), true)).toEqual('0.000000001000000001'),
    expect(formatAmountForDisplay(BigInt(2000000000), true)).toEqual('0.000000002'),
    expect(formatAmountForDisplay(BigInt(2000000002), true)).toEqual('0.000000002000000002'),
    expect(formatAmountForDisplay(BigInt(2000000000000000), true)).toEqual('0.002'),
    expect(formatAmountForDisplay(BigInt('20000000000000000'), true)).toEqual('0.02'),
    expect(formatAmountForDisplay(BigInt('200000000000000000'), true)).toEqual('0.20'),
    expect(formatAmountForDisplay(BigInt('2000000000000000000'), true)).toEqual('2.00'),
    expect(formatAmountForDisplay(alph(BigInt(1230)), true)).toEqual('1230.00'),
    expect(formatAmountForDisplay(alph(BigInt(1230000)), true)).toEqual('1230000.00'),
    expect(formatAmountForDisplay(alph(BigInt(1230000000)), true)).toEqual('1230000000.00'),
    expect(formatAmountForDisplay(alph(BigInt(1230000000000)), true)).toEqual('1230000000000.00'),
    expect(formatAmountForDisplay(alph(BigInt(1230000000000000)), true)).toEqual('1230000000000000.00'),
    expect(formatAmountForDisplay(alph(BigInt(1)), true)).toEqual('1.00'),
    expect(formatAmountForDisplay(BigInt('1000000000000000000'), true, 3)).toEqual('1.000')
})

it('Should display a defined number of decimals', () => {
  expect(formatAmountForDisplay(BigInt('20053549281751930708'), false, 5)).toEqual('20.05355')
})

it('Should format fiat amount for display', () => {
  expect(formatFiatAmountForDisplay(0)).toEqual('0.00'),
    expect(formatFiatAmountForDisplay(0.1)).toEqual('0.10'),
    expect(formatFiatAmountForDisplay(0.11)).toEqual('0.11'),
    expect(formatFiatAmountForDisplay(0.111)).toEqual('0.11'),
    expect(formatFiatAmountForDisplay(0.114)).toEqual('0.11'),
    expect(formatFiatAmountForDisplay(0.115)).toEqual('0.12'),
    expect(formatFiatAmountForDisplay(1.005)).toEqual('1.00'),
    expect(formatFiatAmountForDisplay(1.006)).toEqual('1.01'),
    expect(formatFiatAmountForDisplay(1000)).toEqual("1'000.00"),
    expect(formatFiatAmountForDisplay(1000.09)).toEqual("1'000.09"),
    expect(formatFiatAmountForDisplay(1000.099)).toEqual("1'000.10"),
    expect(formatFiatAmountForDisplay(1000.095)).toEqual("1'000.10"),
    expect(formatFiatAmountForDisplay(10000)).toEqual("10'000.00"),
    expect(formatFiatAmountForDisplay(100000)).toEqual("100'000.00"),
    expect(formatFiatAmountForDisplay(999999.99)).toEqual("999'999.99"),
    expect(formatFiatAmountForDisplay(999999.999)).toEqual('1.00M'),
    expect(formatFiatAmountForDisplay(1000000)).toEqual('1.00M'),
    expect(formatFiatAmountForDisplay(1990000)).toEqual('1.99M'),
    expect(formatFiatAmountForDisplay(1996000)).toEqual('2.00M'),
    expect(formatFiatAmountForDisplay(1100000)).toEqual('1.10M'),
    expect(formatFiatAmountForDisplay(1110000)).toEqual('1.11M'),
    expect(formatFiatAmountForDisplay(1119000)).toEqual('1.12M'),
    expect(formatFiatAmountForDisplay(1116000)).toEqual('1.12M'),
    expect(formatFiatAmountForDisplay(1115000)).toEqual('1.11M'),
    expect(formatFiatAmountForDisplay(10000000)).toEqual('10.00M'),
    expect(formatFiatAmountForDisplay(100000000)).toEqual('100.00M'),
    expect(formatFiatAmountForDisplay(999999000)).toEqual('1.00B'),
    expect(formatFiatAmountForDisplay(1000000000)).toEqual('1.00B'),
    expect(formatFiatAmountForDisplay(10000000000)).toEqual('10.00B'),
    expect(formatFiatAmountForDisplay(100000000000)).toEqual('100.00B'),
    expect(formatFiatAmountForDisplay(1000000000000)).toEqual('1.00T'),
    expect(formatFiatAmountForDisplay(10000000000000)).toEqual('10.00T'),
    expect(formatFiatAmountForDisplay(100000000000000)).toEqual('100.00T'),
    expect(() => formatFiatAmountForDisplay(-1)).toThrow('Invalid fiat amount: -1. Fiat amount cannot be negative.'),
    expect(() => formatFiatAmountForDisplay(-1.01)).toThrow(
      'Invalid fiat amount: -1.01. Fiat amount cannot be negative.'
    )
})

it('should convert Alph amount to Set amount', () => {
  expect(convertAlphToSet('0')).toEqual(BigInt('0')),
    expect(convertAlphToSet('1')).toEqual(BigInt('1000000000000000000')),
    expect(convertAlphToSet('10')).toEqual(BigInt('10000000000000000000')),
    expect(convertAlphToSet('999999999')).toEqual(BigInt('999999999000000000000000000')),
    expect(convertAlphToSet('999999999999')).toEqual(BigInt('999999999999000000000000000000')),
    expect(convertAlphToSet('0.1')).toEqual(BigInt('100000000000000000')),
    expect(convertAlphToSet('.1')).toEqual(BigInt('100000000000000000')),
    expect(convertAlphToSet('0.01')).toEqual(BigInt('10000000000000000')),
    expect(convertAlphToSet('0.00000009')).toEqual(BigInt('90000000000')),
    expect(convertAlphToSet('0.000000000000000001')).toEqual(BigInt('1')),
    expect(() => convertAlphToSet('1e-1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1e-2')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1e-17')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1e-18')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1.1e-1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1.11e-1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1.99999999999999999e-1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1e+1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1e+2')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1e+17')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1e+18')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1.1e+1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('1.99999999999999999e+1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('123.45678e+2')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-0.000000000000000001')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1e-1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1e-2')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1e-17')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1e-18')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1.1e-1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1.11e-1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1.99999999999999999e-1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1e+1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1e+2')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1e+17')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1e+18')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1.1e+1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-1.99999999999999999e+1')).toThrow('Invalid Alph amount'),
    expect(() => convertAlphToSet('-123.45678e+2')).toThrow('Invalid Alph amount')
})

it('should convert Set amount to Alph amount', () => {
  expect(convertSetToAlph(BigInt('0'))).toEqual('0'),
    expect(convertSetToAlph(BigInt('1'))).toEqual('0.000000000000000001'),
    expect(convertSetToAlph(BigInt('100000000000000000'))).toEqual('0.1'),
    expect(convertSetToAlph(BigInt('1000000000000000000'))).toEqual('1'),
    expect(convertSetToAlph(BigInt('99999917646000000000000'))).toEqual('99999.917646'),
    expect(convertSetToAlph(BigInt('99999917646000000000001'))).toEqual('99999.917646000000000001')
})

it('should convert Set amount to fiat amount', () => {
  expect(convertSetToFiat(BigInt('1000000000000000000'), 2)).toEqual(2),
    expect(convertSetToFiat(BigInt('100000000000000000'), 2)).toEqual(0.2),
    expect(convertSetToFiat(BigInt('10000000000000000'), 2)).toEqual(0.02),
    expect(convertSetToFiat(BigInt('1000000000000000'), 2)).toEqual(0.002),
    expect(convertSetToFiat(BigInt('100000000000000'), 2)).toEqual(0.0002),
    expect(convertSetToFiat(BigInt('10000000000000'), 2)).toEqual(0.00002),
    expect(convertSetToFiat(BigInt('1000000000000'), 2)).toEqual(0.000002),
    expect(convertSetToFiat(BigInt('100000000000'), 2)).toEqual(0.0000002),
    expect(convertSetToFiat(BigInt('10000000000'), 2)).toEqual(0.00000002),
    expect(convertSetToFiat(BigInt('1000000000'), 2)).toEqual(0.000000002),
    expect(convertSetToFiat(BigInt('1000000000'), 2)).toEqual(0.000000002),
    expect(convertSetToFiat(BigInt('100000000'), 2)).toEqual(0.0000000002),
    expect(convertSetToFiat(BigInt('10000000'), 2)).toEqual(0.00000000002),
    expect(convertSetToFiat(BigInt('1000000'), 2)).toEqual(0.000000000002),
    expect(convertSetToFiat(BigInt('100000'), 2)).toEqual(0.0000000000002),
    expect(convertSetToFiat(BigInt('10000'), 2)).toEqual(0.00000000000002),
    expect(convertSetToFiat(BigInt('1000'), 2)).toEqual(0.000000000000002),
    expect(convertSetToFiat(BigInt('100'), 2)).toEqual(0.0000000000000002),
    expect(convertSetToFiat(BigInt('10'), 2)).toEqual(0.00000000000000002),
    expect(convertSetToFiat(BigInt('1'), 2)).toEqual(0.000000000000000002),
    expect(convertSetToFiat(BigInt('1000000000000000000'), 2.1)).toEqual(2.1),
    expect(convertSetToFiat(BigInt('1000000000000000000'), 2.100000000001)).toEqual(2.100000000001),
    expect(convertSetToFiat(BigInt('1000000000000000000'), 0)).toEqual(0),
    expect(convertSetToFiat(BigInt('10000000000000000000'), 3)).toEqual(30),
    expect(convertSetToFiat(BigInt('1000000000000000000000000000'), 3)).toEqual(3000000000),
    expect(convertSetToFiat(BigInt('1000000000000000000'), 1e1)).toEqual(10),
    expect(() => convertSetToFiat(BigInt('1000000000000000000'), -2)).toThrow(
      'Invalid fiat value: -2. Fiat value cannot be negative.'
    ),
    expect(() => convertSetToFiat(BigInt('1000000000000000000'), -0.2)).toThrow(
      'Invalid fiat value: -0.2. Fiat value cannot be negative.'
    ),
    expect(() => convertSetToFiat(BigInt('1000000000000000000'), -1e-1)).toThrow(
      'Invalid fiat value: -0.1. Fiat value cannot be negative.'
    )
})

it('should add apostrophes', () => {
  expect(addApostrophes('1')).toEqual('1'),
    expect(addApostrophes('10')).toEqual('10'),
    expect(addApostrophes('100')).toEqual('100'),
    expect(addApostrophes('1000')).toEqual("1'000"),
    expect(addApostrophes('10000')).toEqual("10'000"),
    expect(addApostrophes('100000')).toEqual("100'000"),
    expect(addApostrophes('1000000')).toEqual("1'000'000"),
    expect(addApostrophes('10000000')).toEqual("10'000'000"),
    expect(addApostrophes('100000000')).toEqual("100'000'000"),
    expect(addApostrophes('1000000000')).toEqual("1'000'000'000"),
    expect(addApostrophes('-1')).toEqual('-1'),
    expect(addApostrophes('-10')).toEqual('-10'),
    expect(addApostrophes('-100')).toEqual('-100'),
    expect(addApostrophes('-1000')).toEqual("-1'000"),
    expect(addApostrophes('-10000')).toEqual("-10'000"),
    expect(addApostrophes('-100000')).toEqual("-100'000"),
    expect(addApostrophes('-1000000')).toEqual("-1'000'000"),
    expect(addApostrophes('-10000000')).toEqual("-10'000'000"),
    expect(addApostrophes('-100000000')).toEqual("-100'000'000"),
    expect(addApostrophes('-1000000000')).toEqual("-1'000'000'000"),
    expect(addApostrophes('1.01')).toEqual('1.01'),
    expect(addApostrophes('10.01')).toEqual('10.01'),
    expect(addApostrophes('100.01')).toEqual('100.01'),
    expect(addApostrophes('1000.01')).toEqual("1'000.01"),
    expect(addApostrophes('10000.01')).toEqual("10'000.01"),
    expect(addApostrophes('100000.01')).toEqual("100'000.01"),
    expect(addApostrophes('1000000.01')).toEqual("1'000'000.01"),
    expect(addApostrophes('10000000.01')).toEqual("10'000'000.01"),
    expect(addApostrophes('100000000.01')).toEqual("100'000'000.01"),
    expect(addApostrophes('1000000000.01')).toEqual("1'000'000'000.01"),
    expect(() => addApostrophes('1.01e+1')).toThrow('Invalid number'),
    expect(() => addApostrophes('asdf')).toThrow('Invalid number'),
    expect(() => addApostrophes('')).toThrow('Invalid number')
})

it('should produce the right number of zeros', () => {
  expect(produceZeros(0)).toEqual(''),
    expect(produceZeros(1)).toEqual('0'),
    expect(produceZeros(2)).toEqual('00'),
    expect(produceZeros(3)).toEqual('000'),
    expect(produceZeros(-1)).toEqual('')
})

describe('should test not exported functions', () => {
  const numberUtils = rewire('../dist/lib/numbers')
  const removeTrailingZeros = numberUtils.__get__('removeTrailingZeros')
  const isNumber = numberUtils.__get__('isNumber')

  it('Should remove trailing zeros', () => {
    expect(removeTrailingZeros('0.00010000', minDigits)).toEqual('0.0001'),
      expect(removeTrailingZeros('10000.000', minDigits)).toEqual('10000.000'),
      expect(removeTrailingZeros('10000.100', minDigits)).toEqual('10000.100'),
      expect(removeTrailingZeros('-10000.0001000', minDigits)).toEqual('-10000.0001'),
      expect(removeTrailingZeros('-0.0001020000', minDigits)).toEqual('-0.000102'),
      expect(removeTrailingZeros('0.00010000')).toEqual('0.0001'),
      expect(removeTrailingZeros('10000.000')).toEqual('10000'),
      expect(removeTrailingZeros('-10000.0001000')).toEqual('-10000.0001'),
      expect(removeTrailingZeros('-0.0001020000')).toEqual('-0.000102')
  })

  it('Should check if string is a number', () => {
    expect(isNumber('0.00010000')).toBeTruthy(),
      expect(isNumber('1')).toBeTruthy(),
      expect(isNumber('10000000')).toBeTruthy(),
      expect(isNumber('010000000')).toBeTruthy(),
      expect(isNumber('')).toBeFalsy(),
      expect(isNumber('1.01e+1')).toBeFalsy(),
      expect(isNumber('1a')).toBeFalsy()
  })
})
