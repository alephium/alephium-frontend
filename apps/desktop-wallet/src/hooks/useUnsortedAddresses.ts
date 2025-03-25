import { Address, AddressHash } from '@alephium/shared'

import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses, selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'

export const useUnsortedAddressesHashes = (): AddressHash[] => useAppSelector(selectAllAddressHashes)

export const useUnsortedAddresses = (): Address[] => useAppSelector(selectAllAddresses)
