import { explorer as e } from '@alephium/web3'

import { AddressHash } from '@/types/addresses'
import { AssetAmount } from '@/types/assets'
import { AmountDeltas, SentTransaction, TransactionDirection } from '@/types/transactions'
import { uniq } from '@/utils'

export const calcTxAmountsDeltaForAddress = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction,
  address: string,
  skipConsolidationCheck = false
): AmountDeltas => {
  if (!tx.inputs || !tx.outputs) throw 'Missing transaction details'

  const outputAmounts = summarizeAddressInputOutputAmounts(address, tx.outputs)
  const inputAmounts = summarizeAddressInputOutputAmounts(address, tx.inputs)

  if (!skipConsolidationCheck && isConsolidationTx(tx))
    return removeConsolidationChangeAmount(outputAmounts, tx.outputs)

  const tokensDelta = outputAmounts.tokenAmounts
  inputAmounts.tokenAmounts.forEach((inputToken) => {
    const tokenDelta = tokensDelta.find(({ id }) => id === inputToken.id)

    tokenDelta
      ? (tokenDelta.amount -= inputToken.amount)
      : tokensDelta.push({ ...inputToken, amount: inputToken.amount * BigInt(-1) })
  })

  return {
    alphAmount: outputAmounts.alphAmount - inputAmounts.alphAmount,
    tokenAmounts: tokensDelta.filter(({ amount }) => amount !== BigInt(0))
  }
}

const summarizeAddressInputOutputAmounts = (address: string, io: (e.Input | e.Output)[]) =>
  io.reduce(
    (acc, io) => {
      if (io.address !== address) return acc

      acc.alphAmount += BigInt(io.attoAlphAmount ?? 0)

      if (!io.tokens) return acc

      io.tokens.forEach((token) => {
        const existingToken = acc.tokenAmounts.find((t) => t.id === token.id)
        existingToken
          ? (existingToken.amount += BigInt(token.amount))
          : acc.tokenAmounts.push({
              id: token.id,
              amount: BigInt(token.amount)
            })
      })

      return acc
    },
    { alphAmount: BigInt(0), tokenAmounts: [] } as AmountDeltas
  )

// TODO: Clean up use of Transaction | PendingTransaction | MempoolTransaction

export const getDirection = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction,
  address: string
): TransactionDirection => (calcTxAmountsDeltaForAddress(tx, address, true).alphAmount < 0 ? 'out' : 'in')

export const isConsolidationTx = (tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction): boolean => {
  const inputAddresses = tx.inputs ? uniq(tx.inputs.map((input) => input.address)) : []
  const outputAddresses = tx.outputs ? uniq(tx.outputs.map((output) => output.address)) : []

  return inputAddresses.length === 1 && outputAddresses.length === 1 && inputAddresses[0] === outputAddresses[0]
}

export const isConfirmedTx = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction | SentTransaction
): tx is e.Transaction =>
  'blockHash' in tx &&
  // See https://github.com/alephium/alephium-frontend/issues/1367
  !tx.inputs?.some((input) => input.txHashRef === undefined)

export const isSentTx = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction | SentTransaction
): tx is SentTransaction => 'status' in tx

export const isInternalTx = (tx: e.Transaction | e.PendingTransaction, internalAddresses: AddressHash[]): boolean =>
  [...(tx.outputs ?? []), ...(tx.inputs ?? [])].every((io) => io?.address && internalAddresses.includes(io.address))

export const removeConsolidationChangeAmount = (totalOutputs: AmountDeltas, outputs: e.AssetOutput[] | e.Output[]) => {
  const lastOutput = outputs[outputs.length - 1]

  return outputs.length > 1
    ? // If there are multiple outputs, the last one must be the change amount (this is a heuristic and not guaranteed)
      {
        alphAmount: totalOutputs.alphAmount - BigInt(lastOutput.attoAlphAmount),
        tokenAmounts: totalOutputs.tokenAmounts
          .map((token) => ({
            ...token,
            amount: token.amount - BigInt(lastOutput.tokens?.find((t) => t.id === token.id)?.amount ?? 0)
          }))
          .filter(({ amount }) => amount !== BigInt(0))
      }
    : // otherwise, it's a sweep transaction that consolidates all funds
      totalOutputs
}

export const hasPositiveAndNegativeAmounts = (alphAmout: bigint, tokensAmount: Required<AssetAmount>[]): boolean => {
  const allAmounts = [alphAmout, ...tokensAmount.map((tokenAmount) => tokenAmount.amount)]
  const allAmountsArePositive = allAmounts.every((amount) => amount >= 0)
  const allAmountsAreNegative = allAmounts.every((amount) => amount <= 0)

  return !allAmountsArePositive && !allAmountsAreNegative
}

export const findTransactionReferenceAddress = (addresses: AddressHash[], tx: e.Transaction | e.PendingTransaction) =>
  addresses.find((address) => isAddressPresentInInputsOutputs(address, tx))

export const isAddressPresentInInputsOutputs = (addressHash: AddressHash, tx: e.Transaction | e.PendingTransaction) =>
  tx.inputs?.some((input) => input.address === addressHash) ||
  tx.outputs?.some((output) => output.address === addressHash)

export const findTransactionInternalAddresses = (addresses: AddressHash[], tx: e.Transaction) =>
  addresses.filter((addressHash) => isAddressPresentInInputsOutputs(addressHash, tx))
