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
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'

interface TokenInfoProps {
  asset: Asset
  isLoading?: boolean
  style?: StyleProp<ViewStyle>
}

const TokenInfo = ({ asset, isLoading, style }: TokenInfoProps) => {
  const theme = useTheme()

  return (
    <TokenInfoStyled style={style}>
      <LeftGroup>
        <AssetLogo assetId={asset.id} size={45} />
        <AppText bold numberOfLines={1} style={{ flexShrink: 1 }}>
          {asset.name ?? asset.id}
        </AppText>
      </LeftGroup>
      <Amounts>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.font.primary} />
        ) : (
          <>
            <Amount value={BigInt(asset.balance)} fadeDecimals suffix={asset.symbol} bold />
          </>
        )}
      </Amounts>
    </TokenInfoStyled>
  )
}

export default TokenInfo

const TokenInfoStyled = styled.View`
  flex-direction: row;
`

const LeftGroup = styled.View`
  flex: 1;
  align-items: center;
  flex-direction: row;
  margin-right: 10px;
`

const Amounts = styled.View`
  flex-direction: column;
  justify-content: center;
  text-align: right;
  align-items: flex-end;
`
