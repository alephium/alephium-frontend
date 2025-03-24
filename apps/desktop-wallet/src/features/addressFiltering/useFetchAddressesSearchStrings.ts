import { Address, AddressHash } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { addressSearchStringQuery, AddressSearchStringQueryFnData } from '@/api/queries/addressQueries'
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'

const useFetchAddressesSearchStrings = (addressHashes: AddressHash[]) => {
  const addresses = useUnsortedAddresses()
  const networkId = useCurrentlyOnlineNetworkId()

  const { data } = useQueries({
    queries: addressHashes.map((hash) => addressSearchStringQuery({ addressHash: hash, networkId })),
    combine: (results) => combineAddressesSearchStrings(results, addresses)
  })

  return { data }
}

export default useFetchAddressesSearchStrings

const combineAddressesSearchStrings = (
  results: UseQueryResult<AddressSearchStringQueryFnData, Error>[],
  addresses: Address[]
) => ({
  data: results.reduce(
    (acc, { data }) => {
      if (!data) return acc

      const address = addresses.find((address) => address.hash === data.addressHash)

      acc[data.addressHash] = `${data.searchString} ${address?.label ?? ''} ${data.addressHash}`

      return acc
    },
    {} as Record<AddressHash, string>
  )
})
