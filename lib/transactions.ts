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

import { AssetOutput, Output, Transaction, UnconfirmedTransaction } from '../api/api-explorer'
import { uniq } from './utils'

export type TransactionDirection = 'out' | 'in'

export const calcTxAmountDeltaForAddress = (
  tx: Transaction,
  address: string,
  skipConsolidationCheck = false
): bigint => {
  if (!tx.inputs || !tx.outputs) throw 'Missing transaction details'

  const outputAmount = tx.outputs.reduce<bigint>(
    (acc, output) => (output.address === address ? acc + BigInt(output.attoAlphAmount) : acc),
    BigInt(0)
  )

  if (!skipConsolidationCheck && isConsolidationTx(tx)) {
    return removeConsolidationChangeAmount(outputAmount, tx.outputs)
  }

  const inputAmount = tx.inputs.reduce<bigint>(
    (acc, input) => (input.attoAlphAmount && input.address === address ? acc + BigInt(input.attoAlphAmount) : acc),
    BigInt(0)
  )

  return outputAmount - inputAmount
}

export const getDirection = (tx: Transaction, address: string): TransactionDirection =>
  calcTxAmountDeltaForAddress(tx, address, true) < 0 ? 'out' : 'in'

export const isConsolidationTx = (tx: Transaction | UnconfirmedTransaction): boolean => {
  const inputAddresses = tx.inputs ? uniq(tx.inputs.map((input) => input.address)) : []
  const outputAddresses = tx.outputs ? uniq(tx.outputs.map((output) => output.address)) : []

  return inputAddresses.length === 1 && outputAddresses.length === 1 && inputAddresses[0] === outputAddresses[0]
}

const removeConsolidationChangeAmount = (totalOutputAmount: bigint, outputs: AssetOutput[] | Output[]) =>
  outputs.length > 1
    ? // If there are multiple outputs, the last one must be the change amount (this is a heuristic and not guaranteed)
      totalOutputAmount - BigInt(outputs[outputs.length - 1].attoAlphAmount)
    : // otherwise, it's a sweep transaction that consolidates all funds
      totalOutputAmount
