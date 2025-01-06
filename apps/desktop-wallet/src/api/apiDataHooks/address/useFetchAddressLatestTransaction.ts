import { useQuery } from '@tanstack/react-query'

import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchAddressLatestTransaction = ({ addressHash, skip }: UseFetchAddressProps) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const { data, isLoading } = useQuery(addressLatestTransactionQuery({ addressHash, networkId, skip }))

  return {
    data,
    isLoading
  }
}

export default useFetchAddressLatestTransaction
