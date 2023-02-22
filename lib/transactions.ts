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

import { AssetOutput, Input, Output, Transaction, PendingTransaction, Token } from '../api/api-explorer'
import { GENESIS_TIMESTAMP } from './constants'
import { uniq } from './utils'

export type TransactionDirection = 'out' | 'in'

export type TransactionInfoType = TransactionDirection | 'move' | 'pending'

export type AmountDeltas = {
  alph: bigint
  tokens: {
    id: Token['id']
    amount: bigint
  }[]
}

export const calcTxAmountsDeltaForAddress = (
  tx: Transaction,
  address: string,
  skipConsolidationCheck = false
): AmountDeltas => {
  if (!tx.inputs || !tx.outputs) throw 'Missing transaction details'

  const outputAmounts = summarizeAddressInputOutputAmounts(address, tx.outputs)
  const inputAmounts = summarizeAddressInputOutputAmounts(address, tx.inputs)

  if (!skipConsolidationCheck && isConsolidationTx(tx))
    return removeConsolidationChangeAmount(outputAmounts, tx.outputs)

  const tokensDelta = outputAmounts.tokens
  inputAmounts.tokens.forEach((inputToken) => {
    const tokenDelta = tokensDelta.find((tdelta) => tdelta.id === inputToken.id)

    tokenDelta
      ? (tokenDelta.amount -= inputToken.amount)
      : tokensDelta.push({ id: inputToken.id, amount: inputToken.amount * BigInt(-1) })
  })

  return {
    alph: outputAmounts.alph - inputAmounts.alph,
    tokens: tokensDelta.filter((delta) => delta.amount !== BigInt(0))
  }
}

const summarizeAddressInputOutputAmounts = (address: string, io: (Input | Output)[]) =>
  io.reduce(
    (acc, io) => {
      if (io.address !== address) return acc

      acc.alph += BigInt(io.attoAlphAmount ?? 0)

      if (!io.tokens) return acc

      io.tokens.forEach((token) => {
        const existingToken = acc.tokens.find((t) => t.id === token.id)
        existingToken
          ? (existingToken.amount += BigInt(token.amount))
          : acc.tokens.push({
              id: token.id,
              amount: BigInt(token.amount)
            })
      })

      return acc
    },
    { alph: BigInt(0), tokens: [] } as AmountDeltas
  )

export const getDirection = (tx: Transaction, address: string): TransactionDirection =>
  calcTxAmountsDeltaForAddress(tx, address, true).alph < 0 ? 'out' : 'in'

export const isConsolidationTx = (tx: Transaction | PendingTransaction): boolean => {
  const inputAddresses = tx.inputs ? uniq(tx.inputs.map((input) => input.address)) : []
  const outputAddresses = tx.outputs ? uniq(tx.outputs.map((output) => output.address)) : []

  return inputAddresses.length === 1 && outputAddresses.length === 1 && inputAddresses[0] === outputAddresses[0]
}

export const removeConsolidationChangeAmount = (totalOutputs: AmountDeltas, outputs: AssetOutput[] | Output[]) => {
  const lastOutput = outputs[outputs.length - 1]

  return outputs.length > 1
    ? // If there are multiple outputs, the last one must be the change amount (this is a heuristic and not guaranteed)
      {
        alph: totalOutputs.alph - BigInt(lastOutput.attoAlphAmount),
        tokens: totalOutputs.tokens.map((token) => {
          const outputToken = lastOutput.tokens?.find((t) => t.id === token.id)

          return { id: token.id, amount: token.amount - BigInt(outputToken?.amount ?? 0) }
        })
      }
    : // otherwise, it's a sweep transaction that consolidates all funds
      totalOutputs
}

export const txHasOnlyInternalAddresses = (data: (Input | Output)[], internalAddressHashes: string[]): boolean =>
  data.every((io) => io?.address && internalAddressHashes.some((hash) => hash === io.address))

export const isTxMoveDuplicate = (tx: Transaction, addressHash: string, internalAddressHashes: string[]) =>
  tx.inputs &&
  tx.inputs.length > 0 &&
  txHasOnlyInternalAddresses(tx.inputs, internalAddressHashes) &&
  getDirection(tx, addressHash) == 'in' &&
  tx.timestamp !== GENESIS_TIMESTAMP
