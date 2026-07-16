import { selectAllAddresses, selectAllAddressHashes } from '@alephium/shared/store'
import { Address, AddressHash } from '@alephium/shared/types'
import { useMemo } from 'react'

import { useSharedSelector } from '../../redux'

export const useUnsortedAddressesHashes = (): AddressHash[] => useSharedSelector(selectAllAddressHashes)

export const useUnsortedAddressesHashesSet = (): Set<AddressHash> => {
  const addresses = useUnsortedAddressesHashes()
  return useMemo(() => new Set(addresses), [addresses])
}

export const useUnsortedAddresses = (): Address[] => useSharedSelector(selectAllAddresses)
