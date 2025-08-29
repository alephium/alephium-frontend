import { AddressHash } from '@alephium/shared'
import { InfiniteData } from '@tanstack/react-query'

import {
  AddressTransactionsInfiniteQueryPageData,
  WalletTransactionsInfiniteQueryPageParam
} from '@/api/queries/transactionQueries'
import { queryClient } from '@/api/queryClient'

// Queries need to be invalidated in order of dependency
export const invalidateAddressQueries = async (addressHash: AddressHash) => {
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:-1'] })
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:0'] })
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:1'] })
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:2'] })
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:3'] })
  await queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'level:4'] })
}

export const invalidateWalletQueries = async () => {
  await invalidateWalletTransactionsQuery()
}

type WalletTransactionsQueryData = InfiniteData<
  AddressTransactionsInfiniteQueryPageData,
  WalletTransactionsInfiniteQueryPageParam
>

const invalidateWalletTransactionsQuery = async () => {
  const queryKey = ['wallet', 'transactions']

  // We use `getQueriesData` instead of `getQueryData` because we cannot reconstruct the full query key
  const data = queryClient.getQueriesData({ queryKey })

  // Keep only the first page of the wallet transactions query to avoid refetching all loaded pages
  // See: https://github.com/alephium/alephium-frontend/issues/1475
  if (data && data[0] && data[0][1]) {
    const firstPageData = data[0][1] as WalletTransactionsQueryData

    if (
      firstPageData?.pages &&
      firstPageData.pages.length > 0 &&
      firstPageData?.pageParams &&
      firstPageData.pageParams.length > 0
    ) {
      queryClient.setQueriesData({ queryKey }, () => ({
        pages: firstPageData.pages.slice(0, 1),
        pageParams: firstPageData.pageParams.slice(0, 1)
      }))
    }
  }

  await queryClient.invalidateQueries({ queryKey })
}
