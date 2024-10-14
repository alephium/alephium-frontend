/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash, PAGINATION_PAGE_LIMIT, throttledClient } from '@alephium/shared'
import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { AddressLatestTransactionQueryProps } from '@/api/queries/transactionQueries'
import { DisplayBalances, TokenDisplayBalances } from '@/types/tokens'

export type AddressAlphBalancesQueryFnData = {
  addressHash: AddressHash
  balances: DisplayBalances
}

// Adding networkId in queryKey ensures that switching the network we get different data.
// TODO: Should we add explorerBackendUrl instead?
export const addressAlphBalancesQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'balance', 'ALPH', { networkId }],
    staleTime: Infinity,
    // We don't want address data to be deleted when the user navigates away from components that need them since these
    // data are essential for the major parts of the app. We manually remove cached data when the user deletes an
    // address.
    gcTime: Infinity,
    meta: { isMainnet: networkId === 0 },
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const balances = await throttledClient.explorer.addresses.getAddressesAddressBalance(addressHash)

            return {
              addressHash,
              balances: {
                totalBalance: BigInt(balances.balance),
                lockedBalance: BigInt(balances.lockedBalance),
                availableBalance: BigInt(balances.balance) - BigInt(balances.lockedBalance)
              }
            }
          }
        : skipToken
  })

export type AddressTokensBalancesQueryFnData = {
  addressHash: AddressHash
  balances: TokenDisplayBalances[]
}

export const addressTokensBalancesQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'balance', 'tokens', { networkId }],
    staleTime: Infinity,
    // We don't want address data to be deleted when the user navigates away from components that need them since these
    // data are essential for the major parts of the app. We manually remove cached data when the user deletes an
    // address.
    gcTime: Infinity,
    meta: { isMainnet: networkId === 0 },
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const tokenBalances = [] as TokenDisplayBalances[]
            let tokenBalancesInPage = [] as AddressTokenBalance[]
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
                  totalBalance: BigInt(tokenBalances.balance),
                  lockedBalance: BigInt(tokenBalances.lockedBalance),
                  availableBalance: BigInt(tokenBalances.balance) - BigInt(tokenBalances.lockedBalance)
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
