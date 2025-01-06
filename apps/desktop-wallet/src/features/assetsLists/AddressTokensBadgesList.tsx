import { AddressHash } from '@alephium/shared'
import { useMemo } from 'react'
import styled from 'styled-components'

import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TokenBadgeStyleProps } from '@/components/TokenBadge'
import AddressTokenBadge from '@/features/assetsLists/AddressTokenBadge'

interface AddressTokensBadgesListProps extends TokenBadgeStyleProps {
  addressHash: AddressHash
  maxDisplayedAssets?: number
}

const AddressTokensBadgesList = ({
  addressHash,
  maxDisplayedAssets = 8,
  className,
  ...badgeProps
}: AddressTokensBadgesListProps) => {
  const {
    data: { listedFts, unlistedFtIds, nftIds, nstIds },
    isLoading: isLoadingTokens
  } = useFetchAddressTokensByType({ addressHash, includeAlph: true })

  const { displayedStandardTokenIds, hiddenStandardTokensIds } = useMemo(() => {
    const standardTokens = [...listedFts.map(({ id }) => id), ...unlistedFtIds, ...nftIds]

    return {
      displayedStandardTokenIds: standardTokens.slice(0, maxDisplayedAssets),
      hiddenStandardTokensIds: standardTokens.slice(maxDisplayedAssets)
    }
  }, [listedFts, maxDisplayedAssets, nftIds, unlistedFtIds])

  if (isLoadingTokens) return <SkeletonLoader height="33.5px" />

  const nbOfAdditionalTokens = hiddenStandardTokensIds.length + nstIds.length

  if (displayedStandardTokenIds.length === 0 && nbOfAdditionalTokens === 0) return null

  return (
    <TokensBadgesListStyled className={className}>
      {displayedStandardTokenIds.map((tokenId) => (
        <AddressTokenBadge key={tokenId} tokenId={tokenId} addressHash={addressHash} {...badgeProps} />
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
