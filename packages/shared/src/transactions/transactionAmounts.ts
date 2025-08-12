import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, explorer as e, isGrouplessAddressWithoutGroupIndex } from '@alephium/web3'

import {
  getBaseAddressStr,
  getInputOutputBaseAddress,
  getTxAddresses,
  isSameBaseAddress
} from '@/transactions/transactionUtils'
import { AddressHash } from '@/types/addresses'
import { AssetAmount } from '@/types/assets'
import { SignTransferTxModalProps } from '@/types/signTxModalTypes'
import { AmountDeltas, TransactionDirection } from '@/types/transactions'
import { uniq } from '@/utils/utils'

// TODO: Delete?
export const getDirection = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction,
  address: string
): TransactionDirection => (calcTxAmountsDeltaForAddress(tx, address).alphAmount < 0 ? 'out' : 'in')

export const calcTxAmountsDeltaForAddress = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction,
  refAddress: string
): AmountDeltas => {
  if (!tx.inputs || tx.inputs.length === 0 || !tx.outputs || tx.outputs.length === 0)
    throw 'Missing transaction details'

  let alphDelta
  let tokensDelta: AmountDeltas['tokenAmounts'] = []

  if (getTxAddresses(tx).every((address) => getBaseAddressStr(address) === refAddress)) {
    const totalInputAlph = tx.inputs.reduce((sum, i) => sum + BigInt(i.attoAlphAmount ?? 0), BigInt(0))
    const totalOutputAlph = tx.outputs.reduce((sum, o) => sum + BigInt(o.attoAlphAmount ?? 0), BigInt(0))

    alphDelta = totalOutputAlph - totalInputAlph
    tokensDelta = []
  } else {
    const outputAmounts = sumUpAddressInputOutputAmounts(refAddress, tx.outputs)
    const inputAmounts = sumUpAddressInputOutputAmounts(refAddress, tx.inputs)

    alphDelta = outputAmounts.alphAmount - inputAmounts.alphAmount
    tokensDelta = [...outputAmounts.tokenAmounts]

    inputAmounts.tokenAmounts.forEach((inputToken) => {
      const existingTokenDelta = tokensDelta.find(({ id }) => id === inputToken.id)
      if (existingTokenDelta) {
        existingTokenDelta.amount -= inputToken.amount
      } else {
        tokensDelta.push({
          id: inputToken.id,
          amount: -inputToken.amount
        })
      }
    })
  }

  const fee = BigInt(tx.gasAmount) * BigInt(tx.gasPrice)

  return {
    alphAmount: alphDelta < 0 ? alphDelta + fee : alphDelta,
    tokenAmounts: tokensDelta.filter(({ amount }) => amount !== BigInt(0)),
    fee: fee
  }
}

