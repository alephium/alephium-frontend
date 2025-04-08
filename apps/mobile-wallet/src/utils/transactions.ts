import {
  AddressHash,
  AssetAmount,
  calcTxAmountsDeltaForAddress,
  convertToNegative,
  getDirection,
  hasPositiveAndNegativeAmounts,
  isConsolidationTx,
  isInternalTx,
  TransactionDirection,
  TransactionInfo,
  TransactionInfoType
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, explorer as e } from '@alephium/web3'
import { sortBy } from 'lodash'

import { store } from '~/store/store'
import { AddressPendingTransaction, AddressTransaction } from '~/types/transactions'

export const isPendingTx = (tx: AddressTransaction): tx is AddressPendingTransaction =>
  (tx as AddressPendingTransaction).status === 'pending'

// Same as in desktop wallet, move to SDK?
export const getTransactionInfo = (tx: AddressTransaction, showInternalInflows?: boolean): TransactionInfo => {
  const state = store.getState()
  const fungibleTokens = state.fungibleTokens.entities
  const nfts = state.nfts.entities
  const internalAddresses = state.addresses.ids as AddressHash[]

  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let lockTime: Date | undefined
  let tokens: Required<AssetAmount>[] = []

  if (isPendingTx(tx)) {
    direction = 'out'
    infoType = 'pending'
    amount = tx.amount ? convertToNegative(BigInt(tx.amount)) : undefined
    tokens = tx.tokens ? tx.tokens.map((token) => ({ ...token, amount: convertToNegative(BigInt(token.amount)) })) : []
    lockTime = tx.lockTime !== undefined ? new Date(tx.lockTime) : undefined
  } else {
    const { alphAmount, tokenAmounts } = calcTxAmountsDeltaForAddress(tx, tx.address.hash)

    amount = alphAmount
    tokens = tokenAmounts.map((token) => ({ ...token, amount: token.amount }))

    if (isConsolidationTx(tx)) {
      direction = 'out'
      infoType = 'move'
    } else if (hasPositiveAndNegativeAmounts(amount, tokens)) {
      direction = 'swap'
      infoType = 'swap'
    } else {
      direction = getDirection(tx, tx.address.hash)
      const isInternalTransfer = isInternalTx(tx, internalAddresses)

      infoType =
        (isInternalTransfer && showInternalInflows && direction === 'out') ||
        (isInternalTransfer && !showInternalInflows)
          ? 'move'
          : direction
    }

    lockTime = (tx.outputs ?? []).reduce(
      (a, b) => (a > new Date((b as e.AssetOutput).lockTime ?? 0) ? a : new Date((b as e.AssetOutput).lockTime ?? 0)),
      new Date(0)
    )
    lockTime = lockTime.toISOString() === new Date(0).toISOString() ? undefined : lockTime
  }

  const tokenAssets = [
    ...tokens.map((token) =>
      fungibleTokens[token.id]
        ? { ...token, ...fungibleTokens[token.id], type: 'fungible' }
        : nfts[token.id]
          ? { ...token, ...fungibleTokens[token.id], type: 'non-fungible' }
          : { ...token, verified: false, type: undefined, name: '' }
    )
  ]
  const sortedTokens = sortBy(tokenAssets, [
    (v) => !v.type,
    (v) => !v.verified,
    (v) => v.type === 'non-fungible',
    (v) => v.type === 'fungible',
    (v) => (v.type === 'fungible' ? v.symbol : v?.name)
  ])
  const assets = amount !== undefined ? [{ ...ALPH, amount }, ...sortedTokens] : sortedTokens

  return {
    assets,
    direction,
    infoType,
    lockTime
  }
}

// Same as in desktop wallet
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
    tokens
  }
}

// Same as in desktop wallet
export const getOptionalTransactionAssetAmounts = (assetAmounts?: AssetAmount[]) =>
  assetAmounts ? getTransactionAssetAmounts(assetAmounts) : { attoAlphAmount: undefined, tokens: undefined }
