import { Address, AddressHash, AssetAmount, throttledClient } from '@alephium/shared'
import { SignDeployContractTxParams, transactionSign } from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { SignExecuteScriptTxParamsWithAmounts } from '~/types/transactions'
import { getOptionalTransactionAssetAmounts, getTransactionAssetAmounts } from '~/utils/transactions'

export const buildSweepTransactions = async (fromAddress: Address, toAddressHash: AddressHash) => {
  const { unsignedTxs } = await throttledClient.node.transactions.postTransactionsSweepAddressBuild({
    fromPublicKey: await getAddressAsymetricKey(fromAddress.hash, 'public'),
    fromPublicKeyType: fromAddress.keyType,
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
    return await buildSweepTransactions(fromAddress, toAddressHash)
  } else {
    const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

    const data = await throttledClient.txBuilder.buildTransferTx(
      {
        signerAddress: fromAddress.hash,
        signerKeyType: fromAddress.keyType,
        destinations: [
          {
            address: toAddressHash,
            attoAlphAmount,
            tokens
          }
        ]
      },
      await getAddressAsymetricKey(fromAddress.hash, 'public')
    )

    return {
      unsignedTxs: [{ txId: data.txId, unsignedTx: data.unsignedTx }],
      fees: BigInt(data.gasAmount) * BigInt(data.gasPrice)
    }
  }
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
