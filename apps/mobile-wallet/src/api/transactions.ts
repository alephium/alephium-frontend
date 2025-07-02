import { Address, AddressHash, AssetAmount, throttledClient } from '@alephium/shared'

import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { getTransactionAssetAmounts } from '~/utils/transactions'

export const buildSweepTransactions = async (fromAddress: Address, toAddressHash: AddressHash) => {
  const { unsignedTxs } = await throttledClient.txBuilder.buildSweepTxs(
    {
      signerAddress: fromAddress.hash,
      signerKeyType: fromAddress.keyType,
      toAddress: toAddressHash
    },
    await getAddressAsymetricKey(fromAddress.hash, 'public')
  )

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
        destinations: [{ address: toAddressHash, attoAlphAmount, tokens }]
      },
      await getAddressAsymetricKey(fromAddress.hash, 'public')
    )

    return {
      unsignedTxs: [{ txId: data.txId, unsignedTx: data.unsignedTx }],
      fees: BigInt(data.gasAmount) * BigInt(data.gasPrice)
    }
  }
}
