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

import {
  calcTxAmountsDeltaForAddress,
  getDirection,
  isConsolidationTx,
  TransactionDirection,
  TransactionInfoType,
  txHasOnlyInternalAddresses
} from '@alephium/sdk'
import { AssetOutput, Output } from '@alephium/sdk/api/explorer'

import { selectAddressIds } from '../store/addressesSlice'
import { AddressHash } from '../types/addresses'
import { AddressTransaction } from '../types/transactions'
import { isPendingTx } from '../utils/transactions'
import { useAppSelector } from './redux'

export const useTransactionInfo = (tx: AddressTransaction, addressHash: AddressHash, showInternalInflows?: boolean) => {
  const addressHashes = useAppSelector(selectAddressIds) as string[]

  let amount: bigint | undefined = BigInt(0)
  let direction: TransactionDirection
  let infoType: TransactionInfoType
  let outputs: Output[] = []
  let lockTime: Date | undefined

  if (isPendingTx(tx)) {
    direction = 'out'
    infoType = 'pending'
    amount = tx.amount !== undefined ? BigInt(tx.amount) : undefined
    lockTime = tx.lockTime ? new Date(tx.lockTime) : undefined
  } else {
    outputs = tx.outputs ?? outputs
    const { alph: alphAmount, tokens: tokenAmounts } = calcTxAmountsDeltaForAddress(tx, addressHash)
    amount = alphAmount < 0 ? alphAmount * BigInt(-1) : alphAmount

    if (isConsolidationTx(tx)) {
      direction = 'out'
      infoType = 'move'
    } else {
      direction = getDirection(tx, addressHash)
      const isInternalTransfer = txHasOnlyInternalAddresses(outputs, addressHashes)
      infoType =
        (isInternalTransfer && showInternalInflows && direction === 'out') ||
        (isInternalTransfer && !showInternalInflows)
          ? 'move'
          : direction
    }

    lockTime = outputs.reduce(
      (a, b) => (a > new Date((b as AssetOutput).lockTime ?? 0) ? a : new Date((b as AssetOutput).lockTime ?? 0)),
      new Date(0)
    )
    lockTime = lockTime.toISOString() === new Date(0).toISOString() ? undefined : lockTime
  }

  return {
    amount,
    direction,
    infoType,
    outputs,
    lockTime
  }
}
