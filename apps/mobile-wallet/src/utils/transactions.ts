import {
  Address,
  AddressHash,
  AssetAmount,
  getTransactionAssetAmounts,
  MAXIMAL_GAS_FEE,
  SweepTxParams
} from '@alephium/shared'
import { SignChainedTxParams, SignTransferTxParams } from '@alephium/web3'

export const getSweepTxParams = (address: Address, toAddress: AddressHash): SweepTxParams => ({
  signerAddress: address.hash,
  signerKeyType: address.keyType,
  toAddress
})

export const getTransferTxParams = (
  fromAddress: Address,
  toAddress: AddressHash,
  assetAmounts: AssetAmount[]
): SignTransferTxParams => {
  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

  return {
    signerAddress: fromAddress.hash,
    signerKeyType: fromAddress.keyType,
    destinations: [{ address: toAddress, attoAlphAmount, tokens }]
  }
}

export const getGasRefillChainedTxParams = (
  groupedAddressWithEnoughAlphForGas: string,
  address: Address,
  toAddress: AddressHash,
  assetAmounts: AssetAmount[]
): Array<SignChainedTxParams> => [
  {
    type: 'Transfer',
    signerAddress: groupedAddressWithEnoughAlphForGas,
    signerKeyType: 'default',
    destinations: [{ address: address.hash, attoAlphAmount: MAXIMAL_GAS_FEE }]
  },
  {
    type: 'Transfer',
    ...getTransferTxParams(address, toAddress, assetAmounts)
  }
]
