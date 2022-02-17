/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your 'optio') any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import rewire from 'rewire'
import {
  abbreviateAmount,
  calAmountDelta,
  convertScientificToFloatString,
  convertAlphToSet,
  convertSetToAlph
} from '../lib/numbers'

import transactions from './fixtures/transactions.json'

const alph = (amount: bigint) => {
  return amount * BigInt('1000000000000000000')
}

const minDigits = 3

it('Should abbreviate amount', () => {
  expect(abbreviateAmount(alph(BigInt(-1)))).toEqual('???'),
    expect(abbreviateAmount(BigInt(0))).toEqual('0.00'),
    expect(abbreviateAmount(BigInt(1))).toEqual('0.00'),
    expect(abbreviateAmount(BigInt(100000))).toEqual('0.00'),
    expect(abbreviateAmount(BigInt(900000000000))).toEqual('0.00'),
    expect(abbreviateAmount(BigInt(4000000000000))).toEqual('0.00'),
    expect(abbreviateAmount(BigInt(5000000000000))).toEqual('0.00001'),
    expect(abbreviateAmount(BigInt(6000000000000))).toEqual('0.00001'),
    expect(abbreviateAmount(BigInt(2000000000000000))).toEqual('0.002'),
    expect(abbreviateAmount(BigInt('20000000000000000'))).toEqual('0.02'),
    expect(abbreviateAmount(BigInt('200000000000000000'))).toEqual('0.20'),
    expect(abbreviateAmount(BigInt('2000000000000000000'))).toEqual('2.00'),
    expect(abbreviateAmount(alph(BigInt(1230)))).toEqual("1'230.00"),
    expect(abbreviateAmount(alph(BigInt(1230000)))).toEqual('1.23M'),
    expect(abbreviateAmount(alph(BigInt(1234000)))).toEqual('1.23M'),
    expect(abbreviateAmount(alph(BigInt(1230000000)))).toEqual('1.23B'),
    expect(abbreviateAmount(alph(BigInt(1235000000)))).toEqual('1.24B'),
    expect(abbreviateAmount(alph(BigInt(1230000000000)))).toEqual('1.23T'),
    expect(abbreviateAmount(alph(BigInt(1237000000000)))).toEqual('1.24T'),
    expect(abbreviateAmount(alph(BigInt(1230000000000000)))).toEqual('1230.00T'),
    expect(abbreviateAmount(alph(BigInt(1)))).toEqual('1.00')
})

it('Should keep full amount precision', () => {
  expect(abbreviateAmount(alph(BigInt(-1)))).toEqual('???'),
    expect(abbreviateAmount(BigInt(0), true)).toEqual('0.00'),
    expect(abbreviateAmount(BigInt(1), true)).toEqual('0.000000000000000001'),
    expect(abbreviateAmount(BigInt(100001), true)).toEqual('0.000000000000100001'),
    expect(abbreviateAmount(BigInt(1000000000), true)).toEqual('0.000000001'),
    expect(abbreviateAmount(BigInt(1000000001), true)).toEqual('0.000000001000000001'),
    expect(abbreviateAmount(BigInt(2000000000), true)).toEqual('0.000000002'),
    expect(abbreviateAmount(BigInt(2000000002), true)).toEqual('0.000000002000000002'),
    expect(abbreviateAmount(BigInt(2000000000000000), true)).toEqual('0.002'),
    expect(abbreviateAmount(BigInt('20000000000000000'), true)).toEqual('0.02'),
    expect(abbreviateAmount(BigInt('200000000000000000'), true)).toEqual('0.20'),
    expect(abbreviateAmount(BigInt('2000000000000000000'), true)).toEqual('2.00'),
    expect(abbreviateAmount(alph(BigInt(1230)), true)).toEqual('1230.00'),
    expect(abbreviateAmount(alph(BigInt(1230000)), true)).toEqual('1230000.00'),
    expect(abbreviateAmount(alph(BigInt(1230000000)), true)).toEqual('1230000000.00'),
    expect(abbreviateAmount(alph(BigInt(1230000000000)), true)).toEqual('1230000000000.00'),
    expect(abbreviateAmount(alph(BigInt(1230000000000000)), true)).toEqual('1230000000000000.00'),
    expect(abbreviateAmount(alph(BigInt(1)), true)).toEqual('1.00')
})

