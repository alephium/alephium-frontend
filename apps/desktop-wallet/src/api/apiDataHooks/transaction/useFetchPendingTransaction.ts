import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { UseFetchTransactionProps } from '@/api/apiDataHooks/transaction/transactionTypes'
import { pendingTransactionQuery } from '@/api/queries/transactionQueries'

const useFetchPendingTransaction = (props: UseFetchTransactionProps) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(pendingTransactionQuery({ ...props, networkId }))

  return {
    data,
    isLoading
  }
}

export default useFetchPendingTransaction
