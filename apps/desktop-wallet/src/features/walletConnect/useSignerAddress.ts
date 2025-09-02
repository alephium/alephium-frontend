import { selectAddressByHash, selectAddressesInGroup, selectDefaultAddressHash } from '@alephium/shared'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { useState } from 'react'

import { useAppSelector } from '@/hooks/redux'

const useSignerAddress = (group: AddressGroup) => {
  const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)

  const initialSignerAddress = addressesInGroup.find((a) => a.hash === defaultAddressHash) ?? addressesInGroup.at(0)

  const [signerAddressHash, setSignerAddressHash] = useState(initialSignerAddress?.hash)

  const signerAddressPublicKey = useAppSelector((s) =>
    signerAddressHash ? selectAddressByHash(s, signerAddressHash)?.publicKey : undefined
  )

  const signerAddressKeyType = useAppSelector((s) =>
    signerAddressHash ? selectAddressByHash(s, signerAddressHash)?.keyType : undefined
  )

  return {
    signerAddressHash,
    signerAddressPublicKey,
    signerAddressKeyType,
    setSignerAddressHash,
    addressesInGroup
  }
}

export default useSignerAddress
