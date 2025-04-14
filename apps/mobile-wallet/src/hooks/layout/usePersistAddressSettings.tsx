import { AddressMetadataWithHash, selectDefaultAddress } from '@alephium/shared'

import { useAppSelector } from '~/hooks/redux'
import { persistAddressesSettings } from '~/utils/addresses'

const usePersistAddressSettings = () => {
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const walletId = useAppSelector((s) => s.wallet.id)

  return async (addresses: AddressMetadataWithHash[] | AddressMetadataWithHash) => {
    await persistAddressesSettings(Array.isArray(addresses) ? addresses : [addresses], walletId, defaultAddress)
  }
}

export default usePersistAddressSettings
