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
    data: { listedFts, unlistedFTIds, nftIds, nstIds },
    isLoading: isLoadingTokens
  } = useFetchAddressTokensByType({ addressHash, includeAlph: true })

  const { displayedStandardTokenIds, hiddenStandardTokensIds } = useMemo(() => {
    const standardTokens = [...listedFts.map(({ id }) => id), ...unlistedFTIds, ...nftIds]

    return {
      displayedStandardTokenIds: standardTokens.slice(0, maxDisplayedAssets),
      hiddenStandardTokensIds: standardTokens.slice(maxDisplayedAssets)
    }
  }, [listedFts, maxDisplayedAssets, nftIds, unlistedFTIds])

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
