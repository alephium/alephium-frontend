import { AddressHash } from '@alephium/shared'

import { useAppSelector } from '~/hooks/redux'
import { selectAddressByHash } from '~/store/addressesSlice'

const useCanDeleteAddress = (addressHash: AddressHash) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  return address && !address.settings.isDefault
}

export default useCanDeleteAddress
