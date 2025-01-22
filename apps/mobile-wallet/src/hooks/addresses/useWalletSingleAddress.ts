import { AddressHash } from '@alephium/shared'

import { useAppSelector } from '~/hooks/redux'
import { selectAllAddresses } from '~/store/addresses/addressesSelectors'

interface UseWalletSingleAddressProps {
  checkBalance?: boolean
}

const useWalletSingleAddress = (props?: UseWalletSingleAddressProps): AddressHash | undefined => {
  const addresses = useAppSelector(selectAllAddresses)
  const checkBalance = props?.checkBalance ?? true
  const filteredAddresses = checkBalance ? addresses.filter((a) => a.balance !== '0') : addresses
  const address = filteredAddresses.length === 1 ? filteredAddresses[0] : undefined

  return address?.hash
}

export default useWalletSingleAddress
