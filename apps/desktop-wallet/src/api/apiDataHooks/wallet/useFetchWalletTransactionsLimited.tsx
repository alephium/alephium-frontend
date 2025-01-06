import { useQuery } from '@tanstack/react-query'

import { walletLatestTransactionsQuery } from '@/api/queries/transactionQueries'
import { useAppSelector } from '@/hooks/redux'
import { useCappedAddressesHashes } from '@/hooks/useAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchWalletTransactionsLimited = () => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const { addressHashes, isCapped } = useCappedAddressesHashes()

  const { data: confirmedTxs, isLoading } = useQuery(walletLatestTransactionsQuery({ addressHashes, networkId }))

  return {
    data: confirmedTxs,
    isLoading,
    isDataComplete: !isCapped
  }
}

export default useFetchWalletTransactionsLimited
