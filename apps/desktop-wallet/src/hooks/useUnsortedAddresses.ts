import { AddressHash } from '@alephium/shared'

import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses, selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'
import { Address } from '@/types/addresses'

export const useUnsortedAddressesHashes = (): AddressHash[] => useAppSelector(selectAllAddressHashes)

export const useUnsortedAddresses = (): Address[] => useAppSelector(selectAllAddresses)
