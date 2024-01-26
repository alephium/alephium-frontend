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

import {
  AssetAmount,
  calcTxAmountsDeltaForAddress,
  convertToNegative,
  getDirection,
  isConsolidationTx,
  isSwap,
  TransactionDirection,
  TransactionInfo,
  TransactionInfoType
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, explorer } from '@alephium/web3'
import { sortBy } from 'lodash'

import { store } from '~/store/store'
import { Address } from '~/types/addresses'
import { AddressPendingTransaction, AddressTransaction } from '~/types/transactions'

export const isPendingTx = (tx: AddressTransaction): tx is AddressPendingTransaction =>
  (tx as AddressPendingTransaction).status === 'pending'

// TODO: Same as in desktop wallet, move to SDK?
export const getTransactionInfo = (tx: AddressTransaction, showInternalInflows?: boolean): TransactionInfo => {
  const state = store.getState()
  const fungibleTokens = state.fungibleTokens.entities
  const nfts = state.nfts.entities
  const addresses = Object.values(state.addresses.entities) as Address[]

  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let outputs: explorer.Output[] = []
  let lockTime: Date | undefined
  let tokens: Required<AssetAmount>[] = []

  if (isPendingTx(tx)) {
    direction = 'out'
    infoType = 'pending'
    amount = tx.amount ? convertToNegative(BigInt(tx.amount)) : undefined
    tokens = tx.tokens ? tx.tokens.map((token) => ({ ...token, amount: convertToNegative(BigInt(token.amount)) })) : []
    lockTime = tx.lockTime !== undefined ? new Date(tx.lockTime) : undefined
  } else {
    outputs = tx.outputs ?? outputs
    const { alph: alphAmount, tokens: tokenAmounts } = calcTxAmountsDeltaForAddress(tx, tx.address.hash)

    amount = alphAmount
    tokens = tokenAmounts.map((token) => ({ ...token, amount: token.amount }))

    if (isConsolidationTx(tx)) {
      direction = 'out'
      infoType = 'move'
    } else if (isSwap(amount, tokens)) {
      direction = 'swap'
      infoType = 'swap'
    } else {
      direction = getDirection(tx, tx.address.hash)
      const isInternalTransfer = hasOnlyOutputsWith(outputs, addresses)
      infoType =
        (isInternalTransfer && showInternalInflows && direction === 'out') ||
        (isInternalTransfer && !showInternalInflows)
          ? 'move'
          : direction
    }

    lockTime = outputs.reduce(
      (a, b) =>
        a > new Date((b as explorer.AssetOutput).lockTime ?? 0)
          ? a
          : new Date((b as explorer.AssetOutput).lockTime ?? 0),
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
    outputs,
    lockTime
  }
}

export const hasOnlyOutputsWith = (outputs: explorer.Output[], addresses: Address[]): boolean =>
  outputs.every((o) => o?.address && addresses.map((a) => a.hash).indexOf(o.address) >= 0)

// TODO: Same as in desktop wallet
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

// TODO: Same as in desktop wallet
export const getOptionalTransactionAssetAmounts = (assetAmounts?: AssetAmount[]) =>
  assetAmounts ? getTransactionAssetAmounts(assetAmounts) : { attoAlphAmount: undefined, tokens: undefined }
