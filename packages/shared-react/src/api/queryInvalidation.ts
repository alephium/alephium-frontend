import { AddressHash } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { InfiniteData } from '@tanstack/react-query'

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

type WalletTransactionsQueryData = InfiniteData<{
  pageTransactions: e.Transaction[]
  addressesWithMoreTxPages: AddressHash[]
}>

const invalidateWalletTransactionsQuery = async () => {
  const queryKey = ['wallet', 'transactions']

  // Keep only the first page of the wallet transactions query to avoid refetching all loaded pages
  // See: https://github.com/alephium/alephium-frontend/issues/1475
  queryClient.setQueriesData({ queryKey }, (data: WalletTransactionsQueryData | undefined) => ({
    pages: data?.pages.slice(0, 1) ?? [],
    pageParams: data?.pageParams.slice(0, 1) ?? []
  }))

  await queryClient.invalidateQueries({ queryKey })
}
