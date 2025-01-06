import { PAGINATION_PAGE_LIMIT } from '@alephium/shared'
import { queryOptions } from '@tanstack/react-query'

import client from '@/api/client'
import { browsePages } from '@/utils/api'

export const addressQueries = {
  balance: {
    details: (addressHash: string) =>
      queryOptions({
        queryKey: ['addressBalance', addressHash],
        queryFn: () => client.explorer.addresses.getAddressesAddressBalance(addressHash)
      })
  },
  transactions: {
    confirmed: (addressHash: string, pageNumber: number, limit = 10) =>
      queryOptions({
        queryKey: ['addressConfirmedTransactions', addressHash, pageNumber, limit],
        queryFn: () =>
          client.explorer.addresses.getAddressesAddressTransactions(addressHash, {
            page: pageNumber,
            limit
          })
      }),
    mempool: (addressHash: string) =>
      queryOptions({
        queryKey: ['addressPendingTransactions', addressHash],
        queryFn: () => client.explorer.addresses.getAddressesAddressMempoolTransactions(addressHash)
      }),
    txNumber: (addressHash: string) =>
      queryOptions({
        queryKey: ['addressTxNumber', addressHash],
        queryFn: () => client.explorer.addresses.getAddressesAddressTotalTransactions(addressHash)
      })
  },
  assets: {
    tokensBalance: (addressHash: string) =>
      queryOptions({
        queryKey: ['addressTokensBalance', addressHash],
        queryFn: async () =>
          browsePages(client.explorer.addresses.getAddressesAddressTokensBalance, addressHash, PAGINATION_PAGE_LIMIT)
      })
  }
}
