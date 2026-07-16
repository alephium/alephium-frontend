import { FIVE_MINUTES_MS, is5XXError } from '@alephium/shared'
import { PAGINATION_PAGE_LIMIT, throttledClient } from '@alephium/shared/api'
import { AddressHash, ApiBalances, isFT, isNFT, TokenApiBalances, TokenId } from '@alephium/shared/types'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { separateTokensByListing } from '../../api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import { getFulfilledValues, getQueryConfig } from '../../api/apiUtils'
import {
  combineTokenTypes,
  ftListQuery,
  fungibleTokenMetadataQuery,
  nftQuery,
  tokenQuery,
  tokenTypeQuery
} from '../../api/queries/tokenQueries'
import { queryClient } from '../../api/queryClient'
import { shouldSkip } from './queriesUtils'

export type AddressAlphBalancesQueryFnData = {
  addressHash: AddressHash
  balances: ApiBalances
}

interface AddressQueryProps {
  addressHash: AddressHash
  networkId: number
  skip?: boolean
}

interface AddressNodeQueryProps extends AddressQueryProps {
  isNodeOnline: boolean
}

const nodeAddressBalancesQuery = ({ addressHash, networkId, isNodeOnline, skip }: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'level:-1', 'balance', 'node', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : () => throttledClient.node.addresses.getAddressesAddressBalance(addressHash)
  })

export const addressAlphBalancesQueryKey = ({
  addressHash,
  networkId
}: Pick<AddressNodeQueryProps, 'addressHash' | 'networkId'>) =>
  ['address', addressHash, 'level:0', 'balance', 'ALPH', { networkId }] as const

// Adding networkId in queryKey ensures that switching the network we get different data.
export const addressAlphBalancesQuery = ({ addressHash, networkId, isNodeOnline, skip }: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: addressAlphBalancesQueryKey({ addressHash, networkId }),
    // We don't want address data to be deleted when the user navigates away from components that need them since these
    // data are essential for the major parts of the app. We manually remove cached data when the user deletes an
    // address.
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : async () => {
          let balances = null

          try {
            balances = await throttledClient.explorer.addresses.getAddressesAddressBalance(addressHash)
          } catch (e) {
            if (is5XXError(e)) {
              balances = await queryClient.fetchQuery(
                nodeAddressBalancesQuery({ addressHash, networkId, isNodeOnline, skip })
              )
            } else {
              throw e
            }
          }

          return {
            addressHash,
            balances: {
              totalBalance: balances.balance,
              lockedBalance: balances.lockedBalance,
              availableBalance: (BigInt(balances.balance) - BigInt(balances.lockedBalance)).toString()
            }
          }
        }
  })

export type AddressTokensBalancesQueryFnData = {
  addressHash: AddressHash
  balances: TokenApiBalances[]
}

export const addressTokensBalancesQuery = ({ addressHash, networkId, isNodeOnline, skip }: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'level:0', 'balance', 'tokens', { networkId }],
    // We don't want address data to be deleted when the user navigates away from components that need them since these
    // data are essential for the major parts of the app. We manually remove cached data when the user deletes an
    // address.
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : async () => {
          const tokenBalances = [] as TokenApiBalances[]
          let tokenBalancesInPage = [] as e.AddressTokenBalance[]
          let page = 1

          try {
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
          } catch (e) {
            if (is5XXError(e)) {
              const balances = await queryClient.fetchQuery(
                nodeAddressBalancesQuery({ addressHash, networkId, isNodeOnline, skip })
              )

              balances.tokenBalances?.forEach((tokenBalance) => {
                const lockedBalance = balances.lockedTokenBalances?.find(({ id }) => id === tokenBalance.id)?.amount

                tokenBalances.push({
                  id: tokenBalance.id,
                  totalBalance: tokenBalance.amount,
                  lockedBalance: lockedBalance ?? '0',
                  availableBalance: (BigInt(tokenBalance.amount) - BigInt(lockedBalance ?? 0)).toString()
                })
              })
            } else {
              throw e
            }
          }

          return {
            addressHash,
            balances: tokenBalances
          }
        }
  })

export const addressBalancesQuery = ({ addressHash, networkId, isNodeOnline, skip }: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'level:1', 'balances-all', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : async () => {
          const { balances: addressAlphBalances } = await queryClient.fetchQuery(
            addressAlphBalancesQuery({ addressHash, networkId, isNodeOnline, skip })
          )
          const { balances: addressTokensBalances } = await queryClient.fetchQuery(
            addressTokensBalancesQuery({ addressHash, networkId, isNodeOnline, skip })
          )

          return {
            addressHash,
            balances:
              addressAlphBalances.totalBalance !== '0'
                ? [{ id: ALPH.id, ...addressAlphBalances } as TokenApiBalances, ...addressTokensBalances]
                : addressTokensBalances
          }
        }
  })

export const addressBalancesByListingQuery = ({ addressHash, networkId, isNodeOnline, skip }: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'level:2', 'balances-by-listing', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : async () => {
          const { balances } = await queryClient.fetchQuery(
            addressBalancesQuery({ addressHash, networkId, isNodeOnline, skip })
          )
          const ftList = await queryClient.fetchQuery(ftListQuery({ networkId }))

          return separateTokensByListing(balances, ftList)
        }
  })

