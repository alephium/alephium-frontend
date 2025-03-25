import { AddressHash, PAGINATION_PAGE_LIMIT, throttledClient } from '@alephium/shared'
import { getQueryConfig, queryClient } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { separateTokensByListing } from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import { getFulfilledValues } from '@/api/apiUtils'
import {
  combineTokenTypes,
  ftListQuery,
  fungibleTokenMetadataQuery,
  tokenQuery,
  tokenTypeQuery
} from '@/api/queries/tokenQueries'
import { AddressLatestTransactionQueryProps } from '@/api/queries/transactionQueries'
import { ApiBalances, isFT, isNFT, TokenApiBalances, TokenId } from '@/types/tokens'

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

export const addressBalancesQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'balance', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const { balances: addressAlphBalances } = await queryClient.fetchQuery(
              addressAlphBalancesQuery({ addressHash, networkId })
            )
            const { balances: addressTokensBalances } = await queryClient.fetchQuery(
              addressTokensBalancesQuery({ addressHash, networkId })
            )

            return {
              addressHash,
              balances:
                addressAlphBalances.totalBalance !== '0'
                  ? [{ id: ALPH.id, ...addressAlphBalances } as TokenApiBalances, ...addressTokensBalances]
                  : addressTokensBalances
            }
          }
        : skipToken
  })

export const addressBalancesByListingQuery = ({ addressHash, networkId, skip }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'balance', 'by-listing', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const { balances } = await queryClient.fetchQuery(addressBalancesQuery({ addressHash, networkId }))
            const ftList = await queryClient.fetchQuery(ftListQuery({ networkId }))

            return separateTokensByListing(balances, ftList)
          }
        : skipToken
  })

export type AddressSearchStringQueryFnData = {
  addressHash: AddressHash
  searchString: string
}

// Generates a map of token IDs to search strings that include the name, symbol, and ID of each token, useful for
// filtering tokens.
export const addressTokensSearchStringsQuery = ({ addressHash, networkId }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'computedData', 'tokensSearchStrings', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: async (): Promise<Record<TokenId, string>> => {
      const tokensSearchStrings = {} as Record<TokenId, string>

      const addressTokensBalances = await queryClient.fetchQuery(addressTokensBalancesQuery({ addressHash, networkId }))
      const hasTokens = addressTokensBalances.balances.length > 0
      let hasAlph = hasTokens

      if (hasTokens) {
        const tokenPromiseResults = await Promise.allSettled(
          addressTokensBalances.balances.map(({ id }) => queryClient.fetchQuery(tokenQuery({ id, networkId })))
        )

        getFulfilledValues(tokenPromiseResults).forEach((token) => {
          tokensSearchStrings[token.id] = isFT(token)
            ? `${token.name.toLowerCase()} ${token.symbol.toLowerCase()} ${token.id}`
            : isNFT(token)
              ? `${token.name.toLowerCase()} ${token.id}`
              : token.id
        })
      } else {
        const addressAlphBalances = await queryClient.fetchQuery(addressAlphBalancesQuery({ addressHash, networkId }))
        hasAlph = addressAlphBalances.balances.totalBalance !== '0'
      }

      if (hasAlph) {
        tokensSearchStrings[ALPH.id] = 'alph alephium'
      }

      return tokensSearchStrings
    }
  })

// Generates a string that includes the names and symbols of all tokens in the address, useful for filtering addresses.
export const addressSearchStringQuery = ({ addressHash, networkId }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'computedData', 'searchString', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: async (): Promise<AddressSearchStringQueryFnData> => {
      const tokensSearchStrings = await queryClient.fetchQuery(
        addressTokensSearchStringsQuery({ addressHash, networkId })
      )

      return {
        addressHash,
        searchString: Object.values(tokensSearchStrings).join(' ')
      }
    }
  })

export const addressTokensByTypeQuery = ({ addressHash, networkId }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'computedData', 'tokensByType', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: async () => {
      const { listedFts, unlistedTokens } = await queryClient.fetchQuery(
        addressBalancesByListingQuery({ addressHash, networkId })
      )

      const tokenTypesPromiseResults = await Promise.allSettled(
        unlistedTokens.map(({ id }) => queryClient.fetchQuery(tokenTypeQuery({ id, networkId })))
      )
      const tokenTypes = getFulfilledValues(tokenTypesPromiseResults)

      const { fungible: unlistedFtIds, 'non-fungible': nftIds, 'non-standard': nstIds } = combineTokenTypes(tokenTypes)

      return { listedFts, unlistedTokens, unlistedFtIds, nftIds, nstIds }
    }
  })

export const addressFtsQuery = ({ addressHash, networkId }: AddressLatestTransactionQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'computedData', 'fts', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: async () => {
      const { listedFts, unlistedFtIds } = await queryClient.fetchQuery(
        addressTokensByTypeQuery({ addressHash, networkId })
      )

      const ftMetadataPromiseResults = await Promise.allSettled(
        unlistedFtIds.map((id) => queryClient.fetchQuery(fungibleTokenMetadataQuery({ id, networkId })))
      )

      const unlistedFts = getFulfilledValues(ftMetadataPromiseResults).filter((ftMetadata) => ftMetadata !== null)

      return {
        listedFts,
        unlistedFts
      }
    }
  })
