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

import { AddressHash, AssetAmount, throttledClient } from '@alephium/shared'
import { transactionSign } from '@alephium/web3'

import i18n from '~/features/localization/i18n'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { store } from '~/store/store'
import { Address } from '~/types/addresses'
import { CallContractTxData, DeployContractTxData, TransferTxData } from '~/types/transactions'
import { getAddressAssetsAvailableBalance } from '~/utils/addresses'
import { getOptionalTransactionAssetAmounts, getTransactionAssetAmounts } from '~/utils/transactions'

export const buildSweepTransactions = async (fromAddress: Address, toAddressHash: AddressHash) => {
  const { unsignedTxs } = await throttledClient.node.transactions.postTransactionsSweepAddressBuild({
    fromPublicKey: await getAddressAsymetricKey(fromAddress.hash, 'public'),
    toAddress: toAddressHash
  })

  return {
    unsignedTxs,
    fees: unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))
  }
}

export const buildUnsignedTransactions = async (
  fromAddress: Address,
  toAddressHash: string,
  assetAmounts: AssetAmount[]
) => {
  const assetsWithAvailableBalance = getAddressAssetsAvailableBalance(fromAddress).filter(
    (asset) => asset.availableBalance > 0
  )

  const shouldSweep =
    assetsWithAvailableBalance.length === assetAmounts.length &&
    assetsWithAvailableBalance.every(
      (asset) => assetAmounts.find((a) => a.id === asset.id)?.amount === asset.availableBalance
    )

  if (shouldSweep) {
    return await buildSweepTransactions(fromAddress, toAddressHash)
  } else {
    const data = await buildTransferTransaction({
      fromAddress: fromAddress.hash,
      toAddress: toAddressHash,
      assetAmounts
    })

    if (!data) return

    return {
      unsignedTxs: [{ txId: data.txId, unsignedTx: data.unsignedTx }],
      fees: BigInt(data.gasAmount) * BigInt(data.gasPrice)
    }
  }
}

export const buildTransferTransaction = async ({
  fromAddress,
  toAddress,
  assetAmounts,
  gasAmount,
  gasPrice
}: TransferTxData) => {
  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

  return await throttledClient.node.transactions.postTransactionsBuild({
    fromPublicKey: await getAddressAsymetricKey(fromAddress, 'public'),
    destinations: [
      {
        address: toAddress,
        attoAlphAmount,
        tokens
      }
    ],
    gasAmount,
    gasPrice
  })
}

export const buildCallContractTransaction = async ({
  fromAddress,
  bytecode,
  assetAmounts,
  gasAmount,
  gasPrice
}: CallContractTxData) => {
  const { attoAlphAmount, tokens } = getOptionalTransactionAssetAmounts(assetAmounts)

  return await throttledClient.node.contracts.postContractsUnsignedTxExecuteScript({
    fromPublicKey: await getAddressAsymetricKey(fromAddress, 'public'),
    bytecode,
    attoAlphAmount,
    tokens,
    gasAmount: gasAmount,
    gasPrice: gasPrice?.toString()
  })
}

export const buildDeployContractTransaction = async ({
  fromAddress,
  bytecode,
  initialAlphAmount,
  issueTokenAmount,
  gasAmount,
  gasPrice
}: DeployContractTxData) =>
  await throttledClient.node.contracts.postContractsUnsignedTxDeployContract({
    fromPublicKey: await getAddressAsymetricKey(fromAddress, 'public'),
    bytecode: bytecode,
    initialAttoAlphAmount: initialAlphAmount?.amount?.toString(),
    issueTokenAmount: issueTokenAmount?.toString(),
    gasAmount: gasAmount,
    gasPrice: gasPrice?.toString()
  })

export const signAndSendTransaction = async (fromAddress: AddressHash, txId: string, unsignedTx: string) => {
  const address = store.getState().addresses.entities[fromAddress]

  if (!address) throw new Error(`${i18n.t('Could not find address in store')}: ${fromAddress}`)

  const signature = transactionSign(txId, await getAddressAsymetricKey(address.hash, 'private'))
  const data = await throttledClient.node.transactions.postTransactionsSubmit({ unsignedTx, signature })

  return { ...data, signature }
}