export type AddressSearchStringQueryFnData = {
  addressHash: AddressHash
  searchString: string
}

// Generates a map of token IDs to search strings that include the name, symbol, and ID of each token, useful for
// filtering tokens.
export const addressTokensSearchStringsQuery = ({
  addressHash,
  networkId,
  isNodeOnline,
  skip
}: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'level:1', 'tokens-search-strings', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : async (): Promise<Record<TokenId, string>> => {
          const tokensSearchStrings = {} as Record<TokenId, string>

          const addressTokensBalances = await queryClient.fetchQuery(
            addressTokensBalancesQuery({ addressHash, networkId, isNodeOnline, skip })
          )
          const hasTokens = addressTokensBalances.balances.length > 0
          let hasAlph = hasTokens

          if (hasTokens) {
            const tokenPromiseResults = await Promise.allSettled(
              addressTokensBalances.balances.map(({ id }) =>
                queryClient.fetchQuery(tokenQuery({ id, networkId, isExplorerOnline: isNodeOnline }))
              )
            )

            getFulfilledValues(tokenPromiseResults).forEach((token) => {
              tokensSearchStrings[token.id] = isFT(token)
                ? `${token.name.toLowerCase()} ${token.symbol.toLowerCase()} ${token.id}`
                : isNFT(token)
                  ? `${token.name.toLowerCase()} ${token.id}`
                  : token.id
            })
          } else {
            const addressAlphBalances = await queryClient.fetchQuery(
              addressAlphBalancesQuery({ addressHash, networkId, isNodeOnline, skip })
            )
            hasAlph = addressAlphBalances.balances.totalBalance !== '0'
          }

          if (hasAlph) {
            tokensSearchStrings[ALPH.id] = 'alph alephium'
          }

          return tokensSearchStrings
        }
  })

// Generates a string that includes the names and symbols of all tokens in the address, useful for filtering addresses.
export const addressSearchStringQuery = ({ addressHash, networkId, isNodeOnline, skip }: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'level:2', 'search-string', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : async (): Promise<AddressSearchStringQueryFnData> => {
          const tokensSearchStrings = await queryClient.fetchQuery(
            addressTokensSearchStringsQuery({ addressHash, networkId, isNodeOnline, skip })
          )

          return {
            addressHash,
            searchString: Object.values(tokensSearchStrings).join(' ')
          }
        }
  })

export const addressTokensByTypeQuery = ({ addressHash, networkId, isNodeOnline, skip }: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'level:3', 'tokens-by-type', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : async () => {
          const { listedFts, unlistedTokens } = await queryClient.fetchQuery(
            addressBalancesByListingQuery({ addressHash, networkId, isNodeOnline, skip })
          )

          const tokenTypesPromiseResults = await Promise.allSettled(
            unlistedTokens.map(({ id }) =>
              queryClient.fetchQuery(tokenTypeQuery({ id, networkId, isExplorerOnline: isNodeOnline }))
            )
          )
          const tokenTypes = getFulfilledValues(tokenTypesPromiseResults)

          const {
            fungible: unlistedFtIds,
            'non-fungible': nftIds,
            'non-standard': nstIds
          } = combineTokenTypes(tokenTypes)

          return { listedFts, unlistedTokens, unlistedFtIds, nftIds, nstIds }
        }
  })

export const addressFtsQuery = ({ addressHash, networkId, isNodeOnline, skip }: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'level:4', 'tokens', 'fts', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : async () => {
          const { listedFts, unlistedFtIds } = await queryClient.fetchQuery(
            addressTokensByTypeQuery({ addressHash, networkId, isNodeOnline, skip })
          )

          const ftMetadataPromiseResults = await Promise.allSettled(
            unlistedFtIds.map((id) =>
              queryClient.fetchQuery(fungibleTokenMetadataQuery({ id, networkId, isExplorerOnline: isNodeOnline }))
            )
          )

          const unlistedFts = getFulfilledValues(ftMetadataPromiseResults).filter((ftMetadata) => ftMetadata !== null)

          return {
            listedFts,
            unlistedFts
          }
        }
  })

export const addressNftsQuery = ({ addressHash, networkId, isNodeOnline, skip }: AddressNodeQueryProps) =>
  queryOptions({
    queryKey: ['address', addressHash, 'level:4', 'tokens', 'nfts', { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: shouldSkip(isNodeOnline, skip)
      ? skipToken
      : async () => {
          const { nftIds } = await queryClient.fetchQuery(
            addressTokensByTypeQuery({ addressHash, networkId, isNodeOnline, skip })
          )

          const nftsPromiseResults = await Promise.allSettled(
            nftIds.map((id) => queryClient.fetchQuery(nftQuery({ id, networkId, isExplorerOnline: isNodeOnline })))
          )

          const nfts = getFulfilledValues(nftsPromiseResults).filter((nft) => nft !== null)

          return nfts
        }
  })
