import { selectAddressByHash } from '@alephium/shared/store'
import { AddressHash } from '@alephium/shared/types'

import { useAppSelector } from '~/hooks/redux'

const useCanDeleteAddress = (addressHash: AddressHash) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  return address && !address.isDefault
}

export default useCanDeleteAddress
