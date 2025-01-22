import { AddressHash } from '@alephium/shared'

import { useAppSelector } from '~/hooks/redux'
import { selectAddressIds } from '~/store/addresses/addressesSelectors'

const useWalletSingleAddress = (): AddressHash | undefined => {
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const addressHash = addressHashes.length === 1 ? addressHashes[0] : undefined

  return addressHash
}

export default useWalletSingleAddress