it('should calucate the amount delta between the inputs and outputs of an address in a transaction', () => {
  expect(calAmountDelta(transactions.oneInputOneOutput, transactions.oneInputOneOutput.inputs[0].address)).toEqual(
    alph(BigInt(-50))
  ),
    expect(calAmountDelta(transactions.twoInputsOneOutput, transactions.twoInputsOneOutput.inputs[0].address)).toEqual(
      alph(BigInt(-150))
    ),
    expect(
      calAmountDelta(transactions.twoInputsZeroOutput, transactions.twoInputsZeroOutput.inputs[0].address)
    ).toEqual(alph(BigInt(-200))),
    expect(() =>
      calAmountDelta(transactions.missingInputs, transactions.missingInputs.outputs[0].address)
    ).toThrowError('Missing transaction details'),
    expect(() =>
      calAmountDelta(transactions.missingOutputs, transactions.missingOutputs.inputs[0].address)
    ).toThrowError('Missing transaction details')
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
    expect(convertAlphToSet('1e-1')).toEqual(BigInt('100000000000000000')),
    expect(convertAlphToSet('1e-2')).toEqual(BigInt('10000000000000000')),
    expect(convertAlphToSet('1e-17')).toEqual(BigInt('10')),
    expect(convertAlphToSet('1e-18')).toEqual(BigInt('1')),
    expect(convertAlphToSet('1.1e-1')).toEqual(BigInt('110000000000000000')),
    expect(convertAlphToSet('1.11e-1')).toEqual(BigInt('111000000000000000')),
    expect(convertAlphToSet('1.99999999999999999e-1')).toEqual(BigInt('199999999999999999')),
    expect(convertAlphToSet('1e+1')).toEqual(BigInt('10000000000000000000')),
    expect(convertAlphToSet('1e+2')).toEqual(BigInt('100000000000000000000')),
    expect(convertAlphToSet('1e+17')).toEqual(BigInt('100000000000000000000000000000000000')),
    expect(convertAlphToSet('1e+18')).toEqual(BigInt('1000000000000000000000000000000000000')),
    expect(convertAlphToSet('1.1e+1')).toEqual(BigInt('11000000000000000000')),
    expect(convertAlphToSet('1.99999999999999999e+1')).toEqual(BigInt('19999999999999999900')),
    expect(convertAlphToSet('123.45678e+2')).toEqual(BigInt('12345678000000000000000')),
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

it('should convert scientific numbers to floats or integers', () => {
  expect(convertScientificToFloatString('1e-1')).toEqual('0.1'),
    expect(convertScientificToFloatString('1e-2')).toEqual('0.01'),
    expect(convertScientificToFloatString('1e-17')).toEqual('0.00000000000000001'),
    expect(convertScientificToFloatString('1e-18')).toEqual('0.000000000000000001'),
    expect(convertScientificToFloatString('1.1e-1')).toEqual('0.11'),
    expect(convertScientificToFloatString('1.11e-1')).toEqual('0.111'),
    expect(convertScientificToFloatString('1.99999999999999999e-1')).toEqual('0.199999999999999999'),
    expect(convertScientificToFloatString('123.45678e-2')).toEqual('1.2345678'),
    expect(convertScientificToFloatString('1e+1')).toEqual('10'),
    expect(convertScientificToFloatString('1e+2')).toEqual('100'),
    expect(convertScientificToFloatString('1e+17')).toEqual('100000000000000000'),
    expect(convertScientificToFloatString('1e+18')).toEqual('1000000000000000000'),
    expect(convertScientificToFloatString('1.1e+1')).toEqual('11'),
    expect(convertScientificToFloatString('1.99999999999999999e+1')).toEqual('19.9999999999999999'),
    expect(convertScientificToFloatString('123.45678e+2')).toEqual('12345.678'),
    expect(convertScientificToFloatString('-1e-1')).toEqual('-0.1'),
    expect(convertScientificToFloatString('-1e-2')).toEqual('-0.01'),
    expect(convertScientificToFloatString('-1e-17')).toEqual('-0.00000000000000001'),
    expect(convertScientificToFloatString('-1e-18')).toEqual('-0.000000000000000001'),
    expect(convertScientificToFloatString('-1.1e-1')).toEqual('-0.11'),
    expect(convertScientificToFloatString('-1.11e-1')).toEqual('-0.111'),
    expect(convertScientificToFloatString('-1.99999999999999999e-1')).toEqual('-0.199999999999999999'),
    expect(convertScientificToFloatString('-123.45678e-2')).toEqual('-1.2345678'),
    expect(convertScientificToFloatString('-1e+1')).toEqual('-10'),
    expect(convertScientificToFloatString('-1e+2')).toEqual('-100'),
    expect(convertScientificToFloatString('-1e+17')).toEqual('-100000000000000000'),
    expect(convertScientificToFloatString('-1e+18')).toEqual('-1000000000000000000'),
    expect(convertScientificToFloatString('-1.1e+1')).toEqual('-11'),
    expect(convertScientificToFloatString('-1.99999999999999999e+1')).toEqual('-19.9999999999999999'),
    expect(convertScientificToFloatString('-123.45678e+2')).toEqual('-12345.678'),
    expect(convertScientificToFloatString('123.45678e2')).toEqual('12345.678'),
    expect(convertScientificToFloatString('1e18')).toEqual('1000000000000000000'),
    expect(convertScientificToFloatString('.1e19')).toEqual('1000000000000000000')
})

it('should convert Set amount amount to Alph amount', () => {
  expect(convertSetToAlph(BigInt('0'))).toEqual('0'),
    expect(convertSetToAlph(BigInt('1'))).toEqual('0.000000000000000001'),
    expect(convertSetToAlph(BigInt('100000000000000000'))).toEqual('0.1'),
    expect(convertSetToAlph(BigInt('1000000000000000000'))).toEqual('1'),
    expect(convertSetToAlph(BigInt('99999917646000000000000'))).toEqual('99999.917646'),
    expect(convertSetToAlph(BigInt('99999917646000000000001'))).toEqual('99999.917646000000000001')
})

describe('should test not exported functions', () => {
  const numberUtils = rewire('../dist/lib/numbers')
  const removeTrailingZeros = numberUtils.__get__('removeTrailingZeros')
  const hasExactlyOneDecimalPoint = numberUtils.__get__('hasExactlyOneDecimalPoint')

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

  it('should evaluate whether there is only 1 decimal', () => {
    expect(hasExactlyOneDecimalPoint(0.1)).toEqual(true),
      expect(hasExactlyOneDecimalPoint(-0.1)).toEqual(true),
      expect(hasExactlyOneDecimalPoint(999999999999.9)).toEqual(true),
      expect(hasExactlyOneDecimalPoint(9999999999999.9)).toEqual(true),
      expect(hasExactlyOneDecimalPoint(0.19)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(1000000.10001)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(1000000.0000000001)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(0.1234567891234567)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(-0.19)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(-1000000.10001)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(-1000000.0000000001)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(1e-17)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(1.1e-17)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(-1.23456789e-20)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(-1.2e100)).toEqual(false),
      expect(hasExactlyOneDecimalPoint(1.23456789e-20)).toEqual(false)
  })
})
