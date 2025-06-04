import { BaseWalletAccount, ConnectDappMessageData, RequestOptions } from '@alephium/wallet-dapp-provider'
import { groupOfAddress } from '@alephium/web3'

import { getStorageObject } from '~/persistent-storage/storage'

export const isPreAuthorized = (options: RequestOptions) => {
  const preAuthorizeStore = getStorageObject<PreAuthorization[]>('preAuthorizeStore')

  if (!preAuthorizeStore) return false

  return !!preAuthorizeStore.find((x) => matchAuthorizedOptions(x, options))
}

export const connectDapp = (data: ConnectDappMessageData) => {}

// export const rejectDappConnection = () => {

// }

function matchAuthorizedOptions(preAuthorization: PreAuthorization, options: RequestOptions): boolean {
  return (
    preAuthorization.host === options.host &&
    (options.networkId === undefined || preAuthorization.account.networkId === options.networkId) &&
    (options.address === undefined || preAuthorization.account.address === options.address) &&
    (options.addressGroup === undefined || groupOfAddress(preAuthorization.account.address) === options.addressGroup)
  )
}

interface PreAuthorization {
  account: BaseWalletAccount
  host: string
}
