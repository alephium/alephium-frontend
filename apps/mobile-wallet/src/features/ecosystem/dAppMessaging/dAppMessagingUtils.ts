import { Address, isGrouplessAddress } from '@alephium/shared'
import { TransactionParams } from '@alephium/wallet-dapp-provider'
import {
  SignChainedTxParams,
  SignChainedTxResult,
  SignDeployContractChainedTxParams,
  SignExecuteScriptChainedTxParams,
  SignTransferChainedTxParams
} from '@alephium/web3'
import { capitalize } from 'lodash'

import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import { useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { signer } from '~/signer'

export const useNetwork = (): ConnectedAddressPayload['network'] => {
  const network = useAppSelector((s) => s.network)

  return {
    id: network.name,
    name: capitalize(network.name),
    nodeUrl: network.settings.nodeHost,
    explorerApiUrl: network.settings.explorerApiHost,
    explorerUrl: network.settings.explorerUrl
  }
}

export const getConnectedAddressPayload = async (
  network: ConnectedAddressPayload['network'],
  address: Address,
  host: string,
  icon?: string
): Promise<ConnectedAddressPayload> => ({
  address: address.hash,
  network,
  type: 'alephium',
  signer: await getSigner(address),
  host,
  icon
})

const getSigner = async (address: Address): Promise<ConnectedAddressPayload['signer']> => {
  const publicKey = await getAddressAsymetricKey(address.hash, 'public')

  return {
    type: 'local_secret',
    keyType: address.keyType,
    publicKey,
    derivationIndex: address.index,
    group: isGrouplessAddress(address) ? undefined : address.group
  }
}

export const txParamsToChainedTxParams = (txParams: TransactionParams[]) =>
  txParams.map(({ type, params }) => {
    switch (type) {
      case 'TRANSFER': {
        return { type: 'Transfer', ...params } as SignTransferChainedTxParams
      }
      case 'DEPLOY_CONTRACT': {
        return { type: 'DeployContract', ...params } as SignDeployContractChainedTxParams
      }
      case 'EXECUTE_SCRIPT': {
        return { type: 'ExecuteScript', ...params } as SignExecuteScriptChainedTxParams
      }
      default: {
        throw new Error(`Unsupported transaction type: ${type}`)
      }
    }
  })

export const getChainedTxPropsFromTransactionParams = (
  txParams: Array<TransactionParams>,
  unsignedData: Array<Omit<SignChainedTxResult, 'signature'>>
) =>
  txParams.map(({ type, params }, index) => {
    switch (type) {
      case 'TRANSFER': {
        return { type, txParams: params, unsignedData: unsignedData[index] }
      }
      case 'DEPLOY_CONTRACT': {
        return { type, txParams: params, unsignedData: unsignedData[index] }
      }
      case 'EXECUTE_SCRIPT': {
        return { type, txParams: params, unsignedData: unsignedData[index] }
      }
      default: {
        throw new Error(`Unsupported transaction type: ${type}`)
      }
    }
  })

export const getChainedTxSignersPublicKeys = async (txParams: Array<SignChainedTxParams>) =>
  Promise.all(txParams.map(({ signerAddress }) => signer.getPublicKey(signerAddress)))

export const validateChainedTxsNetwork = (txParams: Array<TransactionParams>) => {
  const networkId = txParams[0].params.networkId
  const allSameNetwork = txParams.slice(1).every((tx) => tx.params.networkId === networkId)

  if (!allSameNetwork) throw Error('All transactions must have the same networkId')
}
