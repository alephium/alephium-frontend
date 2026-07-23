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

interface AddressTokensBadgesListProps extends TokenBadgeStyleProps {
  addressHash: AddressHash
  maxDisplayedAssets?: number
  searchTerm?: string
}

const AddressTokensBadgesList = ({
  addressHash,
  maxDisplayedAssets = 8,
  searchTerm,
  className,
  ...badgeProps
}: AddressTokensBadgesListProps) => {
  const {
    data: { listedFts, unlistedFtIds, nftIds, nstIds },
    isLoading: isLoadingTokens
  } = useFetchAddressTokensByType(addressHash)
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const search = searchTerm?.trim().toLowerCase() ?? ''
  const isSearching = search.length >= 2

  const { data: tokensSearchStrings } = useQuery({
    ...addressTokensSearchStringsQuery({ addressHash, networkId, isNodeOnline }),
    enabled: isSearching
  })

  const { displayedStandardTokenIds, hiddenStandardTokensIds } = useMemo(() => {
    const standardTokens = [...listedFts.map(({ id }) => id), ...unlistedFtIds, ...nftIds]

    const tokenMatchesSearch = (id: string) => tokensSearchStrings?.[id]?.includes(search) ?? false
    const matchingTokenIds = isSearching ? standardTokens.filter(tokenMatchesSearch) : []
    const nonMatchingTokenIds = isSearching ? standardTokens.filter((id) => !tokenMatchesSearch(id)) : standardTokens
    const remainingSlots = Math.max(maxDisplayedAssets - matchingTokenIds.length, 0)

    return {
      displayedStandardTokenIds: [...matchingTokenIds, ...nonMatchingTokenIds.slice(0, remainingSlots)],
      hiddenStandardTokensIds: nonMatchingTokenIds.slice(remainingSlots)
    }
  }, [isSearching, listedFts, maxDisplayedAssets, nftIds, search, tokensSearchStrings, unlistedFtIds])

  if (isLoadingTokens) return <SkeletonLoader height="33.5px" />

  const nbOfAdditionalTokens = hiddenStandardTokensIds.length + nstIds.length

  if (displayedStandardTokenIds.length === 0 && nbOfAdditionalTokens === 0) return null

  return (
    <TokensBadgesListStyled className={className}>
      {displayedStandardTokenIds.map((tokenId) => (
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
