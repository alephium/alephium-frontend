/*
Copyright 2018 - 2022 The Alephium Authors
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

import { Asset } from '@alephium/sdk'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AssetLogo from '~/components/AssetLogo'
import { useAppSelector } from '~/hooks/redux'
import { selectAssetInfoById } from '~/store/assets/assetsSelectors'

interface AssetAmountWithLogoProps {
  assetId: Asset['id']
  logoSize: number
  amount: bigint
}

const AssetAmountWithLogo = ({ assetId, logoSize, amount }: AssetAmountWithLogoProps) => {
  const asset = useAppSelector((s) => selectAssetInfoById(s, assetId))

  if (!asset) return null

  return (
    <AssetStyled key={asset.id}>
      <AssetLogo assetId={asset.id} size={logoSize} />
      <Amount
        value={amount}
        isUnknownToken={!asset.symbol}
        suffix={asset.symbol}
        decimals={asset.decimals}
        semiBold
        fadeSuffix
      />
    </AssetStyled>
  )
}

export default AssetAmountWithLogo

const AssetStyled = styled.View`
  flex-direction: row;
  gap: 5px;
  padding: 3px 7px 3px 3px;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 24px;
  align-items: center;
`
