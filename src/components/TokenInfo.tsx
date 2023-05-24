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
import { ALPH } from '@alephium/token-list'
import { Ghost } from 'lucide-react-native'
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'

import AlephiumLogo from '../images/logos/AlephiumLogo'
import Amount from './Amount'
import AppText from './AppText'

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
        <TokenIcon asset={asset}>
          {asset.logoURI ? (
            <LogoImage source={{ uri: asset.logoURI }} />
          ) : asset.id === ALPH.id ? (
            <AlephiumLogo color={theme.font.tertiary} />
          ) : (
            <Ghost size={30} color={theme.font.secondary} />
          )}
        </TokenIcon>
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

const TokenIcon = styled.View<{ asset: Asset }>`
  width: 45px;
  height: 45px;
  border-radius: 45px;
  margin-right: 10px;
  padding: 1px;

  ${({ asset, theme }) =>
    asset.id === ALPH.id
      ? css`
          padding: 8px;
        `
      : !asset.logoURI &&
        css`
          align-items: center;
          justify-content: center;
          background: ${theme.bg.secondary};
        `}
`

const LogoImage = styled.Image`
  width: 100%;
  height: 100%;
`
