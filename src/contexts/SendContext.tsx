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

import { AssetAmount } from '@alephium/sdk'
import { node } from '@alephium/web3'
import { createContext, useContext, useState } from 'react'

import { AddressHash } from '~/types/addresses'

type UnsignedTxData = {
  unsignedTxs: {
    txId: node.BuildTransactionResult['txId'] | node.SweepAddressTransaction['txId']
    unsignedTx: node.BuildTransactionResult['unsignedTx'] | node.SweepAddressTransaction['unsignedTx']
  }[]
  fees: bigint
}

interface SendContextProps {
  toAddress?: AddressHash
  setToAddress: (toAddress: AddressHash) => void
  fromAddress?: AddressHash
  setFromAddress: (toAddress: AddressHash) => void
  assetAmounts: AssetAmount[]
  setAssetAmount: (assetId: string, amount?: bigint) => void
  unsignedTxData: UnsignedTxData
  setUnsignedTxData: (data: UnsignedTxData) => void
}

const initialValues: SendContextProps = {
  toAddress: undefined,
  setToAddress: () => null,
  fromAddress: undefined,
  setFromAddress: () => null,
  assetAmounts: [],
  setAssetAmount: () => null,
  unsignedTxData: { unsignedTxs: [], fees: BigInt(0) },
  setUnsignedTxData: () => null
}

const SendContext = createContext(initialValues)

export const SendContextProvider: FC = ({ children }) => {
  const [toAddress, setToAddress] = useState<SendContextProps['toAddress']>(initialValues.toAddress)
  const [fromAddress, setFromAddress] = useState<SendContextProps['fromAddress']>(initialValues.fromAddress)
  const [assetAmounts, setAssetAmounts] = useState<SendContextProps['assetAmounts']>(initialValues.assetAmounts)
  const [unsignedTxData, setUnsignedTxData] = useState<SendContextProps['unsignedTxData']>(initialValues.unsignedTxData)

  const setAssetAmount = (assetId: string, amount?: bigint) => {
    const existingAmountIndex = assetAmounts.findIndex(({ id }) => id === assetId)
    const newAssetAmounts = [...assetAmounts]

    if (existingAmountIndex !== -1) {
      amount
        ? newAssetAmounts.splice(existingAmountIndex, 1, { id: assetId, amount })
        : newAssetAmounts.splice(existingAmountIndex, 1)
    } else {
      newAssetAmounts.push({ id: assetId, amount })
    }

    setAssetAmounts(newAssetAmounts)
  }

  return (
    <SendContext.Provider
      value={{
        toAddress,
        setToAddress,
        fromAddress,
        setFromAddress,
        assetAmounts,
        setAssetAmount,
        unsignedTxData,
        setUnsignedTxData
      }}
    >
      {children}
    </SendContext.Provider>
  )
}

export const useSendContext = () => useContext(SendContext)
