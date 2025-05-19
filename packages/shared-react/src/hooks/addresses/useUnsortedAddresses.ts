import { Address, AddressHash, selectAllAddresses, selectAllAddressHashes } from '@alephium/shared'

import { useSharedSelector } from '@/redux'

export const useUnsortedAddressesHashes = (): AddressHash[] => useSharedSelector(selectAllAddressHashes)

export const useUnsortedAddresses = (): Address[] => useSharedSelector(selectAllAddresses)
