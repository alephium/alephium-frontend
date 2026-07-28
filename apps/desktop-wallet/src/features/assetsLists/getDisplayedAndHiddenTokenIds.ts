import { TokenId } from '@alephium/shared/types'

import { MIN_SEARCH_TERM_LENGTH } from '@/features/addressFiltering/addressFilteringConstants'

interface GetDisplayedAndHiddenTokenIdsProps {
  tokenIds: TokenId[]
  maxDisplayedTokens: number
  searchTerm: string
  tokensSearchStrings?: Record<TokenId, string>
}

export const getDisplayedAndHiddenTokenIds = ({
  tokenIds,
  maxDisplayedTokens,
  searchTerm,
  tokensSearchStrings
}: GetDisplayedAndHiddenTokenIdsProps) => {
  if (searchTerm.length < MIN_SEARCH_TERM_LENGTH)
    return {
      displayedTokenIds: tokenIds.slice(0, maxDisplayedTokens),
      hiddenTokenIds: tokenIds.slice(maxDisplayedTokens)
    }

  const matchesSearchTerm = (tokenId: TokenId) => tokensSearchStrings?.[tokenId]?.includes(searchTerm) ?? false
  const matchingTokenIds = tokenIds.filter(matchesSearchTerm)
  const nonMatchingTokenIds = tokenIds.filter((tokenId) => !matchesSearchTerm(tokenId))
  const remainingSlots = Math.max(maxDisplayedTokens - matchingTokenIds.length, 0)

  return {
    displayedTokenIds: [...matchingTokenIds, ...nonMatchingTokenIds.slice(0, remainingSlots)],
    hiddenTokenIds: nonMatchingTokenIds.slice(remainingSlots)
  }
}
