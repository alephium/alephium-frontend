import { AddressHash, selectAddressByHash } from '@alephium/shared'

import { useAppSelector } from '~/hooks/redux'

const useCanDeleteAddress = (addressHash: AddressHash) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  return address && !address.isDefault
}

export default useCanDeleteAddress
