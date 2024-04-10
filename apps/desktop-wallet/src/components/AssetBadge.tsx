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

import { Asset, isFungible, isNonFungible } from '@alephium/shared'
import styled, { css } from 'styled-components'

import { useAssetsMetadataForCurrentNetwork } from '@/api/apiHooks'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'

interface AssetBadgeProps {
  assetId: Asset['id']
  amount?: bigint
  simple?: boolean
  withBorder?: boolean
  withBackground?: boolean
  hideNftName?: boolean
  className?: string
}

const AssetBadge = ({ assetId, amount, simple, hideNftName, className }: AssetBadgeProps) => {
  const tokenInfo = useAssetsMetadataForCurrentNetwork([assetId])[0]

  const fungibleToken = isFungible(tokenInfo) ? tokenInfo : undefined
  const nftInfo = isNonFungible(tokenInfo) ? tokenInfo : undefined

  return (
    <div
      className={className}
      data-tooltip-id="default"
      data-tooltip-content={fungibleToken?.name ?? nftInfo?.name ?? assetId}
    >
      <AssetLogo
        assetId={assetId}
        assetImageUrl={fungibleToken?.logoURI || nftInfo?.image}
        size={20}
        assetName={fungibleToken?.name}
        isNft={!!nftInfo}
      />
      {nftInfo?.name && !hideNftName ? (
        <AssetSymbol>{nftInfo?.name}</AssetSymbol>
      ) : amount !== undefined ? (
        <Amount value={amount} suffix={fungibleToken?.symbol} decimals={fungibleToken?.decimals} />
      ) : (
        !simple && fungibleToken?.symbol && <AssetSymbol>{fungibleToken.symbol}</AssetSymbol>
      )}
    </div>
  )
}

export default styled(AssetBadge)`
  display: flex;
  align-items: center;
  gap: 6px;

  ${({ withBorder }) =>
    withBorder &&
    css`
      border: 1px solid ${({ theme }) => theme.border.primary};
      border-radius: var(--radius-huge);
      padding: 4px 10px 4px 4px;
    `}

  ${({ withBackground }) =>
    withBackground &&
    css`
      background-color: ${({ theme }) => theme.bg.highlight};
      border-radius: var(--radius-huge);
      padding: 4px 10px 4px 4px;
    `}
`

const AssetSymbol = styled.div`
  font-weight: var(--fontWeight-semiBold);
`
