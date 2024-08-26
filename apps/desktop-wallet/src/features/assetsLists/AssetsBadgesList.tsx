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

import { useAddressesTokensBalances } from '@/api/addressesBalancesDataHooks'
import { useAddressesNfts } from '@/api/addressesNftsDataHooks'
import { useAddressesUnlistedNonStandardTokenIds } from '@/api/addressesUnlistedTokensHooks'
import AssetBadge, { AssetBadgeStyleProps } from '@/components/AssetBadge'
import SkeletonLoader from '@/components/SkeletonLoader'
import useAddressesSortedFungibleTokens from '@/features/assetsLists/useSortedFungibleTokens'

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
  const { data: tokensBalances } = useAddressesTokensBalances(addressHash)
  const { data: sortedFTs, isLoading: isLoadingSortedFTs } = useAddressesSortedFungibleTokens(addressHash)
  const { data: NFTs, isLoading: isLoadingNFTs } = useAddressesNfts(addressHash)
  const { data: nonStandardTokens, isLoading: isLoadingNonStandardTokens } =
    useAddressesUnlistedNonStandardTokenIds(addressHash)

  const displayedFTs = sortedFTs.slice(0, maxDisplayedAssets)
  const hiddenFTs = sortedFTs.slice(maxDisplayedAssets)
  const displayedNFTs = NFTs.slice(0, maxDisplayedAssets - displayedFTs.length)
  const hiddenNFTs = NFTs.slice(maxDisplayedAssets - displayedFTs.length)

  const hiddenAssetsTooltipText = [
    ...hiddenFTs.map(({ symbol }) => symbol),
    ...hiddenNFTs.map(({ name }) => name),
    nonStandardTokens.length > 0 ? t('unknownTokensKey', { count: nonStandardTokens.length }) : []
  ].join(', ')

  const isLoading = isLoadingSortedFTs || isLoadingNonStandardTokens
  const showList = displayedFTs.length > 0 || displayedNFTs.length > 0 || !!hiddenAssetsTooltipText

  return isLoading ? (
    <SkeletonLoader height="33.5px" />
  ) : showList ? (
    <AssetsLogosListStyled className={className}>
      {displayedFTs.map(({ id }) => (
        <AssetBadge
          key={id}
          assetId={id}
          amount={showAmount ? tokensBalances[id]?.balance : undefined}
          {...badgeProps}
        />
      ))}
      {displayedNFTs.map(({ id }) => (
        <AssetBadge key={id} assetId={id} hideNftName {...badgeProps} />
      ))}
      {hiddenAssetsTooltipText && (
        <span data-tooltip-id="default" data-tooltip-content={hiddenAssetsTooltipText}>
          +{hiddenFTs.length + hiddenNFTs.length + nonStandardTokens.length}
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
