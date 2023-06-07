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

import { ALPH, TokenInfo } from '@alephium/token-list'
import { Ghost } from 'lucide-react-native'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { css, useTheme } from 'styled-components/native'

import { useAppSelector } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import { selectAssetInfoById } from '~/store/assets/assetsSelectors'

interface AssetLogoProps {
  assetId: TokenInfo['id']
  size: number
  style?: StyleProp<ViewStyle>
}

const AssetLogo = ({ assetId, size, style }: AssetLogoProps) => {
  const theme = useTheme()
  const asset = useAppSelector((state) => selectAssetInfoById(state, assetId)) ?? {
    id: assetId,
    symbol: undefined,
    name: undefined,
    logoURI: undefined
  }

  return (
    <AssetLogoStyled {...{ assetId, style, size }} logoURI={asset.logoURI}>
      {asset.logoURI ? (
        <LogoImage source={{ uri: asset.logoURI }} />
      ) : asset.id === ALPH.id ? (
        <AlephiumLogo color={theme.font.tertiary} />
      ) : (
        <Ghost size={size * 0.7} color={theme.font.secondary} />
      )}
    </AssetLogoStyled>
  )
}

export default AssetLogo

const AssetLogoStyled = styled.View<AssetLogoProps & { logoURI: TokenInfo['logoURI'] }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  padding: 1px;
  background: ${({ theme }) => theme.bg.secondary};

  ${({ assetId, logoURI, size }) =>
    assetId === ALPH.id
      ? css`
          padding: ${size * 0.2}px;
        `
      : !logoURI &&
        css`
          align-items: center;
          justify-content: center;
        `}
`

const LogoImage = styled.Image`
  width: 100%;
  height: 100%;
`
