import { AddressHash } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'

import { addressLatestTransactionQuery } from '../../../api/queries/transactionQueries'
import { useIsExplorerOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchAddressLatestTransaction = (addressHash: AddressHash) => {
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()

  const { data, isLoading } = useQuery(addressLatestTransactionQuery({ addressHash, networkId, isExplorerOnline }))

  return {
    data,
    isLoading
  }
}
