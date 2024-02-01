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
  AddressHash,
  AssetAmount,
  calcTxAmountsDeltaForAddress,
  convertToNegative,
  getDirection,
  isConsolidationTx,
  isInternalTx,
  isSwap,
  TransactionDirection,
  TransactionInfoType
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, MIN_UTXO_SET_AMOUNT } from '@alephium/web3'
import { explorer } from '@alephium/web3'
import dayjs from 'dayjs'

import { SelectOption } from '@/components/Inputs/Select'
import i18n from '@/i18n'
import { store } from '@/storage/store'
import { TranslationKey } from '@/types/i18next'
import {
  AddressPendingTransaction,
  AddressTransaction,
  Direction,
  TransactionInfo,
  TransactionTimePeriod
} from '@/types/transactions'

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

export const isPendingTx = (tx: AddressTransaction): tx is AddressPendingTransaction =>
  (tx as AddressPendingTransaction).status === 'pending'

export const getTransactionAssetAmounts = (assetAmounts: AssetAmount[]) => {
  const alphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount ?? BigInt(0)
  const tokens = assetAmounts
    .filter((asset): asset is Required<AssetAmount> => asset.id !== ALPH.id && asset.amount !== undefined)
    .map((asset) => ({ id: asset.id, amount: asset.amount.toString() }))

  const minAlphAmountRequirement = DUST_AMOUNT * BigInt(tokens.length)

  return {
    attoAlphAmount: (alphAmount + minAlphAmountRequirement).toString(),
    extraAlphForDust: minAlphAmountRequirement,
    tokens
  }
}

export const getOptionalTransactionAssetAmounts = (assetAmounts?: AssetAmount[]) =>
  assetAmounts ? getTransactionAssetAmounts(assetAmounts) : { attoAlphAmount: undefined, tokens: undefined }

const now = dayjs()
const currentYear = now.year()
const today = now.format('DD/MM/YYYY')

export const timePeriodsOptions: SelectOption<TransactionTimePeriod>[] = [
  {
    value: '24h',
    label: i18n.t('Last 24h')
  },
  {
    value: '1w',
    label: i18n.t('Last week')
  },
  {
    value: '1m',
    label: i18n.t('Last month')
  },
  {
    value: '6m',
    label: i18n.t('Last 6 months')
  },
  {
    value: '12m',
    label: `${i18n.t('Last 12 months')}
    (${now.subtract(1, 'year').format('DD/MM/YYYY')}
    - ${today})`
  },
  {
    value: 'previousYear',
    label: `${i18n.t('Previous year')}
    (01/01/${currentYear - 1} - 31/12/${currentYear - 1})`
  },
  {
    value: 'thisYear',
    label: `${i18n.t('This year')} (01/01/${currentYear - 1} - ${today})`
  }
]

export const directionOptions: {
  value: Direction
  label: TranslationKey
}[] = [
  {
    label: 'Sent',
    value: 'out'
  },
  {
    label: 'Received',
    value: 'in'
  },
  {
    label: 'Moved',
    value: 'move'
  },
  {
    label: 'Swapped',
    value: 'swap'
  }
]

export const getTransactionInfo = (tx: AddressTransaction, showInternalInflows?: boolean): TransactionInfo => {
  const state = store.getState()
  const assetsInfo = state.assetsInfo.entities
  const internalAddresses = state.addresses.ids as AddressHash[]

  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let lockTime: Date | undefined
  let tokens: Required<AssetAmount>[] = []

  if (isPendingTx(tx)) {
    direction = internalAddresses.includes(tx.toAddress) ? (tx.address.hash === tx.fromAddress ? 'out' : 'in') : 'out'
    infoType = 'pending'
    amount = tx.amount ? convertToNegative(BigInt(tx.amount)) : undefined
    tokens = tx.tokens ? tx.tokens.map((token) => ({ ...token, amount: convertToNegative(BigInt(token.amount)) })) : []
    lockTime = tx.lockTime !== undefined ? new Date(tx.lockTime) : undefined
  } else {
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
      const isInternalTransfer = isInternalTx(tx, internalAddresses)
      infoType =
        (isInternalTransfer && showInternalInflows && direction === 'out') ||
        (isInternalTransfer && !showInternalInflows)
          ? 'move'
          : direction
    }

    lockTime = (tx.outputs ?? []).reduce(
      (a, b) =>
        a > new Date((b as explorer.AssetOutput).lockTime ?? 0)
          ? a
          : new Date((b as explorer.AssetOutput).lockTime ?? 0),
      new Date(0)
    )
    lockTime = lockTime.toISOString() === new Date(0).toISOString() ? undefined : lockTime
  }

  const tokenAssets = [...tokens.map((token) => ({ ...token, ...assetsInfo[token.id] }))]
  const assets = amount !== undefined ? [{ ...ALPH, amount }, ...tokenAssets] : tokenAssets

  return {
    assets,
    direction,
    infoType,
    lockTime
  }
}
