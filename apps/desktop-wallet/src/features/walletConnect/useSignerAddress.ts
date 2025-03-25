import { keyring } from '@alephium/keyring'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { useMemo, useState } from 'react'

import { useAppSelector } from '@/hooks/redux'
import { selectAddressesInGroup, selectDefaultAddressHash } from '@/storage/addresses/addressesSelectors'

const useSignerAddress = (group: AddressGroup) => {
  const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)

  const initialSignerAddressHash = addressesInGroup.find((a) => a === defaultAddressHash) ?? addressesInGroup[0]

  const [signerAddressHash, setSignerAddressHash] = useState(initialSignerAddressHash)

  const signerAddressPublicKey = useMemo(() => keyring.exportPublicKeyOfAddress(signerAddressHash), [signerAddressHash])

  return {
    signerAddressHash,
    signerAddressPublicKey,
    setSignerAddressHash,
    addressesInGroup
  }
}

export default useSignerAddress
