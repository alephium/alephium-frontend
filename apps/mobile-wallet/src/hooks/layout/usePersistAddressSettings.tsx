import { useAppSelector } from '~/hooks/redux'
import { selectDefaultAddress } from '~/store/addressesSlice'
import { AddressPartial } from '~/types/addresses'
import { persistAddressesSettings } from '~/utils/addresses'

const usePersistAddressSettings = () => {
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const walletId = useAppSelector((s) => s.wallet.id)

  return async (addresses: AddressPartial[] | AddressPartial) => {
    await persistAddressesSettings(Array.isArray(addresses) ? addresses : [addresses], walletId, defaultAddress)
  }
}

export default usePersistAddressSettings
