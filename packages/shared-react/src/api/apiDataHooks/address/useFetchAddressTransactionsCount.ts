import { useQuery } from '@tanstack/react-query'

import { addressTransactionsCountQuery } from '../../../api/queries'
import { useIsExplorerOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchAddressTransactionsCount = (addressStr: string) => {
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()

  const { data, isLoading } = useQuery(
    addressTransactionsCountQuery({ addressHash: addressStr, networkId, isExplorerOnline })
  )

  return {
    data,
    isLoading
  }
}
