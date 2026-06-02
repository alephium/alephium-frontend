import { useQuery } from '@tanstack/react-query'

import { UseFetchTransactionProps } from '../../../api/apiDataHooks/transaction/transactionTypes'
import { pendingTransactionQuery } from '../../../api/queries/transactionQueries'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchPendingTransaction = (props: UseFetchTransactionProps) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading } = useQuery(pendingTransactionQuery({ ...props, networkId, isNodeOnline }))

  return {
    data,
    isLoading
  }
}
