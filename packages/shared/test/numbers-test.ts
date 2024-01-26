/*
Copyright 2018 - 2024 The Alephium Authors
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
  aboveExpLimit,
  addApostrophes,
  calculateAmountWorth,
  exponentialToLiteral,
  formatAmountForDisplay,
  formatFiatAmountForDisplay,
  fromHumanReadableAmount,
  produceZeros,
  toHumanReadableAmount
} from '../lib/numbers'

const minDigits = 3

it('Should abbreviate ALPH amount', () => {
  expect(formatAmountForDisplay({ amount: BigInt('-1') })).toEqual('???'),
    expect(formatAmountForDisplay({ amount: BigInt('0') })).toEqual('0'),
    expect(formatAmountForDisplay({ amount: BigInt('1') })).toEqual('0.000000000000000001'),
    expect(formatAmountForDisplay({ amount: BigInt('100000') })).toEqual('0.0000000000001'),
    expect(formatAmountForDisplay({ amount: BigInt('900000000000') })).toEqual('0.0000009'),
    expect(formatAmountForDisplay({ amount: BigInt('4000000000000') })).toEqual('0.000004'),
    expect(formatAmountForDisplay({ amount: BigInt('6000000000000') })).toEqual('0.000006'),
    expect(formatAmountForDisplay({ amount: BigInt('2000000000000000') })).toEqual('0.002'),
    expect(formatAmountForDisplay({ amount: BigInt('20000000000000000') })).toEqual('0.02'),
    expect(formatAmountForDisplay({ amount: BigInt('200000000000000000') })).toEqual('0.20'),
    expect(formatAmountForDisplay({ amount: BigInt('2000000000000000000') })).toEqual('2.00'),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000') })).toEqual("1'230.00"),
    expect(formatAmountForDisplay({ amount: BigInt('10230000000000000000000') })).toEqual("10'230.00"),
    expect(formatAmountForDisplay({ amount: BigInt('100230000000000000000000') })).toEqual("100'230.00"),
    expect(formatAmountForDisplay({ amount: BigInt('999999990000000000000000') })).toEqual("999'999.99"),
    expect(formatAmountForDisplay({ amount: BigInt('999999999000000000000000') })).toEqual('1.00M'),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000') })).toEqual('1.23M'),
    expect(formatAmountForDisplay({ amount: BigInt('1000000000000000000000000') })).toEqual('1.00M'),
    expect(formatAmountForDisplay({ amount: BigInt('1234000000000000000000000') })).toEqual('1.23M'),
    expect(formatAmountForDisplay({ amount: BigInt('9996000000000000000000000') })).toEqual('10.00M'),
    expect(formatAmountForDisplay({ amount: BigInt('99996000000000000000000000') })).toEqual('100.00M'),
    expect(formatAmountForDisplay({ amount: BigInt('999996000000000000000000000') })).toEqual('1.00B'),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000') })).toEqual('1.23B'),
    expect(formatAmountForDisplay({ amount: BigInt('1235000000000000000000000000') })).toEqual('1.24B'),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000000') })).toEqual('1.23T'),
    expect(formatAmountForDisplay({ amount: BigInt('1237000000000000000000000000000') })).toEqual('1.24T'),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000000000') })).toEqual("1'230.00T"),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000000000000') })).toEqual('1.23e+18'),
    expect(
      formatAmountForDisplay({ amount: BigInt('999999999990000000000000000000000000000'), truncate: true })
    ).toEqual('9.99e+20'),
    expect(formatAmountForDisplay({ amount: BigInt('999999999990000000000000000000000000000') })).toEqual('1.00e+21'),
    expect(formatAmountForDisplay({ amount: BigInt('1000000000000000000') })).toEqual('1.00'),
    expect(formatAmountForDisplay({ amount: BigInt('-1000000000000000000') })).toEqual('???')
})

it('Should abbreviate token amount', () => {
  expect(formatAmountForDisplay({ amount: BigInt('-1'), amountDecimals: 17 })).toEqual('???'),
    expect(formatAmountForDisplay({ amount: BigInt('0'), amountDecimals: 17 })).toEqual('0'),
    expect(formatAmountForDisplay({ amount: BigInt('1'), amountDecimals: 17 })).toEqual('0.00000000000000001'),
    expect(formatAmountForDisplay({ amount: BigInt('100000'), amountDecimals: 17 })).toEqual('0.000000000001'),
    expect(formatAmountForDisplay({ amount: BigInt('9000000'), amountDecimals: 17 })).toEqual('0.00000000009'),
    expect(formatAmountForDisplay({ amount: BigInt('90000000'), amountDecimals: 17 })).toEqual('0.0000000009'),
    expect(formatAmountForDisplay({ amount: BigInt('900000000'), amountDecimals: 17 })).toEqual('0.000000009'),
    expect(formatAmountForDisplay({ amount: BigInt('9000000000'), amountDecimals: 17 })).toEqual('0.00000009'),
    expect(formatAmountForDisplay({ amount: BigInt('90000000000'), amountDecimals: 17 })).toEqual('0.0000009'),
    expect(formatAmountForDisplay({ amount: BigInt('400000000000'), amountDecimals: 17 })).toEqual('0.000004'),
    expect(formatAmountForDisplay({ amount: BigInt('4000000000000'), amountDecimals: 17 })).toEqual('0.00004'),
    expect(formatAmountForDisplay({ amount: BigInt('5000000000000'), amountDecimals: 17 })).toEqual('0.00005'),
    expect(formatAmountForDisplay({ amount: BigInt('6000000000000'), amountDecimals: 17 })).toEqual('0.00006'),
    expect(formatAmountForDisplay({ amount: BigInt('60000000000000'), amountDecimals: 17 })).toEqual('0.0006'),
    expect(formatAmountForDisplay({ amount: BigInt('600000000000000'), amountDecimals: 17 })).toEqual('0.006'),
    expect(formatAmountForDisplay({ amount: BigInt('6000000000000000'), amountDecimals: 17 })).toEqual('0.06'),
    expect(formatAmountForDisplay({ amount: BigInt('60000000000000000'), amountDecimals: 17 })).toEqual('0.60'),
    expect(formatAmountForDisplay({ amount: BigInt('2000000000000000'), amountDecimals: 17 })).toEqual('0.02'),
    expect(formatAmountForDisplay({ amount: BigInt('20000000000000000'), amountDecimals: 17 })).toEqual('0.20'),
    expect(formatAmountForDisplay({ amount: BigInt('200000000000000000'), amountDecimals: 17 })).toEqual('2.00'),
    expect(formatAmountForDisplay({ amount: BigInt('2000000000000000000'), amountDecimals: 17 })).toEqual('20.00'),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000'), amountDecimals: 17 })).toEqual(
      "12'300.00"
    ),
    expect(formatAmountForDisplay({ amount: BigInt('10230000000000000000000'), amountDecimals: 17 })).toEqual(
      "102'300.00"
    ),
    expect(formatAmountForDisplay({ amount: BigInt('100230000000000000000000'), amountDecimals: 17 })).toEqual('1.00M'),
    expect(formatAmountForDisplay({ amount: BigInt('999999990000000000000000'), amountDecimals: 17 })).toEqual(
      '10.00M'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('999999999000000000000000'), amountDecimals: 17 })).toEqual(
      '10.00M'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000'), amountDecimals: 17 })).toEqual(
      '12.30M'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1000000000000000000000000'), amountDecimals: 17 })).toEqual(
      '10.00M'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1234000000000000000000000'), amountDecimals: 17 })).toEqual(
      '12.34M'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('9996000000000000000000000'), amountDecimals: 17 })).toEqual(
      '99.96M'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('99996000000000000000000000'), amountDecimals: 17 })).toEqual(
      '999.96M'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('999996000000000000000000000'), amountDecimals: 17 })).toEqual(
      '10.00B'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000'), amountDecimals: 17 })).toEqual(
      '12.30B'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1235000000000000000000000000'), amountDecimals: 17 })).toEqual(
      '12.35B'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000000'), amountDecimals: 17 })).toEqual(
      '12.30T'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1237000000000000000000000000000'), amountDecimals: 17 })).toEqual(
      '12.37T'
    ),
    expect(
      formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000000000'), amountDecimals: 17 })
    ).toEqual("12'300.00T"),
    expect(
      formatAmountForDisplay({
        amount: BigInt('10000000000000000000000000000000000'),
        amountDecimals: 17
      })
    ).toEqual("100'000.00T"),
    expect(
      formatAmountForDisplay({
        amount: BigInt('99999999999999999999999999999999999'),
        amountDecimals: 17
      })
    ).toEqual('1.00e+18'),
    expect(
      formatAmountForDisplay({ amount: BigInt('100000000000000000000000000000000000'), amountDecimals: 17 })
    ).toEqual('1.00e+18'),
    expect(
      formatAmountForDisplay({
        amount: BigInt('100000000000000000000000000000000000'),
        amountDecimals: 17,
        displayDecimals: 0
      })
    ).toEqual('1e+18'),
    expect(
      formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000000000000'), amountDecimals: 17 })
    ).toEqual('1.23e+19'),
    expect(
      formatAmountForDisplay({
        amount: BigInt('999999999990000000000000000000000000000'),
        amountDecimals: 17
      })
    ).toEqual('1.00e+22'),
    expect(
      formatAmountForDisplay({
        amount: BigInt('999999999990000000000000000000000000000'),
        amountDecimals: 17,
        displayDecimals: 1,
        truncate: true
      })
    ).toEqual('9.9e+21'),
    expect(
      formatAmountForDisplay({
        amount: BigInt('999999999990000000000000000000000000000'),
        amountDecimals: 17,
        displayDecimals: 3,
        truncate: true
      })
    ).toEqual('9.999e+21'),
    expect(formatAmountForDisplay({ amount: BigInt('1000000000000000000'), amountDecimals: 17 })).toEqual('10.00'),
    expect(formatAmountForDisplay({ amount: BigInt('-1000000000000000000'), amountDecimals: 17 })).toEqual('???'),
    expect(formatAmountForDisplay({ amount: BigInt('1000000000000000000000000000000'), amountDecimals: 30 })).toEqual(
      '1.00'
    ),
    expect(
      formatAmountForDisplay({
        amount: BigInt('1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'),
        amountDecimals: 90
      })
    ).toEqual('1.00'),
    expect(
      formatAmountForDisplay({
        amount: BigInt('1999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999'),
        amountDecimals: 90
      })
    ).toEqual('2.00'),
    expect(formatAmountForDisplay({ amount: BigInt('1'), amountDecimals: 0 })).toEqual('1.00'),
    expect(formatAmountForDisplay({ amount: BigInt('12'), amountDecimals: 17, smartRounding: false })).toEqual(
      '0.00000000000000012'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('12'), amountDecimals: 17, smartRounding: true })).toEqual(
      '0.0000000000000001'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('15'), amountDecimals: 17, smartRounding: true })).toEqual(
      '0.000000000000002'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('99100000'), amountDecimals: 17, smartRounding: true })).toEqual(
      '0.000000001'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('4590000000'), amountDecimals: 17, smartRounding: true })).toEqual(
      '0.0000005'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('4110000000'), amountDecimals: 17, smartRounding: true })).toEqual(
      '0.00000004'
    )
})

it('Should keep full amount precision', () => {
  expect(formatAmountForDisplay({ amount: BigInt('0'), fullPrecision: true })).toEqual('0'),
    expect(formatAmountForDisplay({ amount: BigInt('1'), fullPrecision: true })).toEqual('0.000000000000000001'),
    expect(formatAmountForDisplay({ amount: BigInt('100001'), fullPrecision: true })).toEqual('0.000000000000100001'),
    expect(formatAmountForDisplay({ amount: BigInt('1000000000'), fullPrecision: true })).toEqual('0.000000001'),
    expect(formatAmountForDisplay({ amount: BigInt('1000000001'), fullPrecision: true })).toEqual(
      '0.000000001000000001'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('2000000000'), fullPrecision: true })).toEqual('0.000000002'),
    expect(formatAmountForDisplay({ amount: BigInt('2000000002'), fullPrecision: true })).toEqual(
      '0.000000002000000002'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('2000000000000000'), fullPrecision: true })).toEqual('0.002'),
    expect(formatAmountForDisplay({ amount: BigInt('20000000000000000'), fullPrecision: true })).toEqual('0.02'),
    expect(formatAmountForDisplay({ amount: BigInt('200000000000000000'), fullPrecision: true })).toEqual('0.20'),
    expect(formatAmountForDisplay({ amount: BigInt('2000000000000000000'), fullPrecision: true })).toEqual('2.00'),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000'), fullPrecision: true })).toEqual(
      '1230.00'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000'), fullPrecision: true })).toEqual(
      '1230000.00'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000'), fullPrecision: true })).toEqual(
      '1230000000.00'
    ),
    expect(formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000000'), fullPrecision: true })).toEqual(
      '1230000000000.00'
    ),
    expect(
      formatAmountForDisplay({ amount: BigInt('1230000000000000000000000000000000'), fullPrecision: true })
    ).toEqual('1230000000000000.00'),
    expect(formatAmountForDisplay({ amount: BigInt('1000000000000000000'), fullPrecision: true })).toEqual('1.00'),
    expect(
      formatAmountForDisplay({ amount: BigInt('1000000000000000000'), fullPrecision: true, displayDecimals: 3 })
    ).toEqual('1.000')
})

it('Should display a defined number of decimals', () => {
  expect(formatAmountForDisplay({ amount: BigInt('20053549281751930708'), displayDecimals: 5 })).toEqual('20.05355'),
    expect(
      formatAmountForDisplay({ amount: BigInt('20053549281751930708'), displayDecimals: 5, amountDecimals: 17 })
    ).toEqual('200.53549'),
    expect(
      formatAmountForDisplay({ amount: BigInt('20053549281751930708'), displayDecimals: 5, amountDecimals: 0 })
    ).toEqual('2.00535e+19'),
    expect(
      formatAmountForDisplay({ amount: BigInt('20053549281751930708'), displayDecimals: 5, amountDecimals: 17 })
    ).toEqual('200.53549')
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

it('should convert amount to human readable amount', () => {
  expect(fromHumanReadableAmount('0')).toEqual(BigInt('0')),
    expect(fromHumanReadableAmount('1')).toEqual(BigInt('1000000000000000000')),
    expect(fromHumanReadableAmount('10')).toEqual(BigInt('10000000000000000000')),
    expect(fromHumanReadableAmount('999999999')).toEqual(BigInt('999999999000000000000000000')),
    expect(fromHumanReadableAmount('999999999999')).toEqual(BigInt('999999999999000000000000000000')),
    expect(fromHumanReadableAmount('0.1')).toEqual(BigInt('100000000000000000')),
    expect(fromHumanReadableAmount('.1')).toEqual(BigInt('100000000000000000')),
    expect(fromHumanReadableAmount('0.01')).toEqual(BigInt('10000000000000000')),
    expect(fromHumanReadableAmount('0.00000009')).toEqual(BigInt('90000000000')),
    expect(fromHumanReadableAmount('0.000000000000000001')).toEqual(BigInt('1')),
    expect(() => fromHumanReadableAmount('-1')).toThrow('Invalid displayed amount'),
    expect(() => fromHumanReadableAmount('-0.000000000000000001')).toThrow('Invalid displayed amount'),
    expect(fromHumanReadableAmount('0', 0)).toEqual(BigInt('0')),
    expect(fromHumanReadableAmount('1', 0)).toEqual(BigInt('1')),
    expect(fromHumanReadableAmount('10', 0)).toEqual(BigInt('10')),
    expect(fromHumanReadableAmount('10', 1)).toEqual(BigInt('100')),
    expect(fromHumanReadableAmount('10.1', 1)).toEqual(BigInt('101')),
    expect(fromHumanReadableAmount('10.12', 2)).toEqual(BigInt('1012')),
    expect(() => fromHumanReadableAmount('1.1', 0)).toThrow(
      'Cannot convert human readable amount because it has too many decimal points'
    ),
    expect(() => fromHumanReadableAmount('1.12', 1)).toThrow(
      'Cannot convert human readable amount because it has too many decimal points'
    )
})

it('should convert exponential notation string to literal string amount', () => {
  expect(exponentialToLiteral('1e-1')).toEqual('0.1'),
    expect(exponentialToLiteral('1.1e-2')).toEqual('0.011'),
    expect(exponentialToLiteral('1e+1')).toEqual('10'),
    expect(exponentialToLiteral('1e+2')).toEqual('100'),
    expect(exponentialToLiteral('1.7e+2')).toEqual('170'),
    expect(exponentialToLiteral('1.3e+12')).toEqual('1300000000000')
})

it('should detect if string number is equal or above 999999 trillions', () => {
  expect(aboveExpLimit('10000000000000000000')).toBeTruthy(),
    expect(aboveExpLimit('1000000000000000000')).toBeTruthy(),
    expect(aboveExpLimit('999999999999999999')).toBeTruthy(),
    expect(aboveExpLimit('9.99e+17')).toBeTruthy(),
    expect(aboveExpLimit('1.00e+18')).toBeTruthy(),
    expect(aboveExpLimit('100000000000000')).toBeFalsy(),
    expect(aboveExpLimit('1')).toBeFalsy(),
    expect(aboveExpLimit('0.01')).toBeFalsy(),
    expect(aboveExpLimit('1e+18')).toBeTruthy(),
    expect(aboveExpLimit('1e+16')).toBeFalsy(),
    expect(aboveExpLimit('1e+15')).toBeFalsy(),
    expect(aboveExpLimit('9.99e+14')).toBeFalsy(),
    expect(aboveExpLimit('1e+14')).toBeFalsy()
})

it('should convert Set amount to Alph amount', () => {
  expect(toHumanReadableAmount(BigInt('0'))).toEqual('0'),
    expect(toHumanReadableAmount(BigInt('1'))).toEqual('0.000000000000000001'),
    expect(toHumanReadableAmount(BigInt('100000000000000000'))).toEqual('0.1'),
    expect(toHumanReadableAmount(BigInt('1000000000000000000'))).toEqual('1'),
    expect(toHumanReadableAmount(BigInt('99999917646000000000000'))).toEqual('99999.917646'),
    expect(toHumanReadableAmount(BigInt('99999917646000000000001'))).toEqual('99999.917646000000000001')
})

it('should convert Set amount to fiat amount', () => {
  expect(calculateAmountWorth(BigInt('1000000000000000000'), 2)).toEqual(2),
    expect(calculateAmountWorth(BigInt('100000000000000000'), 2)).toEqual(0.2),
    expect(calculateAmountWorth(BigInt('10000000000000000'), 2)).toEqual(0.02),
    expect(calculateAmountWorth(BigInt('1000000000000000'), 2)).toEqual(0.002),
    expect(calculateAmountWorth(BigInt('100000000000000'), 2)).toEqual(0.0002),
    expect(calculateAmountWorth(BigInt('10000000000000'), 2)).toEqual(0.00002),
    expect(calculateAmountWorth(BigInt('1000000000000'), 2)).toEqual(0.000002),
    expect(calculateAmountWorth(BigInt('100000000000'), 2)).toEqual(0.0000002),
    expect(calculateAmountWorth(BigInt('10000000000'), 2)).toEqual(0.00000002),
    expect(calculateAmountWorth(BigInt('1000000000'), 2)).toEqual(0.000000002),
    expect(calculateAmountWorth(BigInt('100000000'), 2)).toEqual(0.0000000002),
    expect(calculateAmountWorth(BigInt('10000000'), 2)).toEqual(0.00000000002),
    expect(calculateAmountWorth(BigInt('1000000'), 2)).toEqual(0.000000000002),
    expect(calculateAmountWorth(BigInt('100000'), 2)).toEqual(0.0000000000002),
    expect(calculateAmountWorth(BigInt('10000'), 2)).toEqual(0.00000000000002),
    expect(calculateAmountWorth(BigInt('1000'), 2)).toEqual(0.000000000000002),
    expect(calculateAmountWorth(BigInt('100'), 2)).toEqual(0.0000000000000002),
    expect(calculateAmountWorth(BigInt('10'), 2)).toEqual(0.00000000000000002),
    expect(calculateAmountWorth(BigInt('1'), 2)).toEqual(0.000000000000000002),
    expect(calculateAmountWorth(BigInt('1000000000000000000'), 2.1)).toEqual(2.1),
    expect(calculateAmountWorth(BigInt('1000000000000000000'), 2.100000000001)).toEqual(2.100000000001),
    expect(calculateAmountWorth(BigInt('1000000000000000000'), 0)).toEqual(0),
    expect(calculateAmountWorth(BigInt('10000000000000000000'), 3)).toEqual(30),
    expect(calculateAmountWorth(BigInt('1000000000000000000000000000'), 3)).toEqual(3000000000),
    expect(calculateAmountWorth(BigInt('1000000000000000000'), 1e1)).toEqual(10),
    expect(() => calculateAmountWorth(BigInt('1000000000000000000'), -2)).toThrow(
      'Invalid fiat price: -2. Fiat price cannot be negative.'
    ),
    expect(() => calculateAmountWorth(BigInt('1000000000000000000'), -0.2)).toThrow(
      'Invalid fiat price: -0.2. Fiat price cannot be negative.'
    ),
    expect(() => calculateAmountWorth(BigInt('1000000000000000000'), -1e-1)).toThrow(
      'Invalid fiat price: -0.1. Fiat price cannot be negative.'
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
    expect(addApostrophes('1.01e+1')).toEqual('1.01e+1'),
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
  const numberUtils = rewire('../dist/numbers')
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
      expect(isNumber('1.01e+1')).toBeTruthy(),
      expect(isNumber('')).toBeFalsy(),
      expect(isNumber('1a')).toBeFalsy()
  })
})