const sumUpAddressInputOutputAmounts = (refAddress: string, io: (e.Input | e.Output)[]) => {
  const isGrouplessRefAddress = isGrouplessAddressWithoutGroupIndex(refAddress)

  return io.reduce(
    (acc, io) => {
      if (!io.address) return acc

      const isNotSameAddress = isGrouplessRefAddress
        ? !isSameBaseAddress(io.address, refAddress)
        : io.address !== refAddress

      if (isNotSameAddress) return acc

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
    { alphAmount: BigInt(0), tokenAmounts: [] } as Omit<AmountDeltas, 'fee'>
  )
}

export const isAlphAmountReduced = (
  tx: e.Transaction | e.PendingTransaction | e.MempoolTransaction,
  refAddress: string
): boolean => {
  const { alphAmount } = calcTxAmountsDeltaForAddress(tx, refAddress)

  return alphAmount < 0
}

export const getInputOutputBaseAddresses = (io: e.Input[] | e.Output[]): AddressHash[] =>
  uniq(io.map(getInputOutputBaseAddress).filter((address): address is string => address !== undefined))

export const hasPositiveAndNegativeAmounts = (alphAmout: bigint, tokensAmount: Required<AssetAmount>[]): boolean => {
  const allAmounts = [alphAmout, ...tokensAmount.map((tokenAmount) => tokenAmount.amount)]
  const allAmountsArePositive = allAmounts.every((amount) => amount >= 0)
  const allAmountsAreNegative = allAmounts.every((amount) => amount <= 0)

  return !allAmountsArePositive && !allAmountsAreNegative
}

export const calculateTransferTxAssetAmounts = (txParams: SignTransferTxModalProps['txParams']) => {
  const assetAmounts = [] as Required<AssetAmount>[]

  const res = txParams.destinations.reduce(
    (acc, destination) => {
      acc.attoAlphAmount += BigInt(destination.attoAlphAmount)

      destination.tokens?.forEach((token) => {
        const t = acc.tokens.find(({ id }) => id === token.id)

        if (t) {
          t.amount += BigInt(token.amount)
        } else {
          acc.tokens.push({ id: token.id, amount: BigInt(token.amount) })
        }
      })

      return acc
    },
    { attoAlphAmount: BigInt(0), tokens: [] as { id: string; amount: bigint }[] }
  )

  if (res.attoAlphAmount > 0) {
    assetAmounts.push({ id: ALPH.id, amount: res.attoAlphAmount })
  }

  if (res.tokens.length > 0) {
    assetAmounts.push(...res.tokens)
  }

  return assetAmounts
}

export const getTransactionAssetAmounts = (assetAmounts: AssetAmount[]) => {
  const alphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount ?? BigInt(0)
  const tokens = assetAmounts
    .filter((asset): asset is Required<AssetAmount> => asset.id !== ALPH.id && asset.amount !== undefined)
    .map((asset) => ({ id: asset.id, amount: asset.amount.toString() }))

  const minAlphAmountRequirement = DUST_AMOUNT * BigInt(tokens.length)
  const minDiff = minAlphAmountRequirement - alphAmount
  const totalAlphAmount = minDiff > 0 ? alphAmount + minDiff : alphAmount

  return {
    attoAlphAmount: totalAlphAmount.toString(),
    extraAlphForDust: minAlphAmountRequirement,
    tokens
  }
}

export const getOptionalTransactionAssetAmounts = (assetAmounts?: AssetAmount[]) =>
  assetAmounts ? getTransactionAssetAmounts(assetAmounts) : { attoAlphAmount: undefined, tokens: undefined }

export const addressHasOnlyNegativeAmountDeltas = (tx: e.Transaction | e.PendingTransaction, address: string) => {
  const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, address)

  const hasNoAlphDelta = !alphAmount
  const hasNoTokensDeltas = tokenAmounts.length === 0

  if (hasNoAlphDelta && hasNoTokensDeltas) return false

  const hasNegativeAlphDelta = alphAmount < 0
  const hasNegativeTokensDeltas = tokenAmounts.every(({ amount }) => amount < 0)

  return (
    (hasNoAlphDelta && hasNegativeTokensDeltas) ||
    (hasNoTokensDeltas && hasNegativeAlphDelta) ||
    (hasNegativeAlphDelta && hasNegativeTokensDeltas)
  )
}

export const addressHasOnlyPositiveAmountDeltas = (tx: e.Transaction | e.PendingTransaction, address: string) => {
  const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, address)

  const hasNoAlphDelta = !alphAmount
  const hasNoTokensDeltas = tokenAmounts.length === 0

  if (hasNoAlphDelta && hasNoTokensDeltas) return false

  const hasPositiveAlphDelta = alphAmount > 0
  const hasPositiveTokensDeltas = tokenAmounts.every(({ amount }) => amount > 0)

  return (
    (hasNoAlphDelta && hasPositiveTokensDeltas) ||
    (hasNoTokensDeltas && hasPositiveAlphDelta) ||
    (hasPositiveAlphDelta && hasPositiveTokensDeltas)
  )
}
