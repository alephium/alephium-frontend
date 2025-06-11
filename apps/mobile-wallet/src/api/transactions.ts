import { Address, AddressHash, AssetAmount, throttledClient } from '@alephium/shared'
import { SignDeployContractTxParams, transactionSign } from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { SignExecuteScriptTxParamsWithAmounts, SignTransferTxParamsSingleDestination } from '~/types/transactions'
import { getOptionalTransactionAssetAmounts, getTransactionAssetAmounts } from '~/utils/transactions'

export const buildSweepTransactions = async (fromAddressHash: AddressHash, toAddressHash: AddressHash) => {
  const { unsignedTxs } = await throttledClient.node.transactions.postTransactionsSweepAddressBuild({
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
  assetAmounts: AssetAmount[],
  shouldSweep: boolean
) => {
  if (shouldSweep) {
    return await buildSweepTransactions(fromAddress.publicKey, toAddressHash)
  } else {
    const data = await buildTransferTransaction({
      signerAddress: fromAddress.hash,
      toAddress: toAddressHash,
      assetAmounts,
      destinations: []
    })

    if (!data) return

    return {
      unsignedTxs: [{ txId: data.txId, unsignedTx: data.unsignedTx }],
      fees: BigInt(data.gasAmount) * BigInt(data.gasPrice)
    }
  }
}

export const buildTransferTransaction = async ({
  signerAddress,
  signerKeyType,
  toAddress,
  assetAmounts,
  gasPrice,
  ...props
}: SignTransferTxParamsSingleDestination) => {
  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

  return await throttledClient.node.transactions.postTransactionsBuild({
    fromPublicKey: await getAddressAsymetricKey(signerAddress, 'public'),
    fromPublicKeyType: signerKeyType,
    ...props,
    // TODO: Remove when supporting multiple destinations
    destinations: [
      {
        address: toAddress,
        attoAlphAmount,
        tokens
      }
    ],
    gasPrice: gasPrice?.toString()
  })
}

export const buildCallContractTransaction = async ({
  signerAddress,
  signerKeyType,
  assetAmounts,
  gasPrice,
  ...props
}: SignExecuteScriptTxParamsWithAmounts) => {
  const { attoAlphAmount, tokens } = getOptionalTransactionAssetAmounts(assetAmounts)

  return await throttledClient.node.contracts.postContractsUnsignedTxExecuteScript({
    fromPublicKey: await getAddressAsymetricKey(signerAddress, 'public'),
    fromPublicKeyType: signerKeyType,
    gasPrice: gasPrice?.toString(),
    ...props,
    attoAlphAmount,
    tokens
  })
}

export const buildDeployContractTransaction = async ({
  signerAddress,
  signerKeyType,
  initialAttoAlphAmount,
  initialTokenAmounts,
  issueTokenAmount,
  gasPrice,
  ...props
}: SignDeployContractTxParams) =>
  await throttledClient.node.contracts.postContractsUnsignedTxDeployContract({
    fromPublicKey: await getAddressAsymetricKey(signerAddress, 'public'),
    fromPublicKeyType: signerKeyType,
    initialAttoAlphAmount: initialAttoAlphAmount?.toString(),
    initialTokenAmounts: initialTokenAmounts?.map((t) => ({ id: t.id, amount: t.amount.toString() })),
    issueTokenAmount: issueTokenAmount?.toString(),
    gasPrice: gasPrice?.toString(),
    ...props
  })

export const signAndSendTransaction = async (fromAddress: AddressHash, txId: string, unsignedTx: string) => {
  const signature = transactionSign(txId, await getAddressAsymetricKey(fromAddress, 'private'))
  const data = await throttledClient.node.transactions.postTransactionsSubmit({ unsignedTx, signature })

  return { ...data, signature }
}
