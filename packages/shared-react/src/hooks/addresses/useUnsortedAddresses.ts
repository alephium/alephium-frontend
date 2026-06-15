import { selectAllAddresses, selectAllAddressHashes } from '@alephium/shared/store'
import { Address, AddressHash } from '@alephium/shared/types'

import { useSharedSelector } from '../../redux'

export const useUnsortedAddressesHashes = (): AddressHash[] => useSharedSelector(selectAllAddressHashes)

export const useUnsortedAddresses = (): Address[] => useSharedSelector(selectAllAddresses)
