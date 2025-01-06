import { AddressHash, PAGINATION_PAGE_LIMIT, throttledClient } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { getQueryConfig } from '@/api/apiDataHooks/utils/getQueryConfig'
import { AddressLatestTransactionQueryProps } from '@/api/queries/transactionQueries'
import { ApiBalances, TokenApiBalances } from '@/types/tokens'

export type AddressAlphBalancesQueryFnData = {
  addressHash: AddressHash
  balances: ApiBalances
}

// Adding networkId in queryKey ensures that switching the network we get different data.
// TODO: Should we add explorerBackendUrl instead?
export const addressAlphBalancesQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'balance', 'ALPH', { networkId }],
    // We don't want address data to be deleted when the user navigates away from components that need them since these
    // data are essential for the major parts of the app. We manually remove cached data when the user deletes an
    // address.
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const balances = await throttledClient.explorer.addresses.getAddressesAddressBalance(addressHash)

            return {
              addressHash,
              balances: {
                totalBalance: balances.balance,
                lockedBalance: balances.lockedBalance,
                availableBalance: (BigInt(balances.balance) - BigInt(balances.lockedBalance)).toString()
              }
            }
          }
        : skipToken
  })

export type AddressTokensBalancesQueryFnData = {
  addressHash: AddressHash
  balances: TokenApiBalances[]
}

export const addressTokensBalancesQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'balance', 'tokens', { networkId }],
    // We don't want address data to be deleted when the user navigates away from components that need them since these
    // data are essential for the major parts of the app. We manually remove cached data when the user deletes an
    // address.
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const tokenBalances = [] as TokenApiBalances[]
            let tokenBalancesInPage = [] as e.AddressTokenBalance[]
            let page = 1

            while (page === 1 || tokenBalancesInPage.length === PAGINATION_PAGE_LIMIT) {
              tokenBalancesInPage = await throttledClient.explorer.addresses.getAddressesAddressTokensBalance(
                addressHash,
                {
                  limit: PAGINATION_PAGE_LIMIT,
                  page
                }
              )

              tokenBalances.push(
                ...tokenBalancesInPage.map((tokenBalances) => ({
                  id: tokenBalances.tokenId,
                  totalBalance: tokenBalances.balance,
                  lockedBalance: tokenBalances.lockedBalance,
                  availableBalance: (BigInt(tokenBalances.balance) - BigInt(tokenBalances.lockedBalance)).toString()
                }))
              )
              page += 1
            }

            return {
              addressHash,
              balances: tokenBalances
            }
          }
        : skipToken
  })
