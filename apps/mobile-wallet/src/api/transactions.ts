import { AddressHash, AssetAmount, client, DEPRECATED_Address as Address } from '@alephium/shared'
import { transactionSign } from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { CallContractTxData, DeployContractTxData, TransferTxData } from '~/types/transactions'
import { getAddressAssetsAvailableBalance } from '~/utils/addresses'
import { getOptionalTransactionAssetAmounts, getTransactionAssetAmounts } from '~/utils/transactions'

export const buildSweepTransactions = async (fromAddressHash: AddressHash, toAddressHash: AddressHash) => {
  const { unsignedTxs } = await client.node.transactions.postTransactionsSweepAddressBuild({
    fromPublicKey: await getAddressAsymetricKey(fromAddressHash, 'public'),
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
    return await buildSweepTransactions(fromAddress.hash, toAddressHash)
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

  return await client.node.transactions.postTransactionsBuild({
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

  return await client.node.contracts.postContractsUnsignedTxExecuteScript({
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
  await client.node.contracts.postContractsUnsignedTxDeployContract({
    fromPublicKey: await getAddressAsymetricKey(fromAddress, 'public'),
    bytecode: bytecode,
    initialAttoAlphAmount: initialAlphAmount?.amount?.toString(),
    issueTokenAmount: issueTokenAmount?.toString(),
    gasAmount: gasAmount,
    gasPrice: gasPrice?.toString()
  })

export const signAndSendTransaction = async (fromAddress: AddressHash, txId: string, unsignedTx: string) => {
  const signature = transactionSign(txId, await getAddressAsymetricKey(fromAddress, 'private'))
  const data = await client.node.transactions.postTransactionsSubmit({ unsignedTx, signature })

  return { ...data, signature }
}
