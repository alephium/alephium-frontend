import { AddressHash } from '@alephium/shared/types'
import {
  addressTokensSearchStringsQuery,
  useFetchAddressTokensByType,
  useIsNodeOnline,
  useNetworkId
} from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import styled from 'styled-components'

import SkeletonLoader from '@/components/SkeletonLoader'
import TokenBadge, { TokenBadgeStyleProps } from '@/components/TokenBadge'
import { MIN_SEARCH_TERM_LENGTH } from '@/features/addressFiltering/addressFilteringConstants'
import { getDisplayedAndHiddenTokenIds } from '@/features/assetsLists/getDisplayedAndHiddenTokenIds'

interface AddressTokensBadgesListProps extends TokenBadgeStyleProps {
  addressHash: AddressHash
  maxDisplayedAssets?: number
  searchTerm?: string
}

const AddressTokensBadgesList = ({
  addressHash,
  maxDisplayedAssets = 8,
  searchTerm = '',
  className,
  ...badgeProps
}: AddressTokensBadgesListProps) => {
  const {
    data: { listedFts, unlistedFtIds, nftIds, nstIds },
    isLoading: isLoadingTokens
  } = useFetchAddressTokensByType(addressHash)
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data: tokensSearchStrings } = useQuery({
    ...addressTokensSearchStringsQuery({ addressHash, networkId, isNodeOnline }),
    enabled: searchTerm.length >= MIN_SEARCH_TERM_LENGTH
  })

  const { displayedTokenIds, hiddenTokenIds } = useMemo(
    () =>
      getDisplayedAndHiddenTokenIds({
        tokenIds: [...listedFts.map(({ id }) => id), ...unlistedFtIds, ...nftIds],
        maxDisplayedTokens: maxDisplayedAssets,
        searchTerm,
        tokensSearchStrings
      }),
    [listedFts, maxDisplayedAssets, nftIds, searchTerm, tokensSearchStrings, unlistedFtIds]
  )

  if (isLoadingTokens) return <SkeletonLoader height="33.5px" />

  const nbOfAdditionalTokens = hiddenTokenIds.length + nstIds.length

  if (displayedTokenIds.length === 0 && nbOfAdditionalTokens === 0) return null

  return (
    <TokensBadgesListStyled className={className}>
      {displayedTokenIds.map((tokenId) => (
        <TokenBadge key={tokenId} tokenId={tokenId} {...badgeProps} />
      ))}

      {nbOfAdditionalTokens > 0 && <span>+{nbOfAdditionalTokens}</span>}
    </TokensBadgesListStyled>
  )
}

export default AddressTokensBadgesList

const TokensBadgesListStyled = styled.div`
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  align-items: center;

  &:empty {
    display: none;
  }
`
