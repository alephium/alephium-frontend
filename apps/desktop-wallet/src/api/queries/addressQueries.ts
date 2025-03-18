import { AddressHash, PAGINATION_PAGE_LIMIT, throttledClient } from '@alephium/shared'
import { getQueryConfig } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { separateTokensByListing } from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import { getFulfilledValues } from '@/api/apiUtils'
import { combineTokenTypes, ftListQuery, tokenQuery, tokenTypeQuery } from '@/api/queries/tokenQueries'
import { AddressLatestTransactionQueryProps } from '@/api/queries/transactionQueries'
import queryClient from '@/api/queryClient'
import { ApiBalances, isFT, isNFT, TokenApiBalances } from '@/types/tokens'

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

export type AddressTokensSearchStringQueryFnData = {
  addressHash: AddressHash
  searchString: string
}

// Generates a string that includes the names and symbols of all tokens in the address, useful for filtering addresses
export const addressTokensSearchStringQuery = ({ addressHash, networkId }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'computedData', 'tokensSearchString', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: async (): Promise<AddressTokensSearchStringQueryFnData> => {
      let searchString = ''

      const addressTokensBalances = await queryClient.fetchQuery(addressTokensBalancesQuery({ addressHash, networkId }))
      const hasTokens = addressTokensBalances.balances.length > 0
      let hasAlph = hasTokens

      if (hasTokens) {
        const tokenPromiseResults = await Promise.allSettled(
          addressTokensBalances.balances.map(({ id }) => queryClient.fetchQuery(tokenQuery({ id, networkId })))
        )

        searchString = getFulfilledValues(tokenPromiseResults)
          .map((token) =>
            isFT(token)
              ? `${token.name.toLowerCase()} ${token.symbol.toLowerCase()} ${token.id}`
              : isNFT(token)
                ? `${token.name.toLowerCase()} ${token.id}`
                : token.id
          )
          .join(' ')
      } else {
        const addressAlphBalances = await queryClient.fetchQuery(addressAlphBalancesQuery({ addressHash, networkId }))
        hasAlph = addressAlphBalances.balances.totalBalance !== '0'
      }

      if (hasAlph) {
        searchString += ' alph alephium'
      }

      return {
        addressHash,
        searchString
      }
    }
  })

export const addressTokensByTypeQuery = ({ addressHash, networkId }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'computedData', 'tokensByType', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: async () => {
      const { balances: addressAlphBalances } = await queryClient.fetchQuery(
        addressAlphBalancesQuery({ addressHash, networkId })
      )
      const { balances: addressTokensBalances } = await queryClient.fetchQuery(
        addressTokensBalancesQuery({ addressHash, networkId })
      )
      const allTokensBalances =
        addressAlphBalances && addressAlphBalances.totalBalance !== '0'
          ? [{ id: ALPH.id, ...addressAlphBalances } as TokenApiBalances, ...addressTokensBalances]
          : addressTokensBalances

      const ftList = await queryClient.fetchQuery(ftListQuery({ networkId }))
      const { listedFts, unlistedTokens } = separateTokensByListing(allTokensBalances, ftList)

      const tokenTypesPromiseResults = await Promise.allSettled(
        unlistedTokens.map(({ id }) => queryClient.fetchQuery(tokenTypeQuery({ id, networkId })))
      )
      const tokenTypes = getFulfilledValues(tokenTypesPromiseResults)

      const { fungible: unlistedFtIds, 'non-fungible': nftIds, 'non-standard': nstIds } = combineTokenTypes(tokenTypes)

      return { listedFts, unlistedTokens, unlistedFtIds, nftIds, nstIds }
    }
  })
