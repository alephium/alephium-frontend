import { queryOptions } from '@tanstack/react-query'

import client from '@/api/client'

export const transactionsQueries = {
  transaction: {
    one: (txHash: string) =>
      queryOptions({
        queryKey: ['transactions', txHash],
        queryFn: () => client.explorer.transactions.getTransactionsTransactionHash(txHash)
      })
  }
}
