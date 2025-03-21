import { AddressHash } from '@alephium/shared'

import { useAppSelector } from '~/hooks/redux'
import { selectAddressByHash } from '~/store/addresses/addressesSelectors'

const useCanDeleteAddress = (addressHash: AddressHash) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  return address && !address.isDefault
}

export default useCanDeleteAddress
