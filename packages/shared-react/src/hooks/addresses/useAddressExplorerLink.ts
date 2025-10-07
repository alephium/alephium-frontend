import { AddressHash } from '@alephium/shared'

import { useSharedSelector } from '@/redux'

export const useAddressExplorerLink = (addressHash: AddressHash) => {
  const explorerUrl = useSharedSelector((s) => s.network.settings.explorerUrl)

  return getAddressExplorerLink(explorerUrl, addressHash)
}

export const getAddressExplorerLink = (explorerUrl: string, addressHash: AddressHash) =>
  `${explorerUrl}${getAddressExplorerPagePath(addressHash)}`

export const getAddressExplorerPagePath = (addressHash: AddressHash) => `/addresses/${addressHash}`
