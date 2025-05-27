import { AddressHash } from '@alephium/shared'
import { useFetchAddressesHashesWithBalance, useUnsortedAddressesHashes } from '@alephium/shared-react'

interface UseWalletSingleAddressProps {
  checkBalance?: boolean
}

const useWalletSingleAddress = (props?: UseWalletSingleAddressProps): AddressHash | undefined => {
  const unsortedAddresses = useUnsortedAddressesHashes()
  const { data: addressesWithBalance } = useFetchAddressesHashesWithBalance()

  const checkBalance = props?.checkBalance ?? true
  const addresses = checkBalance ? addressesWithBalance : unsortedAddresses
  const addressHash = addresses.length === 1 ? addresses.at(0) : undefined

  return addressHash
}

export default useWalletSingleAddress
