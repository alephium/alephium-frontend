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

import { AssetOutput, Input, MempoolTransaction, Output, Transaction } from '@alephium/web3/dist/src/api/api-explorer'

import { AddressHash } from '@/types/addresses'
import { Asset, AssetAmount } from '@/types/assets'
import { AmountDeltas, TransactionDirection } from '@/types/transactions'
import { uniq } from '@/utils'

export const calcTxAmountsDeltaForAddress = (
  tx: Transaction | MempoolTransaction,
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
    const tokenDelta = tokensDelta.find(({ id }) => id === inputToken.id)

    tokenDelta
      ? (tokenDelta.amount -= inputToken.amount)
      : tokensDelta.push({ ...inputToken, amount: inputToken.amount * BigInt(-1) })
  })

  return {
    alph: outputAmounts.alph - inputAmounts.alph,
    tokens: tokensDelta.filter(({ amount }) => amount !== BigInt(0))
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

export const getDirection = (tx: Transaction | MempoolTransaction, address: string): TransactionDirection =>
  calcTxAmountsDeltaForAddress(tx, address, true).alph < 0 ? 'out' : 'in'

export const isConsolidationTx = (tx: Transaction | MempoolTransaction): boolean => {
  const inputAddresses = tx.inputs ? uniq(tx.inputs.map((input) => input.address)) : []
  const outputAddresses = tx.outputs ? uniq(tx.outputs.map((output) => output.address)) : []

  return inputAddresses.length === 1 && outputAddresses.length === 1 && inputAddresses[0] === outputAddresses[0]
}

export const isMempoolTx = (transaction: Transaction | MempoolTransaction): transaction is MempoolTransaction =>
  !('blockHash' in transaction)

export const isInternalTx = (tx: Transaction, internalAddresses: AddressHash[]): boolean =>
  [...(tx.outputs ?? []), ...(tx.inputs ?? [])].every((io) => io?.address && internalAddresses.includes(io.address))

export const removeConsolidationChangeAmount = (totalOutputs: AmountDeltas, outputs: AssetOutput[] | Output[]) => {
  const lastOutput = outputs[outputs.length - 1]

  return outputs.length > 1
    ? // If there are multiple outputs, the last one must be the change amount (this is a heuristic and not guaranteed)
      {
        alph: totalOutputs.alph - BigInt(lastOutput.attoAlphAmount),
        tokens: totalOutputs.tokens
          .map((token) => ({
            ...token,
            amount: token.amount - BigInt(lastOutput.tokens?.find((t) => t.id === token.id)?.amount ?? 0)
          }))
          .filter(({ amount }) => amount !== BigInt(0))
      }
    : // otherwise, it's a sweep transaction that consolidates all funds
      totalOutputs
}

export const isSwap = (alphAmout: bigint, tokensAmount: Required<AssetAmount>[]) => {
  const allAmounts = [alphAmout, ...tokensAmount.map((tokenAmount) => tokenAmount.amount)]
  const allAmountsArePositive = allAmounts.every((amount) => amount >= 0)
  const allAmountsAreNegative = allAmounts.every((amount) => amount <= 0)

  return !allAmountsArePositive && !allAmountsAreNegative
}

export const getTransactionsOfAddress = (transactions: Transaction[], addressHash: AddressHash) =>
  transactions.filter(
    (tx) =>
      tx.inputs?.some((input) => input.address === addressHash) ||
      tx.outputs?.some((output) => output.address === addressHash)
  )

export const extractNewTransactions = (
  incomingTransactions: Transaction[],
  existingTransactions: Transaction['hash'][]
): Transaction[] =>
  incomingTransactions.filter((newTx) => !existingTransactions.some((existingTx) => existingTx === newTx.hash))

export const extractTokenIds = (tokenIds: Asset['id'][], ios: Transaction['inputs'] | Transaction['outputs']) => {
  ios?.forEach((io) => {
    io.tokens?.forEach((token) => {
      if (!tokenIds.includes(token.id)) {
        tokenIds.push(token.id)
      }
    })
  })
}
