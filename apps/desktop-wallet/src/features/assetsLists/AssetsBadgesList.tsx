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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesUnlistedNonStandardTokenIds } from '@/api/addressesUnlistedTokensHooks'
import useAddressesDisplayTokens from '@/api/useAddressesDisplayTokens'
import AssetBadge, { AssetBadgeStyleProps } from '@/components/AssetBadge'
import SkeletonLoader from '@/components/SkeletonLoader'

interface AssetsLogosListProps extends AssetBadgeStyleProps {
  addressHash: AddressHash
  maxDisplayedAssets?: number
  showAmount?: boolean
}

const AssetsLogosList = ({
  addressHash,
  maxDisplayedAssets = 8,
  className,
  showAmount,
  ...badgeProps
}: AssetsLogosListProps) => {
  const { t } = useTranslation()
  const { data: tokens, isLoadingNFTs, isLoadingFTs } = useAddressesDisplayTokens(addressHash)
  const { data: nonStandardTokens, isLoading: isLoadingNonStandardTokens } =
    useAddressesUnlistedNonStandardTokenIds(addressHash)

  const standardTokens = tokens.filter((token) => token.type !== 'nonStandardToken')
  const displayedStandardTokens = standardTokens.slice(0, maxDisplayedAssets)
  const hiddenStandardTokens = standardTokens.slice(maxDisplayedAssets)

  const hiddenAssetsTooltipText = [
    ...hiddenStandardTokens.map((token) => (token.type === 'NFT' ? token.name : token.symbol)),
    nonStandardTokens.length > 0 ? t('unknownTokensKey', { count: nonStandardTokens.length }) : []
  ].join(', ')

  const isLoading = isLoadingFTs || isLoadingNonStandardTokens
  const showList = displayedStandardTokens.length > 0 || !!hiddenAssetsTooltipText

  return isLoading ? (
    <SkeletonLoader height="33.5px" />
  ) : showList ? (
    <AssetsLogosListStyled className={className}>
      {displayedStandardTokens.map((token) => (
        <AssetBadge
          key={token.id}
          assetId={token.id}
          amount={showAmount && token.type !== 'NFT' ? token.totalBalance : undefined}
          hideNftName={token.type === 'NFT'}
          {...badgeProps}
        />
      ))}
      {hiddenAssetsTooltipText && (
        <span data-tooltip-id="default" data-tooltip-content={hiddenAssetsTooltipText}>
          +{hiddenStandardTokens.length + nonStandardTokens.length}
        </span>
      )}
      {isLoadingNFTs && <SkeletonLoader height="33.5px" />}
    </AssetsLogosListStyled>
  ) : null
}

export default AssetsLogosList

const AssetsLogosListStyled = styled.div`
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  align-items: center;
`
