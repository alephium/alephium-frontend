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

import { calcTxAmountsDeltaForAddress } from '../lib/transactions'
import transactions from './fixtures/transactions.json'

it('should calucate the amount delta between the inputs and outputs of an address in a transaction', () => {
  expect(
    calcTxAmountsDeltaForAddress(transactions.oneInputOneOutput, transactions.oneInputOneOutput.inputs[0].address).alph
  ).toEqual(BigInt('-50000000000000000000')),
    expect(
      calcTxAmountsDeltaForAddress(transactions.twoInputsOneOutput, transactions.twoInputsOneOutput.inputs[0].address)
        .alph
    ).toEqual(BigInt('-150000000000000000000')),
    expect(
      calcTxAmountsDeltaForAddress(transactions.twoInputsZeroOutput, transactions.twoInputsZeroOutput.inputs[0].address)
        .alph
    ).toEqual(BigInt('-200000000000000000000')),
    expect(() =>
      calcTxAmountsDeltaForAddress(transactions.missingInputs, transactions.missingInputs.outputs[0].address)
    ).toThrowError('Missing transaction details'),
    expect(() =>
      calcTxAmountsDeltaForAddress(transactions.missingOutputs, transactions.missingOutputs.inputs[0].address)
    ).toThrowError('Missing transaction details')
})
