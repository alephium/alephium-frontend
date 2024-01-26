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

import { Asset } from '@alephium/shared'
import styled from 'styled-components/native'

import Amount, { AmountProps } from '~/components/Amount'
import AssetLogo from '~/components/AssetLogo'
import { NFTThumbnail } from '~/components/NFTsGrid'
import { useAppSelector } from '~/hooks/redux'
import { selectAssetInfoById, selectNFTById } from '~/store/assets/assetsSelectors'

interface AssetAmountWithLogoProps extends Pick<AmountProps, 'fullPrecision' | 'useTinyAmountShorthand'> {
  assetId: Asset['id']
  logoSize: number
  amount: bigint
}

const AssetAmountWithLogo = ({
  assetId,
  logoSize,
  amount,
  useTinyAmountShorthand,
  fullPrecision
}: AssetAmountWithLogoProps) => {
  const asset = useAppSelector((s) => selectAssetInfoById(s, assetId))
  const nft = useAppSelector((s) => selectNFTById(s, assetId))

  return asset ? (
    <AssetStyled key={asset.id}>
      <AssetLogo assetId={asset.id} size={logoSize} />
      <Amount
        value={amount}
        isUnknownToken={!asset.symbol}
        suffix={asset.symbol}
        decimals={asset.decimals}
        semiBold
        fadeSuffix
        fullPrecision={fullPrecision}
        useTinyAmountShorthand={useTinyAmountShorthand}
      />
    </AssetStyled>
  ) : nft ? (
    <NFTThumbnail key={nft.id} style={{ width: 50 }} source={{ uri: nft.image }} height={50} />
  ) : null
}

export default AssetAmountWithLogo

const AssetStyled = styled.View`
  flex-direction: row;
  gap: 5px;
  padding: 3px 7px 3px 3px;
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-radius: 24px;
  align-items: center;
`
