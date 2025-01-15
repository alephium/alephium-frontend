import { AddressGroup } from '@alephium/walletconnect-provider'
import { useState } from 'react'

import { useAppSelector } from '@/hooks/redux'
import {
  selectAddressByHash,
  selectAddressesInGroup,
  selectDefaultAddress
} from '@/storage/addresses/addressesSelectors'

const useSignerAddress = (group: AddressGroup) => {
  const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
  const defaultAddressHash = useAppSelector(selectDefaultAddress).hash

  const initialSignerAddressHash = addressesInGroup.find((a) => a === defaultAddressHash) ?? addressesInGroup[0]

  const [signerAddressHash, setSignerAddressHash] = useState(initialSignerAddressHash)

  const signerAddressPublicKey = useAppSelector((s) => selectAddressByHash(s, signerAddressHash ?? ''))?.publicKey

  return {
    signerAddressHash,
    signerAddressPublicKey,
    setSignerAddressHash,
    addressesInGroup
  }
}

export default useSignerAddress
