import { AddressGroup } from '@alephium/walletconnect-provider'
import { useState } from 'react'

import { useAppSelector } from '@/hooks/redux'
import {
  selectAddressByHash,
  selectAddressesInGroup,
  selectDefaultAddressHash
} from '@/storage/addresses/addressesSelectors'

const useSignerAddress = (group: AddressGroup) => {
  const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)

  const initialSignerAddressHash = addressesInGroup.find((a) => a === defaultAddressHash) ?? addressesInGroup.at(0)

  const [signerAddressHash, setSignerAddressHash] = useState(initialSignerAddressHash)

  const signerAddressPublicKey = useAppSelector((s) =>
    signerAddressHash ? selectAddressByHash(s, signerAddressHash)?.publicKey : undefined
  )

  return {
    signerAddressHash,
    signerAddressPublicKey,
    setSignerAddressHash,
    addressesInGroup
  }
}

export default useSignerAddress
